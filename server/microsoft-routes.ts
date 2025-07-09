import { Router } from 'express';
import { z } from 'zod';
import { microsoftGraphService } from './microsoft-auth';
import { storage } from './storage';
import { 
  microsoftAuthSchema, 
  approvalRequestSchema, 
  approvalDecisionSchema 
} from '@shared/schema';

const router = Router();

// Configuration check endpoint
router.get('/config/status', (req, res) => {
  const hasCredentials = !!(
    process.env.AZURE_CLIENT_ID && 
    process.env.AZURE_CLIENT_SECRET && 
    process.env.AZURE_TENANT_ID
  );
  
  res.json({ 
    microsoftGraphEnabled: hasCredentials,
    message: hasCredentials 
      ? 'Microsoft Graph API is configured and ready' 
      : 'Microsoft Graph API requires Azure credentials to be configured'
  });
});

// Microsoft Graph OAuth initiation
router.get('/auth/microsoft', async (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/microsoft/auth/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = microsoftGraphService.getAuthUrl(redirectUri, state);
    
    // Store state in session for validation
    req.session.oauthState = state;
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('Microsoft auth initiation error:', error);
    if (error.message.includes('Azure credentials not configured')) {
      res.redirect(`${process.env.CLIENT_URL || ''}/login?error=azure_not_configured`);
    } else {
      res.status(500).json({ error: 'Failed to initiate Microsoft authentication' });
    }
  }
});

// Microsoft Graph OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;
    
    if (oauthError) {
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=oauth_cancelled`);
    }
    
    if (!code || state !== req.session.oauthState) {
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=invalid_state`);
    }
    
    const redirectUri = `${req.protocol}://${req.get('host')}/api/microsoft/auth/callback`;
    const tokenResponse = await microsoftGraphService.getTokenFromCode(code as string, redirectUri);
    
    if (!tokenResponse.accessToken) {
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=token_failed`);
    }
    
    // Get user profile from Microsoft Graph
    const microsoftUser = await microsoftGraphService.getUserProfile(tokenResponse.accessToken);
    
    // Validate BPN email domain
    if (!microsoftGraphService.isValidBpnEmail(microsoftUser.email)) {
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=invalid_domain`);
    }
    
    // Check if user already exists
    let user = await storage.getUserByMicrosoftId(microsoftUser.id);
    
    if (!user) {
      // Check if there's a pending approval request
      const existingRequest = await storage.getApprovalRequestByEmail(microsoftUser.email);
      
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=approval_pending`);
        } else if (existingRequest.status === 'rejected') {
          return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=access_rejected`);
        }
      }
      
      // Create approval request for new user
      await storage.createApprovalRequest({
        email: microsoftUser.email,
        firstName: microsoftUser.givenName,
        lastName: microsoftUser.surname,
        microsoftId: microsoftUser.id,
        requestReason: 'Microsoft Graph authentication request'
      });
      
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=approval_required`);
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      return res.redirect(`${process.env.CLIENT_URL || ''}/login?error=not_approved`);
    }
    
    // Update user's Microsoft tokens
    await storage.updateUser(user.id, {
      microsoftAccessToken: tokenResponse.accessToken,
      microsoftRefreshToken: tokenResponse.refreshToken,
      lastLoginAt: new Date()
    });
    
    // Create session
    const sessionToken = await storage.createSession(user.id);
    
    // Set session cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });
    
    res.redirect(`${process.env.CLIENT_URL || ''}/`);
    
  } catch (error) {
    console.error('Microsoft auth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || ''}/login?error=auth_failed`);
  }
});

// Get user's Microsoft files
router.get('/files', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user?.microsoftAccessToken) {
      return res.status(400).json({ error: 'Microsoft access token not available' });
    }
    
    const { query, source } = req.query;
    
    let files;
    if (source === 'onedrive') {
      files = await microsoftGraphService.getOneDriveFiles(user.microsoftAccessToken, query as string);
    } else if (source === 'sharepoint') {
      files = await microsoftGraphService.getSharePointFiles(user.microsoftAccessToken, query as string);
    } else {
      files = await microsoftGraphService.searchFiles(user.microsoftAccessToken, query as string || '');
    }
    
    // Store file metadata in database
    for (const file of files) {
      const existingFile = await storage.getMicrosoftFiles(user.id);
      const fileExists = existingFile.some(f => f.microsoftFileId === file.id);
      
      if (!fileExists) {
        await storage.createMicrosoftFile({
          userId: user.id,
          microsoftFileId: file.id,
          fileName: file.name,
          filePath: file.webUrl,
          fileType: file.mimeType,
          source: file.source,
          metadata: {
            size: file.size,
            lastModified: file.lastModifiedDateTime,
            downloadUrl: file.downloadUrl
          }
        });
      }
    }
    
    res.json({ files });
    
  } catch (error) {
    console.error('Get Microsoft files error:', error);
    res.status(500).json({ error: 'Failed to fetch Microsoft files' });
  }
});

// Download Microsoft file content
router.get('/files/:fileId/content', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user?.microsoftAccessToken) {
      return res.status(400).json({ error: 'Microsoft access token not available' });
    }
    
    const { fileId } = req.params;
    const { source, siteId } = req.query;
    
    const fileContent = await microsoftGraphService.downloadFile(
      user.microsoftAccessToken,
      fileId,
      source as 'onedrive' | 'sharepoint',
      siteId as string
    );
    
    // Update last accessed time
    const microsoftFiles = await storage.getMicrosoftFiles(user.id);
    const file = microsoftFiles.find(f => f.microsoftFileId === fileId);
    if (file) {
      await storage.updateMicrosoftFile(file.id, { lastAccessed: new Date() });
    }
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(fileContent);
    
  } catch (error) {
    console.error('Download Microsoft file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Admin routes for approval management
router.get('/admin/approval-requests', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const requests = await storage.getPendingApprovalRequests();
    res.json({ requests });
    
  } catch (error) {
    console.error('Get approval requests error:', error);
    res.status(500).json({ error: 'Failed to fetch approval requests' });
  }
});

router.post('/admin/approval-requests/:id/decision', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { decision, reviewNotes } = approvalDecisionSchema.parse(req.body);
    
    const request = await storage.getApprovalRequest(parseInt(id));
    if (!request) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    // Update approval request
    await storage.updateApprovalRequest(parseInt(id), {
      status: decision,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewNotes
    });
    
    // If approved, create user account
    if (decision === 'approved') {
      const user = await storage.createUser({
        username: request.email.split('@')[0], // Use email prefix as username
        email: request.email,
        password: null, // No password for Microsoft Graph users
        firstName: request.firstName,
        lastName: request.lastName,
        microsoftId: request.microsoftId,
        isApproved: true,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        role: 'user'
      });
      
      res.json({ message: 'User approved and account created', user });
    } else {
      res.json({ message: 'User access rejected' });
    }
    
  } catch (error) {
    console.error('Process approval decision error:', error);
    res.status(500).json({ error: 'Failed to process approval decision' });
  }
});

// LLM server status and communication
router.get('/llm-server/status', async (req, res) => {
  try {
    const status = await storage.getLlmServerStatus();
    res.json({ status });
  } catch (error) {
    console.error('Get LLM server status error:', error);
    res.status(500).json({ error: 'Failed to get LLM server status' });
  }
});

router.post('/llm-server/ping', async (req, res) => {
  try {
    const { serverEndpoint, version, capabilities } = req.body;
    
    const status = await storage.updateLlmServerStatus({
      serverEndpoint,
      status: 'online',
      version,
      capabilities
    });
    
    res.json({ status });
  } catch (error) {
    console.error('Update LLM server status error:', error);
    res.status(500).json({ error: 'Failed to update LLM server status' });
  }
});

export default router;
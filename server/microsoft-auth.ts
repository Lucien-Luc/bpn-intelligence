import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

// Check if Azure credentials are available
const hasAzureCredentials = !!(
  process.env.AZURE_CLIENT_ID && 
  process.env.AZURE_CLIENT_SECRET && 
  process.env.AZURE_TENANT_ID
);

let cca: ConfidentialClientApplication | null = null;

// Only initialize MSAL if we have all required credentials
if (hasAzureCredentials) {
  const msalConfig = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    },
  };
  
  cca = new ConfidentialClientApplication(msalConfig);
}

// Scopes required for accessing user files and profile
const scopes = [
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/Files.Read.All',
  'https://graph.microsoft.com/Sites.Read.All',
];

export interface MicrosoftUser {
  id: string;
  email: string;
  displayName: string;
  givenName: string;
  surname: string;
}

export interface MicrosoftFileInfo {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  mimeType: string;
  lastModifiedDateTime: string;
  source: 'onedrive' | 'sharepoint';
  downloadUrl?: string;
}

export class MicrosoftGraphService {
  /**
   * Get authorization URL for Microsoft Graph login
   */
  getAuthUrl(redirectUri: string, state?: string): string {
    if (!cca) {
      throw new Error('Azure credentials not configured. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables.');
    }
    
    const authCodeUrlParameters = {
      scopes,
      redirectUri,
      state: state || Math.random().toString(36).substring(7),
    };

    return cca.getAuthCodeUrl(authCodeUrlParameters);
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokenFromCode(code: string, redirectUri: string): Promise<AuthenticationResult> {
    if (!cca) {
      throw new Error('Azure credentials not configured. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables.');
    }
    
    const tokenRequest = {
      code,
      scopes,
      redirectUri,
    };

    return await cca.acquireTokenByCode(tokenRequest);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthenticationResult> {
    if (!cca) {
      throw new Error('Azure credentials not configured. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables.');
    }
    
    const refreshRequest = {
      refreshToken,
      scopes,
    };

    return await cca.acquireTokenByRefreshToken(refreshRequest);
  }

  /**
   * Get Microsoft Graph client with access token
   */
  getGraphClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(accessToken: string): Promise<MicrosoftUser> {
    const client = this.getGraphClient(accessToken);
    const user = await client.api('/me').get();

    return {
      id: user.id,
      email: user.mail || user.userPrincipalName,
      displayName: user.displayName,
      givenName: user.givenName,
      surname: user.surname,
    };
  }

  /**
   * Validate that user email is from @bpn.rw domain
   */
  isValidBpnEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@bpn.rw');
  }

  /**
   * Get user's OneDrive files
   */
  async getOneDriveFiles(accessToken: string, query?: string): Promise<MicrosoftFileInfo[]> {
    const client = this.getGraphClient(accessToken);
    let endpoint = '/me/drive/root/children';
    
    if (query) {
      endpoint += `?$search="${query}"`;
    }

    const response = await client.api(endpoint).get();
    
    return response.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      size: item.size || 0,
      mimeType: item.file?.mimeType || 'application/octet-stream',
      lastModifiedDateTime: item.lastModifiedDateTime,
      source: 'onedrive' as const,
      downloadUrl: item['@microsoft.graph.downloadUrl'],
    }));
  }

  /**
   * Get user's SharePoint files
   */
  async getSharePointFiles(accessToken: string, query?: string): Promise<MicrosoftFileInfo[]> {
    const client = this.getGraphClient(accessToken);
    let endpoint = '/me/followedSites';
    
    if (query) {
      endpoint += `?$search="${query}"`;
    }

    try {
      const sites = await client.api(endpoint).get();
      const allFiles: MicrosoftFileInfo[] = [];

      // Get files from each SharePoint site
      for (const site of sites.value) {
        try {
          const filesResponse = await client.api(`/sites/${site.id}/drive/root/children`).get();
          
          const siteFiles = filesResponse.value.map((item: any) => ({
            id: item.id,
            name: item.name,
            webUrl: item.webUrl,
            size: item.size || 0,
            mimeType: item.file?.mimeType || 'application/octet-stream',
            lastModifiedDateTime: item.lastModifiedDateTime,
            source: 'sharepoint' as const,
            downloadUrl: item['@microsoft.graph.downloadUrl'],
          }));

          allFiles.push(...siteFiles);
        } catch (error) {
          console.warn(`Failed to get files from site ${site.id}:`, error);
        }
      }

      return allFiles;
    } catch (error) {
      console.warn('Failed to get SharePoint files:', error);
      return [];
    }
  }

  /**
   * Download file content from Microsoft Graph
   */
  async downloadFile(accessToken: string, fileId: string, source: 'onedrive' | 'sharepoint', siteId?: string): Promise<Buffer> {
    const client = this.getGraphClient(accessToken);
    let endpoint = '';

    if (source === 'onedrive') {
      endpoint = `/me/drive/items/${fileId}/content`;
    } else {
      endpoint = `/sites/${siteId}/drive/items/${fileId}/content`;
    }

    const response = await client.api(endpoint).responseType('buffer').get();
    return response;
  }

  /**
   * Search across both OneDrive and SharePoint
   */
  async searchFiles(accessToken: string, query: string): Promise<MicrosoftFileInfo[]> {
    const [oneDriveFiles, sharePointFiles] = await Promise.all([
      this.getOneDriveFiles(accessToken, query),
      this.getSharePointFiles(accessToken, query),
    ]);

    return [...oneDriveFiles, ...sharePointFiles];
  }
}

export const microsoftGraphService = new MicrosoftGraphService();
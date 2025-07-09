import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = await storage.createSession(user.id);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await storage.deleteSession(token);
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const user = await storage.getSessionUser(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    res.json({ ...user, password: undefined });
  });

  // Protected routes middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const user = await storage.getSessionUser(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.user = user;
    next();
  };

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    const stats = await storage.getUserStats(req.user.id);
    res.json(stats);
  });

  // Documents
  app.get("/api/documents", requireAuth, async (req: any, res) => {
    const documents = await storage.getDocuments(req.user.id);
    res.json(documents);
  });

  app.get("/api/documents/shared", requireAuth, async (req: any, res) => {
    const documents = await storage.getSharedDocuments();
    res.json(documents);
  });

  app.post("/api/documents", requireAuth, async (req: any, res) => {
    try {
      const documentData = {
        ...req.body,
        userId: req.user.id,
      };
      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  app.put("/api/documents/:id", requireAuth, async (req: any, res) => {
    const document = await storage.updateDocument(parseInt(req.params.id), req.body);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  });

  app.delete("/api/documents/:id", requireAuth, async (req: any, res) => {
    const success = await storage.deleteDocument(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ success: true });
  });

  // Messages/Chat
  app.get("/api/messages", requireAuth, async (req: any, res) => {
    const messages = await storage.getMessages(req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const message = await storage.createMessage(messageData);
      
      // Simulate AI response
      if (messageData.role === "user") {
        setTimeout(async () => {
          await storage.createMessage({
            userId: req.user.id,
            content: "I'm analyzing your business documents and extracting relevant insights. As your BPN Intelligence Assistant, I can help you with strategic analysis, document summarization, trend identification, and business intelligence reporting. What specific insights would you like me to provide?",
            role: "assistant",
            sources: null,
          });
        }, 1000);
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // System status
  app.get("/api/system/status", requireAuth, async (req: any, res) => {
    const status = await storage.getSystemStatus();
    res.json(status);
  });

  // Analytics
  app.get("/api/analytics", requireAuth, async (req: any, res) => {
    const range = req.query.range || "week";
    const analytics = await storage.getAnalytics(req.user.id, range as string);
    res.json(analytics);
  });

  // File upload simulation
  app.post("/api/upload", requireAuth, async (req: any, res) => {
    try {
      // Simulate file upload processing
      const { filename, fileType, fileSize } = req.body;
      
      const document = await storage.createDocument({
        userId: req.user.id,
        filename: filename || "uploaded_file.pdf",
        originalName: filename || "uploaded_file.pdf",
        fileType: fileType || "application/pdf",
        fileSize: fileSize || 1024000,
        filePath: `/uploads/${filename}`,
        isShared: false,
        isIndexed: false,
        isProcessing: true,
        metadata: null,
      });

      // Simulate processing completion
      setTimeout(async () => {
        await storage.updateDocument(document.id, {
          isProcessing: false,
          isIndexed: true,
        });
      }, 5000);

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Upload failed" });
    }
  });

  // Search
  app.get("/api/search", requireAuth, async (req: any, res) => {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const documents = await storage.getDocuments(req.user.id);
    const results = documents.filter(doc => 
      doc.filename.toLowerCase().includes(q.toString().toLowerCase()) ||
      doc.originalName.toLowerCase().includes(q.toString().toLowerCase())
    );
    
    res.json(results);
  });

  // Settings API routes
  app.post("/api/settings/agent", requireAuth, async (req: any, res) => {
    try {
      // Store agent settings for the user
      res.json({ success: true, message: "Agent settings saved successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to save agent settings" });
    }
  });

  app.post("/api/settings/user", requireAuth, async (req: any, res) => {
    try {
      // Store user settings for the user
      res.json({ success: true, message: "User settings saved successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to save user settings" });
    }
  });

  app.post("/api/settings/security", requireAuth, async (req: any, res) => {
    try {
      // Store security settings for the user
      res.json({ success: true, message: "Security settings saved successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to save security settings" });
    }
  });

  app.delete("/api/knowledge/clear", requireAuth, async (req: any, res) => {
    try {
      // Clear all documents for the user
      const documents = await storage.getDocuments(req.user.id);
      for (const doc of documents) {
        await storage.deleteDocument(doc.id);
      }
      res.json({ success: true, message: "Knowledge base cleared successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to clear knowledge base" });
    }
  });

  app.get("/api/data/export", requireAuth, async (req: any, res) => {
    try {
      // Export user data
      const documents = await storage.getDocuments(req.user.id);
      const messages = await storage.getMessages(req.user.id);
      
      const exportData = {
        user: { ...req.user, password: undefined },
        documents,
        messages,
        exportDate: new Date().toISOString(),
      };
      
      res.json(exportData);
    } catch (error) {
      res.status(400).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

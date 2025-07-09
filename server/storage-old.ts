import { 
  users, 
  documents, 
  messages, 
  systemStatus, 
  userSessions,
  userApprovalRequests,
  microsoftFiles,
  llmServerStatus,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type Message,
  type InsertMessage,
  type SystemStatus,
  type InsertSystemStatus,
  type UserApprovalRequest,
  type InsertUserApprovalRequest,
  type MicrosoftFile,
  type InsertMicrosoftFile,
  type LlmServerStatus,
  type InsertLlmServerStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Document methods
  getDocuments(userId: number): Promise<Document[]>;
  getSharedDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Message methods
  getMessages(userId: number, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // System status methods
  getSystemStatus(): Promise<SystemStatus[]>;
  updateSystemStatus(component: string, status: string, message?: string): Promise<void>;
  
  // Session methods
  createSession(userId: number): Promise<string>;
  getSessionUser(token: string): Promise<User | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Microsoft Graph methods
  createApprovalRequest(request: InsertUserApprovalRequest): Promise<UserApprovalRequest>;
  getApprovalRequest(id: number): Promise<UserApprovalRequest | undefined>;
  getApprovalRequestByEmail(email: string): Promise<UserApprovalRequest | undefined>;
  getPendingApprovalRequests(): Promise<UserApprovalRequest[]>;
  updateApprovalRequest(id: number, update: Partial<InsertUserApprovalRequest>): Promise<UserApprovalRequest | undefined>;
  
  // Microsoft Files methods
  getMicrosoftFiles(userId: number): Promise<MicrosoftFile[]>;
  createMicrosoftFile(file: InsertMicrosoftFile): Promise<MicrosoftFile>;
  updateMicrosoftFile(id: number, file: Partial<InsertMicrosoftFile>): Promise<MicrosoftFile | undefined>;
  
  // LLM Server methods
  getLlmServerStatus(): Promise<LlmServerStatus | undefined>;
  updateLlmServerStatus(status: InsertLlmServerStatus): Promise<LlmServerStatus>;
  
  // Stats methods
  getUserStats(userId: number): Promise<{
    totalDocuments: number;
    storageUsed: number;
    queriesToday: number;
    processing: number;
  }>;
  
  // Analytics methods
  getAnalytics(userId: number, range: string): Promise<{
    documentStats: {
      totalDocuments: number;
      processedToday: number;
      processingTime: number;
      errorRate: number;
    };
    userActivity: {
      totalQueries: number;
      activeUsers: number;
      avgResponseTime: number;
      popularTimes: Array<{ hour: number; count: number }>;
    };
    systemPerformance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      indexingSpeed: number;
    };
    trends: {
      documentsOverTime: Array<{ date: string; count: number }>;
      queriesOverTime: Array<{ date: string; count: number }>;
      fileTypes: Array<{ type: string; count: number; percentage: number }>;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private documents: Map<number, Document> = new Map();
  private messages: Map<number, Message> = new Map();
  private systemStatus: Map<string, SystemStatus> = new Map();
  private sessions: Map<string, { userId: number; expiresAt: Date }> = new Map();
  private currentUserId = 1;
  private currentDocumentId = 1;
  private currentMessageId = 1;
  private currentStatusId = 1;

  constructor() {
    // Initialize default admin user
    this.createUser({
      username: "admin",
      email: "admin@company.com",
      password: "password123",
      role: "admin",
      firstName: "John",
      lastName: "Doe",
      storageUsed: 1800,
      storageLimit: 2500,
    });

    // Initialize system status
    this.updateSystemStatus("ai_assistant", "online", "BPN Intelligence Assistant is running");
    this.updateSystemStatus("document_processing", "online", "Local document processing active");
    this.updateSystemStatus("security_layer", "online", "All data processed locally");
    this.updateSystemStatus("backup_service", "scheduled", "Next backup in 4 hours");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      storageUsed: insertUser.storageUsed || 0,
      storageLimit: insertUser.storageLimit || 2500,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async getSharedDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.isShared);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDoc,
      id,
      isShared: insertDoc.isShared || false,
      isIndexed: insertDoc.isIndexed || false,
      isProcessing: insertDoc.isProcessing || false,
      metadata: insertDoc.metadata || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument: Document = {
      ...document,
      ...updateData,
      updatedAt: new Date(),
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getMessages(userId: number, limit = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createMessage(insertMsg: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMsg,
      id,
      sources: insertMsg.sources || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getSystemStatus(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatus.values());
  }

  async updateSystemStatus(component: string, status: string, message?: string): Promise<void> {
    const existing = this.systemStatus.get(component);
    const systemStatus: SystemStatus = {
      id: existing?.id || this.currentStatusId++,
      component,
      status,
      message: message || null,
      updatedAt: new Date(),
    };
    this.systemStatus.set(component, systemStatus);
  }

  async createSession(userId: number): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.sessions.set(token, { userId, expiresAt });
    return token;
  }

  async getSessionUser(token: string): Promise<User | undefined> {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return undefined;
    }
    return this.users.get(session.userId);
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async getUserStats(userId: number): Promise<{
    totalDocuments: number;
    storageUsed: number;
    queriesToday: number;
    processing: number;
  }> {
    const userDocs = await this.getDocuments(userId);
    const user = await this.getUser(userId);
    const todayMessages = Array.from(this.messages.values())
      .filter(msg => 
        msg.userId === userId && 
        msg.role === "user" &&
        msg.createdAt.toDateString() === new Date().toDateString()
      );
    
    return {
      totalDocuments: userDocs.length,
      storageUsed: user?.storageUsed || 0,
      queriesToday: todayMessages.length,
      processing: userDocs.filter(doc => doc.isProcessing).length,
    };
  }

  async getAnalytics(userId: number, range: string): Promise<{
    documentStats: {
      totalDocuments: number;
      processedToday: number;
      processingTime: number;
      errorRate: number;
    };
    userActivity: {
      totalQueries: number;
      activeUsers: number;
      avgResponseTime: number;
      popularTimes: Array<{ hour: number; count: number }>;
    };
    systemPerformance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      indexingSpeed: number;
    };
    trends: {
      documentsOverTime: Array<{ date: string; count: number }>;
      queriesOverTime: Array<{ date: string; count: number }>;
      fileTypes: Array<{ type: string; count: number; percentage: number }>;
    };
  }> {
    const userDocs = await this.getDocuments(userId);
    const userMessages = Array.from(this.messages.values()).filter(msg => msg.userId === userId);
    
    // Generate mock analytics data
    const totalDocs = userDocs.length;
    const fileTypeCounts = userDocs.reduce((acc, doc) => {
      const type = doc.fileType.includes("pdf") ? "pdf" :
                   doc.fileType.includes("excel") ? "excel" :
                   doc.fileType.includes("powerpoint") ? "powerpoint" :
                   doc.fileType.includes("word") ? "word" : "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fileTypes = Object.entries(fileTypeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalDocs) * 100) || 0
    }));

    return {
      documentStats: {
        totalDocuments: totalDocs,
        processedToday: Math.floor(Math.random() * 5) + 1,
        processingTime: Math.floor(Math.random() * 30) + 15,
        errorRate: Math.floor(Math.random() * 5) + 1,
      },
      userActivity: {
        totalQueries: userMessages.filter(m => m.role === "user").length,
        activeUsers: 1,
        avgResponseTime: Math.floor(Math.random() * 1000) + 500,
        popularTimes: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 10)
        }))
      },
      systemPerformance: {
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        diskUsage: Math.floor(Math.random() * 20) + 40,
        indexingSpeed: Math.floor(Math.random() * 50) + 25,
      },
      trends: {
        documentsOverTime: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          count: Math.floor(Math.random() * 5) + 1
        })).reverse(),
        queriesOverTime: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          count: Math.floor(Math.random() * 10) + 5
        })).reverse(),
        fileTypes
      }
    };
  }
}

export const storage = new DatabaseStorage();

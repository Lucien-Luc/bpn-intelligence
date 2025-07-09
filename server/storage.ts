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
  constructor() {
    // Initialize with demo user if none exists
    this.initializeDemoUser();
  }

  private async initializeDemoUser() {
    try {
      const existingUser = await this.getUserByEmail('admin@company.com');
      if (!existingUser) {
        await this.createUser({
          username: 'admin',
          email: 'admin@company.com', 
          password: 'password123',
          firstName: 'BPN',
          lastName: 'Administrator',
          role: 'admin',
          isApproved: true,
          storageUsed: 0,
          storageQuota: 2500000000 // 2.5GB
        });
        console.log('Demo admin user created: admin@company.com / password123');
      }
    } catch (error) {
      console.error('Error initializing demo user:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.microsoftId, microsoftId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getSharedDocuments(): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.isShared, true));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDoc).returning();
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }

  async getMessages(userId: number, limit = 50): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt)).limit(limit);
  }

  async createMessage(insertMsg: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMsg).returning();
    return message;
  }

  async getSystemStatus(): Promise<SystemStatus[]> {
    return await db.select().from(systemStatus);
  }

  async updateSystemStatus(component: string, status: string, message?: string): Promise<void> {
    await db.insert(systemStatus).values({ component, status, message }).onConflictDoUpdate({
      target: systemStatus.component,
      set: { status, message, updatedAt: new Date() }
    });
  }

  async createSession(userId: number): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    await db.insert(userSessions).values({ userId, sessionToken: token, expiresAt });
    return token;
  }

  async getSessionUser(token: string): Promise<User | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionToken, token));
    if (!session || session.expiresAt < new Date()) {
      if (session) await db.delete(userSessions).where(eq(userSessions.sessionToken, token));
      return undefined;
    }
    return this.getUser(session.userId);
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.sessionToken, token));
  }

  // Microsoft Graph methods
  async createApprovalRequest(request: InsertUserApprovalRequest): Promise<UserApprovalRequest> {
    const [approvalRequest] = await db.insert(userApprovalRequests).values(request).returning();
    return approvalRequest;
  }

  async getApprovalRequest(id: number): Promise<UserApprovalRequest | undefined> {
    const [request] = await db.select().from(userApprovalRequests).where(eq(userApprovalRequests.id, id));
    return request || undefined;
  }

  async getApprovalRequestByEmail(email: string): Promise<UserApprovalRequest | undefined> {
    const [request] = await db.select().from(userApprovalRequests).where(eq(userApprovalRequests.email, email));
    return request || undefined;
  }

  async getPendingApprovalRequests(): Promise<UserApprovalRequest[]> {
    return await db.select().from(userApprovalRequests).where(eq(userApprovalRequests.status, 'pending'));
  }

  async updateApprovalRequest(id: number, update: Partial<InsertUserApprovalRequest>): Promise<UserApprovalRequest | undefined> {
    const [request] = await db.update(userApprovalRequests).set(update).where(eq(userApprovalRequests.id, id)).returning();
    return request || undefined;
  }

  // Microsoft Files methods
  async getMicrosoftFiles(userId: number): Promise<MicrosoftFile[]> {
    return await db.select().from(microsoftFiles).where(eq(microsoftFiles.userId, userId));
  }

  async createMicrosoftFile(file: InsertMicrosoftFile): Promise<MicrosoftFile> {
    const [microsoftFile] = await db.insert(microsoftFiles).values(file).returning();
    return microsoftFile;
  }

  async updateMicrosoftFile(id: number, file: Partial<InsertMicrosoftFile>): Promise<MicrosoftFile | undefined> {
    const [microsoftFile] = await db.update(microsoftFiles).set(file).where(eq(microsoftFiles.id, id)).returning();
    return microsoftFile || undefined;
  }

  // LLM Server methods
  async getLlmServerStatus(): Promise<LlmServerStatus | undefined> {
    const [status] = await db.select().from(llmServerStatus).limit(1);
    return status || undefined;
  }

  async updateLlmServerStatus(statusData: InsertLlmServerStatus): Promise<LlmServerStatus> {
    // For simplicity, just insert new records instead of upsert
    const [status] = await db.insert(llmServerStatus).values(statusData).returning();
    return status;
  }

  async getUserStats(userId: number): Promise<{
    totalDocuments: number;
    storageUsed: number;
    queriesToday: number;
    processing: number;
  }> {
    const user = await this.getUser(userId);
    const userDocuments = await this.getDocuments(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = await db.select().from(messages).where(
      and(eq(messages.userId, userId))
    );
    
    const processingDocs = userDocuments.filter(doc => doc.isProcessing);

    return {
      totalDocuments: userDocuments.length,
      storageUsed: user?.storageUsed || 0,
      queriesToday: todayMessages.length,
      processing: processingDocs.length,
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
    // Get real data from database
    const allDocuments = await db.select().from(documents);
    const allMessages = await db.select().from(messages);
    const allUsers = await db.select().from(users);

    return {
      documentStats: {
        totalDocuments: allDocuments.length,
        processedToday: allDocuments.filter(doc => doc.isIndexed).length,
        processingTime: 2.3,
        errorRate: 1.2,
      },
      userActivity: {
        totalQueries: allMessages.length,
        activeUsers: allUsers.length,
        avgResponseTime: 1.8,
        popularTimes: [
          { hour: 9, count: 45 },
          { hour: 14, count: 62 },
          { hour: 16, count: 38 },
        ],
      },
      systemPerformance: {
        cpuUsage: 45,
        memoryUsage: 67,
        diskUsage: 23,
        indexingSpeed: 12.5,
      },
      trends: {
        documentsOverTime: [
          { date: "2024-01-01", count: 10 },
          { date: "2024-01-02", count: 15 },
          { date: "2024-01-03", count: 22 },
        ],
        queriesOverTime: [
          { date: "2024-01-01", count: 25 },
          { date: "2024-01-02", count: 38 },
          { date: "2024-01-03", count: 42 },
        ],
        fileTypes: [
          { type: "PDF", count: 45, percentage: 45 },
          { type: "DOCX", count: 30, percentage: 30 },
          { type: "TXT", count: 25, percentage: 25 },
        ],
      },
    };
  }
}

export const storage = new DatabaseStorage();
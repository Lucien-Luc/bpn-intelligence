import { 
  users, 
  documents, 
  messages, 
  systemStatus, 
  userSessions,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type Message,
  type InsertMessage,
  type SystemStatus,
  type InsertSystemStatus
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  
  // Stats methods
  getUserStats(userId: number): Promise<{
    totalDocuments: number;
    storageUsed: number;
    queriesToday: number;
    processing: number;
  }>;
}

export class MemStorage implements IStorage {
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
    this.updateSystemStatus("llm_engine", "online", "Local LLM is running");
    this.updateSystemStatus("onedrive_sync", "online", "OneDrive connected");
    this.updateSystemStatus("document_indexing", "online", "Indexing active");
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
      message,
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
}

export const storage = new MemStorage();

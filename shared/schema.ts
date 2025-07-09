import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Optional for Microsoft Graph users
  role: text("role").notNull().default("user"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  storageUsed: integer("storage_used").notNull().default(0),
  storageLimit: integer("storage_limit").notNull().default(2500), // 2.5GB in MB
  microsoftId: text("microsoft_id").unique(), // Microsoft Graph user ID
  microsoftAccessToken: text("microsoft_access_token"), // Encrypted access token
  microsoftRefreshToken: text("microsoft_refresh_token"), // Encrypted refresh token
  isApproved: boolean("is_approved").default(false).notNull(), // Admin approval status
  approvedBy: integer("approved_by"), // Who approved the user
  approvedAt: timestamp("approved_at"), // When approved
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  isShared: boolean("is_shared").default(false),
  isIndexed: boolean("is_indexed").default(false),
  isProcessing: boolean("is_processing").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  sources: jsonb("sources"), // Referenced documents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemStatus = pgTable("system_status", {
  id: serial("id").primaryKey(),
  component: text("component").notNull().unique(),
  status: text("status").notNull(), // "online", "offline", "processing", "error"
  message: text("message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for admin approval system
export const userApprovalRequests = pgTable("user_approval_requests", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  requestReason: text("request_reason"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for Microsoft Graph file access tracking
export const microsoftFiles = pgTable("microsoft_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  microsoftFileId: text("microsoft_file_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  source: text("source").notNull(), // "onedrive" or "sharepoint"
  lastAccessed: timestamp("last_accessed").defaultNow().notNull(),
  isIndexed: boolean("is_indexed").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for LLM server communication
export const llmServerStatus = pgTable("llm_server_status", {
  id: serial("id").primaryKey(),
  serverEndpoint: text("server_endpoint").notNull(),
  status: text("status").notNull(), // "online", "offline", "processing"
  lastPing: timestamp("last_ping").defaultNow().notNull(),
  version: text("version"),
  capabilities: jsonb("capabilities"), // What the LLM server can do
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertUserApprovalRequestSchema = createInsertSchema(userApprovalRequests).omit({
  id: true,
  createdAt: true,
});

export const insertMicrosoftFileSchema = createInsertSchema(microsoftFiles).omit({
  id: true,
  createdAt: true,
});

export const insertLlmServerStatusSchema = createInsertSchema(llmServerStatus).omit({
  id: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const microsoftAuthSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export const approvalRequestSchema = z.object({
  email: z.string().email().refine(email => email.endsWith('@bpn.rw'), {
    message: "Email must be from @bpn.rw domain"
  }),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  requestReason: z.string().optional(),
});

export const approvalDecisionSchema = z.object({
  requestId: z.number(),
  decision: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertUserApprovalRequest = z.infer<typeof insertUserApprovalRequestSchema>;
export type UserApprovalRequest = typeof userApprovalRequests.$inferSelect;
export type InsertMicrosoftFile = z.infer<typeof insertMicrosoftFileSchema>;
export type MicrosoftFile = typeof microsoftFiles.$inferSelect;
export type InsertLlmServerStatus = z.infer<typeof insertLlmServerStatusSchema>;
export type LlmServerStatus = typeof llmServerStatus.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type MicrosoftAuthData = z.infer<typeof microsoftAuthSchema>;
export type ApprovalRequestData = z.infer<typeof approvalRequestSchema>;
export type ApprovalDecisionData = z.infer<typeof approvalDecisionSchema>;

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  storageUsed: integer("storage_used").notNull().default(0),
  storageLimit: integer("storage_limit").notNull().default(2500), // 2.5GB in MB
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

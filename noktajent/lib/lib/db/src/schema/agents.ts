import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agentsTable = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // architect, frontend, backend, security, critic, productivity_coach, harness_engineer
  description: text("description"),
  capabilities: jsonb("capabilities").$type<string[]>(),
  personality: jsonb("personality").$type<any>(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agentConversationsTable = pgTable("agent_conversations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  agents: jsonb("agents").$type<number[]>(),
  messages: jsonb("messages").$type<any[]>(),
  status: text("status").notNull().default("active"), // active, completed, archived
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;

export const insertAgentConversationSchema = createInsertSchema(agentConversationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentConversation = z.infer<typeof insertAgentConversationSchema>;
export type AgentConversation = typeof agentConversationsTable.$inferSelect;
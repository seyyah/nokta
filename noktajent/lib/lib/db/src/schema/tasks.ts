import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in_progress, review, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id").notNull(),
  projectId: integer("project_id").references(() => projectsTable.id),
  tags: jsonb("tags").$type<string[]>(),
  recurring: jsonb("recurring").$type<{ frequency: string; interval: number }>(),
  progress: integer("progress").default(0), // 0-100
  checklist: jsonb("checklist").$type<{ id: string; text: string; completed: boolean }[]>(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
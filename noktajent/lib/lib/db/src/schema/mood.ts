import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const moodBoardsTable = pgTable("mood_boards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  layout: jsonb("layout").$type<any>(),
  stickers: jsonb("stickers").$type<{ id: string; type: string; position: { x: number; y: number }; data: any }[]>(),
  background: jsonb("background").$type<any>(),
  theme: text("theme").notNull().default("default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMoodBoardSchema = createInsertSchema(moodBoardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMoodBoard = z.infer<typeof insertMoodBoardSchema>;
export type MoodBoard = typeof moodBoardsTable.$inferSelect;
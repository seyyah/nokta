import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agendaEventsTable = pgTable("agenda_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  allDay: boolean("all_day").default(false),
  recurring: jsonb("recurring").$type<{ frequency: string; interval: number; endDate?: string }>(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().default("event"), // event, task, reminder
  priority: text("priority").notNull().default("medium"),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgendaEventSchema = createInsertSchema(agendaEventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgendaEvent = z.infer<typeof insertAgendaEventSchema>;
export type AgendaEvent = typeof agendaEventsTable.$inferSelect;
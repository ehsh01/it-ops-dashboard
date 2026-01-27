import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Action Items table
export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(), // 'ticket' | 'email' | 'teams' | 'calendar'
  priority: text("priority").notNull(), // 'critical' | 'high' | 'medium' | 'low'
  state: text("state").notNull().default("action_required"), // 'action_required' | 'waiting' | 'snoozed' | 'info' | 'completed'
  sender: text("sender"),
  reason: text("reason").notNull(),
  impact: text("impact"),
  slaStatus: text("sla_status"), // 'breaching' | 'warning' | 'safe'
  waitingOn: text("waiting_on"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;

// EOD Checklist Tasks
export const eodTasks = pgTable("eod_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  order: integer("order").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const insertEodTaskSchema = createInsertSchema(eodTasks).omit({ id: true });
export type InsertEodTask = z.infer<typeof insertEodTaskSchema>;
export type EodTask = typeof eodTasks.$inferSelect;

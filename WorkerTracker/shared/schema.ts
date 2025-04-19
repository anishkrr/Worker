import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task table with enhanced features for scheduling and notifications
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isDaily: boolean("is_daily").default(false),
  taskType: text("task_type").notNull(), // "yes-no" or "letter" or "subjective"
  letterValue: varchar("letter_value", { length: 1 }),
  dailyPosition: integer("daily_position"), // position in daily tasks (1-based)
  
  // New fields for scheduling
  scheduledDate: date("scheduled_date"),
  scheduledTime: text("scheduled_time"), // Store as HH:MM format
  endTime: text("end_time"), // Store as HH:MM format
  hasTimeRequired: boolean("has_time_required").default(true),
  duration: integer("duration"), // Duration in minutes
  notificationTime: integer("notification_time"), // Minutes before task to notify
  
  // Recurrence fields
  isRecurring: boolean("is_recurring").default(false),
  recurringType: text("recurring_type"), // daily, weekly, monthly, custom
  recurringDays: text("recurring_days"), // Comma-separated days for weekly recurrence (1-7)
  recurringEndDate: date("recurring_end_date"),
  
  // Fields for subjective tasks
  subjectiveContent: text("subjective_content"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Note table with enhanced date association
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  associatedDate: date("associated_date"), // Date this note is associated with
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Settings table for app configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Notification settings table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  notificationTime: timestamp("notification_time").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

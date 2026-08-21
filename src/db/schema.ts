/**
 * NEXUS Database Schema
 * PostgreSQL schema using Drizzle ORM
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/**
 * Users table
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  timezone: varchar("timezone", { length: 100 }).notNull().default("UTC"),
  preferences: jsonb("preferences").notNull().default({
    theme: "system",
    startOfWeek: 1,
    timeFormat: "24h",
    dateFormat: "yyyy-MM-dd",
    language: "en",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Tasks table
 */
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).notNull().default("inbox"),
    priority: varchar("priority", { length: 50 }).notNull().default("medium"),
    dueDate: timestamp("due_date"),
    scheduledDate: timestamp("scheduled_date"),
    startTime: timestamp("start_time"), // Day Flow scheduling
    endTime: timestamp("end_time"), // Day Flow scheduling
    estimatedDuration: integer("estimated_duration"), // minutes
    actualDuration: integer("actual_duration"), // minutes
    projectId: uuid("project_id"),
    goalId: uuid("goal_id"),
    parentTaskId: uuid("parent_task_id"),
    tags: jsonb("tags").notNull().default([]),
    order: integer("order").notNull().default(0),
    isFlexible: boolean("is_flexible").notNull().default(true),
    schedulingBehavior: varchar("scheduling_behavior", { length: 20 })
      .notNull()
      .default("flexible"),
    reminder: jsonb("reminder"),
    recurrence: jsonb("recurrence"), // TaskRecurrence object
    completedAt: timestamp("completed_at"),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tasks_user_id_idx").on(table.userId),
    statusIdx: index("tasks_status_idx").on(table.status),
    projectIdIdx: index("tasks_project_id_idx").on(table.projectId),
    goalIdIdx: index("tasks_goal_id_idx").on(table.goalId),
    dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
    scheduledDateIdx: index("tasks_scheduled_date_idx").on(table.scheduledDate),
    startTimeIdx: index("tasks_start_time_idx").on(table.startTime),
  })
);

/**
 * Projects table
 */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: varchar("color", { length: 50 }),
    icon: varchar("icon", { length: 50 }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    startDate: timestamp("start_date"),
    targetEndDate: timestamp("target_end_date"),
    targetDate: timestamp("target_date"),
    actualEndDate: timestamp("actual_end_date"),
    completedAt: timestamp("completed_at"),
    goalId: uuid("goal_id"),
    milestoneId: uuid("milestone_id"),
    priority: varchar("priority", { length: 50 }).notNull().default("medium"),
    tags: jsonb("tags").notNull().default([]),
    accent: varchar("accent", { length: 50 }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
    statusIdx: index("projects_status_idx").on(table.status),
  })
);

/**
 * Goals table
 */
export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    priority: varchar("priority", { length: 50 }).notNull().default("medium"),
    targetDate: timestamp("target_date"),
    completedAt: timestamp("completed_at"),
    icon: varchar("icon", { length: 50 }),
    accent: varchar("accent", { length: 50 }),
    parentGoalId: uuid("parent_goal_id"),
    progress: integer("progress").notNull().default(0),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("goals_user_id_idx").on(table.userId),
    statusIdx: index("goals_status_idx").on(table.status),
  })
);

/**
 * Milestones table
 */
export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).notNull().default("planned"),
    targetDate: timestamp("target_date"),
    completedAt: timestamp("completed_at"),
    projectId: uuid("project_id"),
    goalId: uuid("goal_id"),
    order: integer("order").notNull().default(0),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("milestones_user_id_idx").on(table.userId),
    projectIdIdx: index("milestones_project_id_idx").on(table.projectId),
    goalIdIdx: index("milestones_goal_id_idx").on(table.goalId),
  })
);

/**
 * Tags table
 */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 50 }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tags_user_id_idx").on(table.userId),
  })
);

/**
 * Notes table
 */
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }),
    content: text("content").notNull(),
    taskId: uuid("task_id"),
    projectId: uuid("project_id"),
    tags: jsonb("tags").notNull().default([]),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
    taskIdIdx: index("notes_task_id_idx").on(table.taskId),
    projectIdIdx: index("notes_project_id_idx").on(table.projectId),
  })
);

/**
 * Calendar Events table
 */
export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    location: varchar("location", { length: 500 }),
    isAllDay: boolean("is_all_day").notNull().default(false),
    taskId: uuid("task_id"),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("calendar_events_user_id_idx").on(table.userId),
    startTimeIdx: index("calendar_events_start_time_idx").on(table.startTime),
  })
);

/**
 * Focus Sessions table
 */
export const focusSessions = pgTable(
  "focus_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id"),
    projectId: uuid("project_id"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    duration: integer("duration"), // minutes
    quality: varchar("quality", { length: 50 }),
    notes: text("notes"),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("focus_sessions_user_id_idx").on(table.userId),
    taskIdIdx: index("focus_sessions_task_id_idx").on(table.taskId),
    startTimeIdx: index("focus_sessions_start_time_idx").on(table.startTime),
  })
);

/**
 * Reminders table
 */
export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id"),
    eventId: uuid("event_id"),
    message: text("message").notNull(),
    remindAt: timestamp("remind_at").notNull(),
    isTriggered: boolean("is_triggered").notNull().default(false),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("reminders_user_id_idx").on(table.userId),
    remindAtIdx: index("reminders_remind_at_idx").on(table.remindAt),
  })
);

/**
 * Task History table
 */
export const taskHistory = pgTable(
  "task_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    changes: jsonb("changes").notNull().default({}),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    taskIdIdx: index("task_history_task_id_idx").on(table.taskId),
    userIdIdx: index("task_history_user_id_idx").on(table.userId),
  })
);

/**
 * Notifications table
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    actionUrl: text("action_url"),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  })
);

/**
 * Settings table
 */
export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  notifications: jsonb("notifications").notNull().default({
    enabled: true,
    taskReminders: true,
    dailyDigest: false,
    weeklyReview: false,
    milestoneAlerts: true,
  }),
  focus: jsonb("focus").notNull().default({
    defaultDuration: 25,
    breakDuration: 5,
    autoStartBreaks: false,
    doNotDisturbMode: false,
  }),
  privacy: jsonb("privacy").notNull().default({
    analyticsEnabled: true,
    crashReportsEnabled: true,
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

/**
 * NEXUS Domain Types
 * Core entity definitions for the productivity platform
 */

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  startOfWeek: 0 | 1 | 6; // Sunday, Monday, Saturday
  timeFormat: "12h" | "24h";
  dateFormat: string;
  language: string;
}

export const WEEK_STARTS = [0, 1, 6] as const;
export type WeekStart = (typeof WEEK_STARTS)[number];

/**
 * Task entity
 * Central to the NEXUS experience — one model for Inbox, Today, and Day Flow
 */
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date;
  endTime?: Date;
  projectId?: string;
  goalId?: string;
  parentTaskId?: string;
  tags: string[];
  recurrence?: TaskRecurrence;
  reminder?: TaskReminder;
  schedulingBehavior: SchedulingBehavior;
  order: number;
  completedAt?: Date;
  userId: string;
}

export const TASK_STATUSES = [
  "inbox",
  "planned",
  "ready",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "archived",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const SCHEDULING_BEHAVIORS = ["fixed", "flexible"] as const;

export type SchedulingBehavior = (typeof SCHEDULING_BEHAVIORS)[number];

export interface TaskRecurrence {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface TaskReminder {
  enabled: boolean;
  remindAt?: Date;
  offsetMinutes?: number;
}

/**
 * Project entity
 * "What am I building?" — may stand alone or belong to a Goal / Milestone.
 */
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: TaskPriority;
  goalId?: string;
  milestoneId?: string;
  startDate?: Date;
  targetDate?: Date;
  completedAt?: Date;
  icon?: string;
  accent?: AccentToken;
  tags: string[];
  order: number;
  userId: string;
}

export const PROJECT_STATUSES = [
  "planned",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * Goal entity
 * "Why am I doing it?"
 * Progress is calculated from the hierarchy, not stored as source of truth.
 */
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  status: GoalStatus;
  priority: TaskPriority;
  targetDate?: Date;
  completedAt?: Date;
  icon?: string;
  accent?: AccentToken;
  parentGoalId?: string;
  userId: string;
}

export const GOAL_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

/**
 * Milestone entity
 * A checkpoint on a Goal. May contain multiple Projects.
 */
export interface Milestone extends BaseEntity {
  title: string;
  description?: string;
  status: MilestoneStatus;
  goalId: string;
  targetDate?: Date;
  completedAt?: Date;
  order: number;
  userId: string;
}

export const MILESTONE_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;

export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const ACCENT_TOKENS = [
  "purple",
  "pink",
  "orange",
  "teal",
  "indigo",
] as const;

export type AccentToken = (typeof ACCENT_TOKENS)[number];

/**
 * Lightweight activity event for project/goal feeds.
 * Never fabricated — recorded from real mutations.
 */
export interface ActivityEvent {
  id: string;
  type: ActivityType;
  entityType: "goal" | "milestone" | "project" | "task";
  entityId: string;
  message: string;
  createdAt: Date;
}

export const ACTIVITY_TYPES = [
  "goal_created",
  "goal_completed",
  "goal_updated",
  "milestone_created",
  "milestone_completed",
  "project_created",
  "project_completed",
  "project_updated",
  "task_added",
  "task_completed",
  "deadline_changed",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * Tag entity
 * For categorizing tasks, notes, etc.
 */
export interface Tag extends BaseEntity {
  name: string;
  color?: string;
  userId: string;
}

/**
 * Note entity
 * Lightweight contextual knowledge — not a document editor.
 */
export interface Note extends BaseEntity {
  title?: string;
  content: string;
  taskId?: string;
  projectId?: string;
  goalId?: string;
  tags: string[];
  archived: boolean;
  userId: string;
}

/**
 * Calendar Event entity
 * Time-blocked appointments. Tasks with startTime also appear on the calendar.
 */
export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  taskId?: string;
  schedulingBehavior: SchedulingBehavior;
  userId: string;
}

export const FOCUS_SESSION_STATUSES = [
  "active",
  "paused",
  "completed",
  "abandoned",
] as const;

export type FocusSessionStatus = (typeof FOCUS_SESSION_STATUSES)[number];

/**
 * Focus Session entity
 * Real elapsed time only. Interruptions increment on pause.
 */
export interface FocusSession extends BaseEntity {
  taskId?: string;
  projectId?: string;
  goalId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  accumulatedMs: number;
  lastResumeAt?: Date;
  pausedAt?: Date;
  interruptions: number;
  status: FocusSessionStatus;
  quality?: FocusQuality;
  notes?: string;
  userId: string;
}

export type FocusQuality = "excellent" | "good" | "fair" | "poor";

export interface WeeklyReview extends BaseEntity {
  weekStart: Date;
  weekEnd: Date;
  workedWell: string;
  didntWork: string;
  shouldChange: string;
  userId: string;
}

export interface AppSettings {
  profileName: string;
  startOfWeek: WeekStart;
  timeFormat: "12h" | "24h";
  defaultDurationMinutes: number;
  dayStartHour: number;
  dayEndHour: number;
  defaultReminderOffsetMinutes: number;
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    deadlines: boolean;
    focus: boolean;
    weeklyReview: boolean;
  };
  focus: FocusSettings;
  privacy: PrivacySettings;
  onboardingCompleted: boolean;
  triggeredReminderKeys: string[];
}

/**
 * Reminder entity
 */
export interface Reminder extends BaseEntity {
  taskId?: string;
  eventId?: string;
  message: string;
  remindAt: Date;
  isTriggered: boolean;
  userId: string;
}

/**
 * Task History entity
 * Audit trail for task changes — used by future Insights
 */
export interface TaskHistory extends BaseEntity {
  taskId: string;
  action: TaskHistoryAction;
  changes: Record<string, unknown>;
  userId: string;
}

export const TASK_HISTORY_ACTIONS = [
  "created",
  "updated",
  "rescheduled",
  "priority_changed",
  "started",
  "paused",
  "completed",
  "reopened",
  "archived",
  "deleted",
] as const;

export type TaskHistoryAction = (typeof TASK_HISTORY_ACTIONS)[number];

/**
 * Notification entity
 */
export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  userId: string;
}

export type NotificationType =
  | "task_due"
  | "task_overdue"
  | "reminder"
  | "milestone_reached"
  | "goal_progress"
  | "focus_complete"
  | "system";

/**
 * Settings entity
 * User configuration
 */
export interface Settings extends BaseEntity {
  userId: string;
  notifications: NotificationSettings;
  focus: FocusSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  dailyDigest: boolean;
  weeklyReview: boolean;
  milestoneAlerts: boolean;
}

export interface FocusSettings {
  defaultDuration: number; // minutes
  breakDuration: number; // minutes
  autoStartBreaks: boolean;
  doNotDisturbMode: boolean;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
}

/**
 * Pending mutation prepared for future synchronization.
 * Local-first writes always succeed; these records are the sync ledger.
 */
export interface PendingMutation {
  id: string;
  operation: "create" | "update" | "delete" | "complete" | "reschedule";
  taskId: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  status: "pending" | "synced" | "failed";
}

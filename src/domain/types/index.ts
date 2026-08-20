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

/**
 * Task entity
 * Central to the NEXUS experience
 */
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date; // When task is scheduled to start
  endTime?: Date; // When task is scheduled to end
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  projectId?: string;
  goalId?: string;
  parentTaskId?: string; // For subtasks
  tags: string[];
  order: number; // For manual sorting
  completedAt?: Date;
  userId: string;
  isFlexible?: boolean; // Can be automatically rescheduled
  recurrence?: TaskRecurrence; // For recurring tasks
}

export type TaskStatus = 
  | "inbox"        // Unprocessed
  | "planned"      // Scheduled but not ready
  | "ready"        // Ready to work on
  | "in_progress"  // Currently working
  | "paused"       // Temporarily stopped
  | "blocked"      // Cannot proceed
  | "completed"    // Done
  | "archived";    // Removed from active view

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskRecurrence {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // Every N days/weeks/etc
  endDate?: Date;
  daysOfWeek?: number[]; // For weekly: 0-6
}

/**
 * Project entity
 * Groups related tasks
 */
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status: ProjectStatus;
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  goalId?: string; // Projects can contribute to goals
  userId: string;
}

export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";

/**
 * Goal entity
 * Long-term objectives
 */
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  category?: string;
  status: GoalStatus;
  targetDate?: Date;
  progress: number; // 0-100
  userId: string;
}

export type GoalStatus = "active" | "completed" | "abandoned";

/**
 * Milestone entity
 * Key checkpoints for goals/projects
 */
export interface Milestone extends BaseEntity {
  title: string;
  description?: string;
  targetDate?: Date;
  completedAt?: Date;
  projectId?: string;
  goalId?: string;
  order: number;
  userId: string;
}

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
 * Quick capture and reference
 */
export interface Note extends BaseEntity {
  title?: string;
  content: string;
  taskId?: string;
  projectId?: string;
  tags: string[];
  userId: string;
}

/**
 * Calendar Event entity
 * Time-blocked events
 */
export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  taskId?: string;
  userId: string;
}

/**
 * Focus Session entity
 * Tracks focused work periods
 */
export interface FocusSession extends BaseEntity {
  taskId?: string;
  projectId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  quality?: FocusQuality;
  notes?: string;
  userId: string;
}

export type FocusQuality = "excellent" | "good" | "fair" | "poor";

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
 * Audit trail for task changes
 */
export interface TaskHistory extends BaseEntity {
  taskId: string;
  action: TaskHistoryAction;
  changes: Record<string, unknown>;
  userId: string;
}

export type TaskHistoryAction =
  | "created"
  | "updated"
  | "completed"
  | "reopened"
  | "archived"
  | "deleted";

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

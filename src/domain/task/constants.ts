import type { TaskPriority, TaskStatus } from "@/domain/types";

/** Stable local identity until authentication exists. UUID-shaped for future Postgres sync. */
export const LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";

export const DEFAULT_DURATION_MINUTES = 30;
export const MIN_DURATION_MINUTES = 15;
export const MAX_DURATION_MINUTES = 24 * 60;

export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;
export const DEFAULT_HOUR_HEIGHT = 64;

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: "Inbox",
  planned: "Planned",
  ready: "Ready",
  in_progress: "In progress",
  paused: "Paused",
  blocked: "Blocked",
  completed: "Completed",
  archived: "Archived",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

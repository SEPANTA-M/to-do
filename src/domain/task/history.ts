import type { Task, TaskHistory, TaskHistoryAction } from "@/domain/types";
import { LOCAL_USER_ID } from "./constants";

export function createHistoryEntry(
  taskId: string,
  action: TaskHistoryAction,
  changes: Record<string, unknown>,
  now: Date,
  userId: string = LOCAL_USER_ID
): TaskHistory {
  return {
    id: createId(),
    taskId,
    action,
    changes: serializeChanges(changes),
    userId,
    createdAt: now,
    updatedAt: now,
  };
}

export function inferHistoryAction(
  previous: Task,
  next: Task
): TaskHistoryAction {
  if (previous.status !== next.status) {
    if (next.status === "completed") return "completed";
    if (next.status === "in_progress") return "started";
    if (next.status === "paused") return "paused";
    if (next.status === "archived") return "archived";
    if (previous.status === "completed") return "reopened";
  }

  if (previous.priority !== next.priority) return "priority_changed";

  const startChanged = previous.startTime?.getTime() !== next.startTime?.getTime();
  const endChanged = previous.endTime?.getTime() !== next.endTime?.getTime();
  if (startChanged || endChanged) return "rescheduled";

  return "updated";
}

function serializeChanges(changes: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

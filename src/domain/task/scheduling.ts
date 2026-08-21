import { addMinutes, startOfDay } from "date-fns";
import type { SchedulingBehavior, Task } from "@/domain/types";
import { clampDuration, getTaskDurationMinutes } from "./time";

/**
 * Move a task to a new start time.
 * Duration is preserved unless the caller also resizes.
 * Updates startTime, endTime, scheduledDate, and dueDate as specified.
 */
export function moveTaskToStart(task: Task, newStart: Date, now: Date): Task {
  const duration = getTaskDurationMinutes(task);
  const startTime = new Date(newStart);
  startTime.setSeconds(0, 0);
  const endTime = addMinutes(startTime, duration);
  const day = startOfDay(startTime);

  return {
    ...task,
    startTime,
    endTime,
    scheduledDate: day,
    dueDate: day,
    updatedAt: now,
  };
}

/**
 * Resize a task by changing estimated duration.
 * Start time is preserved. endTime and estimatedDuration update together.
 */
export function resizeTaskDuration(
  task: Task,
  durationMinutes: number,
  now: Date
): Task {
  const duration = clampDuration(durationMinutes);
  const startTime = task.startTime ? new Date(task.startTime) : undefined;
  const endTime = startTime ? addMinutes(startTime, duration) : undefined;

  return {
    ...task,
    estimatedDuration: duration,
    startTime,
    endTime,
    updatedAt: now,
  };
}

export function applySchedulingBehavior(
  task: Task,
  behavior: SchedulingBehavior,
  now: Date
): Task {
  return {
    ...task,
    schedulingBehavior: behavior,
    updatedAt: now,
  };
}

/**
 * Flexible tasks MAY be moved by the system when the user explicitly confirms
 * a schedule change. Fixed tasks must never be auto-moved.
 *
 * Phase 1 never auto-rearranges. This helper exists so a future scheduler
 * has a single, testable rule.
 */
export function canAutoMove(task: Task): boolean {
  return task.schedulingBehavior === "flexible";
}

export function withComputedEnd(task: Task): Task {
  if (!task.startTime) return task;
  const duration = getTaskDurationMinutes(task);
  const endTime = addMinutes(task.startTime, duration);
  if (task.endTime && task.endTime.getTime() === endTime.getTime()) return task;
  return { ...task, endTime, estimatedDuration: duration };
}

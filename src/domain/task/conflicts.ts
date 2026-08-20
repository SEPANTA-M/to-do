import type { Task } from "@/domain/types";
import { isActiveStatus } from "./status";
import { getTaskDurationMinutes } from "./time";

export interface ScheduleConflict {
  task: Task;
  other: Task;
  overlapStart: Date;
  overlapEnd: Date;
}

export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
}

export function getScheduledInterval(
  task: Pick<Task, "startTime" | "endTime" | "estimatedDuration">
): { start: Date; end: Date } | null {
  if (!task.startTime) return null;
  const start = task.startTime;
  const end =
    task.endTime && task.endTime.getTime() > start.getTime()
      ? task.endTime
      : new Date(start.getTime() + getTaskDurationMinutes(task) * 60_000);
  return { start, end };
}

/**
 * Detect overlapping scheduled tasks.
 * Completed and archived items do not conflict.
 */
export function detectConflicts(task: Task, allTasks: Task[]): Task[] {
  const interval = getScheduledInterval(task);
  if (!interval) return [];
  if (!isActiveStatus(task.status)) return [];

  return allTasks.filter((other) => {
    if (other.id === task.id) return false;
    if (!isActiveStatus(other.status)) return false;
    const otherInterval = getScheduledInterval(other);
    if (!otherInterval) return false;
    return intervalsOverlap(
      interval.start,
      interval.end,
      otherInterval.start,
      otherInterval.end
    );
  });
}

export function describeConflicts(task: Task, conflicts: Task[]): string {
  if (conflicts.length === 0) return "";
  const names = conflicts.map((item) => `“${item.title}”`).join(", ");
  const interval = getScheduledInterval(task);
  const formatTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const window = interval
    ? `${formatTime(interval.start)}–${formatTime(interval.end)}`
    : "this time";
  if (conflicts.length === 1) {
    return `${names} overlaps ${window}.`;
  }
  return `${names} overlap ${window}.`;
}

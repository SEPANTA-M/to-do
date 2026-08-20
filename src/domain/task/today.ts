import { isSameDay, startOfDay } from "date-fns";
import type { Task } from "@/domain/types";
import { isActiveStatus } from "./status";

/**
 * A task belongs to a given day if it is scheduled, due, started, or
 * completed on that calendar day. Archived tasks are excluded.
 */
export function isTaskOnDay(task: Task, day: Date): boolean {
  if (task.status === "archived") return false;

  const dates: Date[] = [];
  if (task.startTime) dates.push(task.startTime);
  if (task.scheduledDate) dates.push(task.scheduledDate);
  if (task.dueDate) dates.push(task.dueDate);
  if (task.completedAt) dates.push(task.completedAt);

  return dates.some((date) => isSameDay(date, day));
}

export function getTasksOnDay(tasks: Task[], day: Date): Task[] {
  return tasks.filter((task) => isTaskOnDay(task, day));
}

export function getScheduledTasksOnDay(tasks: Task[], day: Date): Task[] {
  return tasks.filter((task) => {
    if (task.status === "archived") return false;
    if (!task.startTime) return false;
    return isSameDay(task.startTime, day);
  });
}

export interface DayMomentum {
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  completionPercentage: number;
  focusMinutes: number;
}

/**
 * Real momentum from actual task data. No placeholders.
 */
export function computeDayMomentum(tasks: Task[], day: Date): DayMomentum {
  const dayTasks = getTasksOnDay(tasks, day);
  const completed = dayTasks.filter((task) => task.status === "completed");
  const remaining = dayTasks.filter((task) => isActiveStatus(task.status));
  const totalCount = completed.length + remaining.length;
  const completionPercentage =
    totalCount === 0 ? 0 : Math.round((completed.length / totalCount) * 100);

  const focusMinutes = completed.reduce((sum, task) => {
    const minutes = task.actualDuration ?? task.estimatedDuration ?? 0;
    return sum + Math.max(0, minutes);
  }, 0);

  return {
    completedCount: completed.length,
    remainingCount: remaining.length,
    totalCount,
    completionPercentage,
    focusMinutes,
  };
}

export function startOfLocalDay(date: Date): Date {
  return startOfDay(date);
}

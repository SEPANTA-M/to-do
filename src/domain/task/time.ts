import { addMinutes, differenceInMinutes, startOfDay } from "date-fns";
import type { Task } from "@/domain/types";
import {
  DEFAULT_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
} from "./constants";

export function clampDuration(minutes: number): number {
  if (!Number.isFinite(minutes)) return DEFAULT_DURATION_MINUTES;
  const rounded = Math.round(minutes);
  return Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, rounded));
}

export function getTaskDurationMinutes(task: Pick<Task, "startTime" | "endTime" | "estimatedDuration">): number {
  if (task.startTime && task.endTime) {
    const delta = differenceInMinutes(task.endTime, task.startTime);
    if (delta > 0) return delta;
  }
  if (task.estimatedDuration && task.estimatedDuration > 0) {
    return task.estimatedDuration;
  }
  return DEFAULT_DURATION_MINUTES;
}

export function computeEndTime(startTime: Date, durationMinutes: number): Date {
  return addMinutes(startTime, clampDuration(durationMinutes));
}

export function atTimeOnDate(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function dateFromMinutes(day: Date, minutes: number): Date {
  const clamped = Math.max(0, Math.min(24 * 60, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return atTimeOnDate(day, hours, mins);
}

export function snapMinutes(minutes: number, granularity: number): number {
  const snapped = Math.round(minutes / granularity) * granularity;
  return Math.max(0, Math.min(24 * 60, snapped));
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function toDate(value: Date | string | number | undefined | null): Date | undefined {
  if (value === undefined || value === null) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

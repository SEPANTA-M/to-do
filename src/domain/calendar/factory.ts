import { addMinutes } from "date-fns";
import type { CalendarEvent, SchedulingBehavior } from "@/domain/types";
import { createId } from "@/domain/ids";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { DEFAULT_DURATION_MINUTES } from "@/domain/task/constants";
import { clampDuration } from "@/domain/task/time";

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  location?: string;
  isAllDay?: boolean;
  taskId?: string;
  schedulingBehavior?: SchedulingBehavior;
  userId?: string;
  now?: Date;
  id?: string;
}

export function createCalendarEvent(input: CreateEventInput): CalendarEvent {
  const title = input.title.trim();
  if (!title) throw new Error("Event title is required");
  const startTime = new Date(input.startTime);
  if (Number.isNaN(startTime.getTime())) throw new Error("Event start time is invalid");
  const duration = clampDuration(input.durationMinutes ?? DEFAULT_DURATION_MINUTES);
  let endTime = input.endTime ? new Date(input.endTime) : addMinutes(startTime, duration);
  if (endTime.getTime() <= startTime.getTime()) {
    endTime = addMinutes(startTime, duration);
  }
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("event"),
    title,
    description: input.description?.trim() || undefined,
    startTime,
    endTime,
    location: input.location?.trim() || undefined,
    isAllDay: Boolean(input.isAllDay),
    taskId: input.taskId,
    schedulingBehavior: input.schedulingBehavior ?? "fixed",
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  startTime?: Date;
  endTime?: Date;
  location?: string | null;
  isAllDay?: boolean;
  taskId?: string | null;
  schedulingBehavior?: SchedulingBehavior;
}

export function applyEventUpdate(
  event: CalendarEvent,
  updates: UpdateEventInput,
  now = new Date()
): CalendarEvent {
  const next: CalendarEvent = { ...event, updatedAt: now };
  if (updates.title !== undefined) {
    const title = updates.title.trim();
    if (!title) throw new Error("Event title is required");
    next.title = title;
  }
  if (updates.description !== undefined) {
    next.description = updates.description?.trim() || undefined;
  }
  if (updates.startTime !== undefined) next.startTime = new Date(updates.startTime);
  if (updates.endTime !== undefined) next.endTime = new Date(updates.endTime);
  if (next.endTime.getTime() <= next.startTime.getTime()) {
    next.endTime = addMinutes(next.startTime, 30);
  }
  if (updates.location !== undefined) {
    next.location = updates.location?.trim() || undefined;
  }
  if (updates.isAllDay !== undefined) next.isAllDay = updates.isAllDay;
  if (updates.taskId !== undefined) next.taskId = updates.taskId ?? undefined;
  if (updates.schedulingBehavior !== undefined) {
    next.schedulingBehavior = updates.schedulingBehavior;
  }
  return next;
}

export function moveEventToStart(event: CalendarEvent, newStart: Date, now = new Date()): CalendarEvent {
  const duration = Math.max(15, Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60_000));
  const startTime = new Date(newStart);
  startTime.setSeconds(0, 0);
  return {
    ...event,
    startTime,
    endTime: addMinutes(startTime, duration),
    updatedAt: now,
  };
}

export function resizeEventDuration(
  event: CalendarEvent,
  durationMinutes: number,
  now = new Date()
): CalendarEvent {
  const duration = clampDuration(durationMinutes);
  return {
    ...event,
    endTime: addMinutes(event.startTime, duration),
    updatedAt: now,
  };
}

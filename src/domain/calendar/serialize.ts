import type { CalendarEvent, SchedulingBehavior } from "@/domain/types";
import { toDate } from "@/domain/task/time";

interface SerializedEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay?: boolean;
  taskId?: string;
  schedulingBehavior?: SchedulingBehavior;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeEvent(event: CalendarEvent): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    location: event.location,
    isAllDay: event.isAllDay,
    taskId: event.taskId,
    schedulingBehavior: event.schedulingBehavior,
    userId: event.userId,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function deserializeEvent(raw: SerializedEvent): CalendarEvent {
  const startTime = toDate(raw.startTime) ?? new Date(0);
  const endTime = toDate(raw.endTime) ?? startTime;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    startTime,
    endTime,
    location: raw.location,
    isAllDay: Boolean(raw.isAllDay),
    taskId: raw.taskId,
    schedulingBehavior: raw.schedulingBehavior ?? "fixed",
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

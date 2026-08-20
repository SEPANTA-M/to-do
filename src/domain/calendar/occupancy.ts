import { isSameDay } from "date-fns";
import type { CalendarEvent, SchedulingBehavior, Task } from "@/domain/types";
import { getScheduledInterval } from "@/domain/task/conflicts";
import { isActiveStatus } from "@/domain/task/status";

export interface OccupiedInterval {
  id: string;
  kind: "task" | "event";
  title: string;
  start: Date;
  end: Date;
  schedulingBehavior: SchedulingBehavior;
}

export function occupiedFromTasks(tasks: Task[], day: Date): OccupiedInterval[] {
  const result: OccupiedInterval[] = [];
  for (const task of tasks) {
    if (task.status === "archived" || task.status === "completed") continue;
    if (!isActiveStatus(task.status) && task.status !== "planned" && task.status !== "inbox") {
      continue;
    }
    const interval = getScheduledInterval(task);
    if (!interval) continue;
    if (!isSameDay(interval.start, day) && !isSameDay(interval.end, day)) continue;
    result.push({
      id: task.id,
      kind: "task",
      title: task.title,
      start: interval.start,
      end: interval.end,
      schedulingBehavior: task.schedulingBehavior,
    });
  }
  return result;
}

export function occupiedFromEvents(events: CalendarEvent[], day: Date): OccupiedInterval[] {
  return events
    .filter((event) => isSameDay(event.startTime, day) || (event.isAllDay && isSameDay(event.startTime, day)))
    .map((event) => ({
      id: event.id,
      kind: "event" as const,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      schedulingBehavior: event.schedulingBehavior,
    }));
}

export function occupiedForDay(
  tasks: Task[],
  events: CalendarEvent[],
  day: Date
): OccupiedInterval[] {
  return [...occupiedFromTasks(tasks, day), ...occupiedFromEvents(events, day)].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
}

import { addMinutes, format } from "date-fns";
import type { AppSettings, CalendarEvent, Task } from "@/domain/types";
import { PRIORITY_RANK } from "@/domain/task/constants";
import { getTaskDurationMinutes, dateFromMinutes } from "@/domain/task/time";
import { occupiedForDay, type OccupiedInterval } from "@/domain/calendar/occupancy";

export interface FreeSlot {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface PlacementSuggestion {
  taskId: string;
  title: string;
  slot: FreeSlot;
  reason: string;
}

export interface SchedulePreview {
  slots: FreeSlot[];
  suggestions: PlacementSuggestion[];
  descriptions: string[];
}

function mergeOccupied(blocks: OccupiedInterval[]): OccupiedInterval[] {
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: OccupiedInterval[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]!;
    const last = merged[merged.length - 1]!;
    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) last.end = current.end;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

export function findFreeSlots(
  day: Date,
  occupied: OccupiedInterval[],
  options: {
    dayStartHour: number;
    dayEndHour: number;
    minDuration: number;
  }
): FreeSlot[] {
  const startHour = Math.min(23, Math.max(0, options.dayStartHour));
  const endHour = Math.min(24, Math.max(startHour + 1, options.dayEndHour));
  const windowStart = dateFromMinutes(day, startHour * 60);
  const windowEnd = dateFromMinutes(day, endHour * 60);
  const merged = mergeOccupied(
    occupied.filter(
      (block) => block.end.getTime() > windowStart.getTime() && block.start.getTime() < windowEnd.getTime()
    )
  );

  const slots: FreeSlot[] = [];
  let cursor = windowStart;
  for (const block of merged) {
    const blockStart = block.start.getTime() < windowStart.getTime() ? windowStart : block.start;
    if (blockStart.getTime() - cursor.getTime() >= options.minDuration * 60_000) {
      const durationMinutes = Math.round((blockStart.getTime() - cursor.getTime()) / 60_000);
      slots.push({ start: cursor, end: blockStart, durationMinutes });
    }
    if (block.end.getTime() > cursor.getTime()) cursor = block.end;
  }
  if (windowEnd.getTime() - cursor.getTime() >= options.minDuration * 60_000) {
    const durationMinutes = Math.round((windowEnd.getTime() - cursor.getTime()) / 60_000);
    slots.push({ start: cursor, end: windowEnd, durationMinutes });
  }
  return slots;
}

export function describeSlot(slot: FreeSlot, timeFormat: "12h" | "24h" = "24h"): string {
  const pattern = timeFormat === "12h" ? "h:mm a" : "HH:mm";
  return `You have ${slot.durationMinutes} minutes available between ${format(slot.start, pattern)} and ${format(slot.end, pattern)}.`;
}

export function suggestPlacements(
  unscheduled: Task[],
  slots: FreeSlot[]
): PlacementSuggestion[] {
  const remaining = slots.map((slot) => ({ ...slot }));
  const ranked = [...unscheduled]
    .filter((task) => task.status !== "completed" && task.status !== "archived")
    .sort((a, b) => {
      const dueA = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const dueB = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (dueA !== dueB) return dueA - dueB;
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });

  const suggestions: PlacementSuggestion[] = [];
  for (const task of ranked) {
    const duration = getTaskDurationMinutes(task);
    const index = remaining.findIndex((slot) => slot.durationMinutes >= duration);
    if (index < 0) continue;
    const slot = remaining[index]!;
    const start = slot.start;
    const end = addMinutes(start, duration);
    suggestions.push({
      taskId: task.id,
      title: task.title,
      slot: { start, end, durationMinutes: duration },
      reason: task.dueDate
        ? `Fits before the deadline · ${task.priority} priority`
        : `Earliest slot that fits ${duration} min · ${task.priority} priority`,
    });
    const leftover = slot.durationMinutes - duration;
    if (leftover >= 15) {
      remaining[index] = {
        start: end,
        end: slot.end,
        durationMinutes: leftover,
      };
    } else {
      remaining.splice(index, 1);
    }
  }
  return suggestions;
}

export function buildSchedulePreview(
  day: Date,
  tasks: Task[],
  events: CalendarEvent[],
  settings: Pick<AppSettings, "dayStartHour" | "dayEndHour" | "timeFormat" | "defaultDurationMinutes">
): SchedulePreview {
  const occupied = occupiedForDay(tasks, events, day);
  const slots = findFreeSlots(day, occupied, {
    dayStartHour: settings.dayStartHour,
    dayEndHour: settings.dayEndHour,
    minDuration: 15,
  });
  const unscheduled = tasks.filter(
    (task) =>
      !task.startTime &&
      task.status !== "completed" &&
      task.status !== "archived" &&
      (task.dueDate ? isSameCalendarDay(task.dueDate, day) || task.dueDate.getTime() <= day.getTime() : true)
  );
  const suggestions = suggestPlacements(unscheduled, slots);
  return {
    slots,
    suggestions,
    descriptions: slots.map((slot) => describeSlot(slot, settings.timeFormat)),
  };
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Apply a previewed placement. Caller persists. Never auto-called. */
export function applySuggestionStart(suggestion: PlacementSuggestion): Date {
  return suggestion.slot.start;
}

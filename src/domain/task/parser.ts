import { addDays, startOfDay } from "date-fns";
import type { ParsedTaskInput, TaskParser } from "./parser-types";
import type { TaskPriority, TaskRecurrence } from "@/domain/types";
import { DEFAULT_DURATION_MINUTES } from "./constants";
import { atTimeOnDate } from "./time";

export type { ParsedTaskInput, TaskParser } from "./parser-types";

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

/**
 * Deterministic local parser for common natural-language task phrases.
 * This is not AI. Ambiguous input is left in the title rather than guessed.
 */
export class DeterministicTaskParser implements TaskParser {
  parse(input: string, now: Date = new Date()): ParsedTaskInput {
    let working = input.trim();
    const tags: string[] = [];
    let priority: TaskPriority | undefined;
    let duration: number | undefined;
    let timeMinutes: number | undefined;
    let date: Date | undefined;
    let recurrence: TaskRecurrence | undefined;

    const take = (pattern: RegExp, handler: (match: RegExpExecArray) => void) => {
      pattern.lastIndex = 0;
      const match = pattern.exec(working);
      if (!match) return;
      handler(match);
      working = `${working.slice(0, match.index)} ${working.slice(match.index + match[0].length)}`;
      working = working.replace(/\s{2,}/g, " ").trim();
    };

    // Tags: #focus
    working = working.replace(/(?:^|\s)#([a-zA-Z][\w-]{0,31})/g, (_raw, tag: string) => {
      tags.push(tag.toLowerCase());
      return " ";
    });
    working = working.replace(/\s{2,}/g, " ").trim();

    // Recurrence
    take(/\b(every\s+day|daily)\b/i, () => {
      recurrence = { frequency: "daily", interval: 1 };
    });
    take(/\b(every\s+week|weekly)\b/i, () => {
      recurrence = { frequency: "weekly", interval: 1 };
    });

    // Priority
    take(/\b(critical|urgent)\b/i, () => {
      priority = "critical";
    });
    take(/\b(high\s+priority|p1)\b/i, () => {
      priority = "high";
    });
    take(/\b(low\s+priority|p4)\b/i, () => {
      priority = "low";
    });
    take(/\b(medium\s+priority|p2|p3)\b/i, () => {
      priority = "medium";
    });

    // Duration: "for 60 minutes", "for 1 hour", "for 1h", "for 30m"
    take(/\bfor\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b/i, (match) => {
      duration = Math.round(parseFloat(match[1]) * 60);
    });
    take(/\bfor\s+(\d+)\s*(minutes?|mins?|m)\b/i, (match) => {
      duration = parseInt(match[1], 10);
    });
    take(/\b(\d+)\s*(minutes?|mins?)\b/i, (match) => {
      duration = parseInt(match[1], 10);
    });
    take(/\b(\d+(?:\.\d+)?)\s*(hours?|hrs?)\b/i, (match) => {
      duration = Math.round(parseFloat(match[1]) * 60);
    });

    // Time: "at 7pm", "at 19:00", "7:00 pm"
    take(/\b(?:at|@)\s*(\d{1,2})(?::(\d{2}))\s*(am|pm)\b/i, (match) => {
      timeMinutes = parseClock(match[1], match[2], match[3]);
    });
    take(/\b(?:at|@)\s*(\d{1,2})\s*(am|pm)\b/i, (match) => {
      timeMinutes = parseClock(match[1], "0", match[2]);
    });
    take(/\b(?:at|@)\s*(\d{1,2}):(\d{2})\b/i, (match) => {
      timeMinutes = parseClock(match[1], match[2], undefined);
    });
    take(/\b(\d{1,2})(?::(\d{2}))\s*(am|pm)\b/i, (match) => {
      timeMinutes = parseClock(match[1], match[2] ?? "0", match[3]);
    });

    // Dates
    take(/\btomorrow\b/i, () => {
      date = addDays(startOfDay(now), 1);
    });
    take(/\btoday\b/i, () => {
      date = startOfDay(now);
    });
    take(/\btonight\b/i, () => {
      date = startOfDay(now);
      if (timeMinutes === undefined) timeMinutes = 20 * 60;
    });
    take(/\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, (match) => {
      date = nextWeekday(now, WEEKDAYS[match[1].toLowerCase()], true);
    });
    take(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, (match) => {
      date = nextWeekday(now, WEEKDAYS[match[1].toLowerCase()], false);
    });
    take(/\b(\d{4})-(\d{2})-(\d{2})\b/, (match) => {
      date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
    });
    take(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
      (match) => {
        const month = MONTHS[match[1].toLowerCase()];
        const day = Number(match[2]);
        date = new Date(now.getFullYear(), month, day, 0, 0, 0, 0);
        if (date.getTime() < startOfDay(now).getTime()) {
          date = new Date(now.getFullYear() + 1, month, day, 0, 0, 0, 0);
        }
      }
    );

    working = working
      .replace(/\b(at|on|for|from|to)\b$/i, "")
      .replace(/^[,\-–—\s]+|[,\-–—\s]+$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const title = working.length > 0 ? working : input.trim();

    let startTime: Date | undefined;
    let dueDate: Date | undefined;

    if (date || timeMinutes !== undefined) {
      const day = date ?? startOfDay(now);
      if (timeMinutes !== undefined) {
        startTime = atTimeOnDate(day, Math.floor(timeMinutes / 60), timeMinutes % 60);
        dueDate = startOfDay(day);
      } else {
        dueDate = startOfDay(day);
      }
    }

    return {
      title,
      dueDate,
      startTime,
      estimatedDuration: duration,
      priority,
      tags: tags.length > 0 ? tags : undefined,
      recurrence,
      remainder: title,
    };
  }
}

export const defaultTaskParser: TaskParser = new DeterministicTaskParser();

export function parseTaskText(input: string, now: Date = new Date()): ParsedTaskInput {
  return defaultTaskParser.parse(input, now);
}

function parseClock(hourRaw: string, minuteRaw: string | undefined, meridiem: string | undefined): number {
  let hour = Number(hourRaw);
  const minute = Number(minuteRaw ?? 0);
  if (meridiem) {
    const pm = meridiem.toLowerCase() === "pm";
    if (hour === 12) hour = pm ? 12 : 0;
    else if (pm) hour += 12;
  }
  hour = Math.min(23, Math.max(0, hour));
  const minutes = Math.min(59, Math.max(0, minute));
  return hour * 60 + minutes;
}

function nextWeekday(now: Date, weekday: number, forceNext: boolean): Date {
  const today = startOfDay(now);
  const current = today.getDay();
  let diff = weekday - current;
  if (diff < 0 || (diff === 0 && forceNext)) diff += 7;
  if (diff === 0 && !forceNext) return today;
  return addDays(today, diff);
}

export function inferredDuration(parsed: ParsedTaskInput): number {
  return parsed.estimatedDuration ?? DEFAULT_DURATION_MINUTES;
}

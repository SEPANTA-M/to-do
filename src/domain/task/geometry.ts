import type { Task } from "@/domain/types";
import { DAY_END_HOUR, DAY_START_HOUR, DEFAULT_HOUR_HEIGHT } from "./constants";
import { getTaskDurationMinutes, minutesFromMidnight, snapMinutes } from "./time";

export type TimeGranularity = 15 | 30 | 60;

export interface BlockGeometry {
  top: number;
  height: number;
  startMinutes: number;
  durationMinutes: number;
}

export interface DayFlowLayout {
  hourHeight: number;
  dayStartHour: number;
  dayEndHour: number;
  totalHours: number;
  totalHeight: number;
  granularity: TimeGranularity;
}

export function createDayFlowLayout(
  granularity: TimeGranularity = 15,
  hourHeight: number = DEFAULT_HOUR_HEIGHT
): DayFlowLayout {
  const totalHours = DAY_END_HOUR - DAY_START_HOUR;
  return {
    hourHeight,
    dayStartHour: DAY_START_HOUR,
    dayEndHour: DAY_END_HOUR,
    totalHours,
    totalHeight: totalHours * hourHeight,
    granularity,
  };
}

export function getBlockGeometry(task: Task, layout: DayFlowLayout): BlockGeometry | null {
  if (!task.startTime) return null;
  const durationMinutes = getTaskDurationMinutes(task);
  const startMinutes = minutesFromMidnight(task.startTime);
  const top =
    ((startMinutes - layout.dayStartHour * 60) / 60) * layout.hourHeight;
  const height = Math.max((durationMinutes / 60) * layout.hourHeight, 18);
  return { top, height, startMinutes, durationMinutes };
}

export function yToMinutes(y: number, layout: DayFlowLayout): number {
  const raw = layout.dayStartHour * 60 + (y / layout.hourHeight) * 60;
  return snapMinutes(raw, layout.granularity);
}

export function minutesToY(minutes: number, layout: DayFlowLayout): number {
  return ((minutes - layout.dayStartHour * 60) / 60) * layout.hourHeight;
}

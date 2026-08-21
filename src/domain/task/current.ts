import type { Task } from "@/domain/types";
import { PRIORITY_RANK } from "./constants";
import { isActiveStatus } from "./status";
import { getScheduledInterval } from "./conflicts";

/**
 * Deterministic "what should I do right now?" selection.
 * Not an AI engine — explicit ranked rules:
 *   1. Task already in progress
 *   2. Scheduled window covering now
 *   3. Ready tasks by priority, then soonest start
 *   4. Planned tasks with a start time today (soonest)
 *   5. Highest-priority remaining active task
 */
export function getCurrentTask(tasks: Task[], now: Date): Task | null {
  const active = tasks.filter((task) => isActiveStatus(task.status));
  if (active.length === 0) return null;

  const inProgress = active.filter((task) => task.status === "in_progress");
  if (inProgress.length > 0) {
    return sortByPriorityThenTime(inProgress, now)[0] ?? null;
  }

  const happeningNow = active.filter((task) => {
    const interval = getScheduledInterval(task);
    if (!interval) return false;
    return interval.start.getTime() <= now.getTime() && now.getTime() < interval.end.getTime();
  });
  if (happeningNow.length > 0) {
    return sortByPriorityThenTime(happeningNow, now)[0] ?? null;
  }

  const ready = active.filter((task) => task.status === "ready");
  if (ready.length > 0) {
    return sortByPriorityThenTime(ready, now)[0] ?? null;
  }

  const upcoming = active
    .filter((task) => task.startTime && task.startTime.getTime() >= now.getTime())
    .sort((a, b) => {
      const aStart = a.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bStart = b.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (aStart !== bStart) return aStart - bStart;
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });
  if (upcoming.length > 0) {
    return upcoming[0] ?? null;
  }

  return sortByPriorityThenTime(active, now)[0] ?? null;
}

function sortByPriorityThenTime(tasks: Task[], now: Date): Task[] {
  return [...tasks].sort((a, b) => {
    const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rank !== 0) return rank;

    const aStart = a.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bStart = b.startTime?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (aStart !== bStart) return aStart - bStart;

    const aDue = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;

    return a.createdAt.getTime() - b.createdAt.getTime() || now.getTime() * 0;
  });
}

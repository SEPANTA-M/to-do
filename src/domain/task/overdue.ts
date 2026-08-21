import { startOfDay } from "date-fns";
import type { Task } from "@/domain/types";
import { isActiveStatus } from "./status";

/**
 * A task is overdue when it has a due date before the start of today
 * and is still active. Overdue tasks are never deleted automatically.
 */
export function isOverdue(task: Task, now: Date): boolean {
  if (!task.dueDate) return false;
  if (!isActiveStatus(task.status)) return false;
  return task.dueDate.getTime() < startOfDay(now).getTime();
}

export function getOverdueTasks(tasks: Task[], now: Date): Task[] {
  return tasks
    .filter((task) => isOverdue(task, now))
    .sort((a, b) => {
      const aDue = a.dueDate?.getTime() ?? 0;
      const bDue = b.dueDate?.getTime() ?? 0;
      return aDue - bDue;
    });
}

import type { AppSettings, Notification, Task } from "@/domain/types";
import { createId } from "@/domain/ids";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { isOverdue } from "@/domain/task/overdue";

export function reminderKey(kind: string, id: string, slot: string): string {
  return `${kind}:${id}:${slot}`;
}

export function dueReminders(
  now: Date,
  tasks: Task[],
  settings: AppSettings
): { notification: Notification; key: string }[] {
  if (!settings.notifications.enabled) return [];
  const results: { notification: Notification; key: string }[] = [];
  const triggered = new Set(settings.triggeredReminderKeys);

  if (settings.notifications.taskReminders) {
    for (const task of tasks) {
      if (!task.reminder?.enabled) continue;
      if (task.status === "completed" || task.status === "archived") continue;
      const at = task.reminder.remindAt;
      if (!at || at.getTime() > now.getTime()) continue;
      const key = reminderKey("task", task.id, at.toISOString());
      if (triggered.has(key)) continue;
      results.push({
        key,
        notification: makeNotification(
          "reminder",
          "Task reminder",
          task.title,
          "/",
          now
        ),
      });
    }
  }

  if (settings.notifications.deadlines) {
    for (const task of tasks) {
      if (!task.startTime) continue;
      if (task.status === "completed" || task.status === "archived") continue;
      const delta = task.startTime.getTime() - now.getTime();
      if (delta > 30 * 60_000 || delta < -5 * 60_000) continue;
      const slot = task.startTime.toISOString();
      const key = reminderKey("upcoming", task.id, slot);
      if (triggered.has(key)) continue;
      results.push({
        key,
        notification: makeNotification(
          "task_due",
          "Upcoming",
          `${task.title} starts soon`,
          "/",
          now
        ),
      });
    }

    for (const task of tasks) {
      if (!isOverdue(task, now)) continue;
      const key = reminderKey("overdue", task.id, task.dueDate?.toDateString() ?? "");
      if (triggered.has(key)) continue;
      results.push({
        key,
        notification: makeNotification(
          "task_overdue",
          "Overdue",
          task.title,
          "/",
          now
        ),
      });
    }
  }

  return results;
}

function makeNotification(
  type: Notification["type"],
  title: string,
  message: string,
  actionUrl: string,
  now: Date
): Notification {
  return {
    id: createId("ntf"),
    type,
    title,
    message,
    isRead: false,
    actionUrl,
    userId: LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/state/task-store";
import { useSettingsStore } from "@/state/settings-store";
import { dueReminders } from "@/domain/notifications/reminders";

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const addNotification = useSettingsStore((s) => s.addNotification);
  const markReminder = useSettingsStore((s) => s.markReminder);

  useEffect(() => {
    if (!hydrated || !settingsHydrated) return;
    if (!settings.notifications.enabled && !settings.notifications.taskReminders && !settings.notifications.deadlines) {
      return;
    }

    const tick = () => {
      const due = dueReminders(new Date(), tasks, {
        ...settings,
        notifications: { ...settings.notifications, enabled: true },
      });
      for (const item of due) {
        void markReminder(item.key);
        void addNotification(item.notification);
        if (
          settings.notifications.enabled &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(item.notification.title, { body: item.notification.message });
          } catch {
            /* unsupported context */
          }
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [hydrated, settingsHydrated, tasks, settings, addNotification, markReminder]);

  return <>{children}</>;
}

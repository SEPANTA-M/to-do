import type { AppSettings } from "@/domain/types";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  profileName: "",
  startOfWeek: 1,
  timeFormat: "24h",
  defaultDurationMinutes: 30,
  dayStartHour: 7,
  dayEndHour: 22,
  defaultReminderOffsetMinutes: 10,
  notifications: {
    enabled: false,
    taskReminders: true,
    deadlines: true,
    focus: false,
    weeklyReview: false,
  },
  focus: {
    defaultDuration: 25,
    breakDuration: 5,
    autoStartBreaks: false,
    doNotDisturbMode: false,
  },
  privacy: {
    analyticsEnabled: false,
    crashReportsEnabled: false,
  },
  onboardingCompleted: false,
  triggeredReminderKeys: [],
};

export function mergeSettings(partial: Partial<AppSettings> | null | undefined): AppSettings {
  if (!partial) return { ...DEFAULT_APP_SETTINGS };
  return {
    ...DEFAULT_APP_SETTINGS,
    ...partial,
    notifications: {
      ...DEFAULT_APP_SETTINGS.notifications,
      ...(partial.notifications ?? {}),
    },
    focus: {
      ...DEFAULT_APP_SETTINGS.focus,
      ...(partial.focus ?? {}),
    },
    privacy: {
      ...DEFAULT_APP_SETTINGS.privacy,
      ...(partial.privacy ?? {}),
    },
    triggeredReminderKeys: partial.triggeredReminderKeys ?? [],
  };
}

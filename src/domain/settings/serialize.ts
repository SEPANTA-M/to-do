import type { AppSettings, WeekStart } from "@/domain/types";
import { mergeSettings } from "./defaults";

interface SerializedSettings {
  profileName?: string;
  startOfWeek?: number;
  timeFormat?: "12h" | "24h";
  defaultDurationMinutes?: number;
  dayStartHour?: number;
  dayEndHour?: number;
  defaultReminderOffsetMinutes?: number;
  notifications?: AppSettings["notifications"];
  focus?: AppSettings["focus"];
  privacy?: AppSettings["privacy"];
  onboardingCompleted?: boolean;
  triggeredReminderKeys?: string[];
}

export function serializeSettings(settings: AppSettings): SerializedSettings {
  return {
    profileName: settings.profileName,
    startOfWeek: settings.startOfWeek,
    timeFormat: settings.timeFormat,
    defaultDurationMinutes: settings.defaultDurationMinutes,
    dayStartHour: settings.dayStartHour,
    dayEndHour: settings.dayEndHour,
    defaultReminderOffsetMinutes: settings.defaultReminderOffsetMinutes,
    notifications: settings.notifications,
    focus: settings.focus,
    privacy: settings.privacy,
    onboardingCompleted: settings.onboardingCompleted,
    triggeredReminderKeys: settings.triggeredReminderKeys,
  };
}

export function deserializeSettings(raw: SerializedSettings | null | undefined): AppSettings {
  const startOfWeek: WeekStart =
    raw?.startOfWeek === 0 || raw?.startOfWeek === 1 || raw?.startOfWeek === 6
      ? raw.startOfWeek
      : 1;
  return mergeSettings({
    ...raw,
    startOfWeek,
    dayStartHour: clampHour(raw?.dayStartHour, 7),
    dayEndHour: clampHour(raw?.dayEndHour, 22),
    defaultDurationMinutes:
      typeof raw?.defaultDurationMinutes === "number" && raw.defaultDurationMinutes > 0
        ? Math.round(raw.defaultDurationMinutes)
        : 30,
  });
}

function clampHour(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(23, Math.max(0, Math.round(value)));
}

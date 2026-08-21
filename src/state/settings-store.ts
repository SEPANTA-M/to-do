import { create } from "zustand";
import type { AppSettings, Notification, WeeklyReview } from "@/domain/types";
import { DEFAULT_APP_SETTINGS } from "@/domain/settings/defaults";
import { createWeeklyReview } from "@/domain/review/weekly";
import { SettingsRepository } from "@/persistence/settings-repository";
import { logError } from "@/lib/logger";

interface SettingsState {
  settings: AppSettings;
  reviews: WeeklyReview[];
  notifications: Notification[];
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  markReminder: (key: string) => Promise<void>;
  addNotification: (notification: Notification) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  saveReview: (input: {
    weekStart: Date;
    weekEnd: Date;
    workedWell: string;
    didntWork: string;
    shouldChange: string;
  }) => Promise<WeeklyReview>;
  replaceAll: (next: {
    settings?: AppSettings;
    reviews?: WeeklyReview[];
    notifications?: Notification[];
  }) => Promise<void>;
}

const repository = new SettingsRepository();

async function persist(state: {
  settings: AppSettings;
  reviews: WeeklyReview[];
  notifications: Notification[];
}): Promise<void> {
  try {
    await repository.save(state);
  } catch (error) {
    logError("Unable to save settings", "settings.persist");
    useSettingsStore.setState({
      error: error instanceof Error ? error.message : "Unable to save settings",
    });
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_APP_SETTINGS,
  reviews: [],
  notifications: [],
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const loaded = await repository.load();
      set({ ...loaded, hydrated: true, error: null });
    } catch {
      set({ hydrated: true });
    }
  },

  updateSettings: async (patch) => {
    const { settings, reviews, notifications } = get();
    const next = {
      settings: {
        ...settings,
        ...patch,
        notifications: { ...settings.notifications, ...(patch.notifications ?? {}) },
        focus: { ...settings.focus, ...(patch.focus ?? {}) },
        privacy: { ...settings.privacy, ...(patch.privacy ?? {}) },
      },
      reviews,
      notifications,
    };
    set(next);
    await persist(next);
  },

  completeOnboarding: async () => {
    await get().updateSettings({ onboardingCompleted: true });
  },

  markReminder: async (key) => {
    const { settings } = get();
    if (settings.triggeredReminderKeys.includes(key)) return;
    await get().updateSettings({
      triggeredReminderKeys: [...settings.triggeredReminderKeys, key].slice(-400),
    });
  },

  addNotification: async (notification) => {
    const { settings, reviews, notifications } = get();
    const next = {
      settings,
      reviews,
      notifications: [notification, ...notifications].slice(0, 100),
    };
    set(next);
    await persist(next);
  },

  markRead: async (id) => {
    const { settings, reviews, notifications } = get();
    const next = {
      settings,
      reviews,
      notifications: notifications.map((item) =>
        item.id === id ? { ...item, isRead: true, updatedAt: new Date() } : item
      ),
    };
    set(next);
    await persist(next);
  },

  saveReview: async (input) => {
    const review = createWeeklyReview(input);
    const { settings, reviews, notifications } = get();
    const next = { settings, reviews: [...reviews, review], notifications };
    set(next);
    await persist(next);
    return review;
  },

  replaceAll: async (incoming) => {
    const current = get();
    const next = {
      settings: incoming.settings ?? current.settings,
      reviews: incoming.reviews ?? current.reviews,
      notifications: incoming.notifications ?? current.notifications,
    };
    set(next);
    await persist(next);
  },
}));

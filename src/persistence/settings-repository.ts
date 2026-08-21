import type { AppSettings, Notification, WeeklyReview } from "@/domain/types";
import { deserializeSettings, serializeSettings } from "@/domain/settings/serialize";
import { deserializeReview, serializeReview } from "@/domain/review/serialize";
import { DEFAULT_APP_SETTINGS } from "@/domain/settings/defaults";
import { toDate } from "@/domain/task/time";
import { getDefaultStorage, type KeyValueStorage } from "./storage";
import { parseArray } from "./json";

const SETTINGS_KEY = "nexus.settings";
const REVIEWS_KEY = "nexus.reviews";
const NOTIFICATIONS_KEY = "nexus.notifications";

export interface SettingsState {
  settings: AppSettings;
  reviews: WeeklyReview[];
  notifications: Notification[];
}

export class SettingsRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<SettingsState> {
    const [settingsRaw, reviewsRaw, notificationsRaw] = await Promise.all([
      this.storage.getItem(SETTINGS_KEY),
      this.storage.getItem(REVIEWS_KEY),
      this.storage.getItem(NOTIFICATIONS_KEY),
    ]);
    let settings = DEFAULT_APP_SETTINGS;
    if (settingsRaw) {
      try {
        settings = deserializeSettings(JSON.parse(settingsRaw));
      } catch {
        settings = DEFAULT_APP_SETTINGS;
      }
    }
    return {
      settings,
      reviews: parseArray(reviewsRaw, deserializeReview),
      notifications: parseArray(notificationsRaw, deserializeNotification),
    };
  }

  async save(state: SettingsState): Promise<void> {
    await Promise.all([
      this.storage.setItem(SETTINGS_KEY, JSON.stringify(serializeSettings(state.settings))),
      this.storage.setItem(REVIEWS_KEY, JSON.stringify(state.reviews.map(serializeReview))),
      this.storage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(state.notifications.map(serializeNotification))
      ),
    ]);
  }
}

interface SerializedNotification {
  id: string;
  type: Notification["type"];
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

function serializeNotification(item: Notification): SerializedNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    isRead: item.isRead,
    actionUrl: item.actionUrl,
    userId: item.userId,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function deserializeNotification(raw: SerializedNotification): Notification {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    message: raw.message,
    isRead: Boolean(raw.isRead),
    actionUrl: raw.actionUrl,
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

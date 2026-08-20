import type { CalendarEvent } from "@/domain/types";
import { deserializeEvent, serializeEvent } from "@/domain/calendar/serialize";
import { getDefaultStorage, type KeyValueStorage } from "./storage";
import { parseArray } from "./json";

const EVENTS_KEY = "nexus.events";

export class CalendarRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<CalendarEvent[]> {
    const raw = await this.storage.getItem(EVENTS_KEY);
    return parseArray(raw, deserializeEvent);
  }

  async save(events: CalendarEvent[]): Promise<void> {
    await this.storage.setItem(EVENTS_KEY, JSON.stringify(events.map(serializeEvent)));
  }
}

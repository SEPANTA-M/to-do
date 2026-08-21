import { create } from "zustand";
import type { CalendarEvent } from "@/domain/types";
import {
  applyEventUpdate,
  createCalendarEvent,
  moveEventToStart,
  resizeEventDuration,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/domain/calendar/factory";
import { CalendarRepository } from "@/persistence/calendar-repository";
import { logError } from "@/lib/logger";

interface CalendarState {
  events: CalendarEvent[];
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  createEvent: (input: CreateEventInput) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: UpdateEventInput) => Promise<CalendarEvent | null>;
  moveEvent: (id: string, start: Date) => Promise<CalendarEvent | null>;
  resizeEvent: (id: string, durationMinutes: number) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<void>;
  replaceAll: (events: CalendarEvent[]) => Promise<void>;
}

const repository = new CalendarRepository();

async function persist(events: CalendarEvent[]): Promise<void> {
  try {
    await repository.save(events);
  } catch (error) {
    logError("Unable to save events", "calendar.persist");
    useCalendarStore.setState({
      error: error instanceof Error ? error.message : "Unable to save events",
    });
  }
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const events = await repository.load();
      set({ events, hydrated: true, error: null });
    } catch {
      set({ hydrated: true });
    }
  },

  createEvent: async (input) => {
    const event = createCalendarEvent(input);
    const events = [...get().events, event];
    set({ events, error: null });
    await persist(events);
    return event;
  },

  updateEvent: async (id, updates) => {
    const current = get().events.find((event) => event.id === id);
    if (!current) return null;
    const next = applyEventUpdate(current, updates);
    const events = get().events.map((event) => (event.id === id ? next : event));
    set({ events });
    await persist(events);
    return next;
  },

  moveEvent: async (id, start) => {
    const current = get().events.find((event) => event.id === id);
    if (!current) return null;
    const next = moveEventToStart(current, start);
    const events = get().events.map((event) => (event.id === id ? next : event));
    set({ events });
    await persist(events);
    return next;
  },

  resizeEvent: async (id, durationMinutes) => {
    const current = get().events.find((event) => event.id === id);
    if (!current) return null;
    const next = resizeEventDuration(current, durationMinutes);
    const events = get().events.map((event) => (event.id === id ? next : event));
    set({ events });
    await persist(events);
    return next;
  },

  deleteEvent: async (id) => {
    const events = get().events.filter((event) => event.id !== id);
    set({ events });
    await persist(events);
  },

  replaceAll: async (events) => {
    set({ events });
    await persist(events);
  },
}));

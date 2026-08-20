import { create } from "zustand";
import type { FocusSession, Task } from "@/domain/types";
import {
  abandonFocusSession,
  completeFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
} from "@/domain/focus/session";
import { FocusRepository } from "@/persistence/focus-repository";
import { logError } from "@/lib/logger";

interface FocusState {
  sessions: FocusSession[];
  activeSessionId: string | null;
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  start: (task?: Task) => Promise<FocusSession>;
  pause: () => Promise<FocusSession | null>;
  resume: () => Promise<FocusSession | null>;
  complete: () => Promise<FocusSession | null>;
  exit: () => Promise<FocusSession | null>;
  replaceAll: (sessions: FocusSession[]) => Promise<void>;
}

const repository = new FocusRepository();

async function persist(sessions: FocusSession[]): Promise<void> {
  try {
    await repository.save(sessions);
  } catch (error) {
    logError("Unable to save focus sessions", "focus.persist");
    useFocusStore.setState({
      error: error instanceof Error ? error.message : "Unable to save focus sessions",
    });
  }
}

function replaceSession(sessions: FocusSession[], next: FocusSession): FocusSession[] {
  return sessions.map((session) => (session.id === next.id ? next : session));
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const sessions = await repository.load();
      const active = sessions.find((session) => session.status === "active" || session.status === "paused");
      set({
        sessions,
        activeSessionId: active?.id ?? null,
        hydrated: true,
        error: null,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  start: async (task) => {
    const current = get().sessions.find((session) => session.id === get().activeSessionId);
    let sessions = get().sessions;
    if (current && (current.status === "active" || current.status === "paused")) {
      const abandoned = abandonFocusSession(current);
      sessions = replaceSession(sessions, abandoned);
    }
    const session = startFocusSession({ task });
    sessions = [...sessions, session];
    set({ sessions, activeSessionId: session.id, error: null });
    await persist(sessions);
    return session;
  },

  pause: async () => {
    const { sessions, activeSessionId } = get();
    const current = sessions.find((session) => session.id === activeSessionId);
    if (!current) return null;
    const next = pauseFocusSession(current);
    const updated = replaceSession(sessions, next);
    set({ sessions: updated });
    await persist(updated);
    return next;
  },

  resume: async () => {
    const { sessions, activeSessionId } = get();
    const current = sessions.find((session) => session.id === activeSessionId);
    if (!current) return null;
    const next = resumeFocusSession(current);
    const updated = replaceSession(sessions, next);
    set({ sessions: updated });
    await persist(updated);
    return next;
  },

  complete: async () => {
    const { sessions, activeSessionId } = get();
    const current = sessions.find((session) => session.id === activeSessionId);
    if (!current) return null;
    const next = completeFocusSession(current);
    const updated = replaceSession(sessions, next);
    set({ sessions: updated, activeSessionId: null });
    await persist(updated);
    return next;
  },

  exit: async () => {
    const { sessions, activeSessionId } = get();
    const current = sessions.find((session) => session.id === activeSessionId);
    if (!current) return null;
    const next =
      current.status === "completed" ? current : abandonFocusSession(current);
    const updated = replaceSession(sessions, next);
    set({ sessions: updated, activeSessionId: null });
    await persist(updated);
    return next;
  },

  replaceAll: async (sessions) => {
    const active = sessions.find((session) => session.status === "active" || session.status === "paused");
    set({ sessions, activeSessionId: active?.id ?? null });
    await persist(sessions);
  },
}));

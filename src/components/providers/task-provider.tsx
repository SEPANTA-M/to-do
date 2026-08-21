"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/state/task-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useNotesStore } from "@/state/notes-store";
import { useCalendarStore } from "@/state/calendar-store";
import { useFocusStore } from "@/state/focus-store";
import { useSettingsStore } from "@/state/settings-store";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const hydrateTasks = useTaskStore((state) => state.hydrate);
  const tasksHydrated = useTaskStore((state) => state.hydrated);
  const hydrateWorkspace = useWorkspaceStore((state) => state.hydrate);
  const workspaceHydrated = useWorkspaceStore((state) => state.hydrated);
  const hydrateNotes = useNotesStore((state) => state.hydrate);
  const notesHydrated = useNotesStore((state) => state.hydrated);
  const hydrateCalendar = useCalendarStore((state) => state.hydrate);
  const calendarHydrated = useCalendarStore((state) => state.hydrated);
  const hydrateFocus = useFocusStore((state) => state.hydrate);
  const focusHydrated = useFocusStore((state) => state.hydrated);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const settingsHydrated = useSettingsStore((state) => state.hydrated);

  useEffect(() => {
    if (!tasksHydrated) void hydrateTasks();
  }, [hydrateTasks, tasksHydrated]);

  useEffect(() => {
    if (!workspaceHydrated) void hydrateWorkspace();
  }, [hydrateWorkspace, workspaceHydrated]);

  useEffect(() => {
    if (!notesHydrated) void hydrateNotes();
  }, [hydrateNotes, notesHydrated]);

  useEffect(() => {
    if (!calendarHydrated) void hydrateCalendar();
  }, [hydrateCalendar, calendarHydrated]);

  useEffect(() => {
    if (!focusHydrated) void hydrateFocus();
  }, [hydrateFocus, focusHydrated]);

  useEffect(() => {
    if (!settingsHydrated) void hydrateSettings();
  }, [hydrateSettings, settingsHydrated]);

  return <>{children}</>;
}

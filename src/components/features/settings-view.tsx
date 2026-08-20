"use client";

import * as React from "react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { SectionLabel } from "@/components/core/section-label";
import { PageSkeleton } from "@/components/core/skeleton";
import { useThemeStore } from "@/state/theme-store";
import { useSettingsStore } from "@/state/settings-store";
import { useTaskStore } from "@/state/task-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useNotesStore } from "@/state/notes-store";
import { useCalendarStore } from "@/state/calendar-store";
import { useFocusStore } from "@/state/focus-store";
import { createBackup, mergeBackup, parseBackup, tasksToCsv } from "@/domain/export/backup";
import type { AppSettings } from "@/domain/types";

export function SettingsView() {
  const { theme, setTheme } = useThemeStore();
  const settings = useSettingsStore((s) => s.settings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const reviews = useSettingsStore((s) => s.reviews);
  const notifications = useSettingsStore((s) => s.notifications);

  const tasks = useTaskStore((s) => s.tasks);
  const history = useTaskStore((s) => s.history);
  const pendingMutations = useTaskStore((s) => s.mutations);
  const replaceTasks = useTaskStore((s) => s.replaceAll);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const activity = useWorkspaceStore((s) => s.activity);
  const replaceWorkspace = useWorkspaceStore((s) => s.replaceAll);
  const notes = useNotesStore((s) => s.notes);
  const replaceNotes = useNotesStore((s) => s.replaceAll);
  const events = useCalendarStore((s) => s.events);
  const replaceEvents = useCalendarStore((s) => s.replaceAll);
  const sessions = useFocusStore((s) => s.sessions);
  const replaceSessions = useFocusStore((s) => s.replaceAll);
  const replaceSettings = useSettingsStore((s) => s.replaceAll);

  const [importMessage, setImportMessage] = React.useState<string | null>(null);
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(() =>
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  if (!hydrated) return <PageSkeleton />;

  const patch = (next: Partial<AppSettings>) => void updateSettings(next);

  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const backup = createBackup({
      tasks,
      history,
      goals,
      milestones,
      projects,
      activity,
      notes,
      events,
      sessions,
      reviews,
      settings,
    });
    download("nexus-backup.json", JSON.stringify(backup, null, 2), "application/json");
  };

  const handleExportCsv = () => {
    download("nexus-tasks.csv", tasksToCsv(tasks), "text/csv");
  };

  const handleImport = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text());
      const backup = parseBackup(raw);
      const result = mergeBackup(
        {
          tasks,
          history,
          goals,
          milestones,
          projects,
          activity,
          notes,
          events,
          sessions,
          reviews,
          settings,
        },
        backup
      );
      await replaceTasks(result.snapshot.tasks, result.snapshot.history);
      await replaceWorkspace({
        goals: result.snapshot.goals,
        milestones: result.snapshot.milestones,
        projects: result.snapshot.projects,
        activity: result.snapshot.activity,
      });
      await replaceNotes(result.snapshot.notes);
      await replaceEvents(result.snapshot.events);
      await replaceSessions(result.snapshot.sessions);
      await replaceSettings({ reviews: result.snapshot.reviews });
      setImportMessage(`Imported ${result.added} new items. ${result.skipped} existing items were kept.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed");
    }
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await updateSettings({ notifications: { ...settings.notifications, enabled: true } });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-5 py-10 space-y-12">
      <div>
        <p className="label-caps mb-2">Settings</p>
        <h1 className="text-xl font-medium tracking-tight text-text-primary">This device</h1>
      </div>

      <section>
        <SectionLabel>Appearance</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {(["light", "dark", "system"] as const).map((value) => (
            <Button key={value} size="sm" variant={theme === value ? "primary" : "secondary"} onClick={() => setTheme(value)}>
              {value}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-text-secondary">Accent is the ink teal of the Spatial UI. It is not a theme preset.</p>
      </section>

      <section className="space-y-3">
        <SectionLabel>Account</SectionLabel>
        <p className="text-sm text-text-secondary leading-relaxed">
          NEXUS is local-first. There is no cloud login on this build. Your work stays on this device. A display name is optional.
        </p>
        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="profile">Display name</Label>
          <Input
            id="profile"
            value={settings.profileName}
            onChange={(event) => patch({ profileName: event.target.value })}
            placeholder="Optional"
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel>Productivity</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Field label="Default duration (min)">
            <Input
              type="number"
              min={15}
              step={15}
              value={settings.defaultDurationMinutes}
              onChange={(event) => patch({ defaultDurationMinutes: Number(event.target.value) || 30 })}
            />
          </Field>
          <Field label="Start of day">
            <Input
              type="number"
              min={0}
              max={12}
              value={settings.dayStartHour}
              onChange={(event) => patch({ dayStartHour: Number(event.target.value) })}
            />
          </Field>
          <Field label="End of day">
            <Input
              type="number"
              min={12}
              max={24}
              value={settings.dayEndHour}
              onChange={(event) => patch({ dayEndHour: Number(event.target.value) })}
            />
          </Field>
          <Field label="Week starts">
            <select
              className="h-11 w-full rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
              value={settings.startOfWeek}
              onChange={(event) => patch({ startOfWeek: Number(event.target.value) as 0 | 1 | 6 })}
            >
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
              <option value={6}>Saturday</option>
            </select>
          </Field>
          <Field label="Time format">
            <select
              className="h-11 w-full rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
              value={settings.timeFormat}
              onChange={(event) => patch({ timeFormat: event.target.value as "12h" | "24h" })}
            >
              <option value="24h">24-hour</option>
              <option value="12h">12-hour</option>
            </select>
          </Field>
          <Field label="Default reminder (min before)">
            <Input
              type="number"
              min={0}
              value={settings.defaultReminderOffsetMinutes}
              onChange={(event) => patch({ defaultReminderOffsetMinutes: Number(event.target.value) || 0 })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Notifications</SectionLabel>
        <p className="text-sm text-text-secondary">
          Permission is requested only when you turn this on. NEXUS will not send a digest you did not enable.
        </p>
        {permission !== "granted" && (
          <Button size="sm" variant="secondary" onClick={() => void enableNotifications()}>
            Allow browser notifications
          </Button>
        )}
        <Toggle
          label="Task reminders"
          checked={settings.notifications.taskReminders}
          onChange={(taskReminders) =>
            patch({ notifications: { ...settings.notifications, taskReminders } })
          }
        />
        <Toggle
          label="Upcoming deadlines"
          checked={settings.notifications.deadlines}
          onChange={(deadlines) => patch({ notifications: { ...settings.notifications, deadlines } })}
        />
        <Toggle
          label="Focus session ended"
          checked={settings.notifications.focus}
          onChange={(focus) => patch({ notifications: { ...settings.notifications, focus } })}
        />
        <Toggle
          label="Weekly review"
          checked={settings.notifications.weeklyReview}
          onChange={(weeklyReview) =>
            patch({ notifications: { ...settings.notifications, weeklyReview } })
          }
        />
        <p className="text-xs text-text-tertiary">{notifications.filter((n) => !n.isRead).length} unread in-app notices</p>
      </section>

      <section>
        <SectionLabel>Keyboard</SectionLabel>
        <ul className="text-sm text-text-secondary space-y-1 font-mono">
          <li>N — new task</li>
          <li>⌘/Ctrl+K — command palette</li>
          <li>Day Flow arrows — move selected block</li>
          <li>Enter — open · Delete — remove</li>
        </ul>
      </section>

      <section className="space-y-3">
        <SectionLabel>Privacy</SectionLabel>
        <p className="text-sm text-text-secondary">
          Analytics and crash reporting are off. This build does not send your tasks anywhere.
        </p>
        <Toggle
          label="Usage analytics"
          checked={settings.privacy.analyticsEnabled}
          onChange={(analyticsEnabled) =>
            patch({ privacy: { ...settings.privacy, analyticsEnabled } })
          }
        />
        <Toggle
          label="Crash reports"
          checked={settings.privacy.crashReportsEnabled}
          onChange={(crashReportsEnabled) =>
            patch({ privacy: { ...settings.privacy, crashReportsEnabled } })
          }
        />
      </section>

      <section className="space-y-3">
        <SectionLabel>Data</SectionLabel>
        <p className="text-sm text-text-secondary">
          Export is a portable JSON snapshot. Import never overwrites existing items — duplicates are skipped.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleExportJson}>
            Export JSON
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExportCsv}>
            Export tasks CSV
          </Button>
          <label className="inline-flex items-center">
            <span className="sr-only">Import JSON</span>
            <input
              type="file"
              accept="application/json"
              className="text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
          </label>
        </div>
        {importMessage && <p className="text-sm text-text-secondary">{importMessage}</p>}
      </section>

      <section>
        <SectionLabel>Sync</SectionLabel>
        <p className="text-sm text-text-secondary leading-relaxed">
          Cloud sync is not configured. A mutation ledger is recorded locally for a future worker. Pending local changes are never discarded.
        </p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">
          {pendingMutations.filter((m) => m.status === "pending").length} pending mutations
        </p>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 max-w-md py-1">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors ${checked ? "bg-interactive-primary" : "bg-bg-tertiary"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg-elevated transition-transform ${checked ? "left-4" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

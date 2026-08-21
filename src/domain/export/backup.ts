import type {
  ActivityEvent,
  AppSettings,
  CalendarEvent,
  FocusSession,
  Goal,
  Milestone,
  Note,
  Project,
  Task,
  TaskHistory,
  WeeklyReview,
} from "@/domain/types";
import { serializeTask, deserializeTask } from "@/domain/task/serialize";
import {
  deserializeActivity,
  deserializeGoal,
  deserializeMilestone,
  deserializeProject,
  serializeActivity,
  serializeGoal,
  serializeMilestone,
  serializeProject,
} from "@/domain/workspace/serialize";
import { deserializeNote, serializeNote } from "@/domain/note/serialize";
import { deserializeEvent, serializeEvent } from "@/domain/calendar/serialize";
import { deserializeFocus, serializeFocus } from "@/domain/focus/serialize";
import { deserializeReview, serializeReview } from "@/domain/review/serialize";
import { deserializeSettings, serializeSettings } from "@/domain/settings/serialize";
import { DEFAULT_APP_SETTINGS } from "@/domain/settings/defaults";
import { createId } from "@/domain/ids";

export const BACKUP_VERSION = 1 as const;

export interface NexusSnapshot {
  tasks: Task[];
  history: TaskHistory[];
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  activity: ActivityEvent[];
  notes: Note[];
  events: CalendarEvent[];
  sessions: FocusSession[];
  reviews: WeeklyReview[];
  settings: AppSettings;
}

export interface NexusBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  tasks: ReturnType<typeof serializeTask>[];
  history: unknown[];
  goals: unknown[];
  milestones: unknown[];
  projects: unknown[];
  activity: unknown[];
  notes: unknown[];
  events: unknown[];
  sessions: unknown[];
  reviews: unknown[];
  settings: unknown;
}

export function createBackup(snapshot: NexusSnapshot, now = new Date()): NexusBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks: snapshot.tasks.map(serializeTask),
    history: snapshot.history,
    goals: snapshot.goals.map(serializeGoal),
    milestones: snapshot.milestones.map(serializeMilestone),
    projects: snapshot.projects.map(serializeProject),
    activity: snapshot.activity.map(serializeActivity),
    notes: snapshot.notes.map(serializeNote),
    events: snapshot.events.map(serializeEvent),
    sessions: snapshot.sessions.map(serializeFocus),
    reviews: snapshot.reviews.map(serializeReview),
    settings: serializeSettings(snapshot.settings),
  };
}

export function parseBackup(raw: unknown): NexusBackup {
  if (!raw || typeof raw !== "object") {
    throw new Error("Backup file is not valid JSON");
  }
  const data = raw as Record<string, unknown>;
  if (data.version !== BACKUP_VERSION && data.version !== undefined) {
    throw new Error("This backup version is not supported");
  }
  return {
    version: BACKUP_VERSION,
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : new Date().toISOString(),
    tasks: asArray(data.tasks),
    history: asArray(data.history),
    goals: asArray(data.goals),
    milestones: asArray(data.milestones),
    projects: asArray(data.projects),
    activity: asArray(data.activity),
    notes: asArray(data.notes),
    events: asArray(data.events),
    sessions: asArray(data.sessions),
    reviews: asArray(data.reviews),
    settings: data.settings,
  };
}

export interface ImportResult {
  snapshot: NexusSnapshot;
  added: number;
  skipped: number;
}

/**
 * Merge incoming backup into current data.
 * Existing ids are kept. Incoming duplicates are skipped — never overwritten.
 */
export function mergeBackup(current: NexusSnapshot, backup: NexusBackup): ImportResult {
  let added = 0;
  let skipped = 0;

  const take = <T extends { id: string }>(
    existing: T[],
    incoming: T[]
  ): T[] => {
    const ids = new Set(existing.map((item) => item.id));
    const next = [...existing];
    for (const item of incoming) {
      if (!item?.id) continue;
      if (ids.has(item.id)) {
        skipped += 1;
        continue;
      }
      ids.add(item.id);
      next.push(item);
      added += 1;
    }
    return next;
  };

  const tasks = take(
    current.tasks,
    (backup.tasks as Parameters<typeof deserializeTask>[0][]).map((item) => {
      try {
        return deserializeTask(item);
      } catch {
        skipped += 1;
        return null;
      }
    }).filter((item): item is Task => Boolean(item))
  );

  const goals = take(
    current.goals,
    mapSafe(backup.goals, deserializeGoal as (raw: never) => Goal, () => {
      skipped += 1;
    })
  );
  const milestones = take(
    current.milestones,
    mapSafe(backup.milestones, deserializeMilestone as (raw: never) => Milestone, () => {
      skipped += 1;
    })
  );
  const projects = take(
    current.projects,
    mapSafe(backup.projects, deserializeProject as (raw: never) => Project, () => {
      skipped += 1;
    })
  );
  const notes = take(
    current.notes,
    mapSafe(backup.notes, deserializeNote as (raw: never) => Note, () => {
      skipped += 1;
    })
  );
  const events = take(
    current.events,
    mapSafe(backup.events, deserializeEvent as (raw: never) => CalendarEvent, () => {
      skipped += 1;
    })
  );
  const sessions = take(
    current.sessions,
    mapSafe(backup.sessions, deserializeFocus as (raw: never) => FocusSession, () => {
      skipped += 1;
    })
  );
  const reviews = take(
    current.reviews,
    mapSafe(backup.reviews, deserializeReview as (raw: never) => WeeklyReview, () => {
      skipped += 1;
    })
  );
  const activity = take(
    current.activity,
    mapSafe(backup.activity, deserializeActivity as (raw: never) => ActivityEvent, () => {
      skipped += 1;
    })
  );

  return {
    snapshot: {
      tasks,
      history: current.history,
      goals,
      milestones,
      projects,
      activity,
      notes,
      events,
      sessions,
      reviews,
      settings: current.settings,
    },
    added,
    skipped,
  };
}

export function tasksToCsv(tasks: Task[]): string {
  const header = [
    "id",
    "title",
    "status",
    "priority",
    "dueDate",
    "startTime",
    "endTime",
    "estimatedDuration",
    "projectId",
    "goalId",
    "tags",
  ];
  const rows = tasks.map((task) =>
    [
      task.id,
      csvEscape(task.title),
      task.status,
      task.priority,
      task.dueDate?.toISOString() ?? "",
      task.startTime?.toISOString() ?? "",
      task.endTime?.toISOString() ?? "",
      task.estimatedDuration ?? "",
      task.projectId ?? "",
      task.goalId ?? "",
      csvEscape(task.tags.join(";")),
    ].join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function asArray(value: unknown): never[] {
  return Array.isArray(value) ? (value as never[]) : [];
}

function mapSafe<T>(
  raw: unknown[],
  map: (item: never) => T,
  onError: () => void
): T[] {
  const result: T[] = [];
  for (const item of raw) {
    try {
      result.push(map(item as never));
    } catch {
      onError();
    }
  }
  return result;
}

export function duplicateIncomingId<T extends { id: string }>(item: T): T {
  return { ...item, id: createId() };
}

export { DEFAULT_APP_SETTINGS };

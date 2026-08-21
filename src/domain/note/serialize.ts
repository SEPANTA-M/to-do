import type { Note } from "@/domain/types";
import { toDate } from "@/domain/task/time";

interface SerializedNote {
  id: string;
  title?: string;
  content: string;
  taskId?: string;
  projectId?: string;
  goalId?: string;
  tags?: string[];
  archived?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeNote(note: Note): SerializedNote {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    taskId: note.taskId,
    projectId: note.projectId,
    goalId: note.goalId,
    tags: note.tags,
    archived: note.archived,
    userId: note.userId,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function deserializeNote(raw: SerializedNote): Note {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content ?? "",
    taskId: raw.taskId,
    projectId: raw.projectId,
    goalId: raw.goalId,
    tags: raw.tags ?? [],
    archived: Boolean(raw.archived),
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

import type { Note } from "@/domain/types";
import { createId } from "@/domain/ids";
import { LOCAL_USER_ID } from "@/domain/task/constants";

export interface CreateNoteInput {
  title?: string;
  content: string;
  taskId?: string;
  projectId?: string;
  goalId?: string;
  tags?: string[];
  userId?: string;
  now?: Date;
  id?: string;
}

export function createNote(input: CreateNoteInput): Note {
  const content = input.content.trim();
  const title = input.title?.trim() || undefined;
  if (!content && !title) {
    throw new Error("Note content is required");
  }
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("note"),
    title,
    content: content || title || "",
    taskId: input.taskId,
    projectId: input.projectId,
    goalId: input.goalId,
    tags: input.tags ?? [],
    archived: false,
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateNoteInput {
  title?: string | null;
  content?: string;
  taskId?: string | null;
  projectId?: string | null;
  goalId?: string | null;
  tags?: string[];
  archived?: boolean;
}

export function applyNoteUpdate(note: Note, updates: UpdateNoteInput, now = new Date()): Note {
  const next: Note = { ...note, updatedAt: now };
  if (updates.title !== undefined) {
    next.title = updates.title?.trim() || undefined;
  }
  if (updates.content !== undefined) {
    const content = updates.content.trim();
    if (!content && !next.title) throw new Error("Note content is required");
    next.content = content;
  }
  if (updates.taskId !== undefined) next.taskId = updates.taskId ?? undefined;
  if (updates.projectId !== undefined) next.projectId = updates.projectId ?? undefined;
  if (updates.goalId !== undefined) next.goalId = updates.goalId ?? undefined;
  if (updates.tags !== undefined) next.tags = updates.tags;
  if (updates.archived !== undefined) next.archived = updates.archived;
  return next;
}

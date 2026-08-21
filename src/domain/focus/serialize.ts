import type { FocusSession, FocusSessionStatus } from "@/domain/types";
import { toDate } from "@/domain/task/time";

interface SerializedFocus {
  id: string;
  taskId?: string;
  projectId?: string;
  goalId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  accumulatedMs?: number;
  lastResumeAt?: string;
  pausedAt?: string;
  interruptions?: number;
  status?: FocusSessionStatus;
  quality?: FocusSession["quality"];
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeFocus(session: FocusSession): SerializedFocus {
  return {
    id: session.id,
    taskId: session.taskId,
    projectId: session.projectId,
    goalId: session.goalId,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString(),
    duration: session.duration,
    accumulatedMs: session.accumulatedMs,
    lastResumeAt: session.lastResumeAt?.toISOString(),
    pausedAt: session.pausedAt?.toISOString(),
    interruptions: session.interruptions,
    status: session.status,
    quality: session.quality,
    notes: session.notes,
    userId: session.userId,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function deserializeFocus(raw: SerializedFocus): FocusSession {
  const status: FocusSessionStatus =
    raw.status === "active" ||
    raw.status === "paused" ||
    raw.status === "completed" ||
    raw.status === "abandoned"
      ? raw.status
      : raw.endTime
        ? "completed"
        : "abandoned";
  return {
    id: raw.id,
    taskId: raw.taskId,
    projectId: raw.projectId,
    goalId: raw.goalId,
    startTime: toDate(raw.startTime) ?? new Date(0),
    endTime: toDate(raw.endTime),
    duration: raw.duration,
    accumulatedMs: raw.accumulatedMs ?? (raw.duration ? raw.duration * 60_000 : 0),
    lastResumeAt: toDate(raw.lastResumeAt),
    pausedAt: toDate(raw.pausedAt),
    interruptions: raw.interruptions ?? 0,
    status,
    quality: raw.quality,
    notes: raw.notes,
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

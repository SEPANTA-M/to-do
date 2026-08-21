import type { FocusSession, Task } from "@/domain/types";
import { createId } from "@/domain/ids";
import { LOCAL_USER_ID } from "@/domain/task/constants";

export interface StartFocusInput {
  task?: Task;
  userId?: string;
  now?: Date;
  id?: string;
}

export function startFocusSession(input: StartFocusInput): FocusSession {
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("focus"),
    taskId: input.task?.id,
    projectId: input.task?.projectId,
    goalId: input.task?.goalId,
    startTime: now,
    accumulatedMs: 0,
    lastResumeAt: now,
    interruptions: 0,
    status: "active",
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export function elapsedMs(session: FocusSession, now = new Date()): number {
  const live =
    session.status === "active" && session.lastResumeAt
      ? Math.max(0, now.getTime() - session.lastResumeAt.getTime())
      : 0;
  return session.accumulatedMs + live;
}

export function elapsedMinutes(session: FocusSession, now = new Date()): number {
  return Math.max(0, Math.round(elapsedMs(session, now) / 60_000));
}

export function pauseFocusSession(session: FocusSession, now = new Date()): FocusSession {
  if (session.status !== "active") return session;
  return {
    ...session,
    status: "paused",
    accumulatedMs: elapsedMs(session, now),
    lastResumeAt: undefined,
    pausedAt: now,
    interruptions: session.interruptions + 1,
    updatedAt: now,
  };
}

export function resumeFocusSession(session: FocusSession, now = new Date()): FocusSession {
  if (session.status !== "paused") return session;
  return {
    ...session,
    status: "active",
    lastResumeAt: now,
    pausedAt: undefined,
    updatedAt: now,
  };
}

export function completeFocusSession(session: FocusSession, now = new Date()): FocusSession {
  const total = elapsedMs(session, now);
  return {
    ...session,
    status: "completed",
    endTime: now,
    accumulatedMs: total,
    lastResumeAt: undefined,
    pausedAt: undefined,
    duration: Math.max(0, Math.round(total / 60_000)),
    updatedAt: now,
  };
}

export function abandonFocusSession(session: FocusSession, now = new Date()): FocusSession {
  const total = elapsedMs(session, now);
  return {
    ...session,
    status: "abandoned",
    endTime: now,
    accumulatedMs: total,
    lastResumeAt: undefined,
    pausedAt: undefined,
    duration: Math.max(0, Math.round(total / 60_000)),
    updatedAt: now,
  };
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

import type { Task, TaskStatus } from "@/domain/types";

/**
 * Explicit, predictable status transitions.
 *
 * Primary path:
 *   planned → ready → in_progress → completed
 *
 * Reasonable alternates are allowed. Impossible jumps are rejected.
 */
export const ALLOWED_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  inbox: ["planned", "ready", "in_progress", "blocked", "completed", "archived"],
  planned: ["inbox", "ready", "in_progress", "blocked", "completed", "archived"],
  ready: ["inbox", "planned", "in_progress", "blocked", "paused", "completed", "archived"],
  in_progress: ["paused", "completed", "blocked", "ready"],
  paused: ["in_progress", "ready", "blocked", "planned", "completed"],
  blocked: ["ready", "planned", "inbox", "archived", "in_progress", "completed"],
  completed: ["ready", "archived"],
  archived: ["inbox"],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export class InvalidStatusTransitionError extends Error {
  readonly from: TaskStatus;
  readonly to: TaskStatus;

  constructor(from: TaskStatus, to: TaskStatus) {
    super(`Cannot change task status from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
    this.from = from;
    this.to = to;
  }
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}

export function isActiveStatus(status: TaskStatus): boolean {
  return status !== "completed" && status !== "archived";
}

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === "completed" || status === "archived";
}

export function applyStatus(
  task: Task,
  next: TaskStatus,
  now: Date
): Task {
  assertTransition(task.status, next);

  const updated: Task = {
    ...task,
    status: next,
    updatedAt: now,
  };

  if (next === "completed") {
    updated.completedAt = now;
  } else {
    updated.completedAt = undefined;
  }

  return updated;
}

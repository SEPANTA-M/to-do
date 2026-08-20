import type {
  PendingMutation,
  SchedulingBehavior,
  Task,
  TaskHistory,
  TaskPriority,
  TaskReminder,
  TaskStatus,
} from "@/domain/types";
import { LOCAL_USER_ID } from "./constants";
import { detectConflicts } from "./conflicts";
import { createTask, duplicateTask, type CreateTaskInput } from "./factory";
import { createHistoryEntry, inferHistoryAction } from "./history";
import { applyStatus } from "./status";
import { moveTaskToStart, resizeTaskDuration } from "./scheduling";

export type { CreateTaskInput };

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  dueDate?: Date | null;
  scheduledDate?: Date | null;
  startTime?: Date | null;
  endTime?: Date | null;
  projectId?: string | null;
  goalId?: string | null;
  parentTaskId?: string | null;
  tags?: string[];
  reminder?: TaskReminder | null;
  schedulingBehavior?: SchedulingBehavior;
  order?: number;
}

export interface EngineResult {
  tasks: Task[];
  history: TaskHistory[];
  mutation: PendingMutation;
  task: Task | null;
}

function mutation(
  operation: PendingMutation["operation"],
  taskId: string,
  payload: Record<string, unknown>,
  now: Date
): PendingMutation {
  return {
    id: createId("mut"),
    operation,
    taskId,
    payload: serializePayload(payload),
    createdAt: now,
    status: "pending",
  };
}

export function applyCreate(
  tasks: Task[],
  history: TaskHistory[],
  input: CreateTaskInput,
  now: Date = new Date()
): EngineResult {
  const task = createTask({ ...input, now });
  const entry = createHistoryEntry(task.id, "created", { title: task.title }, now, task.userId);
  return {
    tasks: [...tasks, task],
    history: [...history, entry],
    mutation: mutation("create", task.id, { taskId: task.id, title: task.title }, now),
    task,
  };
}

export function applyUpdate(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  updates: UpdateTaskInput,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("update", taskId, {}, now), task: null };
  }

  let next: Task = { ...current, updatedAt: now };

  if (updates.title !== undefined) {
    const title = updates.title.trim();
    if (!title) throw new Error("Task title is required");
    next.title = title;
  }
  if (updates.description !== undefined) {
    next.description = updates.description?.trim() || undefined;
  }
  if (updates.priority !== undefined) next.priority = updates.priority;
  if (updates.schedulingBehavior !== undefined) {
    next.schedulingBehavior = updates.schedulingBehavior;
  }
  if (updates.tags !== undefined) next.tags = updates.tags;
  if (updates.order !== undefined) next.order = updates.order;
  if (updates.projectId !== undefined) next.projectId = updates.projectId ?? undefined;
  if (updates.goalId !== undefined) next.goalId = updates.goalId ?? undefined;
  if (updates.parentTaskId !== undefined) {
    next.parentTaskId = updates.parentTaskId ?? undefined;
  }
  if (updates.reminder !== undefined) next.reminder = updates.reminder ?? undefined;
  if (updates.actualDuration !== undefined) {
    next.actualDuration = updates.actualDuration ?? undefined;
  }
  if (updates.estimatedDuration !== undefined) {
    next.estimatedDuration = updates.estimatedDuration ?? undefined;
  }
  if (updates.dueDate !== undefined) next.dueDate = updates.dueDate ?? undefined;
  if (updates.scheduledDate !== undefined) {
    next.scheduledDate = updates.scheduledDate ?? undefined;
  }
  if (updates.startTime !== undefined) next.startTime = updates.startTime ?? undefined;
  if (updates.endTime !== undefined) next.endTime = updates.endTime ?? undefined;

  if (updates.startTime !== undefined && next.startTime && !updates.endTime) {
    const duration = next.estimatedDuration ?? 30;
    next.endTime = new Date(next.startTime.getTime() + duration * 60_000);
  }

  if (updates.status !== undefined && updates.status !== current.status) {
    next = applyStatus(next, updates.status, now);
  }

  const action = inferHistoryAction(current, next);
  const entry = createHistoryEntry(
    taskId,
    action,
    collectChanges(current, next),
    now,
    current.userId
  );

  return {
    tasks: tasks.map((task) => (task.id === taskId ? next : task)),
    history: [...history, entry],
    mutation: mutation("update", taskId, collectChanges(current, next), now),
    task: next,
  };
}

export function applyComplete(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  return applyUpdate(tasks, history, taskId, { status: "completed" }, now);
}

export function applyStart(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("update", taskId, {}, now), task: null };
  }
  const from = current.status;
  const to = from === "paused" || from === "ready" || from === "planned" || from === "inbox"
    ? "in_progress"
    : "in_progress";
  return applyUpdate(tasks, history, taskId, { status: to }, now);
}

export function applyPause(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  return applyUpdate(tasks, history, taskId, { status: "paused" }, now);
}

export function applyArchive(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  return applyUpdate(tasks, history, taskId, { status: "archived" }, now);
}

export function applyDelete(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("delete", taskId, {}, now), task: null };
  }
  const entry = createHistoryEntry(
    taskId,
    "deleted",
    { title: current.title },
    now,
    current.userId
  );
  return {
    tasks: tasks.filter((task) => task.id !== taskId),
    history: [...history, entry],
    mutation: mutation("delete", taskId, { title: current.title }, now),
    task: current,
  };
}

export function applyDuplicate(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("create", taskId, {}, now), task: null };
  }
  const copy = duplicateTask(current, now);
  const entry = createHistoryEntry(
    copy.id,
    "created",
    { duplicatedFrom: current.id, title: copy.title },
    now,
    copy.userId
  );
  return {
    tasks: [...tasks, copy],
    history: [...history, entry],
    mutation: mutation("create", copy.id, { duplicatedFrom: current.id }, now),
    task: copy,
  };
}

export function applyReschedule(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  newStart: Date,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("reschedule", taskId, {}, now), task: null };
  }
  const next = moveTaskToStart(current, newStart, now);
  if (next.status === "inbox") {
    next.status = "planned";
  }
  const entry = createHistoryEntry(
    taskId,
    "rescheduled",
    {
      startTime: next.startTime?.toISOString(),
      endTime: next.endTime?.toISOString(),
    },
    now,
    current.userId
  );
  return {
    tasks: tasks.map((task) => (task.id === taskId ? next : task)),
    history: [...history, entry],
    mutation: mutation(
      "reschedule",
      taskId,
      {
        startTime: next.startTime?.toISOString() ?? null,
        endTime: next.endTime?.toISOString() ?? null,
      },
      now
    ),
    task: next,
  };
}

export function applyResize(
  tasks: Task[],
  history: TaskHistory[],
  taskId: string,
  durationMinutes: number,
  now: Date = new Date()
): EngineResult {
  const current = tasks.find((task) => task.id === taskId);
  if (!current) {
    return { tasks, history, mutation: mutation("update", taskId, {}, now), task: null };
  }
  const next = resizeTaskDuration(current, durationMinutes, now);
  const entry = createHistoryEntry(
    taskId,
    "rescheduled",
    { estimatedDuration: next.estimatedDuration },
    now,
    current.userId
  );
  return {
    tasks: tasks.map((task) => (task.id === taskId ? next : task)),
    history: [...history, entry],
    mutation: mutation(
      "update",
      taskId,
      { estimatedDuration: next.estimatedDuration ?? null },
      now
    ),
    task: next,
  };
}

export function applyReorder(
  tasks: Task[],
  history: TaskHistory[],
  orderedIds: string[],
  now: Date = new Date()
): EngineResult {
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
  const nextTasks = tasks.map((task) => {
    const order = orderMap.get(task.id);
    if (order === undefined || task.order === order) return task;
    return { ...task, order, updatedAt: now };
  });
  return {
    tasks: nextTasks,
    history,
    mutation: mutation("update", orderedIds[0] ?? "", { order: orderedIds }, now),
    task: null,
  };
}

export function conflictsFor(task: Task, tasks: Task[]): Task[] {
  return detectConflicts(task, tasks);
}

export function defaultUserId(): string {
  return LOCAL_USER_ID;
}

function collectChanges(previous: Task, next: Task): Record<string, unknown> {
  const keys: (keyof Task)[] = [
    "title",
    "description",
    "status",
    "priority",
    "estimatedDuration",
    "actualDuration",
    "dueDate",
    "scheduledDate",
    "startTime",
    "endTime",
    "schedulingBehavior",
    "tags",
    "projectId",
    "goalId",
    "parentTaskId",
  ];
  const changes: Record<string, unknown> = {};
  for (const key of keys) {
    const before = previous[key];
    const after = next[key];
    if (serializeValue(before) !== serializeValue(after)) {
      changes[key] = after instanceof Date ? after.toISOString() : after;
    }
  }
  return changes;
}

function serializeValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function serializePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    result[key] = value instanceof Date ? value.toISOString() : value;
  }
  return result;
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

import type { PendingMutation, Task, TaskHistory, TaskRecurrence, TaskReminder } from "@/domain/types";
import { toDate } from "./time";

interface SerializedTask {
  id: string;
  title: string;
  description?: string;
  status: Task["status"];
  priority: Task["priority"];
  estimatedDuration?: number;
  actualDuration?: number;
  dueDate?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  projectId?: string;
  goalId?: string;
  parentTaskId?: string;
  tags: string[];
  recurrence?: SerializedRecurrence;
  reminder?: SerializedReminder;
  schedulingBehavior: Task["schedulingBehavior"];
  isFlexible?: boolean;
  order: number;
  completedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedRecurrence {
  frequency: NonNullable<Task["recurrence"]>["frequency"];
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

interface SerializedReminder {
  enabled: boolean;
  remindAt?: string;
  offsetMinutes?: number;
}

interface SerializedHistory {
  id: string;
  taskId: string;
  action: TaskHistory["action"];
  changes: Record<string, unknown>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedMutation {
  id: string;
  operation: PendingMutation["operation"];
  taskId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: PendingMutation["status"];
}

export function serializeTask(task: Task): SerializedTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    estimatedDuration: task.estimatedDuration,
    actualDuration: task.actualDuration,
    dueDate: task.dueDate?.toISOString(),
    scheduledDate: task.scheduledDate?.toISOString(),
    startTime: task.startTime?.toISOString(),
    endTime: task.endTime?.toISOString(),
    projectId: task.projectId,
    goalId: task.goalId,
    parentTaskId: task.parentTaskId,
    tags: task.tags,
    recurrence: task.recurrence
      ? {
          frequency: task.recurrence.frequency,
          interval: task.recurrence.interval,
          endDate: task.recurrence.endDate?.toISOString(),
          daysOfWeek: task.recurrence.daysOfWeek,
        }
      : undefined,
    reminder: task.reminder
      ? {
          enabled: task.reminder.enabled,
          remindAt: task.reminder.remindAt?.toISOString(),
          offsetMinutes: task.reminder.offsetMinutes,
        }
      : undefined,
    schedulingBehavior: task.schedulingBehavior,
    order: task.order,
    completedAt: task.completedAt?.toISOString(),
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function deserializeTask(raw: SerializedTask): Task {
  const recurrence: TaskRecurrence | undefined = raw.recurrence
    ? {
        frequency: raw.recurrence.frequency,
        interval: raw.recurrence.interval,
        endDate: toDate(raw.recurrence.endDate),
        daysOfWeek: raw.recurrence.daysOfWeek,
      }
    : undefined;

  const reminder: TaskReminder | undefined = raw.reminder
    ? {
        enabled: raw.reminder.enabled,
        remindAt: toDate(raw.reminder.remindAt),
        offsetMinutes: raw.reminder.offsetMinutes,
      }
    : undefined;

  const schedulingBehavior =
    raw.schedulingBehavior ??
    (raw.isFlexible === false ? "fixed" : "flexible");

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    estimatedDuration: raw.estimatedDuration,
    actualDuration: raw.actualDuration,
    dueDate: toDate(raw.dueDate),
    scheduledDate: toDate(raw.scheduledDate),
    startTime: toDate(raw.startTime),
    endTime: toDate(raw.endTime),
    projectId: raw.projectId,
    goalId: raw.goalId,
    parentTaskId: raw.parentTaskId,
    tags: raw.tags ?? [],
    recurrence,
    reminder,
    schedulingBehavior,
    order: raw.order ?? 0,
    completedAt: toDate(raw.completedAt),
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

export function serializeHistory(entry: TaskHistory): SerializedHistory {
  return {
    id: entry.id,
    taskId: entry.taskId,
    action: entry.action,
    changes: entry.changes,
    userId: entry.userId,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function deserializeHistory(raw: SerializedHistory): TaskHistory {
  return {
    id: raw.id,
    taskId: raw.taskId,
    action: raw.action,
    changes: raw.changes ?? {},
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

export function serializeMutation(mutation: PendingMutation): SerializedMutation {
  return {
    id: mutation.id,
    operation: mutation.operation,
    taskId: mutation.taskId,
    payload: mutation.payload,
    createdAt: mutation.createdAt.toISOString(),
    status: mutation.status,
  };
}

export function deserializeMutation(raw: SerializedMutation): PendingMutation {
  return {
    id: raw.id,
    operation: raw.operation,
    taskId: raw.taskId,
    payload: raw.payload ?? {},
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    status: raw.status,
  };
}

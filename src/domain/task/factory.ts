import { addMinutes, startOfDay } from "date-fns";
import type {
  SchedulingBehavior,
  Task,
  TaskPriority,
  TaskRecurrence,
  TaskReminder,
  TaskStatus,
} from "@/domain/types";
import { DEFAULT_DURATION_MINUTES, LOCAL_USER_ID } from "./constants";
import { getTaskDurationMinutes } from "./time";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedDuration?: number;
  actualDuration?: number;
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date;
  endTime?: Date;
  projectId?: string;
  goalId?: string;
  parentTaskId?: string;
  tags?: string[];
  recurrence?: TaskRecurrence;
  reminder?: TaskReminder;
  schedulingBehavior?: SchedulingBehavior;
  order?: number;
  userId?: string;
  now?: Date;
  id?: string;
}

export function createTask(input: CreateTaskInput): Task {
  const now = input.now ?? new Date();
  const title = input.title.trim();
  if (!title) {
    throw new Error("Task title is required");
  }

  const startTime = input.startTime ? new Date(input.startTime) : undefined;
  let estimatedDuration = input.estimatedDuration;
  let endTime = input.endTime ? new Date(input.endTime) : undefined;

  if (startTime && !endTime) {
    const duration = estimatedDuration && estimatedDuration > 0
      ? estimatedDuration
      : DEFAULT_DURATION_MINUTES;
    estimatedDuration = duration;
    endTime = addMinutes(startTime, duration);
  } else if (startTime && endTime && !estimatedDuration) {
    estimatedDuration = getTaskDurationMinutes({ startTime, endTime, estimatedDuration });
  }

  const scheduledDate =
    input.scheduledDate ??
    (startTime ? startOfDay(startTime) : undefined);

  const status: TaskStatus =
    input.status ?? (startTime ? "planned" : "inbox");

  return {
    id: input.id ?? createId(),
    title,
    description: input.description?.trim() || undefined,
    status,
    priority: input.priority ?? "medium",
    estimatedDuration,
    actualDuration: input.actualDuration,
    dueDate: input.dueDate,
    scheduledDate,
    startTime,
    endTime,
    projectId: input.projectId,
    goalId: input.goalId,
    parentTaskId: input.parentTaskId,
    tags: input.tags ?? [],
    recurrence: input.recurrence,
    reminder: input.reminder,
    schedulingBehavior: input.schedulingBehavior ?? "flexible",
    order: input.order ?? 0,
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateTask(task: Task, now: Date = new Date()): Task {
  return {
    ...task,
    id: createId(),
    title: task.title,
    status: task.status === "completed" || task.status === "archived" ? "planned" : task.status,
    completedAt: undefined,
    actualDuration: undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

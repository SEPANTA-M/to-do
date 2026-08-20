import type {
  ActivityEvent,
  Goal,
  GoalStatus,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectStatus,
} from "@/domain/types";
import { toDate } from "@/domain/task/time";

interface SerializedGoal {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: Goal["priority"];
  targetDate?: string;
  completedAt?: string;
  icon?: string;
  accent?: Goal["accent"];
  parentGoalId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedMilestone {
  id: string;
  title: string;
  description?: string;
  status: string;
  goalId: string;
  targetDate?: string;
  completedAt?: string;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: Project["priority"];
  goalId?: string;
  milestoneId?: string;
  startDate?: string;
  targetDate?: string;
  targetEndDate?: string;
  completedAt?: string;
  icon?: string;
  accent?: Project["accent"];
  color?: string;
  tags?: string[];
  order?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedActivity {
  id: string;
  type: ActivityEvent["type"];
  entityType: ActivityEvent["entityType"];
  entityId: string;
  message: string;
  createdAt: string;
}

export function serializeGoal(goal: Goal): SerializedGoal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    priority: goal.priority,
    targetDate: goal.targetDate?.toISOString(),
    completedAt: goal.completedAt?.toISOString(),
    icon: goal.icon,
    accent: goal.accent,
    parentGoalId: goal.parentGoalId,
    userId: goal.userId,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

export function deserializeGoal(raw: SerializedGoal): Goal {
  const status = normalizeGoalStatus(raw.status);
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status,
    priority: raw.priority ?? "medium",
    targetDate: toDate(raw.targetDate),
    completedAt: toDate(raw.completedAt),
    icon: raw.icon,
    accent: raw.accent,
    parentGoalId: raw.parentGoalId,
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

export function serializeMilestone(milestone: Milestone): SerializedMilestone {
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    status: milestone.status,
    goalId: milestone.goalId,
    targetDate: milestone.targetDate?.toISOString(),
    completedAt: milestone.completedAt?.toISOString(),
    order: milestone.order,
    userId: milestone.userId,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

export function deserializeMilestone(raw: SerializedMilestone): Milestone {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: normalizeMilestoneStatus(raw.status, raw.completedAt),
    goalId: raw.goalId,
    targetDate: toDate(raw.targetDate),
    completedAt: toDate(raw.completedAt),
    order: raw.order ?? 0,
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

export function serializeProject(project: Project): SerializedProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    goalId: project.goalId,
    milestoneId: project.milestoneId,
    startDate: project.startDate?.toISOString(),
    targetDate: project.targetDate?.toISOString(),
    completedAt: project.completedAt?.toISOString(),
    icon: project.icon,
    accent: project.accent,
    tags: project.tags,
    order: project.order,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function deserializeProject(raw: SerializedProject): Project {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: normalizeProjectStatus(raw.status),
    priority: raw.priority ?? "medium",
    goalId: raw.goalId,
    milestoneId: raw.milestoneId,
    startDate: toDate(raw.startDate),
    targetDate: toDate(raw.targetDate ?? raw.targetEndDate),
    completedAt: toDate(raw.completedAt),
    icon: raw.icon,
    accent: raw.accent,
    tags: raw.tags ?? [],
    order: raw.order ?? 0,
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}

export function serializeActivity(event: ActivityEvent): SerializedActivity {
  return {
    id: event.id,
    type: event.type,
    entityType: event.entityType,
    entityId: event.entityId,
    message: event.message,
    createdAt: event.createdAt.toISOString(),
  };
}

export function deserializeActivity(raw: SerializedActivity): ActivityEvent {
  return {
    id: raw.id,
    type: raw.type,
    entityType: raw.entityType,
    entityId: raw.entityId,
    message: raw.message,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
  };
}

function normalizeGoalStatus(status: string): GoalStatus {
  if (status === "abandoned") return "archived";
  if (
    status === "draft" ||
    status === "active" ||
    status === "paused" ||
    status === "completed" ||
    status === "archived"
  ) {
    return status;
  }
  return "active";
}

function normalizeProjectStatus(status: string): ProjectStatus {
  if (status === "on_hold") return "paused";
  if (
    status === "planned" ||
    status === "active" ||
    status === "paused" ||
    status === "completed" ||
    status === "archived"
  ) {
    return status;
  }
  return "active";
}

function normalizeMilestoneStatus(
  status: string,
  completedAt?: string
): MilestoneStatus {
  if (
    status === "planned" ||
    status === "active" ||
    status === "completed" ||
    status === "archived"
  ) {
    return status;
  }
  return completedAt ? "completed" : "planned";
}

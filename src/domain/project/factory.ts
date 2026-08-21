import type {
  AccentToken,
  Project,
  ProjectStatus,
  TaskPriority,
} from "@/domain/types";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { createId } from "@/domain/ids";

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: TaskPriority;
  goalId?: string;
  milestoneId?: string;
  startDate?: Date;
  targetDate?: Date;
  icon?: string;
  accent?: AccentToken;
  tags?: string[];
  order?: number;
  userId?: string;
  now?: Date;
  id?: string;
}

export function createProject(input: CreateProjectInput): Project {
  const name = input.name.trim();
  if (!name) throw new Error("Project name is required");
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("proj"),
    name,
    description: input.description?.trim() || undefined,
    status: input.status ?? "active",
    priority: input.priority ?? "medium",
    goalId: input.goalId,
    milestoneId: input.milestoneId,
    startDate: input.startDate,
    targetDate: input.targetDate,
    icon: input.icon,
    accent: input.accent,
    tags: input.tags ?? [],
    order: input.order ?? 0,
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: TaskPriority;
  goalId?: string | null;
  milestoneId?: string | null;
  startDate?: Date | null;
  targetDate?: Date | null;
  icon?: string | null;
  accent?: AccentToken | null;
  tags?: string[];
}

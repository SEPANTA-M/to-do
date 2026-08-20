import type { AccentToken, Goal, GoalStatus, TaskPriority } from "@/domain/types";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { createId } from "@/domain/ids";

export interface CreateGoalInput {
  title: string;
  description?: string;
  status?: GoalStatus;
  priority?: TaskPriority;
  targetDate?: Date;
  icon?: string;
  accent?: AccentToken;
  parentGoalId?: string;
  userId?: string;
  now?: Date;
  id?: string;
}

export function createGoal(input: CreateGoalInput): Goal {
  const title = input.title.trim();
  if (!title) throw new Error("Goal title is required");
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("goal"),
    title,
    description: input.description?.trim() || undefined,
    status: input.status ?? "active",
    priority: input.priority ?? "medium",
    targetDate: input.targetDate,
    icon: input.icon,
    accent: input.accent,
    parentGoalId: input.parentGoalId,
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  status?: GoalStatus;
  priority?: TaskPriority;
  targetDate?: Date | null;
  icon?: string | null;
  accent?: AccentToken | null;
}

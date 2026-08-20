import type { Milestone, MilestoneStatus } from "@/domain/types";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { createId } from "@/domain/ids";

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  goalId: string;
  status?: MilestoneStatus;
  targetDate?: Date;
  order?: number;
  userId?: string;
  now?: Date;
  id?: string;
}

export function createMilestone(input: CreateMilestoneInput): Milestone {
  const title = input.title.trim();
  if (!title) throw new Error("Milestone title is required");
  if (!input.goalId) throw new Error("A milestone must belong to a goal");
  const now = input.now ?? new Date();
  return {
    id: input.id ?? createId("ms"),
    title,
    description: input.description?.trim() || undefined,
    status: input.status ?? "planned",
    goalId: input.goalId,
    targetDate: input.targetDate,
    order: input.order ?? 0,
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string | null;
  status?: MilestoneStatus;
  targetDate?: Date | null;
  order?: number;
}

import type { Milestone, MilestoneStatus } from "@/domain/types";

export const MILESTONE_TRANSITIONS: Record<
  MilestoneStatus,
  readonly MilestoneStatus[]
> = {
  planned: ["active", "completed", "archived"],
  active: ["completed", "planned", "archived"],
  completed: ["active", "archived"],
  archived: ["planned"],
};

export function canTransitionMilestone(
  from: MilestoneStatus,
  to: MilestoneStatus
): boolean {
  if (from === to) return true;
  return MILESTONE_TRANSITIONS[from].includes(to);
}

export function applyMilestoneStatus(
  milestone: Milestone,
  next: MilestoneStatus,
  now: Date
): Milestone {
  if (!canTransitionMilestone(milestone.status, next)) {
    throw new Error(`Cannot change milestone status from ${milestone.status} to ${next}`);
  }
  return {
    ...milestone,
    status: next,
    completedAt: next === "completed" ? now : undefined,
    updatedAt: now,
  };
}

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

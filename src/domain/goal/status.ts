import type { Goal, GoalStatus } from "@/domain/types";

export const GOAL_TRANSITIONS: Record<GoalStatus, readonly GoalStatus[]> = {
  draft: ["active", "archived"],
  active: ["paused", "completed", "archived", "draft"],
  paused: ["active", "completed", "archived"],
  completed: ["active", "archived"],
  archived: ["draft"],
};

export function canTransitionGoal(from: GoalStatus, to: GoalStatus): boolean {
  if (from === to) return true;
  return GOAL_TRANSITIONS[from].includes(to);
}

export function applyGoalStatus(goal: Goal, next: GoalStatus, now: Date): Goal {
  if (!canTransitionGoal(goal.status, next)) {
    throw new Error(`Cannot change goal status from ${goal.status} to ${next}`);
  }
  return {
    ...goal,
    status: next,
    completedAt: next === "completed" ? now : undefined,
    updatedAt: now,
  };
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

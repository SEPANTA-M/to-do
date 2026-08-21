import type { Project, ProjectStatus } from "@/domain/types";

export const PROJECT_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  planned: ["active", "completed", "archived"],
  active: ["paused", "completed", "archived", "planned"],
  paused: ["active", "completed", "archived"],
  completed: ["active", "archived"],
  archived: ["planned"],
};

export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  if (from === to) return true;
  return PROJECT_TRANSITIONS[from].includes(to);
}

export function applyProjectStatus(
  project: Project,
  next: ProjectStatus,
  now: Date
): Project {
  if (!canTransitionProject(project.status, next)) {
    throw new Error(`Cannot change project status from ${project.status} to ${next}`);
  }
  return {
    ...project,
    status: next,
    completedAt: next === "completed" ? now : undefined,
    updatedAt: now,
  };
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

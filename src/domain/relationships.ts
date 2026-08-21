import type { Goal, Milestone, Project, Task } from "@/domain/types";

export interface TaskContext {
  project?: Project;
  milestone?: Milestone;
  goal?: Goal;
}

/**
 * Resolve Goal ← Milestone ← Project ← Task without duplicating FKs on the task.
 * task.projectId is canonical. task.goalId is only used when there is no project.
 */
export function resolveTaskContext(
  task: Task,
  projects: Project[],
  milestones: Milestone[],
  goals: Goal[]
): TaskContext {
  const project = task.projectId
    ? projects.find((item) => item.id === task.projectId)
    : undefined;
  const milestoneId = project?.milestoneId;
  const milestone = milestoneId
    ? milestones.find((item) => item.id === milestoneId)
    : undefined;
  const goalId = project?.goalId ?? milestone?.goalId ?? task.goalId;
  const goal = goalId ? goals.find((item) => item.id === goalId) : undefined;
  return { project, milestone, goal };
}

export function sanitizeProjectLinks(
  project: Project,
  goals: Goal[],
  milestones: Milestone[]
): Project {
  let next = project;
  if (project.goalId && !goals.some((goal) => goal.id === project.goalId)) {
    next = { ...next, goalId: undefined };
  }
  if (
    project.milestoneId &&
    !milestones.some((milestone) => milestone.id === project.milestoneId)
  ) {
    next = { ...next, milestoneId: undefined };
  }
  if (next.milestoneId) {
    const milestone = milestones.find((item) => item.id === next.milestoneId);
    if (milestone && next.goalId !== milestone.goalId) {
      next = { ...next, goalId: milestone.goalId };
    }
  }
  return next;
}

export function sanitizeTaskLinks(task: Task, projects: Project[], goals: Goal[]): Task {
  let next = task;
  if (task.projectId && !projects.some((project) => project.id === task.projectId)) {
    next = { ...next, projectId: undefined };
  }
  if (task.goalId && !goals.some((goal) => goal.id === task.goalId)) {
    next = { ...next, goalId: undefined };
  }
  if (next.projectId) {
    const project = projects.find((item) => item.id === next.projectId);
    if (project) {
      next = { ...next, goalId: project.goalId };
    }
  }
  return next;
}

export function unlinkProjectsFromGoal(projects: Project[], goalId: string, now: Date): Project[] {
  return projects.map((project) =>
    project.goalId === goalId
      ? { ...project, goalId: undefined, milestoneId: undefined, updatedAt: now }
      : project
  );
}

export function unlinkProjectsFromMilestone(
  projects: Project[],
  milestoneId: string,
  now: Date
): Project[] {
  return projects.map((project) =>
    project.milestoneId === milestoneId
      ? { ...project, milestoneId: undefined, updatedAt: now }
      : project
  );
}

export function unlinkTasksFromProject(tasks: Task[], projectId: string, now: Date): Task[] {
  return tasks.map((task) =>
    task.projectId === projectId
      ? { ...task, projectId: undefined, updatedAt: now }
      : task
  );
}

export function unlinkTasksFromGoal(tasks: Task[], goalId: string, now: Date): Task[] {
  return tasks.map((task) =>
    task.goalId === goalId ? { ...task, goalId: undefined, updatedAt: now } : task
  );
}

export function unlinkMilestonesFromGoal(
  milestones: Milestone[],
  goalId: string
): Milestone[] {
  return milestones.filter((milestone) => milestone.goalId !== goalId);
}

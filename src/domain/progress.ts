/**
 * Hierarchical progress model (Phase 2)
 *
 * Leaf unit: a Task that is not archived.
 * A task is done iff status === "completed".
 *
 * Project progress
 *   T = tasks with projectId and status !== archived
 *   If T is empty: 0 (completing a project does NOT auto-complete tasks;
 *   a completed project with no tasks still reports 0 from children and
 *   is shown as complete via its own status).
 *   Else: round(100 * completed(T) / |T|)
 *
 * Milestone progress
 *   P = non-archived projects with this milestoneId
 *   If P is empty: 100 if milestone is completed, else 0
 *   Else: round(mean of project progresses) — equal weight
 *
 * Goal progress
 *   If the goal has non-archived milestones: round(mean of milestone progresses)
 *   Else if it has non-archived projects: round(mean of those project progresses)
 *   Else if it has non-archived tasks (goalId): completed / total
 *   Else: 0
 *
 * Weights are 1 for every child. A future `weight` field can be passed
 * through averageProgress without changing callers.
 *
 * Completing a parent never mutates children. Progress only *reflects* them.
 */

import type { Goal, Milestone, Project, Task } from "@/domain/types";

export interface WeightedProgress {
  progress: number;
  weight?: number;
}

export function averageProgress(items: WeightedProgress[]): number {
  if (items.length === 0) return 0;
  let sum = 0;
  let weight = 0;
  for (const item of items) {
    const w = item.weight && item.weight > 0 ? item.weight : 1;
    sum += item.progress * w;
    weight += w;
  }
  if (weight === 0) return 0;
  return Math.round(sum / weight);
}

export function isCountableTask(task: Task): boolean {
  return task.status !== "archived";
}

export function isCompletedTask(task: Task): boolean {
  return task.status === "completed";
}

export function computeProjectProgress(project: Project, tasks: Task[]): number {
  const mine = tasks.filter(
    (task) => task.projectId === project.id && isCountableTask(task)
  );
  if (mine.length === 0) return 0;
  const done = mine.filter(isCompletedTask).length;
  return Math.round((done / mine.length) * 100);
}

export function computeMilestoneProgress(
  milestone: Milestone,
  projects: Project[],
  tasks: Task[]
): number {
  const children = projects.filter(
    (project) => project.milestoneId === milestone.id && project.status !== "archived"
  );
  if (children.length === 0) {
    return milestone.status === "completed" ? 100 : 0;
  }
  return averageProgress(
    children.map((project) => ({
      progress: computeProjectProgress(project, tasks),
    }))
  );
}

export function computeGoalProgress(
  goal: Goal,
  milestones: Milestone[],
  projects: Project[],
  tasks: Task[]
): number {
  const goalMilestones = milestones.filter(
    (milestone) => milestone.goalId === goal.id && milestone.status !== "archived"
  );
  if (goalMilestones.length > 0) {
    return averageProgress(
      goalMilestones.map((milestone) => ({
        progress: computeMilestoneProgress(milestone, projects, tasks),
      }))
    );
  }

  const goalProjects = projects.filter(
    (project) =>
      project.goalId === goal.id &&
      !project.milestoneId &&
      project.status !== "archived"
  );
  if (goalProjects.length > 0) {
    return averageProgress(
      goalProjects.map((project) => ({
        progress: computeProjectProgress(project, tasks),
      }))
    );
  }

  const goalTasks = tasks.filter(
    (task) => task.goalId === goal.id && !task.projectId && isCountableTask(task)
  );
  if (goalTasks.length === 0) return 0;
  const done = goalTasks.filter(isCompletedTask).length;
  return Math.round((done / goalTasks.length) * 100);
}

export function countProjectTasks(projectId: string, tasks: Task[]): {
  total: number;
  completed: number;
  active: number;
} {
  const mine = tasks.filter(
    (task) => task.projectId === projectId && isCountableTask(task)
  );
  const completed = mine.filter(isCompletedTask).length;
  return {
    total: mine.length,
    completed,
    active: mine.length - completed,
  };
}

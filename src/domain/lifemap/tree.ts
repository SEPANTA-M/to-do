import type { Goal, Milestone, Project, Task } from "@/domain/types";
import {
  computeGoalProgress,
  computeMilestoneProgress,
  computeProjectProgress,
} from "@/domain/progress";

export type LifeMapKind = "goal" | "milestone" | "project" | "task";

export interface LifeMapNode {
  id: string;
  kind: LifeMapKind;
  title: string;
  status: string;
  progress: number;
  href: string;
  children: LifeMapNode[];
}

export function buildLifeMap(
  goals: Goal[],
  milestones: Milestone[],
  projects: Project[],
  tasks: Task[]
): LifeMapNode[] {
  const visibleGoals = goals.filter((goal) => goal.status !== "archived");
  const orphanProjects = projects.filter(
    (project) =>
      project.status !== "archived" &&
      !project.goalId &&
      !project.milestoneId
  );
  const orphanTasks = tasks.filter(
    (task) =>
      task.status !== "archived" &&
      !task.projectId &&
      !task.goalId &&
      !task.parentTaskId
  );

  const goalNodes = visibleGoals.map((goal) => goalNode(goal, milestones, projects, tasks));

  const projectNodes = orphanProjects.map((project) =>
    projectNode(project, tasks)
  );

  const taskNodes = orphanTasks.map(taskNode);

  return [...goalNodes, ...projectNodes, ...taskNodes];
}

function goalNode(
  goal: Goal,
  milestones: Milestone[],
  projects: Project[],
  tasks: Task[]
): LifeMapNode {
  const goalMilestones = milestones
    .filter((milestone) => milestone.goalId === goal.id && milestone.status !== "archived")
    .sort((a, b) => a.order - b.order);
  const unmilestoned = projects.filter(
    (project) =>
      project.goalId === goal.id &&
      !project.milestoneId &&
      project.status !== "archived"
  );
  const directTasks = tasks.filter(
    (task) =>
      task.goalId === goal.id &&
      !task.projectId &&
      !task.parentTaskId &&
      task.status !== "archived"
  );

  return {
    id: goal.id,
    kind: "goal",
    title: goal.title,
    status: goal.status,
    progress: computeGoalProgress(goal, milestones, projects, tasks),
    href: `/goals/${goal.id}`,
    children: [
      ...goalMilestones.map((milestone) => milestoneNode(milestone, projects, tasks)),
      ...unmilestoned.map((project) => projectNode(project, tasks)),
      ...directTasks.map(taskNode),
    ],
  };
}

function milestoneNode(
  milestone: Milestone,
  projects: Project[],
  tasks: Task[]
): LifeMapNode {
  const children = projects.filter(
    (project) => project.milestoneId === milestone.id && project.status !== "archived"
  );
  return {
    id: milestone.id,
    kind: "milestone",
    title: milestone.title,
    status: milestone.status,
    progress: computeMilestoneProgress(milestone, projects, tasks),
    href: `/goals/${milestone.goalId}`,
    children: children.map((project) => projectNode(project, tasks)),
  };
}

function projectNode(project: Project, tasks: Task[]): LifeMapNode {
  const children = tasks.filter(
    (task) =>
      task.projectId === project.id &&
      !task.parentTaskId &&
      task.status !== "archived"
  );
  return {
    id: project.id,
    kind: "project",
    title: project.name,
    status: project.status,
    progress: computeProjectProgress(project, tasks),
    href: `/projects/${project.id}`,
    children: children.map(taskNode),
  };
}

function taskNode(task: Task): LifeMapNode {
  return {
    id: task.id,
    kind: "task",
    title: task.title,
    status: task.status,
    progress: task.status === "completed" ? 100 : 0,
    href: `/tasks?open=${task.id}`,
    children: [],
  };
}

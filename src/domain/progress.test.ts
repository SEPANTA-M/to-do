import { describe, expect, it } from "vitest";
import { createGoal } from "./goal/factory";
import { createMilestone } from "./milestone/factory";
import { createProject } from "./project/factory";
import { createTask } from "./task/factory";
import {
  computeGoalProgress,
  computeMilestoneProgress,
  computeProjectProgress,
} from "./progress";
import { applyComplete, applyCreate } from "./task/service";

describe("hierarchical progress", () => {
  it("computes project progress from real tasks", () => {
    const project = createProject({ name: "Auth" });
    const a = createTask({ title: "JWT", projectId: project.id, status: "completed" });
    a.completedAt = new Date();
    const b = createTask({ title: "Middleware", projectId: project.id });
    const c = createTask({ title: "Tests", projectId: project.id });
    expect(computeProjectProgress(project, [a, b, c])).toBe(33);
  });

  it("ignores archived tasks", () => {
    const project = createProject({ name: "Auth" });
    const a = createTask({ title: "Done", projectId: project.id, status: "completed" });
    const archived = createTask({ title: "Old", projectId: project.id, status: "archived" });
    expect(computeProjectProgress(project, [a, archived])).toBe(100);
  });

  it("uses milestone → project averages, not a flat task ratio", () => {
    const goal = createGoal({ title: "Launch" });
    const research = createMilestone({ title: "Research", goalId: goal.id });
    const mvp = createMilestone({ title: "MVP", goalId: goal.id });
    const p1 = createProject({ name: "Interviews", goalId: goal.id, milestoneId: research.id });
    const p2 = createProject({ name: "Auth", goalId: goal.id, milestoneId: mvp.id });
    const t1 = createTask({ title: "Call", projectId: p1.id, status: "completed" });
    const t2 = createTask({ title: "JWT", projectId: p2.id });
    const t3 = createTask({ title: "Session", projectId: p2.id });
    // Research project 100%, MVP project 0% → milestone avg 50%, goal 50%
    // Flat task ratio would be 1/3 = 33%
    expect(computeProjectProgress(p1, [t1, t2, t3])).toBe(100);
    expect(computeProjectProgress(p2, [t1, t2, t3])).toBe(0);
    expect(computeMilestoneProgress(research, [p1, p2], [t1, t2, t3])).toBe(100);
    expect(computeMilestoneProgress(mvp, [p1, p2], [t1, t2, t3])).toBe(0);
    expect(computeGoalProgress(goal, [research, mvp], [p1, p2], [t1, t2, t3])).toBe(50);
  });

  it("updates project and goal progress when a task is completed", () => {
    const goal = createGoal({ title: "Launch" });
    const milestone = createMilestone({ title: "MVP", goalId: goal.id });
    const project = createProject({
      name: "Auth",
      goalId: goal.id,
      milestoneId: milestone.id,
    });
    const createdA = applyCreate([], [], {
      title: "JWT",
      projectId: project.id,
      goalId: goal.id,
    });
    const createdB = applyCreate(createdA.tasks, createdA.history, {
      title: "Middleware",
      projectId: project.id,
      goalId: goal.id,
    });
    expect(computeProjectProgress(project, createdB.tasks)).toBe(0);
    expect(computeGoalProgress(goal, [milestone], [project], createdB.tasks)).toBe(0);

    const completed = applyComplete(
      createdB.tasks,
      createdB.history,
      createdA.task!.id
    );
    expect(computeProjectProgress(project, completed.tasks)).toBe(50);
    expect(computeGoalProgress(goal, [milestone], [project], completed.tasks)).toBe(50);
  });
});

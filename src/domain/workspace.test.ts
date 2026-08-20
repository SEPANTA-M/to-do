import { describe, expect, it } from "vitest";
import { createGoal } from "./goal/factory";
import { applyGoalStatus, canTransitionGoal } from "./goal/status";
import { createMilestone } from "./milestone/factory";
import { createProject } from "./project/factory";
import { applyProjectStatus, canTransitionProject } from "./project/status";
import { createTask } from "./task/factory";
import {
  resolveTaskContext,
  sanitizeProjectLinks,
  sanitizeTaskLinks,
  unlinkProjectsFromGoal,
  unlinkTasksFromProject,
} from "./relationships";
import { classifyDeadline } from "./deadlines";
import { searchGoals, searchProjects } from "./search";

describe("goal states", () => {
  it("creates and completes a goal without mutating children", () => {
    const now = new Date("2026-08-20T10:00:00");
    const goal = createGoal({ title: "Launch startup", now });
    const project = createProject({ name: "Auth", goalId: goal.id, now });
    const completed = applyGoalStatus(goal, "completed", now);
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toEqual(now);
    expect(project.status).toBe("active");
  });

  it("rejects illegal goal transitions", () => {
    expect(canTransitionGoal("draft", "completed")).toBe(false);
    expect(canTransitionGoal("archived", "active")).toBe(false);
  });
});

describe("milestones", () => {
  it("must belong to a goal", () => {
    expect(() => createMilestone({ title: "MVP", goalId: "" })).toThrow(/goal/i);
    const goal = createGoal({ title: "Launch" });
    const ms = createMilestone({ title: "MVP", goalId: goal.id });
    expect(ms.goalId).toBe(goal.id);
  });
});

describe("projects", () => {
  it("can exist without a goal", () => {
    const project = createProject({ name: "Side quest" });
    expect(project.goalId).toBeUndefined();
    expect(project.status).toBe("active");
  });

  it("does not auto-complete tasks when the project completes", () => {
    const now = new Date("2026-08-20T10:00:00");
    const project = createProject({ name: "Auth", now });
    const task = createTask({ title: "JWT", projectId: project.id, now });
    const completed = applyProjectStatus(project, "completed", now);
    expect(completed.status).toBe("completed");
    expect(task.status).toBe("inbox");
  });

  it("rejects illegal project transitions", () => {
    expect(canTransitionProject("archived", "completed")).toBe(false);
  });
});

describe("task → project → goal", () => {
  it("resolves hierarchy from the project, not duplicated FKs", () => {
    const goal = createGoal({ title: "Launch" });
    const milestone = createMilestone({ title: "MVP", goalId: goal.id });
    const project = createProject({
      name: "Auth",
      goalId: goal.id,
      milestoneId: milestone.id,
    });
    const task = createTask({ title: "JWT", projectId: project.id });
    const ctx = resolveTaskContext(task, [project], [milestone], [goal]);
    expect(ctx.project?.name).toBe("Auth");
    expect(ctx.milestone?.title).toBe("MVP");
    expect(ctx.goal?.title).toBe("Launch");
  });
});

describe("deletion safety", () => {
  it("unlinks projects instead of deleting them", () => {
    const now = new Date();
    const goal = createGoal({ title: "Launch" });
    const project = createProject({ name: "Auth", goalId: goal.id });
    const next = unlinkProjectsFromGoal([project], goal.id, now);
    expect(next[0]?.goalId).toBeUndefined();
    expect(next[0]?.id).toBe(project.id);
  });

  it("unlinks tasks instead of deleting them", () => {
    const now = new Date();
    const project = createProject({ name: "Auth" });
    const task = createTask({ title: "JWT", projectId: project.id });
    const next = unlinkTasksFromProject([task], project.id, now);
    expect(next[0]?.projectId).toBeUndefined();
    expect(next[0]?.title).toBe("JWT");
  });

  it("clears references to missing goals", () => {
    const project = createProject({ name: "Auth", goalId: "missing" });
    const clean = sanitizeProjectLinks(project, [], []);
    expect(clean.goalId).toBeUndefined();
    const task = createTask({ title: "JWT", projectId: "gone", goalId: "missing" });
    const cleanTask = sanitizeTaskLinks(task, [], []);
    expect(cleanTask.projectId).toBeUndefined();
    expect(cleanTask.goalId).toBeUndefined();
  });
});

describe("deadlines", () => {
  const now = new Date("2026-08-20T12:00:00");

  it("classifies overdue, due soon, upcoming, completed", () => {
    expect(classifyDeadline(new Date("2026-08-01"), "active", now)).toBe("overdue");
    expect(classifyDeadline(new Date("2026-08-22"), "active", now)).toBe("due_soon");
    expect(classifyDeadline(new Date("2026-12-01"), "active", now)).toBe("upcoming");
    expect(classifyDeadline(new Date("2026-08-01"), "completed", now)).toBe("completed");
    expect(classifyDeadline(undefined, "active", now)).toBe("none");
  });
});

describe("search", () => {
  it("finds goals and projects by name", () => {
    const goals = [createGoal({ title: "Launch startup" }), createGoal({ title: "Health" })];
    expect(searchGoals(goals, "launch").map((g) => g.title)).toEqual(["Launch startup"]);
    const projects = [createProject({ name: "Authentication" }), createProject({ name: "Billing" })];
    expect(searchProjects(projects, "auth").map((p) => p.name)).toEqual(["Authentication"]);
  });
});

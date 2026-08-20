import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { createGoal } from "@/domain/goal/factory";
import { createProject } from "@/domain/project/factory";
import { startFocusSession, completeFocusSession } from "@/domain/focus/session";
import { computeInsights, MIN_COMPLETED_FOR_RATE } from "./compute";

describe("insights", () => {
  const now = new Date("2026-08-21T18:00:00");

  it("does not invent a completion rate without enough data", () => {
    const tasks = [
      createTask({ title: "One", status: "completed", now: new Date("2026-08-20T10:00:00") }),
    ];
    tasks[0]!.completedAt = new Date("2026-08-20T11:00:00");
    const report = computeInsights(now, tasks, [], [], [], [], []);
    expect(report.completionRate).toBeNull();
    const metric = report.metrics.find((item) => item.key === "completionRate");
    expect(metric?.available).toBe(false);
    expect(metric?.requirement).toMatch(/completed tasks/i);
  });

  it("computes completion rate and focus minutes from real records", () => {
    const tasks = Array.from({ length: MIN_COMPLETED_FOR_RATE }, (_, i) => {
      const task = createTask({
        title: `Done ${i}`,
        status: "completed",
        estimatedDuration: 30,
        actualDuration: 30,
        now: new Date("2026-08-19T09:00:00"),
      });
      task.completedAt = new Date(`2026-08-20T1${i}:00:00`);
      return task;
    });
    const t0 = new Date("2026-08-20T09:00:00");
    const session = completeFocusSession(
      startFocusSession({ task: tasks[0], now: t0 }),
      new Date("2026-08-20T09:40:00")
    );
    const report = computeInsights(now, tasks, [], [session], [], [], []);
    expect(report.completedCount).toBe(MIN_COMPLETED_FOR_RATE);
    expect(report.completionRate).not.toBeNull();
    expect(report.focusMinutes).toBe(40);
    expect(report.planningAccuracy).toBe(100);
  });

  it("reports real project progress, not a placeholder", () => {
    const goal = createGoal({ title: "Ship" });
    const project = createProject({ name: "Auth", goalId: goal.id });
    const done = createTask({
      title: "JWT",
      projectId: project.id,
      status: "completed",
      now: new Date("2026-08-20T08:00:00"),
    });
    done.completedAt = new Date("2026-08-20T09:00:00");
    const open = createTask({ title: "Sessions", projectId: project.id, status: "planned" });
    const report = computeInsights(now, [done, open], [], [], [project], [goal], []);
    expect(report.projectProgress[0]?.progress).toBe(50);
    expect(report.goalProgress[0]?.progress).toBe(50);
  });
});

import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { createProject } from "@/domain/project/factory";
import { startFocusSession, completeFocusSession } from "@/domain/focus/session";
import { computeWeekSummary } from "./weekly";

describe("weekly review", () => {
  it("separates completed, incomplete, and carried-over work", () => {
    const now = new Date("2026-08-21T12:00:00");
    const completed = createTask({
      title: "Shipped",
      status: "completed",
      now: new Date("2026-08-19T09:00:00"),
    });
    completed.completedAt = new Date("2026-08-19T16:00:00");
    const incomplete = createTask({
      title: "Still open",
      status: "planned",
      startTime: new Date("2026-08-20T11:00:00"),
      estimatedDuration: 30,
    });
    const carried = createTask({
      title: "From last week",
      status: "planned",
      startTime: new Date("2026-08-10T11:00:00"),
      dueDate: new Date("2026-08-10T11:00:00"),
      estimatedDuration: 30,
    });
    const project = createProject({ name: "Auth" });
    completed.projectId = project.id;
    const session = completeFocusSession(
      startFocusSession({ now: new Date("2026-08-19T09:00:00") }),
      new Date("2026-08-19T09:25:00")
    );
    const summary = computeWeekSummary(
      now,
      { startOfWeek: 1 },
      [completed, incomplete, carried],
      [],
      [session],
      [project],
      []
    );
    expect(summary.completed.map((task) => task.title)).toContain("Shipped");
    expect(summary.incomplete.map((task) => task.title)).toContain("Still open");
    expect(summary.carriedOver.map((task) => task.title)).toContain("From last week");
    expect(summary.focusMinutes).toBe(25);
    expect(summary.projectMovement[0]?.name).toBe("Auth");
  });
});

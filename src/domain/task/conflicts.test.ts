import { describe, expect, it } from "vitest";
import { createTask } from "./factory";
import { detectConflicts } from "./conflicts";

describe("conflict detection", () => {
  it("detects overlapping scheduled tasks", () => {
    const a = createTask({
      title: "Task A",
      startTime: new Date("2026-08-20T15:00:00"),
      estimatedDuration: 120,
    });
    const b = createTask({
      title: "Task B",
      startTime: new Date("2026-08-20T16:00:00"),
      estimatedDuration: 60,
    });
    const conflicts = detectConflicts(b, [a, b]);
    expect(conflicts.map((task) => task.id)).toEqual([a.id]);
  });

  it("does not flag adjacent non-overlapping tasks", () => {
    const a = createTask({
      title: "Task A",
      startTime: new Date("2026-08-20T15:00:00"),
      estimatedDuration: 60,
    });
    const b = createTask({
      title: "Task B",
      startTime: new Date("2026-08-20T16:00:00"),
      estimatedDuration: 60,
    });
    expect(detectConflicts(b, [a, b])).toEqual([]);
  });

  it("ignores completed tasks", () => {
    const a = createTask({
      title: "Done",
      status: "completed",
      startTime: new Date("2026-08-20T15:00:00"),
      estimatedDuration: 120,
    });
    const b = createTask({
      title: "Live",
      startTime: new Date("2026-08-20T16:00:00"),
      estimatedDuration: 60,
    });
    expect(detectConflicts(b, [a, b])).toEqual([]);
  });
});

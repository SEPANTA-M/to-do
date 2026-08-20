import { describe, expect, it } from "vitest";
import { createTask } from "./factory";
import { getOverdueTasks, isOverdue } from "./overdue";

describe("overdue detection", () => {
  const now = new Date("2026-08-20T10:00:00");

  it("marks past due dates as overdue", () => {
    const task = createTask({
      title: "Late",
      dueDate: new Date("2026-08-18T00:00:00"),
      now,
    });
    expect(isOverdue(task, now)).toBe(true);
  });

  it("does not mark completed tasks overdue", () => {
    const task = createTask({
      title: "Finished",
      dueDate: new Date("2026-08-18T00:00:00"),
      status: "completed",
      now,
    });
    expect(isOverdue(task, now)).toBe(false);
  });

  it("does not treat today's due date as overdue", () => {
    const task = createTask({
      title: "Today",
      dueDate: new Date("2026-08-20T18:00:00"),
      now,
    });
    expect(isOverdue(task, now)).toBe(false);
  });

  it("returns overdue tasks sorted by due date", () => {
    const older = createTask({
      title: "Older",
      dueDate: new Date("2026-08-10T00:00:00"),
    });
    const newer = createTask({
      title: "Newer",
      dueDate: new Date("2026-08-12T00:00:00"),
    });
    const result = getOverdueTasks([newer, older], now);
    expect(result.map((task) => task.title)).toEqual(["Older", "Newer"]);
  });
});

import { describe, expect, it } from "vitest";
import { createTask } from "./factory";
import { moveTaskToStart, resizeTaskDuration, canAutoMove } from "./scheduling";
import { applyCreate, applyReschedule, applyResize } from "./service";

describe("scheduling and rescheduling", () => {
  it("moves a task from 14:00 to 16:00 and preserves duration", () => {
    const now = new Date("2026-08-20T09:00:00");
    const start = new Date("2026-08-20T14:00:00");
    const task = createTask({
      title: "Deep work",
      startTime: start,
      estimatedDuration: 60,
      now,
    });
    expect(task.startTime?.getHours()).toBe(14);
    expect(task.endTime?.getHours()).toBe(15);

    const moved = moveTaskToStart(task, new Date("2026-08-20T16:00:00"), now);
    expect(moved.startTime?.getHours()).toBe(16);
    expect(moved.startTime?.getMinutes()).toBe(0);
    expect(moved.endTime?.getHours()).toBe(17);
    expect(moved.endTime?.getMinutes()).toBe(0);
    expect(moved.dueDate?.toDateString()).toBe(
      new Date("2026-08-20T00:00:00").toDateString()
    );
  });

  it("updates estimatedDuration when resized", () => {
    const now = new Date("2026-08-20T09:00:00");
    const task = createTask({
      title: "Review",
      startTime: new Date("2026-08-20T10:00:00"),
      estimatedDuration: 30,
      now,
    });
    const resized = resizeTaskDuration(task, 90, now);
    expect(resized.estimatedDuration).toBe(90);
    expect(resized.endTime?.getHours()).toBe(11);
    expect(resized.endTime?.getMinutes()).toBe(30);
    expect(resized.startTime?.getHours()).toBe(10);
  });

  it("does not auto-move fixed tasks", () => {
    const task = createTask({
      title: "Standup",
      schedulingBehavior: "fixed",
      startTime: new Date("2026-08-20T09:00:00"),
    });
    expect(canAutoMove(task)).toBe(false);
    expect(canAutoMove({ ...task, schedulingBehavior: "flexible" })).toBe(true);
  });

  it("applyReschedule writes 16:00 into the data model", () => {
    const created = applyCreate([], [], {
      title: "Pairing",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 45,
    });
    const result = applyReschedule(
      created.tasks,
      created.history,
      created.task!.id,
      new Date("2026-08-20T16:00:00")
    );
    expect(result.task?.startTime?.getHours()).toBe(16);
    expect(result.task?.startTime?.getMinutes()).toBe(0);
    expect(result.history.at(-1)?.action).toBe("rescheduled");
  });

  it("applyResize updates duration in the model", () => {
    const created = applyCreate([], [], {
      title: "Write",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 30,
    });
    const result = applyResize(
      created.tasks,
      created.history,
      created.task!.id,
      120
    );
    expect(result.task?.estimatedDuration).toBe(120);
    expect(result.task?.endTime?.getHours()).toBe(16);
  });
});

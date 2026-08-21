import { describe, expect, it } from "vitest";
import { createTask } from "./factory";
import {
  applyComplete,
  applyCreate,
  applyPause,
  applyStart,
  applyUpdate,
} from "./service";
import { getCurrentTask } from "./current";
import { computeDayMomentum } from "./today";
import { PRIORITY_RANK } from "./constants";

describe("task creation and editing", () => {
  it("creates a task with a title and defaults", () => {
    const result = applyCreate([], [], { title: "Capture idea" });
    expect(result.task?.title).toBe("Capture idea");
    expect(result.task?.status).toBe("inbox");
    expect(result.task?.priority).toBe("medium");
    expect(result.task?.schedulingBehavior).toBe("flexible");
    expect(result.history[0]?.action).toBe("created");
  });

  it("rejects empty titles", () => {
    expect(() => applyCreate([], [], { title: "   " })).toThrow(/title/i);
  });

  it("edits title and priority", () => {
    const created = applyCreate([], [], { title: "Draft" });
    const updated = applyUpdate(
      created.tasks,
      created.history,
      created.task!.id,
      { title: "Draft essay", priority: "high" }
    );
    expect(updated.task?.title).toBe("Draft essay");
    expect(updated.task?.priority).toBe("high");
    expect(updated.history.at(-1)?.action).toBe("priority_changed");
  });

  it("completes a task from in_progress", () => {
    const created = applyCreate([], [], { title: "Ship", status: "ready" });
    const started = applyStart(created.tasks, created.history, created.task!.id);
    const completed = applyComplete(
      started.tasks,
      started.history,
      created.task!.id
    );
    expect(completed.task?.status).toBe("completed");
    expect(completed.task?.completedAt).toBeInstanceOf(Date);
    expect(completed.history.at(-1)?.action).toBe("completed");
  });

  it("starts and pauses", () => {
    const created = applyCreate([], [], { title: "Focus", status: "ready" });
    const started = applyStart(created.tasks, created.history, created.task!.id);
    expect(started.task?.status).toBe("in_progress");
    expect(started.history.at(-1)?.action).toBe("started");
    const paused = applyPause(started.tasks, started.history, created.task!.id);
    expect(paused.task?.status).toBe("paused");
    expect(paused.history.at(-1)?.action).toBe("paused");
  });
});

describe("priority", () => {
  it("ranks critical above high", () => {
    expect(PRIORITY_RANK.critical).toBeLessThan(PRIORITY_RANK.high);
    expect(PRIORITY_RANK.high).toBeLessThan(PRIORITY_RANK.medium);
    expect(PRIORITY_RANK.medium).toBeLessThan(PRIORITY_RANK.low);
  });
});

describe("current task", () => {
  it("prefers in_progress over scheduled", () => {
    const now = new Date("2026-08-20T10:30:00");
    const scheduled = createTask({
      title: "Scheduled",
      startTime: new Date("2026-08-20T10:00:00"),
      estimatedDuration: 60,
      status: "planned",
    });
    const active = createTask({
      title: "Active",
      status: "in_progress",
      priority: "low",
    });
    expect(getCurrentTask([scheduled, active], now)?.title).toBe("Active");
  });
});

describe("momentum", () => {
  it("calculates real completion percentage", () => {
    const day = new Date("2026-08-20T12:00:00");
    const done = createTask({
      title: "Done",
      status: "completed",
      startTime: new Date("2026-08-20T09:00:00"),
      estimatedDuration: 60,
    });
    done.completedAt = new Date("2026-08-20T10:00:00");
    const remaining = createTask({
      title: "Next",
      startTime: new Date("2026-08-20T11:00:00"),
      estimatedDuration: 30,
    });
    const momentum = computeDayMomentum([done, remaining], day);
    expect(momentum.completedCount).toBe(1);
    expect(momentum.remainingCount).toBe(1);
    expect(momentum.completionPercentage).toBe(50);
    expect(momentum.focusMinutes).toBe(60);
  });
});

import { describe, expect, it } from "vitest";
import { applyCreate, applyComplete, applyReschedule } from "@/domain/task/service";
import { TaskRepository } from "./task-repository";
import { createMemoryStorage } from "./storage";

describe("persistence", () => {
  it("round-trips created tasks including dates", async () => {
    const repo = new TaskRepository(createMemoryStorage());
    const created = applyCreate([], [], {
      title: "Persist me",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 45,
      priority: "high",
    });
    await repo.save({
      tasks: created.tasks,
      history: created.history,
      mutations: [created.mutation],
    });
    const loaded = await repo.load();
    expect(loaded.tasks).toHaveLength(1);
    expect(loaded.tasks[0]?.title).toBe("Persist me");
    expect(loaded.tasks[0]?.startTime).toBeInstanceOf(Date);
    expect(loaded.tasks[0]?.startTime?.getHours()).toBe(14);
    expect(loaded.tasks[0]?.priority).toBe("high");
    expect(loaded.history[0]?.action).toBe("created");
    expect(loaded.mutations[0]?.status).toBe("pending");
  });

  it("persists completion and reschedule", async () => {
    const repo = new TaskRepository(createMemoryStorage());
    const created = applyCreate([], [], {
      title: "Move",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 60,
      status: "in_progress",
    });
    const moved = applyReschedule(
      created.tasks,
      created.history,
      created.task!.id,
      new Date("2026-08-20T16:00:00")
    );
    const completed = applyComplete(
      moved.tasks,
      moved.history,
      created.task!.id
    );
    await repo.save({
      tasks: completed.tasks,
      history: completed.history,
      mutations: [created.mutation, moved.mutation, completed.mutation],
    });
    const loaded = await repo.load();
    expect(loaded.tasks[0]?.startTime?.getHours()).toBe(16);
    expect(loaded.tasks[0]?.status).toBe("completed");
    expect(loaded.tasks[0]?.completedAt).toBeInstanceOf(Date);
  });
});

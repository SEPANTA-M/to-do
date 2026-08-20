import { describe, expect, it } from "vitest";
import { applyStatus, canTransition, InvalidStatusTransitionError } from "./status";
import { createTask } from "./factory";

describe("status transitions", () => {
  it("allows the primary path planned → ready → in_progress → completed", () => {
    expect(canTransition("planned", "ready")).toBe(true);
    expect(canTransition("ready", "in_progress")).toBe(true);
    expect(canTransition("in_progress", "completed")).toBe(true);
  });

  it("allows reasonable alternates", () => {
    expect(canTransition("inbox", "ready")).toBe(true);
    expect(canTransition("in_progress", "paused")).toBe(true);
    expect(canTransition("paused", "in_progress")).toBe(true);
    expect(canTransition("ready", "blocked")).toBe(true);
    expect(canTransition("completed", "ready")).toBe(true);
    expect(canTransition("archived", "inbox")).toBe(true);
  });

  it("rejects impossible jumps", () => {
    expect(canTransition("completed", "in_progress")).toBe(false);
    expect(canTransition("archived", "completed")).toBe(false);
    expect(canTransition("completed", "inbox")).toBe(false);
  });

  it("sets completedAt on complete and clears it on reopen", () => {
    const now = new Date("2026-08-20T10:00:00");
    const later = new Date("2026-08-20T11:00:00");
    const task = createTask({ title: "Write", status: "in_progress", now });
    const completed = applyStatus(task, "completed", later);
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toEqual(later);
    const reopened = applyStatus(completed, "ready", later);
    expect(reopened.status).toBe("ready");
    expect(reopened.completedAt).toBeUndefined();
  });

  it("throws on invalid transition", () => {
    const task = createTask({ title: "Done", status: "completed" });
    expect(() => applyStatus(task, "in_progress", new Date())).toThrow(
      InvalidStatusTransitionError
    );
  });
});

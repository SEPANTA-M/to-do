import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import {
  abandonFocusSession,
  completeFocusSession,
  elapsedMs,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
} from "./session";

describe("focus sessions", () => {
  it("starts against a real task and records elapsed time", () => {
    const task = createTask({ title: "Draft chapter" });
    const t0 = new Date("2026-08-21T10:00:00");
    const session = startFocusSession({ task, now: t0 });
    expect(session.taskId).toBe(task.id);
    expect(session.status).toBe("active");
    expect(session.interruptions).toBe(0);
    const t1 = new Date("2026-08-21T10:25:00");
    expect(elapsedMs(session, t1)).toBe(25 * 60_000);
  });

  it("counts a pause as an interruption and excludes paused time", () => {
    const t0 = new Date("2026-08-21T10:00:00");
    let session = startFocusSession({ now: t0 });
    const t1 = new Date("2026-08-21T10:10:00");
    session = pauseFocusSession(session, t1);
    expect(session.status).toBe("paused");
    expect(session.interruptions).toBe(1);
    const t2 = new Date("2026-08-21T10:40:00");
    expect(elapsedMs(session, t2)).toBe(10 * 60_000);
    session = resumeFocusSession(session, t2);
    const t3 = new Date("2026-08-21T10:50:00");
    session = completeFocusSession(session, t3);
    expect(session.status).toBe("completed");
    expect(session.duration).toBe(20);
    expect(session.endTime?.getTime()).toBe(t3.getTime());
  });

  it("exit without complete marks the session abandoned but keeps duration", () => {
    const t0 = new Date("2026-08-21T09:00:00");
    let session = startFocusSession({ now: t0 });
    const t1 = new Date("2026-08-21T09:12:00");
    session = abandonFocusSession(session, t1);
    expect(session.status).toBe("abandoned");
    expect(session.duration).toBe(12);
  });
});

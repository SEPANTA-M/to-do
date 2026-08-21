import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { applyComplete, applyCreate, applyReschedule, applyStart } from "@/domain/task/service";
import { createGoal } from "@/domain/goal/factory";
import { createMilestone } from "@/domain/milestone/factory";
import { createProject } from "@/domain/project/factory";
import { computeGoalProgress, computeProjectProgress } from "@/domain/progress";
import {
  completeFocusSession,
  elapsedMs,
  pauseFocusSession,
  startFocusSession,
} from "@/domain/focus/session";
import { createNote } from "@/domain/note/factory";
import { createCalendarEvent } from "@/domain/calendar/factory";
import { occupiedForDay } from "@/domain/calendar/occupancy";
import { describeSlot, findFreeSlots, suggestPlacements } from "@/domain/scheduling/smart";
import { computeInsights } from "@/domain/insights/compute";
import { buildLifeMap } from "@/domain/lifemap/tree";
import { computeWeekSummary } from "@/domain/review/weekly";
import { searchAll } from "@/domain/search";
import { createBackup, mergeBackup } from "@/domain/export/backup";
import { DEFAULT_APP_SETTINGS } from "@/domain/settings/defaults";
import { dueReminders } from "@/domain/notifications/reminders";
import { parseTaskText } from "@/domain/task/parser";

describe("critical user journeys", () => {
  it("captures, schedules 14:00→16:00, starts, and completes a task", () => {
    const created = applyCreate([], [], {
      title: "Ship auth",
      startTime: new Date("2026-08-21T14:00:00"),
      estimatedDuration: 60,
    });
    expect(created.task?.startTime?.getHours()).toBe(14);
    const moved = applyReschedule(
      created.tasks,
      created.history,
      created.task!.id,
      new Date("2026-08-21T16:00:00")
    );
    expect(moved.task?.startTime?.getHours()).toBe(16);
    const started = applyStart(moved.tasks, moved.history, created.task!.id);
    expect(started.task?.status).toBe("in_progress");
    const done = applyComplete(started.tasks, started.history, created.task!.id);
    expect(done.task?.status).toBe("completed");
    expect(done.task?.completedAt).toBeInstanceOf(Date);
  });

  it("parses a natural-language capture without pretending to be AI", () => {
    const parsed = parseTaskText(
      "Finish physics homework tomorrow at 7pm for 60 minutes",
      new Date("2026-08-21T10:00:00")
    );
    expect(parsed.title.toLowerCase()).toContain("physics");
    expect(parsed.estimatedDuration).toBe(60);
    expect(parsed.startTime?.getHours()).toBe(19);
  });

  it("links goal → milestone → project → task and computes hierarchical progress", () => {
    const goal = createGoal({ title: "Launch Startup" });
    const mvp = createMilestone({ title: "MVP", goalId: goal.id });
    const auth = createProject({ name: "Authentication", goalId: goal.id, milestoneId: mvp.id });
    const jwt = createTask({ title: "JWT", projectId: auth.id, status: "completed" });
    jwt.completedAt = new Date("2026-08-20T12:00:00");
    const sessions = createTask({ title: "Sessions", projectId: auth.id, status: "planned" });
    expect(computeProjectProgress(auth, [jwt, sessions])).toBe(50);
    expect(computeGoalProgress(goal, [mvp], [auth], [jwt, sessions])).toBe(50);
    const tree = buildLifeMap([goal], [mvp], [auth], [jwt, sessions]);
    expect(tree[0]?.children[0]?.children[0]?.title).toBe("Authentication");
  });

  it("records a real focus session with pause as an interruption", () => {
    const task = createTask({ title: "Draft" });
    const t0 = new Date("2026-08-21T09:00:00");
    let session = startFocusSession({ task, now: t0 });
    session = pauseFocusSession(session, new Date("2026-08-21T09:10:00"));
    expect(session.interruptions).toBe(1);
    expect(elapsedMs(session, new Date("2026-08-21T09:40:00"))).toBe(10 * 60_000);
    session = completeFocusSession(session, new Date("2026-08-21T09:10:00"));
    expect(session.duration).toBe(10);
    expect(session.taskId).toBe(task.id);
  });

  it("does not invent insights or fire reminders when disabled", () => {
    const report = computeInsights(new Date("2026-08-21T18:00:00"), [], [], [], [], [], []);
    expect(report.completionRate).toBeNull();
    expect(report.metrics.find((m) => m.key === "completionRate")?.available).toBe(false);
    const task = createTask({
      title: "Due",
      reminder: { enabled: true, remindAt: new Date("2026-08-21T10:00:00") },
    });
    expect(
      dueReminders(new Date("2026-08-21T11:00:00"), [task], DEFAULT_APP_SETTINGS)
    ).toHaveLength(0);
  });

  it("finds open calendar time and never mutates until the user places", () => {
    const day = new Date("2026-08-21T00:00:00");
    const event = createCalendarEvent({
      title: "Call",
      startTime: new Date("2026-08-21T14:00:00"),
      endTime: new Date("2026-08-21T16:00:00"),
    });
    const occupied = occupiedForDay([], [event], day);
    const slots = findFreeSlots(day, occupied, {
      dayStartHour: 16,
      dayEndHour: 18,
      minDuration: 15,
    });
    expect(slots[0]?.durationMinutes).toBe(120);
    expect(
      describeSlot({
        start: new Date("2026-08-21T16:00:00"),
        end: new Date("2026-08-21T18:00:00"),
        durationMinutes: 90,
      })
    ).toBe("You have 90 minutes available between 16:00 and 18:00.");
    const open = createTask({ title: "Write", estimatedDuration: 45 });
    const suggestions = suggestPlacements([open], slots);
    expect(suggestions).toHaveLength(1);
    expect(open.startTime).toBeUndefined();
  });

  it("searches across entities and exports without overwriting on import", () => {
    const task = createTask({ title: "Implement authentication", id: "task-keep" });
    const note = createNote({ content: "JWT notes" });
    const results = searchAll("auth", {
      tasks: [task],
      projects: [],
      goals: [],
      milestones: [],
      notes: [note],
      events: [],
    });
    expect(results.tasks).toHaveLength(1);
    const snapshot = {
      tasks: [task],
      history: [],
      goals: [],
      milestones: [],
      projects: [],
      activity: [],
      notes: [note],
      events: [],
      sessions: [],
      reviews: [],
      settings: DEFAULT_APP_SETTINGS,
    };
    const incoming = createTask({ title: "Incoming", id: "task-keep" });
    const extra = createTask({ title: "Brand new" });
    const backup = createBackup({ ...snapshot, tasks: [incoming, extra] });
    const merged = mergeBackup(snapshot, backup);
    expect(merged.snapshot.tasks.find((item) => item.id === "task-keep")?.title).toBe(
      "Implement authentication"
    );
    expect(merged.snapshot.tasks.some((item) => item.title === "Brand new")).toBe(true);
  });

  it("builds a weekly review from real completed and carried work", () => {
    const completed = createTask({
      title: "Shipped",
      status: "completed",
      now: new Date("2026-08-19T09:00:00"),
    });
    completed.completedAt = new Date("2026-08-19T16:00:00");
    const carried = createTask({
      title: "Old",
      status: "planned",
      startTime: new Date("2026-08-10T11:00:00"),
      dueDate: new Date("2026-08-10T11:00:00"),
    });
    const summary = computeWeekSummary(
      new Date("2026-08-21T12:00:00"),
      { startOfWeek: 1 },
      [completed, carried],
      [],
      [],
      [],
      []
    );
    expect(summary.completed.map((t) => t.title)).toContain("Shipped");
    expect(summary.carriedOver.map((t) => t.title)).toContain("Old");
  });
});

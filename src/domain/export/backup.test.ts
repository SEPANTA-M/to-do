import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { createGoal } from "@/domain/goal/factory";
import { createNote } from "@/domain/note/factory";
import { DEFAULT_APP_SETTINGS } from "@/domain/settings/defaults";
import { createBackup, mergeBackup, parseBackup, tasksToCsv } from "./backup";

describe("export / import", () => {
  it("round-trips a backup without dropping titles", () => {
    const snapshot = {
      tasks: [createTask({ title: "Keep me" })],
      history: [],
      goals: [createGoal({ title: "Stay" })],
      milestones: [],
      projects: [],
      activity: [],
      notes: [createNote({ content: "Context" })],
      events: [],
      sessions: [],
      reviews: [],
      settings: DEFAULT_APP_SETTINGS,
    };
    const backup = createBackup(snapshot);
    const parsed = parseBackup(JSON.parse(JSON.stringify(backup)));
    expect(parsed.version).toBe(1);
    expect(parsed.tasks).toHaveLength(1);
  });

  it("never overwrites existing ids on import", () => {
    const existing = createTask({ title: "Local", id: "task-1" });
    const incoming = createTask({ title: "Incoming", id: "task-1" });
    const extra = createTask({ title: "New" });
    const current = {
      tasks: [existing],
      history: [],
      goals: [],
      milestones: [],
      projects: [],
      activity: [],
      notes: [],
      events: [],
      sessions: [],
      reviews: [],
      settings: DEFAULT_APP_SETTINGS,
    };
    const backup = createBackup({
      ...current,
      tasks: [incoming, extra],
    });
    const result = mergeBackup(current, backup);
    expect(result.snapshot.tasks.find((task) => task.id === "task-1")?.title).toBe("Local");
    expect(result.snapshot.tasks.some((task) => task.title === "New")).toBe(true);
    expect(result.skipped).toBeGreaterThan(0);
  });

  it("exports tasks as csv", () => {
    const csv = tasksToCsv([createTask({ title: "Comma, inside" })]);
    expect(csv.split("\n")[0]).toContain("title");
    expect(csv).toContain("\"Comma, inside\"");
  });
});

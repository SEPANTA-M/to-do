import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { createGoal } from "@/domain/goal/factory";
import { createProject } from "@/domain/project/factory";
import { createNote } from "@/domain/note/factory";
import { createCalendarEvent } from "@/domain/calendar/factory";
import { searchAll } from "./search";

describe("unified search", () => {
  it("groups matches by entity", () => {
    const results = searchAll("auth", {
      tasks: [createTask({ title: "Implement authentication" })],
      projects: [createProject({ name: "Authentication" })],
      goals: [createGoal({ title: "Launch startup" })],
      milestones: [],
      notes: [createNote({ content: "JWT notes" })],
      events: [
        createCalendarEvent({
          title: "Auth review",
          startTime: new Date("2026-08-21T10:00:00"),
        }),
      ],
    });
    expect(results.tasks[0]?.title).toMatch(/authentication/i);
    expect(results.projects[0]?.name).toBe("Authentication");
    expect(results.events[0]?.title).toBe("Auth review");
    expect(results.goals).toHaveLength(0);
  });
});

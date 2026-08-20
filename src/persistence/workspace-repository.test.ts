import { describe, expect, it } from "vitest";
import { createGoal } from "@/domain/goal/factory";
import { createMilestone } from "@/domain/milestone/factory";
import { createProject } from "@/domain/project/factory";
import { recordActivity } from "@/domain/activity";
import { WorkspaceRepository } from "./workspace-repository";
import { createMemoryStorage } from "./storage";

describe("workspace persistence", () => {
  it("round-trips goals, milestones, and projects", async () => {
    const repo = new WorkspaceRepository(createMemoryStorage());
    const goal = createGoal({
      title: "Launch",
      targetDate: new Date("2026-12-01T00:00:00"),
    });
    const milestone = createMilestone({ title: "MVP", goalId: goal.id });
    const project = createProject({
      name: "Auth",
      goalId: goal.id,
      milestoneId: milestone.id,
    });
    const activity = recordActivity("goal_created", "goal", goal.id, "Goal created: Launch");
    await repo.save({
      goals: [goal],
      milestones: [milestone],
      projects: [project],
      activity: [activity],
    });
    const loaded = await repo.load();
    expect(loaded.goals[0]?.title).toBe("Launch");
    expect(loaded.goals[0]?.targetDate).toBeInstanceOf(Date);
    expect(loaded.milestones[0]?.goalId).toBe(goal.id);
    expect(loaded.projects[0]?.milestoneId).toBe(milestone.id);
    expect(loaded.activity[0]?.type).toBe("goal_created");
  });
});

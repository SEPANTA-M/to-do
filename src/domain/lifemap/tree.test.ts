import { describe, expect, it } from "vitest";
import { createGoal } from "@/domain/goal/factory";
import { createMilestone } from "@/domain/milestone/factory";
import { createProject } from "@/domain/project/factory";
import { createTask } from "@/domain/task/factory";
import { buildLifeMap } from "./tree";

describe("life map", () => {
  it("builds GOAL → MILESTONE → PROJECT → TASK from real data", () => {
    const goal = createGoal({ title: "Launch Startup" });
    const mvp = createMilestone({ title: "MVP", goalId: goal.id });
    const auth = createProject({
      name: "Authentication",
      goalId: goal.id,
      milestoneId: mvp.id,
    });
    const jwt = createTask({ title: "JWT", projectId: auth.id, status: "planned" });
    const tree = buildLifeMap([goal], [mvp], [auth], [jwt]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.title).toBe("Launch Startup");
    expect(tree[0]?.children[0]?.title).toBe("MVP");
    expect(tree[0]?.children[0]?.children[0]?.title).toBe("Authentication");
    expect(tree[0]?.children[0]?.children[0]?.children[0]?.title).toBe("JWT");
  });

  it("does not invent nodes when the workspace is empty", () => {
    expect(buildLifeMap([], [], [], [])).toEqual([]);
  });
});

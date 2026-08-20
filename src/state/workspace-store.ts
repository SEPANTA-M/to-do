import { create } from "zustand";
import type { ActivityEvent, Goal, Milestone, Project } from "@/domain/types";
import { createGoal, type CreateGoalInput, type UpdateGoalInput } from "@/domain/goal/factory";
import { applyGoalStatus } from "@/domain/goal/status";
import {
  createMilestone,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
} from "@/domain/milestone/factory";
import { applyMilestoneStatus } from "@/domain/milestone/status";
import {
  createProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/domain/project/factory";
import { applyProjectStatus } from "@/domain/project/status";
import { recordActivity } from "@/domain/activity";
import {
  sanitizeProjectLinks,
  unlinkProjectsFromGoal,
  unlinkProjectsFromMilestone,
} from "@/domain/relationships";
import { WorkspaceRepository } from "@/persistence/workspace-repository";

interface WorkspaceStore {
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  activity: ActivityEvent[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, updates: UpdateGoalInput) => Promise<Goal | null>;
  archiveGoal: (id: string, unlinkChildren?: boolean) => Promise<void>;
  createMilestone: (input: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestone: (id: string, updates: UpdateMilestoneInput) => Promise<Milestone | null>;
  archiveMilestone: (id: string, unlinkProjects?: boolean) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, updates: UpdateProjectInput) => Promise<Project | null>;
  archiveProject: (id: string) => Promise<void>;
  record: (event: ActivityEvent) => Promise<void>;
  replaceAll: (next: {
    goals?: Goal[];
    milestones?: Milestone[];
    projects?: Project[];
    activity?: ActivityEvent[];
  }) => Promise<void>;
}

const repository = new WorkspaceRepository();

async function persist(state: {
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  activity: ActivityEvent[];
}): Promise<void> {
  try {
    await repository.save(state);
  } catch {
    // Local writes already applied in memory; keep the UI usable.
  }
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  goals: [],
  milestones: [],
  projects: [],
  activity: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const loaded = await repository.load();
      const goals = loaded.goals;
      const milestones = loaded.milestones.filter((milestone) =>
        goals.some((goal) => goal.id === milestone.goalId)
      );
      const projects = loaded.projects.map((project) =>
        sanitizeProjectLinks(project, goals, milestones)
      );
      set({
        goals,
        milestones,
        projects,
        activity: loaded.activity,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  createGoal: async (input) => {
    const goal = createGoal(input);
    const activity = recordActivity(
      "goal_created",
      "goal",
      goal.id,
      `Goal created: ${goal.title}`
    );
    const { goals, milestones, projects, activity: events } = get();
    const next = {
      goals: [...goals, goal],
      milestones,
      projects,
      activity: [...events, activity],
    };
    set(next);
    await persist(next);
    return goal;
  },

  updateGoal: async (id, updates) => {
    const { goals, milestones, projects, activity } = get();
    const current = goals.find((goal) => goal.id === id);
    if (!current) return null;
    const now = new Date();
    const events = [...activity];
    let nextGoal = { ...current, updatedAt: now };
    if (updates.title !== undefined) {
      const title = updates.title.trim();
      if (!title) throw new Error("Goal title is required");
      nextGoal.title = title;
    }
    if (updates.description !== undefined) {
      nextGoal.description = updates.description?.trim() || undefined;
    }
    if (updates.priority !== undefined) nextGoal.priority = updates.priority;
    if (updates.targetDate !== undefined) {
      const changed =
        current.targetDate?.getTime() !== updates.targetDate?.getTime();
      nextGoal.targetDate = updates.targetDate ?? undefined;
      if (changed) {
        events.push(
          recordActivity("deadline_changed", "goal", id, `Deadline changed: ${nextGoal.title}`, now)
        );
      }
    }
    if (updates.icon !== undefined) nextGoal.icon = updates.icon ?? undefined;
    if (updates.accent !== undefined) nextGoal.accent = updates.accent ?? undefined;
    if (updates.status !== undefined && updates.status !== current.status) {
      nextGoal = applyGoalStatus(nextGoal, updates.status, now);
      if (updates.status === "completed") {
        events.push(
          recordActivity("goal_completed", "goal", id, `Goal completed: ${nextGoal.title}`, now)
        );
      } else {
        events.push(
          recordActivity("goal_updated", "goal", id, `Goal updated: ${nextGoal.title}`, now)
        );
      }
    }
    const next = {
      goals: goals.map((goal) => (goal.id === id ? nextGoal : goal)),
      milestones,
      projects,
      activity: events,
    };
    set(next);
    await persist(next);
    return nextGoal;
  },

  archiveGoal: async (id, unlinkChildren = false) => {
    const { goals, milestones, projects, activity } = get();
    const now = new Date();
    const current = goals.find((goal) => goal.id === id);
    if (!current) return;
    const archived =
      current.status === "archived"
        ? current
        : applyGoalStatus(current, "archived", now);
    let nextProjects = projects;
    if (unlinkChildren) {
      nextProjects = unlinkProjectsFromGoal(projects, id, now);
    }
    const next = {
      goals: goals.map((goal) => (goal.id === id ? archived : goal)),
      milestones,
      projects: nextProjects,
      activity,
    };
    set(next);
    await persist(next);
  },

  createMilestone: async (input) => {
    const { goals, milestones, projects, activity } = get();
    if (!goals.some((goal) => goal.id === input.goalId)) {
      throw new Error("Milestone requires an existing goal");
    }
    const order = input.order ?? milestones.filter((m) => m.goalId === input.goalId).length;
    const milestone = createMilestone({ ...input, order });
    const event = recordActivity(
      "milestone_created",
      "milestone",
      milestone.id,
      `Milestone created: ${milestone.title}`
    );
    const next = {
      goals,
      milestones: [...milestones, milestone],
      projects,
      activity: [...activity, event],
    };
    set(next);
    await persist(next);
    return milestone;
  },

  updateMilestone: async (id, updates) => {
    const { goals, milestones, projects, activity } = get();
    const current = milestones.find((item) => item.id === id);
    if (!current) return null;
    const now = new Date();
    const events = [...activity];
    let nextMs = { ...current, updatedAt: now };
    if (updates.title !== undefined) {
      const title = updates.title.trim();
      if (!title) throw new Error("Milestone title is required");
      nextMs.title = title;
    }
    if (updates.description !== undefined) {
      nextMs.description = updates.description?.trim() || undefined;
    }
    if (updates.targetDate !== undefined) nextMs.targetDate = updates.targetDate ?? undefined;
    if (updates.order !== undefined) nextMs.order = updates.order;
    if (updates.status !== undefined && updates.status !== current.status) {
      nextMs = applyMilestoneStatus(nextMs, updates.status, now);
      if (updates.status === "completed") {
        events.push(
          recordActivity(
            "milestone_completed",
            "milestone",
            id,
            `Milestone completed: ${nextMs.title}`,
            now
          )
        );
      }
    }
    const next = {
      goals,
      milestones: milestones.map((item) => (item.id === id ? nextMs : item)),
      projects,
      activity: events,
    };
    set(next);
    await persist(next);
    return nextMs;
  },

  archiveMilestone: async (id, unlinkProjects = false) => {
    const { goals, milestones, projects, activity } = get();
    const current = milestones.find((item) => item.id === id);
    if (!current) return;
    const now = new Date();
    const archived = applyMilestoneStatus(current, "archived", now);
    let nextProjects = projects;
    if (unlinkProjects) {
      nextProjects = unlinkProjectsFromMilestone(projects, id, now);
    }
    const next = {
      goals,
      milestones: milestones.map((item) => (item.id === id ? archived : item)),
      projects: nextProjects,
      activity,
    };
    set(next);
    await persist(next);
  },

  createProject: async (input) => {
    const { goals, milestones, projects, activity } = get();
    let goalId = input.goalId;
    let milestoneId = input.milestoneId;
    if (milestoneId) {
      const milestone = milestones.find((item) => item.id === milestoneId);
      if (!milestone) throw new Error("Milestone not found");
      goalId = milestone.goalId;
    }
    if (goalId && !goals.some((goal) => goal.id === goalId)) {
      throw new Error("Goal not found");
    }
    const project = createProject({ ...input, goalId, milestoneId });
    const event = recordActivity(
      "project_created",
      "project",
      project.id,
      `Project created: ${project.name}`
    );
    const next = {
      goals,
      milestones,
      projects: [...projects, project],
      activity: [...activity, event],
    };
    set(next);
    await persist(next);
    return project;
  },

  updateProject: async (id, updates) => {
    const { goals, milestones, projects, activity } = get();
    const current = projects.find((item) => item.id === id);
    if (!current) return null;
    const now = new Date();
    const events = [...activity];
    let nextProject = { ...current, updatedAt: now };
    if (updates.name !== undefined) {
      const name = updates.name.trim();
      if (!name) throw new Error("Project name is required");
      nextProject.name = name;
    }
    if (updates.description !== undefined) {
      nextProject.description = updates.description?.trim() || undefined;
    }
    if (updates.priority !== undefined) nextProject.priority = updates.priority;
    if (updates.startDate !== undefined) nextProject.startDate = updates.startDate ?? undefined;
    if (updates.targetDate !== undefined) {
      const changed =
        current.targetDate?.getTime() !== updates.targetDate?.getTime();
      nextProject.targetDate = updates.targetDate ?? undefined;
      if (changed) {
        events.push(
          recordActivity(
            "deadline_changed",
            "project",
            id,
            `Deadline changed: ${nextProject.name}`,
            now
          )
        );
      }
    }
    if (updates.icon !== undefined) nextProject.icon = updates.icon ?? undefined;
    if (updates.accent !== undefined) nextProject.accent = updates.accent ?? undefined;
    if (updates.tags !== undefined) nextProject.tags = updates.tags;
    if (updates.milestoneId !== undefined) {
      nextProject.milestoneId = updates.milestoneId ?? undefined;
      if (nextProject.milestoneId) {
        const milestone = milestones.find((item) => item.id === nextProject.milestoneId);
        if (!milestone) throw new Error("Milestone not found");
        nextProject.goalId = milestone.goalId;
      }
    }
    if (updates.goalId !== undefined && updates.milestoneId === undefined) {
      nextProject.goalId = updates.goalId ?? undefined;
      if (nextProject.milestoneId) {
        const milestone = milestones.find((item) => item.id === nextProject.milestoneId);
        if (milestone && milestone.goalId !== nextProject.goalId) {
          nextProject.milestoneId = undefined;
        }
      }
    }
    if (updates.status !== undefined && updates.status !== current.status) {
      nextProject = applyProjectStatus(nextProject, updates.status, now);
      events.push(
        recordActivity(
          updates.status === "completed" ? "project_completed" : "project_updated",
          "project",
          id,
          updates.status === "completed"
            ? `Project completed: ${nextProject.name}`
            : `Project updated: ${nextProject.name}`,
          now
        )
      );
    }
    nextProject = sanitizeProjectLinks(nextProject, goals, milestones);
    const next = {
      goals,
      milestones,
      projects: projects.map((item) => (item.id === id ? nextProject : item)),
      activity: events,
    };
    set(next);
    await persist(next);
    return nextProject;
  },

  archiveProject: async (id) => {
    const { goals, milestones, projects, activity } = get();
    const current = projects.find((item) => item.id === id);
    if (!current) return;
    const now = new Date();
    const archived = applyProjectStatus(current, "archived", now);
    const next = {
      goals,
      milestones,
      projects: projects.map((item) => (item.id === id ? archived : item)),
      activity,
    };
    set(next);
    await persist(next);
  },

  record: async (event) => {
    const { goals, milestones, projects, activity } = get();
    const next = { goals, milestones, projects, activity: [...activity, event] };
    set(next);
    await persist(next);
  },

  replaceAll: async (incoming) => {
    const current = get();
    const next = {
      goals: incoming.goals ?? current.goals,
      milestones: incoming.milestones ?? current.milestones,
      projects: incoming.projects ?? current.projects,
      activity: incoming.activity ?? current.activity,
    };
    set(next);
    await persist(next);
  },
}));

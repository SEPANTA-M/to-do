import type { ActivityEvent, Goal, Milestone, Project } from "@/domain/types";
import {
  deserializeActivity,
  deserializeGoal,
  deserializeMilestone,
  deserializeProject,
  serializeActivity,
  serializeGoal,
  serializeMilestone,
  serializeProject,
} from "@/domain/workspace/serialize";
import { getDefaultStorage, type KeyValueStorage } from "./storage";

const GOALS_KEY = "nexus.goals";
const MILESTONES_KEY = "nexus.milestones";
const PROJECTS_KEY = "nexus.projects";
const ACTIVITY_KEY = "nexus.activity";

export interface WorkspaceState {
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  activity: ActivityEvent[];
}

export class WorkspaceRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<WorkspaceState> {
    const [goalsRaw, milestonesRaw, projectsRaw, activityRaw] = await Promise.all([
      this.storage.getItem(GOALS_KEY),
      this.storage.getItem(MILESTONES_KEY),
      this.storage.getItem(PROJECTS_KEY),
      this.storage.getItem(ACTIVITY_KEY),
    ]);
    return {
      goals: parseArray(goalsRaw, deserializeGoal),
      milestones: parseArray(milestonesRaw, deserializeMilestone),
      projects: parseArray(projectsRaw, deserializeProject),
      activity: parseArray(activityRaw, deserializeActivity),
    };
  }

  async save(state: WorkspaceState): Promise<void> {
    await Promise.all([
      this.storage.setItem(GOALS_KEY, JSON.stringify(state.goals.map(serializeGoal))),
      this.storage.setItem(
        MILESTONES_KEY,
        JSON.stringify(state.milestones.map(serializeMilestone))
      ),
      this.storage.setItem(
        PROJECTS_KEY,
        JSON.stringify(state.projects.map(serializeProject))
      ),
      this.storage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(state.activity.map(serializeActivity))
      ),
    ]);
  }
}

function parseArray<T, R>(raw: string | null, map: (item: T) => R): R[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => map(item as T));
  } catch {
    return [];
  }
}

/**
 * Task store — reactive cache over the local-first repository.
 * Every mutation writes through persistence and records a sync ledger entry.
 */

import { create } from "zustand";
import type { PendingMutation, Task, TaskHistory } from "@/domain/types";
import {
  applyArchive,
  applyComplete,
  applyCreate,
  applyDelete,
  applyDuplicate,
  applyPause,
  applyReorder,
  applyReschedule,
  applyResize,
  applyStart,
  applyUpdate,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/domain/task/service";
import { unlinkTasksFromGoal, unlinkTasksFromProject } from "@/domain/relationships";
import { TaskRepository } from "@/persistence/task-repository";

interface TaskState {
  tasks: Task[];
  history: TaskHistory[];
  mutations: PendingMutation[];
  hydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskInput) => Promise<Task | null>;
  completeTask: (taskId: string) => Promise<Task | null>;
  startTask: (taskId: string) => Promise<Task | null>;
  pauseTask: (taskId: string) => Promise<Task | null>;
  archiveTask: (taskId: string) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  duplicateTask: (taskId: string) => Promise<Task | null>;
  rescheduleTask: (taskId: string, newStart: Date) => Promise<Task | null>;
  resizeTask: (taskId: string, durationMinutes: number) => Promise<Task | null>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  unlinkProject: (projectId: string) => Promise<void>;
  unlinkGoal: (goalId: string) => Promise<void>;
  retryPersist: () => Promise<void>;
  replaceAll: (tasks: Task[], history?: TaskHistory[]) => Promise<void>;
}

const repository = new TaskRepository();

async function persist(state: {
  tasks: Task[];
  history: TaskHistory[];
  mutations: PendingMutation[];
}): Promise<void> {
  try {
    await repository.save(state);
  } catch (error) {
    useTaskStore.setState({
      error: error instanceof Error ? error.message : "Unable to save changes",
    });
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  history: [],
  mutations: [],
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const loaded = await repository.load();
      set({
        tasks: loaded.tasks,
        history: loaded.history,
        mutations: loaded.mutations,
        hydrated: true,
        error: null,
      });
    } catch (error) {
      set({
        hydrated: true,
        error: error instanceof Error ? error.message : "Failed to load tasks",
      });
    }
  },

  createTask: async (input) => {
    const { tasks, history, mutations } = get();
    const result = applyCreate(tasks, history, input);
    if (!result.task) throw new Error("Failed to create task");
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  updateTask: async (taskId, updates) => {
    const { tasks, history, mutations } = get();
    const result = applyUpdate(tasks, history, taskId, updates);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  completeTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyComplete(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  startTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyStart(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  pauseTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyPause(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  archiveTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyArchive(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  deleteTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyDelete(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task !== null;
  },

  duplicateTask: async (taskId) => {
    const { tasks, history, mutations } = get();
    const result = applyDuplicate(tasks, history, taskId);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  rescheduleTask: async (taskId, newStart) => {
    const { tasks, history, mutations } = get();
    const result = applyReschedule(tasks, history, taskId, newStart);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  resizeTask: async (taskId, durationMinutes) => {
    const { tasks, history, mutations } = get();
    const result = applyResize(tasks, history, taskId, durationMinutes);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
    return result.task;
  },

  reorderTasks: async (orderedIds) => {
    const { tasks, history, mutations } = get();
    const result = applyReorder(tasks, history, orderedIds);
    const next = {
      tasks: result.tasks,
      history: result.history,
      mutations: [...mutations, result.mutation],
    };
    set(next);
    await persist(next);
  },

  unlinkProject: async (projectId) => {
    const { tasks, history, mutations } = get();
    const nextTasks = unlinkTasksFromProject(tasks, projectId, new Date());
    const next = { tasks: nextTasks, history, mutations };
    set(next);
    await persist(next);
  },

  unlinkGoal: async (goalId) => {
    const { tasks, history, mutations } = get();
    const nextTasks = unlinkTasksFromGoal(tasks, goalId, new Date());
    const next = { tasks: nextTasks, history, mutations };
    set(next);
    await persist(next);
  },

  retryPersist: async () => {
    const { tasks, history, mutations } = get();
    set({ error: null });
    await persist({ tasks, history, mutations });
  },

  replaceAll: async (tasks, history) => {
    const current = get();
    const next = {
      tasks,
      history: history ?? current.history,
      mutations: current.mutations,
    };
    set({ ...next, error: null });
    await persist(next);
  },
}));

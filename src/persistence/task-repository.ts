import type { PendingMutation, Task, TaskHistory } from "@/domain/types";
import {
  deserializeHistory,
  deserializeMutation,
  deserializeTask,
  serializeHistory,
  serializeMutation,
  serializeTask,
} from "@/domain/task/serialize";
import { getDefaultStorage, type KeyValueStorage } from "./storage";

const TASKS_KEY = "nexus.tasks";
const HISTORY_KEY = "nexus.task-history";
const MUTATIONS_KEY = "nexus.mutations";

export interface PersistedState {
  tasks: Task[];
  history: TaskHistory[];
  mutations: PendingMutation[];
}

export class TaskRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<PersistedState> {
    const [tasksRaw, historyRaw, mutationsRaw] = await Promise.all([
      this.storage.getItem(TASKS_KEY),
      this.storage.getItem(HISTORY_KEY),
      this.storage.getItem(MUTATIONS_KEY),
    ]);

    return {
      tasks: parseArray(tasksRaw, deserializeTask),
      history: parseArray(historyRaw, deserializeHistory),
      mutations: parseArray(mutationsRaw, deserializeMutation),
    };
  }

  async save(state: PersistedState): Promise<void> {
    await Promise.all([
      this.storage.setItem(TASKS_KEY, JSON.stringify(state.tasks.map(serializeTask))),
      this.storage.setItem(
        HISTORY_KEY,
        JSON.stringify(state.history.map(serializeHistory))
      ),
      this.storage.setItem(
        MUTATIONS_KEY,
        JSON.stringify(state.mutations.map(serializeMutation))
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

/**
 * Task State Management
 * Zustand store for task operations and caching
 */

import { create } from "zustand";
import type { Task, TaskStatus, TaskPriority } from "@/domain/types";

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  selectTask: (taskId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getTodayTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
    })),
  
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    })),
  
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  getTodayTasks: () => {
    const { tasks } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return tasks.filter((task) => {
      if (task.status === "completed" || task.status === "archived") return false;
      
      // Include if scheduled for today
      if (task.scheduledDate) {
        const scheduled = new Date(task.scheduledDate);
        return scheduled >= today && scheduled <= todayEnd;
      }
      
      // Include if has start time today
      if (task.startTime) {
        const start = new Date(task.startTime);
        return start >= today && start <= todayEnd;
      }
      
      // Include if due today
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        return due >= today && due <= todayEnd;
      }
      
      return false;
    });
  },
  
  getTaskById: (taskId) => {
    const { tasks } = get();
    return tasks.find((task) => task.id === taskId);
  },
  
  getTasksByStatus: (status) => {
    const { tasks } = get();
    return tasks.filter((task) => task.status === status);
  },
  
  getTasksByPriority: (priority) => {
    const { tasks } = get();
    return tasks.filter((task) => task.priority === priority);
  },
}));

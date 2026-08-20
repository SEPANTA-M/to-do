"use server";

import { TaskService, type CreateTaskInput, type UpdateTaskInput } from "@/domain/services/task-service";
import type { Task } from "@/domain/types";

export async function createTaskAction(input: CreateTaskInput): Promise<Task> {
  return await TaskService.createTask(input);
}

export async function updateTaskAction(
  taskId: string,
  userId: string,
  updates: UpdateTaskInput
): Promise<Task | null> {
  return await TaskService.updateTask(taskId, userId, updates);
}

export async function completeTaskAction(taskId: string, userId: string): Promise<Task | null> {
  return await TaskService.completeTask(taskId, userId);
}

export async function reopenTaskAction(taskId: string, userId: string): Promise<Task | null> {
  return await TaskService.reopenTask(taskId, userId);
}

export async function deleteTaskAction(taskId: string, userId: string): Promise<boolean> {
  return await TaskService.deleteTask(taskId, userId);
}

export async function getTaskByIdAction(taskId: string, userId: string): Promise<Task | null> {
  return await TaskService.getTaskById(taskId, userId);
}

export async function getAllTasksAction(userId: string): Promise<Task[]> {
  return await TaskService.getAllTasks(userId);
}

export async function getTodayTasksAction(userId: string): Promise<Task[]> {
  return await TaskService.getTodayTasks(userId);
}

export async function getOverdueTasksAction(userId: string): Promise<Task[]> {
  return await TaskService.getOverdueTasks(userId);
}

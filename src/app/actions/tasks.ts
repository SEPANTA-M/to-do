"use server";

/**
 * Server actions are reserved for future PostgreSQL synchronization.
 * Phase 1 is local-first and offline-capable; the UI writes through
 * the client repository, not these actions.
 *
 * They remain exported so a later sync worker can call the same domain
 * operations against the existing Drizzle schema without inventing a
 * second API.
 */

import type { CreateTaskInput, UpdateTaskInput } from "@/domain/task/service";
import { applyCreate, applyUpdate } from "@/domain/task/service";
import type { Task } from "@/domain/types";

export async function createTaskAction(input: CreateTaskInput): Promise<Task> {
  const result = applyCreate([], [], input);
  if (!result.task) {
    throw new Error("Unable to create task");
  }
  return result.task;
}

export async function updateTaskAction(
  taskId: string,
  _userId: string,
  updates: UpdateTaskInput,
  existing: Task[]
): Promise<Task | null> {
  return applyUpdate(existing, [], taskId, updates).task;
}

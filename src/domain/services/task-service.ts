/**
 * Task Service
 * Business logic for task operations
 */

import type { Task, TaskStatus, TaskPriority } from "../types";
import { db } from "@/db";
import { tasks, taskHistory } from "@/db/schema";
import { eq, and, gte, lte, isNull, or, desc } from "drizzle-orm";
import { startOfDay, endOfDay, isBefore, isAfter, startOfToday } from "date-fns";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
  projectId?: string;
  goalId?: string;
  parentTaskId?: string;
  tags?: string[];
  isFlexible?: boolean;
  userId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  projectId?: string;
  goalId?: string;
  tags?: string[];
  isFlexible?: boolean;
  order?: number;
}

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(input: CreateTaskInput): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        status: input.status || "inbox",
        priority: input.priority || "medium",
        dueDate: input.dueDate,
        scheduledDate: input.scheduledDate,
        startTime: input.startTime,
        endTime: input.endTime,
        estimatedDuration: input.estimatedDuration,
        projectId: input.projectId,
        goalId: input.goalId,
        parentTaskId: input.parentTaskId,
        tags: input.tags || [],
        isFlexible: input.isFlexible ?? true,
        userId: input.userId,
      })
      .returning();

    // Record history
    await this.recordHistory(task.id, "created", {}, input.userId);

    return this.mapDbTaskToDomain(task);
  }

  /**
   * Update a task
   */
  static async updateTask(
    taskId: string,
    userId: string,
    updates: UpdateTaskInput
  ): Promise<Task | null> {
    const [task] = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!task) return null;

    // Record history
    await this.recordHistory(taskId, "updated", updates as Record<string, unknown>, userId);

    return this.mapDbTaskToDomain(task);
  }

  /**
   * Complete a task
   */
  static async completeTask(taskId: string, userId: string): Promise<Task | null> {
    const now = new Date();
    
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!task) return null;

    await this.recordHistory(taskId, "completed", {}, userId);

    return this.mapDbTaskToDomain(task);
  }

  /**
   * Reopen a completed task
   */
  static async reopenTask(taskId: string, userId: string): Promise<Task | null> {
    const [task] = await db
      .update(tasks)
      .set({
        status: "ready",
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!task) return null;

    await this.recordHistory(taskId, "reopened", {}, userId);

    return this.mapDbTaskToDomain(task);
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (result.length > 0) {
      await this.recordHistory(taskId, "deleted", {}, userId);
      return true;
    }

    return false;
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    return task ? this.mapDbTaskToDomain(task) : null;
  }

  /**
   * Get all tasks for a user
   */
  static async getAllTasks(userId: string): Promise<Task[]> {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    return allTasks.map(this.mapDbTaskToDomain);
  }

  /**
   * Get tasks for today
   */
  static async getTodayTasks(userId: string): Promise<Task[]> {
    const today = startOfToday();
    const todayEnd = endOfDay(today);

    const todayTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          or(
            // Tasks scheduled for today
            and(
              gte(tasks.scheduledDate, today),
              lte(tasks.scheduledDate, todayEnd)
            ),
            // Tasks with start time today
            and(
              gte(tasks.startTime, today),
              lte(tasks.startTime, todayEnd)
            ),
            // Tasks due today
            and(
              gte(tasks.dueDate, today),
              lte(tasks.dueDate, todayEnd)
            )
          )
        )
      )
      .orderBy(tasks.startTime, tasks.order);

    return todayTasks.map(this.mapDbTaskToDomain);
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date();

    const overdueTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          lte(tasks.dueDate, now),
          isNull(tasks.completedAt)
        )
      )
      .orderBy(tasks.dueDate);

    return overdueTasks.map(this.mapDbTaskToDomain);
  }

  /**
   * Detect scheduling conflicts
   */
  static detectConflicts(task: Task, allTasks: Task[]): Task[] {
    if (!task.startTime || !task.endTime) return [];

    return allTasks.filter((other) => {
      if (other.id === task.id) return false;
      if (!other.startTime || !other.endTime) return false;
      if (other.status === "completed" || other.status === "archived") return false;

      // Check if times overlap
      const taskStart = task.startTime!;
      const taskEnd = task.endTime!;
      const otherStart = other.startTime!;
      const otherEnd = other.endTime!;

      return (
        (taskStart >= otherStart && taskStart < otherEnd) ||
        (taskEnd > otherStart && taskEnd <= otherEnd) ||
        (taskStart <= otherStart && taskEnd >= otherEnd)
      );
    });
  }

  /**
   * Get current task (most relevant right now)
   */
  static getCurrentTask(tasks: Task[]): Task | null {
    const now = new Date();

    // First: task currently in progress
    const inProgress = tasks.find((t) => t.status === "in_progress");
    if (inProgress) return inProgress;

    // Second: task scheduled to start now
    const scheduledNow = tasks.find(
      (t) =>
        t.startTime &&
        t.endTime &&
        isBefore(t.startTime, now) &&
        isAfter(t.endTime, now) &&
        t.status !== "completed"
    );
    if (scheduledNow) return scheduledNow;

    // Third: next ready task by priority
    const readyTasks = tasks.filter(
      (t) => t.status === "ready"
    );
    const sortedReady = readyTasks.sort((a, b) => {
      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // Then by start time if available
      if (a.startTime && b.startTime) {
        return a.startTime.getTime() - b.startTime.getTime();
      }
      
      return 0;
    });

    return sortedReady[0] || null;
  }

  /**
   * Record task history
   */
  private static async recordHistory(
    taskId: string,
    action: "created" | "updated" | "completed" | "reopened" | "deleted",
    changes: Record<string, unknown>,
    userId: string
  ): Promise<void> {
    await db.insert(taskHistory).values({
      taskId,
      action,
      changes,
      userId,
    });
  }

  /**
   * Map database task to domain model
   */
  private static mapDbTaskToDomain(dbTask: typeof tasks.$inferSelect): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || undefined,
      status: dbTask.status as TaskStatus,
      priority: dbTask.priority as TaskPriority,
      dueDate: dbTask.dueDate || undefined,
      scheduledDate: dbTask.scheduledDate || undefined,
      startTime: dbTask.startTime || undefined,
      endTime: dbTask.endTime || undefined,
      estimatedDuration: dbTask.estimatedDuration || undefined,
      actualDuration: dbTask.actualDuration || undefined,
      projectId: dbTask.projectId || undefined,
      goalId: dbTask.goalId || undefined,
      parentTaskId: dbTask.parentTaskId || undefined,
      tags: (dbTask.tags as string[]) || [],
      order: dbTask.order,
      isFlexible: dbTask.isFlexible,
      recurrence: dbTask.recurrence as any,
      completedAt: dbTask.completedAt || undefined,
      userId: dbTask.userId,
      createdAt: dbTask.createdAt,
      updatedAt: dbTask.updatedAt,
    };
  }
}

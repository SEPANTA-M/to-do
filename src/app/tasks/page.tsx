"use client";

import * as React from "react";
import { Plus, ListTodo } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { TaskForm, type TaskFormData } from "@/components/features/task-form";
import { TaskItem } from "@/components/features/task-item";
import { EmptyState } from "@/components/core/empty-state";
import { useTaskStore } from "@/state/task-store";
import type { Task } from "@/domain/types";
import { addMinutes } from "date-fns";

export default function TasksPage() {
  const { tasks, addTask, updateTask } = useTaskStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);

  const handleCreateTask = async (data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: data.status || "inbox",
      priority: data.priority || "medium",
      dueDate: data.dueDate,
      scheduledDate: data.scheduledDate,
      startTime: data.startTime,
      endTime: data.startTime && data.estimatedDuration
        ? addMinutes(data.startTime, data.estimatedDuration)
        : undefined,
      estimatedDuration: data.estimatedDuration,
      tags: [],
      order: 0,
      userId: "demo-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(newTask);
    setIsTaskFormOpen(false);
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "completed") {
      updateTask(taskId, { status: "ready", completedAt: undefined });
    } else {
      updateTask(taskId, { status: "completed", completedAt: new Date() });
    }
  };

  // Group tasks by status
  const inboxTasks = tasks.filter((t) => t.status === "inbox");
  const activeTasks = tasks.filter(
    (t) => t.status === "ready" || t.status === "planned" || t.status === "in_progress"
  );
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            All Tasks
          </h1>
          <p className="text-sm text-text-secondary">
            {tasks.length} total · {activeTasks.length} active · {completedTasks.length} completed
          </p>
        </div>
        <Button onClick={() => setIsTaskFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </header>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-16 w-16" />}
          title="No tasks yet"
          description="Create your first task to start organizing your work."
          action={
            <Button onClick={() => setIsTaskFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create first task
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Inbox */}
          {inboxTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Inbox ({inboxTasks.length})
              </h2>
              <div className="space-y-2">
                {inboxTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() => {}}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Active */}
          {activeTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Active ({activeTasks.length})
              </h2>
              <div className="space-y-2">
                {activeTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() => {}}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() => {}}
                    onComplete={() => handleTaskComplete(task.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}


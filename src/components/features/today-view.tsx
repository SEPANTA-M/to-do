"use client";

import * as React from "react";
import { Plus, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { TaskForm, type TaskFormData } from "./task-form";
import { DayFlow } from "./day-flow";
import { TaskItem } from "./task-item";
import { EmptyState } from "@/components/core/empty-state";
import { useTaskStore } from "@/state/task-store";
import type { Task } from "@/domain/types";
import { format, addMinutes } from "date-fns";

export function TodayView() {
  const { tasks, setTasks, updateTask, addTask } = useTaskStore();
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskFormDefaults, setTaskFormDefaults] = React.useState<{ date?: Date; time?: string }>({});

  // Load tasks on mount (in real app this would be server-side)
  React.useEffect(() => {
    const loadTasks = async () => {
      // For now, using demo data. In production, this would call:
      // const todayTasks = await TaskService.getTodayTasks(userId);
      // setTasks(todayTasks);
      
      // Demo task
      const demoTasks: Task[] = [];
      setTasks(demoTasks);
    };
    
    loadTasks();
  }, [setTasks]);

  const today = new Date();
  const todayTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === "completed" || task.status === "archived") return false;
      const taskDate = task.startTime || task.scheduledDate || task.dueDate;
      if (!taskDate) return false;
      const date = new Date(taskDate);
      return date.toDateString() === today.toDateString();
    });
  }, [tasks]);

  const completedToday = todayTasks.filter((t) => t.status === "completed").length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Get current task (most relevant right now)
  const currentTask = React.useMemo(() => {
    const now = new Date();
    
    // First: task currently in progress
    const inProgress = todayTasks.find((t) => t.status === "in_progress");
    if (inProgress) return inProgress;
    
    // Second: next ready task by priority
    const readyTasks = todayTasks.filter((t) => t.status === "ready");
    const sortedReady = readyTasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      
      return 0;
    });
    
    return sortedReady[0] || null;
  }, [todayTasks]);

  const handleCreateTask = async (data: TaskFormData) => {
    // In production, this would call TaskService.createTask
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
      userId: "demo-user", // In production, get from auth
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(newTask);
    setIsTaskFormOpen(false);
    setTaskFormDefaults({});
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

  const handleEmptySlotClick = (time: Date) => {
    setTaskFormDefaults({
      date: time,
      time: format(time, "HH:mm"),
    });
    setIsTaskFormOpen(true);
  };

  const greetingText = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-primary px-4 py-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1">
            {greetingText}
          </h1>
          <p className="text-sm text-text-secondary">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 h-full">
          {/* Stats */}
          {totalToday > 0 && (
            <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-bg-elevated border border-border-primary rounded-lg p-4">
                <div className="text-2xl font-bold text-text-primary">{completionPercentage}%</div>
                <div className="text-xs text-text-secondary">Completed</div>
              </div>
              <div className="bg-bg-elevated border border-border-primary rounded-lg p-4">
                <div className="text-2xl font-bold text-text-primary">{completedToday}</div>
                <div className="text-xs text-text-secondary">Done</div>
              </div>
              <div className="bg-bg-elevated border border-border-primary rounded-lg p-4">
                <div className="text-2xl font-bold text-text-primary">{totalToday - completedToday}</div>
                <div className="text-xs text-text-secondary">Remaining</div>
              </div>
              <div className="bg-bg-elevated border border-border-primary rounded-lg p-4">
                <div className="text-2xl font-bold text-text-primary">{totalToday}</div>
                <div className="text-xs text-text-secondary">Total</div>
              </div>
            </div>
          )}

          {/* Current task */}
          {currentTask && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Currently
              </h2>
              <div className="bg-bg-elevated border-2 border-interactive-primary rounded-lg p-4">
                <TaskItem
                  task={currentTask}
                  onClick={() => setSelectedTask(currentTask)}
                  onComplete={() => handleTaskComplete(currentTask.id)}
                />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="primary">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <Button size="sm" variant="secondary">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Day Flow */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Day Flow
              </h2>
              <Button
                size="sm"
                onClick={() => setIsTaskFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>

            {totalToday === 0 ? (
              <EmptyState
                icon={<Clock className="h-16 w-16" />}
                title="Your day is clear"
                description="Plan your day by creating tasks and scheduling them in the timeline."
                action={
                  <Button onClick={() => setIsTaskFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create first task
                  </Button>
                }
              />
            ) : (
              <DayFlow
                date={today}
                tasks={tasks}
                onTaskClick={(task) => setSelectedTask(task)}
                onTaskComplete={handleTaskComplete}
                onEmptySlotClick={handleEmptySlotClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Form */}
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleCreateTask}
        defaultDate={taskFormDefaults.date}
        defaultTime={taskFormDefaults.time}
      />
    </div>
  );
}

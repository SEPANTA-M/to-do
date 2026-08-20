"use client";

import * as React from "react";
import { Clock, CheckCircle2, Circle, AlertCircle, Pause, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/domain/types";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
  onComplete?: () => void;
  className?: string;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "text-text-tertiary",
  medium: "text-text-secondary",
  high: "text-accent-orange",
  critical: "text-status-error",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  inbox: <Circle className="h-5 w-5" />,
  planned: <Circle className="h-5 w-5" />,
  ready: <Circle className="h-5 w-5 text-interactive-primary" />,
  in_progress: <Clock className="h-5 w-5 text-interactive-primary animate-pulse" />,
  paused: <Pause className="h-5 w-5 text-text-tertiary" />,
  blocked: <Ban className="h-5 w-5 text-status-error" />,
  completed: <CheckCircle2 className="h-5 w-5 text-status-success" />,
  archived: <Circle className="h-5 w-5 text-text-disabled" />,
};

export function TaskItem({ task, onClick, onComplete, className }: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && !isCompleted && new Date(task.dueDate) < new Date();

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 rounded-md border border-border-primary bg-bg-elevated p-3",
        "transition-all hover:border-border-hover hover:shadow-sm cursor-pointer",
        isCompleted && "opacity-60",
        className
      )}
    >
      {/* Status icon / Complete button */}
      <button
        onClick={handleComplete}
        className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
        aria-label={isCompleted ? "Reopen task" : "Complete task"}
      >
        {statusIcons[task.status]}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title and priority */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-sm font-medium text-text-primary line-clamp-2",
              isCompleted && "line-through"
            )}
          >
            {task.title}
          </h3>
          {task.priority !== "medium" && (
            <span className={cn("flex-shrink-0 text-xs font-medium", priorityColors[task.priority])}>
              {task.priority === "critical" && "!"}
              {task.priority === "high" && "High"}
              {task.priority === "low" && "Low"}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          {/* Time */}
          {task.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(task.startTime), "h:mm a")}
            </span>
          )}

          {/* Duration */}
          {task.estimatedDuration && (
            <span>
              {task.estimatedDuration}min
            </span>
          )}

          {/* Due date */}
          {task.dueDate && !task.startTime && (
            <span className={cn("flex items-center gap-1", isOverdue && "text-status-error")}>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              Due {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <span className="text-text-tertiary">
              {task.tags.slice(0, 2).join(", ")}
              {task.tags.length > 2 && ` +${task.tags.length - 2}`}
            </span>
          )}
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-text-tertiary line-clamp-1">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}

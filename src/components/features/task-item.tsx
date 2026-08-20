"use client";

import * as React from "react";
import { AlertCircle, Ban, Check, Circle, Clock, Pause, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/domain/types";
import { format } from "date-fns";
import { isOverdue } from "@/domain/task/overdue";

interface TaskItemProps {
  task: Task;
  selected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onComplete?: () => void;
  className?: string;
}

const priorityClass: Record<TaskPriority, string> = {
  low: "text-text-tertiary",
  medium: "text-text-secondary",
  high: "text-accent-orange",
  critical: "text-status-error",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  inbox: <Circle className="h-3.5 w-3.5" />,
  planned: <Circle className="h-3.5 w-3.5" />,
  ready: <Circle className="h-3.5 w-3.5 text-interactive-primary" />,
  in_progress: <Clock className="h-3.5 w-3.5 text-interactive-primary" />,
  paused: <Pause className="h-3.5 w-3.5 text-text-tertiary" />,
  blocked: <Ban className="h-3.5 w-3.5 text-status-error" />,
  completed: <Check className="h-3.5 w-3.5 text-status-success" />,
  archived: <Circle className="h-3.5 w-3.5 text-text-disabled" />,
};

export function TaskItem({
  task,
  selected = false,
  onClick,
  onComplete,
  className,
}: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const overdue = isOverdue(task, new Date());

  const handleComplete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onComplete?.();
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        "group flex items-center gap-3 py-2.5 min-h-11 cursor-pointer",
        "border-b border-border-primary/70 last:border-0",
        "transition-colors duration-fast",
        selected && "bg-bg-tertiary/50 -mx-2 px-2",
        isCompleted && "task-complete",
        className
      )}
    >
      <button
        type="button"
        onClick={handleComplete}
        className="flex-shrink-0 h-9 w-9 -ml-2 flex items-center justify-center text-text-tertiary hover:text-text-primary"
        aria-label={isCompleted ? "Reopen task" : "Complete task"}
      >
        {statusIcons[task.status]}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              "text-[13.5px] text-text-primary truncate",
              isCompleted && "text-text-tertiary"
            )}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px] text-text-tertiary">
            {task.startTime && <span>{format(task.startTime, "HH:mm")}</span>}
            {task.estimatedDuration ? <span>{task.estimatedDuration}m</span> : null}
          </div>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-text-tertiary opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-fast">
          {task.schedulingBehavior === "fixed" && (
            <span className="inline-flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Fixed
            </span>
          )}
          {task.priority !== "medium" && (
            <span className={priorityClass[task.priority]}>
              {task.priority === "critical" ? "Critical" : task.priority === "high" ? "High" : "Low"}
            </span>
          )}
          {task.dueDate && (
            <span className={cn(overdue && "text-status-error inline-flex items-center gap-1")}>
              {overdue && <AlertCircle className="h-3 w-3" />}
              {overdue ? "Overdue" : format(task.dueDate, "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

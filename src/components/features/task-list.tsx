"use client";

import * as React from "react";
import type { Task, TaskPriority, TaskStatus } from "@/domain/types";
import { PRIORITY_RANK } from "@/domain/task/constants";
import { TaskItem } from "./task-item";
import { cn } from "@/lib/utils";

export type TaskSort = "manual" | "priority" | "time" | "title" | "created";

export interface TaskListFilter {
  query?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  hideCompleted?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  sort?: TaskSort;
  filter?: TaskListFilter;
  selectedIds?: string[];
  selectable?: boolean;
  multiSelect?: boolean;
  onSelect?: (ids: string[]) => void;
  onOpen?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onReorder?: (orderedIds: string[]) => void;
  empty?: React.ReactNode;
  className?: string;
}

export function TaskList({
  tasks,
  sort = "manual",
  filter,
  selectedIds = [],
  selectable = true,
  multiSelect = true,
  onSelect,
  onOpen,
  onComplete,
  onReorder,
  empty,
  className,
}: TaskListProps) {
  const visible = React.useMemo(() => {
    let next = [...tasks];
    if (filter?.hideCompleted) {
      next = next.filter((task) => task.status !== "completed" && task.status !== "archived");
    }
    if (filter?.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      next = next.filter((task) => statuses.includes(task.status));
    }
    if (filter?.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      next = next.filter((task) => priorities.includes(task.priority));
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      next = next.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return sortTasks(next, sort);
  }, [tasks, filter, sort]);

  const handleClick = (task: Task, event: React.MouseEvent) => {
    if (selectable && (event.metaKey || event.ctrlKey || event.shiftKey) && multiSelect) {
      const exists = selectedIds.includes(task.id);
      const next = exists
        ? selectedIds.filter((id) => id !== task.id)
        : [...selectedIds, task.id];
      onSelect?.(next);
      return;
    }
    onSelect?.([task.id]);
    onOpen?.(task);
  };

  const dragId = React.useRef<string | null>(null);

  const handleDragStart = (taskId: string) => (event: React.DragEvent) => {
    dragId.current = taskId;
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (targetId: string) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId || !onReorder) return;
    const ids = visible.map((task) => task.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  if (visible.length === 0) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className={cn("space-y-0", className)} role="list">
      {visible.map((task) => (
        <div
          key={task.id}
          role="listitem"
          draggable={Boolean(onReorder)}
          onDragStart={handleDragStart(task.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop(task.id)}
        >
          <TaskItem
            task={task}
            selected={selectedIds.includes(task.id)}
            onClick={(event) => handleClick(task, event)}
            onComplete={() => onComplete?.(task)}
          />
        </div>
      ))}
    </div>
  );
}

function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks];
  switch (sort) {
    case "priority":
      return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case "time":
      return copy.sort((a, b) => {
        const aTime = a.startTime?.getTime() ?? a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = b.startTime?.getTime() ?? b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "created":
      return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "manual":
    default:
      return copy.sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime());
  }
}

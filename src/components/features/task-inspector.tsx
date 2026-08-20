"use client";

import * as React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Label } from "@/components/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import type { SchedulingBehavior, Task, TaskPriority, TaskStatus } from "@/domain/types";
import { STATUS_LABELS } from "@/domain/task/constants";
import { canTransition } from "@/domain/task/status";
import { TASK_STATUSES } from "@/domain/types";
import { cn } from "@/lib/utils";
import type { UpdateTaskInput } from "@/domain/task/service";
import { atTimeOnDate } from "@/domain/task/time";
import { HierarchyPicker } from "./hierarchy-picker";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { resolveTaskContext } from "@/domain/relationships";
import Link from "next/link";

interface TaskInspectorProps {
  task: Task;
  onChange: (updates: UpdateTaskInput) => void;
  onComplete: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
  variant?: "panel" | "sheet";
  className?: string;
}

export function TaskInspector({
  task,
  onChange,
  onComplete,
  onDelete,
  onDuplicate,
  onClose,
  variant = "panel",
  className,
}: TaskInspectorProps) {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description ?? "");
  const [tags, setTags] = React.useState(task.tags.join(", "));
  const [subtaskTitle, setSubtaskTitle] = React.useState("");
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const context = resolveTaskContext(task, projects, milestones, goals);
  const subtasks = tasks.filter((item) => item.parentTaskId === task.id);

  const dateValue = task.startTime
    ? format(task.startTime, "yyyy-MM-dd")
    : task.dueDate
      ? format(task.dueDate, "yyyy-MM-dd")
      : "";
  const timeValue = task.startTime ? format(task.startTime, "HH:mm") : "";

  const persistTitle = () => {
    const next = title.trim();
    if (next && next !== task.title) onChange({ title: next });
    else setTitle(task.title);
  };

  const persistDescription = () => {
    const next = description.trim();
    if ((next || undefined) !== task.description) {
      onChange({ description: next || null });
    }
  };

  const persistTags = () => {
    const next = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const same =
      next.length === task.tags.length && next.every((tag, i) => tag === task.tags[i]);
    if (!same) onChange({ tags: next });
  };

  const handleDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr && !timeStr) {
      onChange({ startTime: null, endTime: null, scheduledDate: null });
      return;
    }
    const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const start = atTimeOnDate(base, hours, minutes);
      onChange({
        startTime: start,
        dueDate: base,
        scheduledDate: base,
      });
    } else {
      onChange({ dueDate: base, scheduledDate: base });
    }
  };

  return (
    <div
      data-nexus-panel=""
      className={cn(
        "flex flex-col",
        variant === "panel" && "h-full border-l border-border-primary",
        variant === "sheet" &&
          "fixed inset-x-0 bottom-0 z-[1300] max-h-[88vh] rounded-t-xl border-t border-border-primary shadow-xl",
        className
      )}
    >
      {variant === "sheet" && (
        <div className="flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-border-secondary" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
        <h2 className="label-caps mb-0">Task</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close inspector">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inspect-title">Title</Label>
          <Input
            id="inspect-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={persistTitle}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspect-description">Description</Label>
          <Textarea
            id="inspect-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={persistDescription}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={task.priority}
              onValueChange={(value) => onChange({ priority: value as TaskPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={task.status}
              onValueChange={(value) => onChange({ status: value as TaskStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    disabled={!canTransition(task.status, status)}
                  >
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="inspect-date">Date</Label>
            <Input
              id="inspect-date"
              type="date"
              value={dateValue}
              onChange={(event) => handleDateTime(event.target.value, timeValue)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspect-time">Time</Label>
            <Input
              id="inspect-time"
              type="time"
              value={timeValue}
              onChange={(event) => handleDateTime(dateValue || format(new Date(), "yyyy-MM-dd"), event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspect-duration">Duration (minutes)</Label>
          <Input
            id="inspect-duration"
            type="number"
            min={15}
            step={15}
            value={task.estimatedDuration ?? 30}
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);
              if (Number.isFinite(value)) onChange({ estimatedDuration: value });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Schedule</Label>
          <Select
            value={task.schedulingBehavior}
            onValueChange={(value) =>
              onChange({ schedulingBehavior: value as SchedulingBehavior })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">Flexible — may move later</SelectItem>
              <SelectItem value="fixed">Fixed — stays put</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspect-tags">Tags</Label>
          <Input
            id="inspect-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            onBlur={persistTags}
            placeholder="comma separated"
          />
        </div>

        <div className="space-y-3 pt-2">
          <p className="label-caps">Context</p>
          <HierarchyPicker
            goals={goals}
            milestones={milestones}
            projects={projects}
            value={{
              goalId: context.goal?.id ?? task.goalId,
              milestoneId: context.milestone?.id,
              projectId: task.projectId,
            }}
            onChange={(next) =>
              onChange({
                projectId: next.projectId ?? null,
                goalId: next.goalId ?? null,
              })
            }
          />
          {(context.project || context.goal) && (
            <div className="text-xs text-text-secondary space-y-1">
              {context.project && (
                <Link href={`/projects/${context.project.id}`} className="block hover:text-text-primary">
                  Project · {context.project.name}
                </Link>
              )}
              {context.milestone && <div>Milestone · {context.milestone.title}</div>}
              {context.goal && (
                <Link href={`/goals/${context.goal.id}`} className="block hover:text-text-primary">
                  Goal · {context.goal.title}
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <p className="label-caps">Subtasks</p>
          <ul className="space-y-1">
            {subtasks.map((child) => (
              <li key={child.id} className="text-sm text-text-primary">
                {child.status === "completed" ? "✓ " : "○ "}
                {child.title}
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!subtaskTitle.trim()) return;
              void createTask({
                title: subtaskTitle.trim(),
                parentTaskId: task.id,
                projectId: task.projectId,
                goalId: task.goalId,
              });
              setSubtaskTitle("");
            }}
          >
            <Input
              value={subtaskTitle}
              onChange={(event) => setSubtaskTitle(event.target.value)}
              placeholder="Add a subtask"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={!subtaskTitle.trim()}>
              Add
            </Button>
          </form>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={Boolean(task.reminder?.enabled)}
            onChange={(event) =>
              onChange({
                reminder: event.target.checked
                  ? {
                      enabled: true,
                      offsetMinutes: 10,
                      remindAt: task.startTime
                        ? new Date(task.startTime.getTime() - 10 * 60_000)
                        : undefined,
                    }
                  : null,
              })
            }
            className="h-4 w-4 rounded border-border-primary"
          />
          Reminder
        </label>

        <div className="rounded-md bg-bg-secondary px-3 py-2 text-xs text-text-tertiary space-y-1">
          <div>Created {format(task.createdAt, "MMM d, yyyy · h:mm a")}</div>
          <div>Updated {format(task.updatedAt, "MMM d, yyyy · h:mm a")}</div>
          {task.completedAt ? (
            <div>Completed {format(task.completedAt, "MMM d, yyyy · h:mm a")}</div>
          ) : (
            <div>Not completed</div>
          )}
        </div>
      </div>

      <div className="border-t border-border-primary p-3 flex flex-wrap gap-2">
        {task.status !== "completed" && (
          <Button size="sm" onClick={onComplete}>
            Complete
          </Button>
        )}
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/focus?task=${task.id}`}>Focus</Link>
        </Button>
        <Button size="sm" variant="secondary" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

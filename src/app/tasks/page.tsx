"use client";

import * as React from "react";
import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { TaskList, type TaskSort } from "@/components/features/task-list";
import { TaskInspector } from "@/components/features/task-inspector";
import { EmptyState } from "@/components/core/empty-state";
import { useTaskStore } from "@/state/task-store";
import { useUiStore } from "@/state/ui-store";
import type { TaskStatus } from "@/domain/types";
import { STATUS_LABELS } from "@/domain/task/constants";

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const hydrated = useTaskStore((state) => state.hydrated);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const duplicateTask = useTaskStore((state) => state.duplicateTask);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const resizeTask = useTaskStore((state) => state.resizeTask);

  const openComposer = useUiStore((state) => state.openComposer);
  const inspectorTaskId = useUiStore((state) => state.inspectorTaskId);
  const openInspector = useUiStore((state) => state.openInspector);
  const closeInspector = useUiStore((state) => state.closeInspector);
  const selectedIds = useUiStore((state) => state.selectedIds);
  const setSelectedIds = useUiStore((state) => state.setSelectedIds);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<TaskSort>("manual");
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all");

  const inspectorTask = tasks.find((task) => task.id === inspectorTaskId) ?? null;
  const visible = tasks.filter((task) => task.status !== "archived");
  const active = visible.filter(
    (task) => task.status !== "completed"
  );
  const completed = visible.filter((task) => task.status === "completed");

  if (!hydrated) {
    return <div className="px-5 py-10"><span className="label-caps">Loading</span></div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="flex-1 min-w-0 container max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-text-primary mb-1">Tasks</h1>
            <p className="font-mono text-xs text-text-tertiary">
              {visible.length} · {active.length} open · {completed.length} done
            </p>
          </div>
          <Button onClick={() => openComposer()}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Filter tasks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="sm:max-w-xs"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as TaskSort)}
            className="h-11 rounded border border-border-secondary bg-bg-field px-3 text-sm text-text-primary"
          >
            <option value="manual">Manual</option>
            <option value="priority">Priority</option>
            <option value="time">Time</option>
            <option value="title">Title</option>
            <option value="created">Created</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "all")}
            className="h-11 rounded border border-border-secondary bg-bg-field px-3 text-sm text-text-primary"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-16 w-16" />}
            title="Nothing captured yet"
            description="Create a task to start building your day."
            action={
              <Button onClick={() => openComposer()}>
                <Plus className="h-4 w-4" />
                Create task
              </Button>
            }
          />
        ) : (
          <TaskList
            tasks={visible}
            sort={sort}
            filter={{
              query,
              status: statusFilter === "all" ? undefined : statusFilter,
            }}
            selectedIds={selectedIds}
            multiSelect
            onSelect={setSelectedIds}
            onOpen={(task) => openInspector(task.id)}
            onComplete={(task) => {
              if (task.status === "completed") {
                void updateTask(task.id, { status: "ready" });
              } else {
                void completeTask(task.id);
              }
            }}
            onReorder={(ids) => void reorderTasks(ids)}
          />
        )}
      </div>

      {inspectorTask && (
        <>
          <aside className="hidden lg:flex w-80 flex-shrink-0">
            <TaskInspector
              key={inspectorTask.id}
              task={inspectorTask}
              variant="panel"
              onChange={(updates) => {
                if (updates.estimatedDuration && inspectorTask.startTime) {
                  void resizeTask(inspectorTask.id, updates.estimatedDuration);
                  const rest = { ...updates };
                  delete rest.estimatedDuration;
                  if (Object.keys(rest).length > 0) void updateTask(inspectorTask.id, rest);
                  return;
                }
                void updateTask(inspectorTask.id, updates);
              }}
              onComplete={() => void completeTask(inspectorTask.id)}
              onDelete={() => {
                void deleteTask(inspectorTask.id);
                closeInspector();
              }}
              onDuplicate={() => void duplicateTask(inspectorTask.id)}
              onClose={closeInspector}
            />
          </aside>
          <div className="lg:hidden">
            <button
              type="button"
              data-nexus-scrim=""
              className="fixed inset-0 z-[1200] bg-black/55"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", opacity: 1 }}
              aria-label="Close inspector"
              onClick={closeInspector}
            />
            <TaskInspector
              key={`${inspectorTask.id}-sheet`}
              task={inspectorTask}
              variant="sheet"
              onChange={(updates) => void updateTask(inspectorTask.id, updates)}
              onComplete={() => void completeTask(inspectorTask.id)}
              onDelete={() => {
                void deleteTask(inspectorTask.id);
                closeInspector();
              }}
              onDuplicate={() => void duplicateTask(inspectorTask.id)}
              onClose={closeInspector}
            />
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { ProgressBar } from "@/components/core/progress-bar";
import { Breadcrumbs, CompactContext } from "@/components/core/breadcrumbs";
import { TaskList, type TaskSort } from "./task-list";
import { TaskInspector } from "./task-inspector";
import { DayFlow } from "./day-flow";
import { ActivityFeed } from "./activity-feed";
import { ConfirmArchive } from "./confirm-archive";
import { HierarchyPicker, type HierarchyValue } from "./hierarchy-picker";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { useUiStore } from "@/state/ui-store";
import { computeProjectProgress, countProjectTasks } from "@/domain/progress";
import { classifyDeadline, deadlineLabel } from "@/domain/deadlines";
import { PROJECT_STATUS_LABELS, canTransitionProject } from "@/domain/project/status";
import { PROJECT_STATUSES } from "@/domain/types";
import { activityForEntity } from "@/domain/activity";
import { recordActivity } from "@/domain/activity";
import { isOverdue } from "@/domain/task/overdue";
import type { UpdateTaskInput } from "@/domain/task/service";
import { cn } from "@/lib/utils";

type TaskFilter = "all" | "active" | "completed" | "overdue" | "scheduled";

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const activity = useWorkspaceStore((s) => s.activity);
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const archiveProject = useWorkspaceStore((s) => s.archiveProject);
  const record = useWorkspaceStore((s) => s.record);
  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const resizeTask = useTaskStore((s) => s.resizeTask);
  const unlinkProject = useTaskStore((s) => s.unlinkProject);
  const openComposer = useUiStore((s) => s.openComposer);
  const inspectorTaskId = useUiStore((s) => s.inspectorTaskId);
  const openInspector = useUiStore((s) => s.openInspector);
  const closeInspector = useUiStore((s) => s.closeInspector);
  const granularity = useUiStore((s) => s.granularity);

  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const project = projects.find((item) => item.id === projectId);
  const [name, setName] = React.useState(project?.name ?? "");
  const [description, setDescription] = React.useState(project?.description ?? "");
  const [filter, setFilter] = React.useState<TaskFilter>("all");
  const [sort, setSort] = React.useState<TaskSort>("priority");
  const [showFlow, setShowFlow] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);

  if (!hydrated) {
    return <div className="px-4 py-8 text-sm text-text-tertiary">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="px-4 py-8">
        <p className="text-sm text-text-secondary">This project is not available.</p>
      </div>
    );
  }

  const goal = project.goalId ? goals.find((g) => g.id === project.goalId) : undefined;
  const milestone = project.milestoneId
    ? milestones.find((m) => m.id === project.milestoneId)
    : undefined;
  const progress = computeProjectProgress(project, tasks);
  const counts = countProjectTasks(project.id, tasks);
  const deadline = classifyDeadline(project.targetDate, project.status, new Date());
  const projectTasks = tasks.filter((t) => t.projectId === project.id && t.status !== "archived");
  const now = new Date();
  const filtered = projectTasks.filter((task) => {
    if (filter === "active") return task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    if (filter === "overdue") return isOverdue(task, now);
    if (filter === "scheduled") return Boolean(task.startTime);
    return true;
  });
  const upcoming = projectTasks.filter(
    (t) => t.status !== "completed" && t.startTime && t.startTime.getTime() > now.getTime()
  );
  const inspectorTask = tasks.find((t) => t.id === inspectorTaskId) ?? null;
  const events = activityForEntity(
    activity,
    project.id,
    projectTasks.map((t) => t.id)
  );
  const nextTask = projectTasks.find(
    (t) => t.status === "in_progress" || t.status === "ready" || t.status === "planned"
  );

  const hierarchy: HierarchyValue = {
    goalId: project.goalId,
    milestoneId: project.milestoneId,
    projectId: project.id,
  };

  const handleInspectorChange = (updates: UpdateTaskInput) => {
    if (!inspectorTask) return;
    if (updates.estimatedDuration && inspectorTask.startTime) {
      void resizeTask(inspectorTask.id, updates.estimatedDuration);
      const rest = { ...updates };
      delete rest.estimatedDuration;
      if (Object.keys(rest).length > 0) void updateTask(inspectorTask.id, rest);
      return;
    }
    void updateTask(inspectorTask.id, updates);
  };

  const crumbs = [
    ...(goal ? [{ label: goal.title, href: `/goals/${goal.id}` }] : [{ label: "Projects", href: "/projects" }]),
    ...(milestone ? [{ label: milestone.title }] : []),
    { label: project.name },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="flex-1 min-w-0">
        <div className="px-4 py-4 lg:px-6 border-b border-border-primary">
          <CompactContext
            label={goal ? goal.title : "Projects"}
            href={goal ? `/goals/${goal.id}` : "/projects"}
          />
          <Breadcrumbs crumbs={crumbs} className="mb-2" />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  if (name.trim() && name.trim() !== project.name) {
                    void updateProject(project.id, { name: name.trim() });
                  }
                }}
                className="text-xl font-semibold h-auto border-0 px-0 focus-visible:ring-0"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <select
                  value={project.status}
                  onChange={(event) =>
                    void updateProject(project.id, {
                      status: event.target.value as typeof project.status,
                    })
                  }
                  className="h-11 rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={!canTransitionProject(project.status, status)}
                    >
                      {PROJECT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {project.targetDate && (
                  <span>
                    {format(project.targetDate, "MMM d")}
                    {deadline !== "none" ? ` · ${deadlineLabel(deadline)}` : ""}
                  </span>
                )}
                {goal && (
                  <Link href={`/goals/${goal.id}`} className="hover:text-text-primary">
                    Goal: {goal.title}
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {nextTask && (
                <Button size="sm" onClick={() => openInspector(nextTask.id)}>
                  Continue
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openComposer({ projectId: project.id, goalId: project.goalId })}
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 max-w-md">
            <ProgressBar value={progress} className="flex-1" />
            <span className="text-sm tabular-nums text-text-secondary">{progress}%</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] min-h-0">
          <div className="px-4 py-5 lg:px-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "completed", "overdue", "scheduled"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md border min-h-8 capitalize",
                    filter === key
                      ? "border-interactive-primary text-text-primary bg-bg-tertiary"
                      : "border-border-primary text-text-secondary"
                  )}
                >
                  {key}
                </button>
              ))}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as TaskSort)}
                className="h-11 rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
              >
                <option value="priority">Priority</option>
                <option value="time">Deadline</option>
                <option value="created">Created</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <TaskList
              tasks={filtered}
              sort={sort}
              onOpen={(task) => openInspector(task.id)}
              onComplete={(task) => {
                if (task.status === "completed") {
                  void updateTask(task.id, { status: "ready" });
                } else {
                  void completeTask(task.id);
                  void record(
                    recordActivity("task_completed", "task", task.id, `Task completed: ${task.title}`)
                  );
                }
              }}
            />

            <div>
              <Button size="sm" variant="ghost" onClick={() => setShowFlow((v) => !v)}>
                {showFlow ? "Hide scheduled work" : "View scheduled work"}
              </Button>
              {showFlow && (
                <div className="mt-3 h-[28rem]">
                  <DayFlow
                    date={new Date()}
                    tasks={projectTasks}
                    granularity={granularity}
                    selectedTaskId={inspectorTaskId}
                    onSelect={(task) => openInspector(task.id)}
                    onOpen={(task) => openInspector(task.id)}
                    onComplete={(task) => void completeTask(task.id)}
                    onDelete={(task) => void deleteTask(task.id)}
                    onDuplicate={(task) => void duplicateTask(task.id)}
                    onEmptySlotClick={(time) =>
                      openComposer({
                        startTime: time,
                        date: time,
                        projectId: project.id,
                        goalId: project.goalId,
                        prompt: "What's happening?",
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <aside className="border-t lg:border-t-0 lg:border-l border-border-primary px-4 py-5 lg:px-4 space-y-6 bg-neutral-50 dark:bg-neutral-950">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-2">
                Details
              </h2>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={() => {
                  const next = description.trim() || null;
                  if ((next || undefined) !== project.description) {
                    void updateProject(project.id, { description: next });
                  }
                }}
                rows={3}
                placeholder="What this project is"
              />
              <div className="mt-3 space-y-1 text-xs text-text-secondary">
                <div>
                  {counts.completed}/{counts.total} tasks · {counts.active} remaining
                </div>
                {project.startDate && <div>Start {format(project.startDate, "MMM d, yyyy")}</div>}
                {project.targetDate && <div>Target {format(project.targetDate, "MMM d, yyyy")}</div>}
                {milestone && <div>Milestone {milestone.title}</div>}
                {goal && (
                  <Link href={`/goals/${goal.id}`} className="block hover:text-text-primary">
                    Goal {goal.title}
                  </Link>
                )}
              </div>
              <div className="mt-4">
                <HierarchyPicker
                  goals={goals}
                  milestones={milestones}
                  projects={projects}
                  value={hierarchy}
                  showProject={false}
                  onChange={(next) => {
                    void updateProject(project.id, {
                      goalId: next.goalId ?? null,
                      milestoneId: next.milestoneId ?? null,
                    });
                  }}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-3"
                onClick={() => setConfirm(true)}
              >
                Archive project
              </Button>
            </section>
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-2">
                  Upcoming
                </h2>
                <ul className="space-y-1 text-sm">
                  {upcoming.slice(0, 5).map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        className="text-left text-text-primary hover:underline"
                        onClick={() => openInspector(task.id)}
                      >
                        {task.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-2">
                Activity
              </h2>
              <ActivityFeed events={events} />
            </section>
          </aside>
        </div>
      </div>

      {inspectorTask && (
        <>
          <aside className="hidden xl:flex w-80 flex-shrink-0 border-l border-border-primary">
            <TaskInspector
              key={inspectorTask.id}
              task={inspectorTask}
              variant="panel"
              onChange={handleInspectorChange}
              onComplete={() => void completeTask(inspectorTask.id)}
              onDelete={() => {
                void deleteTask(inspectorTask.id);
                closeInspector();
              }}
              onDuplicate={() => void duplicateTask(inspectorTask.id)}
              onClose={closeInspector}
            />
          </aside>
          <div className="xl:hidden">
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
              onChange={handleInspectorChange}
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

      <ConfirmArchive
        open={confirm}
        title="Archive this project?"
        description="Tasks are not deleted. Completing a project does not complete its tasks."
        unlinkLabel="Detach tasks, then archive"
        onArchive={() => {
          void archiveProject(project.id);
          setConfirm(false);
          router.push("/projects");
        }}
        onUnlink={() => {
          void unlinkProject(project.id);
          void archiveProject(project.id);
          setConfirm(false);
          router.push("/projects");
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

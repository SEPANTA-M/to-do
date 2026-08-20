"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { DayFlow } from "./day-flow";
import { TaskInspector } from "./task-inspector";
import { ConflictDialog } from "./conflict-dialog";
import { TaskList } from "./task-list";
import { EmptyState } from "@/components/core/empty-state";
import { SectionLabel } from "@/components/core/section-label";
import { PageSkeleton } from "@/components/core/skeleton";
import { useTaskStore } from "@/state/task-store";
import { useUiStore } from "@/state/ui-store";
import type { Task } from "@/domain/types";
import { computeDayMomentum, getTasksOnDay } from "@/domain/task/today";
import { getCurrentTask } from "@/domain/task/current";
import { getOverdueTasks } from "@/domain/task/overdue";
import { detectConflicts, getScheduledInterval } from "@/domain/task/conflicts";
import { dateFromMinutes, minutesFromMidnight, snapMinutes } from "@/domain/task/time";
import type { UpdateTaskInput } from "@/domain/task/service";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/state/workspace-store";
import { resolveTaskContext } from "@/domain/relationships";
import Link from "next/link";
import { useT } from "@/i18n/use-t";

export function TodayView() {
  const t = useT();
  const tasks = useTaskStore((state) => state.tasks);
  const hydrated = useTaskStore((state) => state.hydrated);
  const updateTask = useTaskStore((state) => state.updateTask);
  const completeTask = useTaskStore((state) => state.completeTask);
  const startTask = useTaskStore((state) => state.startTask);
  const pauseTask = useTaskStore((state) => state.pauseTask);
  const archiveTask = useTaskStore((state) => state.archiveTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const duplicateTask = useTaskStore((state) => state.duplicateTask);
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);
  const resizeTask = useTaskStore((state) => state.resizeTask);

  const openComposer = useUiStore((state) => state.openComposer);
  const inspectorTaskId = useUiStore((state) => state.inspectorTaskId);
  const inspectorCollapsed = useUiStore((state) => state.inspectorCollapsed);
  const openInspector = useUiStore((state) => state.openInspector);
  const closeInspector = useUiStore((state) => state.closeInspector);
  const toggleInspectorCollapsed = useUiStore((state) => state.toggleInspectorCollapsed);
  const granularity = useUiStore((state) => state.granularity);
  const setGranularity = useUiStore((state) => state.setGranularity);
  const pendingConflict = useUiStore((state) => state.pendingConflict);
  const setPendingConflict = useUiStore((state) => state.setPendingConflict);

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const today = React.useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);
  const dayTasks = React.useMemo(() => getTasksOnDay(tasks, today), [tasks, today]);
  const momentum = React.useMemo(() => computeDayMomentum(tasks, today), [tasks, today]);
  const current = React.useMemo(() => getCurrentTask(dayTasks, now), [dayTasks, now]);
  const overdue = React.useMemo(() => getOverdueTasks(tasks, today), [tasks, today]);
  const inspectorTask = tasks.find((task) => task.id === inspectorTaskId) ?? null;
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const currentContext = current
    ? resolveTaskContext(current, projects, milestones, goals)
    : {};

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("today.morning");
    if (hour < 18) return t("today.afternoon");
    return t("today.evening");
  }, [t]);

  const proposeChange = (original: Task, proposed: Task, kind: "move" | "resize") => {
    const conflicts = detectConflicts(proposed, tasks);
    if (conflicts.length > 0) {
      setPendingConflict({ taskId: original.id, proposed, conflicts, kind });
      return;
    }
    void commitProposed(proposed, kind);
  };

  const commitProposed = async (proposed: Task, kind: "move" | "resize" | "create") => {
    if (kind === "resize") {
      await resizeTask(proposed.id, proposed.estimatedDuration ?? 30);
    } else if (kind === "move" || kind === "create") {
      if (proposed.startTime) {
        await rescheduleTask(proposed.id, proposed.startTime);
      }
      if (proposed.estimatedDuration) {
        await resizeTask(proposed.id, proposed.estimatedDuration);
      }
    }
  };

  const handleKeepOverlap = async () => {
    if (!pendingConflict) return;
    await commitProposed(pendingConflict.proposed, pendingConflict.kind);
    setPendingConflict(null);
  };

  const handleCancelConflict = async () => {
    if (!pendingConflict) return;
    if (pendingConflict.kind === "create") {
      await deleteTask(pendingConflict.taskId);
    }
    setPendingConflict(null);
  };

  const handleMoveLater = async () => {
    if (!pendingConflict) return;
    const latest = Math.max(
      ...pendingConflict.conflicts.map((task) => {
        const interval = getScheduledInterval(task);
        return interval ? interval.end.getTime() : 0;
      })
    );
    const start = new Date(latest);
    const minutes = snapMinutes(minutesFromMidnight(start), granularity);
    const snapped = dateFromMinutes(today, minutes);
    await rescheduleTask(pendingConflict.taskId, snapped);
    setPendingConflict(null);
  };

  const handleResizeToFit = async () => {
    if (!pendingConflict) return;
    const proposedStart = pendingConflict.proposed.startTime;
    if (!proposedStart) {
      setPendingConflict(null);
      return;
    }
    const earliest = Math.min(
      ...pendingConflict.conflicts.map((task) => {
        const interval = getScheduledInterval(task);
        return interval ? interval.start.getTime() : Number.MAX_SAFE_INTEGER;
      })
    );
    const minutes = Math.floor((earliest - proposedStart.getTime()) / 60_000);
    if (minutes < 15) {
      await handleMoveLater();
      return;
    }
    await resizeTask(pendingConflict.taskId, minutes);
    setPendingConflict(null);
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

  if (!hydrated) {
    return <PageSkeleton />;
  }

  const inspectorOpen = Boolean(inspectorTask) && !inspectorCollapsed;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="px-5 pt-8 pb-4 lg:px-10 lg:pt-10">
          <div className="flex items-start justify-between gap-4 max-w-3xl">
            <div>
              <p className="label-caps mb-2">{greeting}</p>
              <h1 className="text-xl font-medium tracking-tight text-text-primary">
                {format(today, "EEEE, d MMMM")}
              </h1>
              {momentum.totalCount > 0 && (
                <p className="mt-3 text-sm text-text-secondary font-mono">
                  <span className="text-text-primary">{momentum.completionPercentage}%</span>
                  <span className="text-text-tertiary"> · </span>
                  {momentum.completedCount} done
                  <span className="text-text-tertiary"> · </span>
                  {momentum.remainingCount} remaining
                  <span className="text-text-tertiary"> · </span>
                  {formatMinutes(momentum.focusMinutes)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => openComposer()} className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" />
                {t("action.capture")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex h-8 w-8"
                onClick={toggleInspectorCollapsed}
                aria-label={inspectorCollapsed ? "Show inspector" : "Hide inspector"}
              >
                {inspectorCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-5 pb-10 lg:px-10 space-y-10 max-w-3xl">

            {current && (
              <section>
                <SectionLabel>{t("today.now")}</SectionLabel>
                <div className="pl-0">
                  <h2 className="text-2xl font-medium tracking-tight text-text-primary leading-snug">
                    {current.title}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    {currentContext.project ? (
                      <Link href={`/projects/${currentContext.project.id}`} className="hover:text-text-primary">
                        {currentContext.project.name}
                      </Link>
                    ) : (
                      <span>{t("today.unassigned")}</span>
                    )}
                    {currentContext.goal && (
                      <>
                        <span className="text-text-tertiary"> · </span>
                        <Link href={`/goals/${currentContext.goal.id}`} className="hover:text-text-primary">
                          {currentContext.goal.title}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="mt-1 font-mono text-sm text-text-tertiary">
                    {current.estimatedDuration ? `${current.estimatedDuration} min` : "—"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {current.status !== "in_progress" && current.status !== "completed" && (
                      <Button size="sm" onClick={() => void startTask(current.id)}>
                        {t("action.start")}
                      </Button>
                    )}
                    {current.status === "in_progress" && (
                      <Button size="sm" variant="secondary" onClick={() => void pauseTask(current.id)}>
                        {t("action.pause")}
                      </Button>
                    )}
                    {current.status !== "completed" && (
                      <Button size="sm" variant="ghost" onClick={() => void completeTask(current.id)}>
                        {t("action.complete")}
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/focus?task=${current.id}`}>{t("action.focus")}</Link>
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {overdue.length > 0 && (
              <section>
                <SectionLabel>{t("today.stillOpen")}</SectionLabel>
                <ul className="space-y-3">
                  {overdue.map((task) => (
                    <li key={task.id} className="flex items-baseline justify-between gap-3">
                      <button
                        type="button"
                        className="text-left text-sm text-text-primary hover:text-interactive-primary"
                        onClick={() => openInspector(task.id)}
                      >
                        {task.title}
                      </button>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          className="text-xs text-text-tertiary hover:text-text-primary"
                          onClick={() => void completeTask(task.id)}
                        >
                          {t("action.complete")}
                        </button>
                        <button
                          type="button"
                          className="text-xs text-text-tertiary hover:text-text-primary"
                          onClick={() => void archiveTask(task.id)}
                        >
                          {t("action.archive")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="flex flex-col min-h-[32rem]">
              <div className="flex items-center justify-between mb-4 gap-3">
                <SectionLabel className="mb-0 flex-1">{t("today.flow")}</SectionLabel>
                <div className="flex items-center gap-1">
                  {([15, 30, 60] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGranularity(value)}
                      className={cn(
                        "px-2 py-1 font-mono text-[11px] min-h-8 rounded-sm",
                        granularity === value
                          ? "text-text-primary bg-bg-tertiary"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      {value}m
                    </button>
                  ))}
                </div>
              </div>

              {dayTasks.length === 0 ? (
                <div className="flex flex-col flex-1 min-h-[28rem]">
                  <EmptyState
                    title={t("empty.day")}
                    description={t("empty.dayHint")}
                    action={
                      <Button onClick={() => openComposer()} variant="secondary">
                        {t("action.plan")}
                      </Button>
                    }
                  />
                  <div className="flex-1 min-h-[18rem]">
                    <DayFlow
                      date={today}
                      tasks={tasks}
                      granularity={granularity}
                      selectedTaskId={inspectorTaskId}
                      onSelect={(task) => openInspector(task.id)}
                      onOpen={(task) => openInspector(task.id)}
                      onComplete={(task) => void completeTask(task.id)}
                      onDelete={(task) => void deleteTask(task.id)}
                      onDuplicate={(task) => void duplicateTask(task.id)}
                      onMove={(task, proposed) => proposeChange(task, proposed, "move")}
                      onResize={(task, proposed) => proposeChange(task, proposed, "resize")}
                      onEmptySlotClick={(time) =>
                        openComposer({ startTime: time, date: time, prompt: "What's happening?" })
                      }
                    />
                  </div>
                </div>
              ) : (
                <DayFlow
                  date={today}
                  tasks={tasks}
                  granularity={granularity}
                  selectedTaskId={inspectorTaskId}
                  onSelect={(task) => openInspector(task.id)}
                  onOpen={(task) => openInspector(task.id)}
                  onComplete={(task) => void completeTask(task.id)}
                  onDelete={(task) => void deleteTask(task.id)}
                  onDuplicate={(task) => void duplicateTask(task.id)}
                  onMove={(task, proposed) => proposeChange(task, proposed, "move")}
                  onResize={(task, proposed) => proposeChange(task, proposed, "resize")}
                  onEmptySlotClick={(time) =>
                    openComposer({ startTime: time, date: time, prompt: "What's happening?" })
                  }
                  className="h-[36rem] lg:h-[42rem]"
                />
              )}
            </section>

            {dayTasks.filter((task) => !task.startTime && task.status !== "completed").length >
              0 && (
              <section>
                <SectionLabel>Up next</SectionLabel>
                <TaskList
                  tasks={dayTasks.filter((task) => !task.startTime)}
                  sort="priority"
                  onOpen={(task) => openInspector(task.id)}
                  onComplete={(task) => void completeTask(task.id)}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      <aside
        className={cn(
          "hidden lg:flex flex-col w-80 flex-shrink-0 bg-bg-primary",
          (!inspectorTask || inspectorCollapsed) && "lg:hidden"
        )}
      >
        {inspectorTask && inspectorOpen && (
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
        )}
      </aside>

      {inspectorTask && (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-[1200] bg-bg-overlay"
            aria-label="Close inspector"
            onClick={closeInspector}
          />
          <TaskInspector
            key={inspectorTask.id}
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
      )}

      <ConflictDialog
        conflict={pendingConflict}
        onKeepOverlap={() => void handleKeepOverlap()}
        onCancel={() => void handleCancelConflict()}
        onMoveLater={() => void handleMoveLater()}
        onResizeToFit={() => void handleResizeToFit()}
      />
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

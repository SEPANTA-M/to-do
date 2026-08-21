"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/core/empty-state";
import { PageSkeleton } from "@/components/core/skeleton";
import { ProgressBar } from "@/components/core/progress-bar";
import { useTaskStore } from "@/state/task-store";
import { useFocusStore } from "@/state/focus-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { resolveTaskContext } from "@/domain/relationships";
import { elapsedMs, formatElapsed } from "@/domain/focus/session";
import { getCurrentTask } from "@/domain/task/current";
import { getTasksOnDay } from "@/domain/task/today";
import { cn } from "@/lib/utils";

export function FocusView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("task");

  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const startTask = useTaskStore((s) => s.startTask);
  const pauseTask = useTaskStore((s) => s.pauseTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const sessions = useFocusStore((s) => s.sessions);
  const activeSessionId = useFocusStore((s) => s.activeSessionId);
  const focusHydrated = useFocusStore((s) => s.hydrated);
  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const complete = useFocusStore((s) => s.complete);
  const exit = useFocusStore((s) => s.exit);

  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);

  const session = sessions.find((item) => item.id === activeSessionId) ?? null;
  const [now, setNow] = React.useState(() => new Date());
  const [pickedId, setPickedId] = React.useState<string | null>(null);
  const selectedId = pickedId ?? requestedId;

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const candidates = React.useMemo(() => {
    const today = getTasksOnDay(tasks, now).filter(
      (task) => task.status !== "completed" && task.status !== "archived"
    );
    const current = getCurrentTask(today, now);
    const rest = today.filter((task) => task.id !== current?.id);
    const extra = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.status !== "archived" &&
        !today.some((item) => item.id === task.id)
    );
    return [...(current ? [current] : []), ...rest, ...extra].slice(0, 24);
  }, [tasks, now]);

  const focusedTask = session?.taskId
    ? tasks.find((task) => task.id === session.taskId)
    : tasks.find((task) => task.id === selectedId);

  const context = focusedTask
    ? resolveTaskContext(focusedTask, projects, milestones, goals)
    : {};

  if (!hydrated || !focusHydrated) return <PageSkeleton />;

  const ms = session ? elapsedMs(session, now) : 0;
  const estimated = focusedTask?.estimatedDuration ?? 0;
  const progress = estimated > 0 ? Math.min(100, (ms / (estimated * 60_000)) * 100) : 0;

  const handleStart = async () => {
    const task = focusedTask ?? candidates[0];
    const created = await start(task);
    if (task && task.status !== "in_progress") {
      try {
        await startTask(task.id);
      } catch {
        // Status machine may reject; the session still tracks time.
      }
    }
    if (created.taskId) setPickedId(created.taskId);
  };

  const handlePause = async () => {
    await pause();
    if (focusedTask && focusedTask.status === "in_progress") {
      try {
        await pauseTask(focusedTask.id);
      } catch {
        /* keep session */
      }
    }
  };

  const handleResume = async () => {
    await resume();
    if (focusedTask && focusedTask.status !== "in_progress") {
      try {
        await startTask(focusedTask.id);
      } catch {
        /* keep session */
      }
    }
  };

  const handleComplete = async () => {
    const ended = await complete();
    if (focusedTask && ended) {
      const added = ended.duration ?? 0;
      await updateTask(focusedTask.id, {
        actualDuration: (focusedTask.actualDuration ?? 0) + added,
      });
      if (focusedTask.status !== "completed") {
        await completeTask(focusedTask.id);
      }
    }
    router.push("/");
  };

  const handleExit = async () => {
    const ended = await exit();
    if (focusedTask && ended && (ended.duration ?? 0) > 0) {
      await updateTask(focusedTask.id, {
        actualDuration: (focusedTask.actualDuration ?? 0) + (ended.duration ?? 0),
      });
    }
    router.push("/");
  };

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex flex-col">
      <header className="px-5 pt-8 pb-4 lg:px-16 lg:pt-12 flex items-start justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Focus</p>
          <h1 className="text-xl font-medium tracking-tight text-text-primary">
            {session ? "One thing." : "Choose the work."}
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void handleExit()}>
          Exit
        </Button>
      </header>

      <main className="flex-1 px-5 pb-16 lg:px-16 max-w-3xl">
        {!session && candidates.length === 0 ? (
          <EmptyState
            title="Nothing to focus on."
            description="Capture a task first. Focus tracks real sessions against real work."
            action={
              <Button asChild variant="secondary">
                <Link href="/">Go to Today</Link>
              </Button>
            }
          />
        ) : null}

        {!session && candidates.length > 0 && (
          <ul className="space-y-1 mb-8">
            {candidates.map((task) => {
              const ctx = resolveTaskContext(task, projects, milestones, goals);
              const selected = selectedId === task.id;
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => setPickedId(task.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded min-h-11 transition-colors duration-fast",
                      selected ? "bg-bg-tertiary" : "hover:bg-bg-secondary"
                    )}
                  >
                    <div className="text-[15px] text-text-primary">{task.title}</div>
                    <div className="mt-1 text-xs text-text-tertiary">
                      {ctx.project?.name ?? "Unassigned"}
                      {ctx.goal ? ` · ${ctx.goal.title}` : ""}
                      {task.estimatedDuration ? ` · ${task.estimatedDuration} min` : ""}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {session && (
          <section className="pt-6">
            <h2 className="text-3xl font-medium tracking-tight text-text-primary leading-tight">
              {focusedTask?.title ?? "Open focus"}
            </h2>
            <p className="mt-3 text-sm text-text-secondary">
              {context.project ? (
                <Link href={`/projects/${context.project.id}`} className="hover:text-text-primary">
                  {context.project.name}
                </Link>
              ) : (
                <span>Unassigned</span>
              )}
              {context.goal && (
                <>
                  <span className="text-text-tertiary"> · </span>
                  <Link href={`/goals/${context.goal.id}`} className="hover:text-text-primary">
                    {context.goal.title}
                  </Link>
                </>
              )}
            </p>

            <div className="mt-10 font-mono text-5xl tracking-tight text-text-primary tabular-nums">
              {formatElapsed(ms)}
            </div>
            <p className="mt-2 text-xs text-text-tertiary font-mono">
              {session.status === "paused" ? "Paused" : "Running"}
              {session.interruptions > 0 ? ` · ${session.interruptions} interruption${session.interruptions === 1 ? "" : "s"}` : ""}
              {estimated > 0 ? ` · ${estimated} min estimated` : ""}
            </p>
            {estimated > 0 && (
              <div className="mt-6 max-w-md">
                <ProgressBar value={progress} />
              </div>
            )}
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-2">
          {!session && (
            <Button onClick={() => void handleStart()} disabled={!focusedTask && candidates.length === 0}>
              Start
            </Button>
          )}
          {session?.status === "active" && (
            <Button variant="secondary" onClick={() => void handlePause()}>
              Pause
            </Button>
          )}
          {session?.status === "paused" && (
            <Button onClick={() => void handleResume()}>Resume</Button>
          )}
          {session && (
            <Button onClick={() => void handleComplete()}>Complete</Button>
          )}
          {session && (
            <Button variant="ghost" onClick={() => void handleExit()}>
              Exit
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

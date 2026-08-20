"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/primitives/button";
import { Textarea } from "@/components/primitives/textarea";
import { Label } from "@/components/primitives/label";
import { SectionLabel } from "@/components/core/section-label";
import { PageSkeleton } from "@/components/core/skeleton";
import { useTaskStore } from "@/state/task-store";
import { useFocusStore } from "@/state/focus-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useSettingsStore } from "@/state/settings-store";
import { useUiStore } from "@/state/ui-store";
import { computeWeekSummary } from "@/domain/review/weekly";
import { formatMinutes } from "@/domain/insights/compute";

export function WeeklyReviewView() {
  const tasks = useTaskStore((s) => s.tasks);
  const history = useTaskStore((s) => s.history);
  const hydrated = useTaskStore((s) => s.hydrated);
  const completeTask = useTaskStore((s) => s.completeTask);
  const archiveTask = useTaskStore((s) => s.archiveTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const sessions = useFocusStore((s) => s.sessions);
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const settings = useSettingsStore((s) => s.settings);
  const saveReview = useSettingsStore((s) => s.saveReview);
  const reviews = useSettingsStore((s) => s.reviews);
  const openComposer = useUiStore((s) => s.openComposer);

  const [workedWell, setWorkedWell] = React.useState("");
  const [didntWork, setDidntWork] = React.useState("");
  const [shouldChange, setShouldChange] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  if (!hydrated) return <PageSkeleton />;

  const summary = computeWeekSummary(
    new Date(),
    settings,
    tasks,
    history,
    sessions,
    projects,
    goals
  );

  const existing = reviews.find(
    (review) => review.weekStart.getTime() === summary.window.start.getTime()
  );

  return (
    <div className="container max-w-3xl mx-auto px-5 py-10">
      <p className="label-caps mb-2">Weekly review</p>
      <h1 className="text-xl font-medium tracking-tight text-text-primary">
        {format(summary.window.start, "d MMM")} – {format(summary.window.end, "d MMM")}
      </h1>
      <p className="mt-2 text-sm text-text-secondary mb-10">
        Nothing here is changed automatically. Review, then act.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
        <Stat label="Completed" value={String(summary.completed.length)} />
        <Stat label="Incomplete" value={String(summary.incomplete.length)} />
        <Stat label="Carried over" value={String(summary.carriedOver.length)} />
        <Stat label="Focus" value={formatMinutes(summary.focusMinutes)} />
      </div>

      {summary.overdue.length > 0 && (
        <section className="mb-10">
          <SectionLabel>Overdue</SectionLabel>
          <TaskActions
            tasks={summary.overdue}
            onComplete={(id) => void completeTask(id)}
            onArchive={(id) => void archiveTask(id)}
            onReschedule={(id) => void rescheduleTask(id, new Date())}
            onPriority={(id, priority) => void updateTask(id, { priority })}
          />
        </section>
      )}

      {summary.incomplete.length > 0 && (
        <section className="mb-10">
          <SectionLabel>Still open this week</SectionLabel>
          <TaskActions
            tasks={summary.incomplete}
            onComplete={(id) => void completeTask(id)}
            onArchive={(id) => void archiveTask(id)}
            onReschedule={(id) => void rescheduleTask(id, new Date())}
            onPriority={(id, priority) => void updateTask(id, { priority })}
          />
        </section>
      )}

      {summary.projectMovement.length > 0 && (
        <section className="mb-10">
          <SectionLabel>Project movement</SectionLabel>
          <ul className="space-y-2">
            {summary.projectMovement.map((project) => (
              <li key={project.id} className="text-sm">
                <Link href={`/projects/${project.id}`} className="text-text-primary hover:text-interactive-primary">
                  {project.name}
                </Link>
                <span className="text-text-tertiary font-mono"> · {project.completedTasks} completed</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.goalMovement.length > 0 && (
        <section className="mb-10">
          <SectionLabel>Goal movement</SectionLabel>
          <ul className="space-y-2">
            {summary.goalMovement.map((goal) => (
              <li key={goal.id} className="text-sm">
                <Link href={`/goals/${goal.id}`} className="text-text-primary hover:text-interactive-primary">
                  {goal.title}
                </Link>
                <span className="text-text-tertiary font-mono"> · {goal.completedTasks} completed</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4 mb-8">
        <SectionLabel>Reflection</SectionLabel>
        <div className="space-y-2">
          <Label htmlFor="worked">What worked?</Label>
          <Textarea id="worked" rows={3} value={workedWell} onChange={(e) => setWorkedWell(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="didnt">What didn&apos;t?</Label>
          <Textarea id="didnt" rows={3} value={didntWork} onChange={(e) => setDidntWork(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="change">What should change?</Label>
          <Textarea id="change" rows={3} value={shouldChange} onChange={(e) => setShouldChange(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              await saveReview({
                weekStart: summary.window.start,
                weekEnd: summary.window.end,
                workedWell,
                didntWork,
                shouldChange,
              });
              setSaved(true);
            }}
          >
            Save review
          </Button>
          <Button variant="secondary" onClick={() => openComposer()}>
            Capture a follow-up
          </Button>
        </div>
        {saved && <p className="text-sm text-text-secondary">Saved on this device.</p>}
        {existing && !saved && (
          <p className="text-xs text-text-tertiary">
            A review for this week already exists. Saving adds another snapshot — it does not overwrite.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-caps mb-2">{label}</p>
      <p className="font-mono text-2xl text-text-primary">{value}</p>
    </div>
  );
}

function TaskActions({
  tasks,
  onComplete,
  onArchive,
  onReschedule,
  onPriority,
}: {
  tasks: { id: string; title: string; priority: string }[];
  onComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onReschedule: (id: string) => void;
  onPriority: (id: string, priority: "low" | "medium" | "high" | "critical") => void;
}) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-sm text-text-primary">{task.title}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="text-xs text-text-tertiary hover:text-text-primary min-h-8" onClick={() => onComplete(task.id)}>
              Complete
            </button>
            <button type="button" className="text-xs text-text-tertiary hover:text-text-primary min-h-8" onClick={() => onReschedule(task.id)}>
              Reschedule today
            </button>
            <button type="button" className="text-xs text-text-tertiary hover:text-text-primary min-h-8" onClick={() => onPriority(task.id, "high")}>
              High
            </button>
            <button type="button" className="text-xs text-text-tertiary hover:text-text-primary min-h-8" onClick={() => onArchive(task.id)}>
              Archive
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

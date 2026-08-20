"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { ProgressBar } from "@/components/core/progress-bar";
import { Breadcrumbs, CompactContext } from "@/components/core/breadcrumbs";
import { ProjectCard } from "./project-card";
import { ProjectComposer } from "./project-composer";
import { ActivityFeed } from "./activity-feed";
import { ConfirmArchive } from "./confirm-archive";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { computeGoalProgress, computeMilestoneProgress } from "@/domain/progress";
import { classifyDeadline, deadlineLabel } from "@/domain/deadlines";
import { GOAL_STATUS_LABELS, canTransitionGoal } from "@/domain/goal/status";
import { GOAL_STATUSES } from "@/domain/types";
import { activityForEntity } from "@/domain/activity";
import { cn } from "@/lib/utils";

export function GoalDetail({ goalId }: { goalId: string }) {
  const router = useRouter();
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const activity = useWorkspaceStore((s) => s.activity);
  const updateGoal = useWorkspaceStore((s) => s.updateGoal);
  const archiveGoal = useWorkspaceStore((s) => s.archiveGoal);
  const createMilestone = useWorkspaceStore((s) => s.createMilestone);
  const updateMilestone = useWorkspaceStore((s) => s.updateMilestone);
  const createProject = useWorkspaceStore((s) => s.createProject);
  const unlinkGoal = useTaskStore((s) => s.unlinkGoal);
  const tasks = useTaskStore((s) => s.tasks);

  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const goal = goals.find((item) => item.id === goalId);
  const [title, setTitle] = React.useState(goal?.title ?? "");
  const [description, setDescription] = React.useState(goal?.description ?? "");
  const [msTitle, setMsTitle] = React.useState("");
  const [projectOpen, setProjectOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);

  if (!hydrated) {
    return <div className="px-4 py-8 text-sm text-text-tertiary">Loading…</div>;
  }

  if (!goal) {
    return (
      <div className="px-4 py-8">
        <p className="text-sm text-text-secondary">This goal is not available.</p>
      </div>
    );
  }

  const goalMilestones = milestones
    .filter((m) => m.goalId === goal.id && m.status !== "archived")
    .sort((a, b) => a.order - b.order);
  const goalProjects = projects.filter(
    (p) => p.goalId === goal.id && p.status !== "archived"
  );
  const progress = computeGoalProgress(goal, milestones, projects, tasks);
  const taskCount = tasks.filter(
    (t) =>
      t.status !== "archived" &&
      (t.goalId === goal.id || goalProjects.some((p) => p.id === t.projectId))
  );
  const activeTasks = taskCount.filter((t) => t.status !== "completed");
  const deadline = classifyDeadline(goal.targetDate, goal.status, new Date());
  const events = activityForEntity(
    activity,
    goal.id,
    [...goalMilestones.map((m) => m.id), ...goalProjects.map((p) => p.id)]
  );

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 lg:py-8">
      <CompactContext label="Goals" href="/goals" />
      <Breadcrumbs
        crumbs={[
          { label: "Goals", href: "/goals" },
          { label: goal.title },
        ]}
        className="mb-3"
      />

      <header className="mb-6">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (title.trim() && title.trim() !== goal.title) {
              void updateGoal(goal.id, { title: title.trim() });
            }
          }}
          className="text-2xl font-bold h-auto border-0 px-0 focus-visible:ring-0"
        />
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={() => {
            const next = description.trim() || null;
            if ((next || undefined) !== goal.description) {
              void updateGoal(goal.id, { description: next });
            }
          }}
          placeholder="Why this matters"
          rows={2}
          className="mt-2 border-0 px-0 focus-visible:ring-0"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <select
            value={goal.status}
            onChange={(event) =>
              void updateGoal(goal.id, { status: event.target.value as typeof goal.status })
            }
            className="h-9 rounded-md border border-border-primary bg-bg-primary px-2 text-sm"
          >
            {GOAL_STATUSES.map((status) => (
              <option key={status} value={status} disabled={!canTransitionGoal(goal.status, status)}>
                {GOAL_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {goal.targetDate && (
            <span>
              {format(goal.targetDate, "MMM d, yyyy")}
              {deadline !== "none" ? ` · ${deadlineLabel(deadline)}` : ""}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
            Archive
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={progress} className="flex-1 max-w-md" />
          <span className="text-lg font-semibold tabular-nums text-text-primary">{progress}%</span>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          {goalMilestones.length} milestones · {goalProjects.length} projects · {activeTasks.length}{" "}
          active tasks
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-4">
          Milestones
        </h2>
        <ol className="space-y-0">
          {goalMilestones.map((milestone, index) => {
            const msProgress = computeMilestoneProgress(milestone, projects, tasks);
            const done = milestone.status === "completed";
            return (
              <li key={milestone.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full border mt-1.5",
                      done
                        ? "bg-status-success border-status-success"
                        : milestone.status === "active"
                          ? "bg-interactive-primary border-interactive-primary"
                          : "border-border-secondary bg-bg-elevated"
                    )}
                  />
                  {index < goalMilestones.length - 1 && (
                    <span className="w-px flex-1 bg-border-primary my-1" />
                  )}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm font-medium", done && "text-text-secondary")}>
                      {milestone.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] tabular-nums text-text-tertiary">{msProgress}%</span>
                      {milestone.status !== "completed" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void updateMilestone(milestone.id, { status: "completed" })}
                        >
                          Complete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <ProgressBar value={msProgress} className="mt-1 max-w-xs" />
                </div>
              </li>
            );
          })}
        </ol>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!msTitle.trim()) return;
            void createMilestone({ goalId: goal.id, title: msTitle.trim() });
            setMsTitle("");
          }}
        >
          <Input
            value={msTitle}
            onChange={(event) => setMsTitle(event.target.value)}
            placeholder="Add a milestone"
          />
          <Button type="submit" variant="secondary" disabled={!msTitle.trim()}>
            Add
          </Button>
        </form>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Projects
          </h2>
          <Button size="sm" onClick={() => setProjectOpen(true)}>
            <Plus className="h-4 w-4" />
            Project
          </Button>
        </div>
        {goalProjects.length === 0 ? (
          <p className="text-sm text-text-tertiary">No projects on this goal yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {goalProjects.map((project) => (
              <ProjectCard key={project.id} project={project} tasks={tasks} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-3">
          Recent activity
        </h2>
        <ActivityFeed events={events} />
      </section>

      <ProjectComposer
        key={projectOpen ? "open" : "closed"}
        open={projectOpen}
        onOpenChange={setProjectOpen}
        preset={{ goalId: goal.id }}
        onSubmit={async (input) => {
          await createProject({ ...input, goalId: goal.id });
        }}
      />

      <ConfirmArchive
        open={confirm}
        title="Archive this goal?"
        description="Projects and milestones stay. Completing or archiving a goal does not complete its children."
        unlinkLabel="Detach projects, then archive"
        onArchive={() => {
          void archiveGoal(goal.id, false);
          setConfirm(false);
          router.push("/goals");
        }}
        onUnlink={() => {
          void unlinkGoal(goal.id);
          void archiveGoal(goal.id, true);
          setConfirm(false);
          router.push("/goals");
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}

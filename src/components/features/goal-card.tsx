"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { Goal, Milestone, Project, Task } from "@/domain/types";
import { computeGoalProgress } from "@/domain/progress";
import { classifyDeadline, deadlineLabel } from "@/domain/deadlines";
import { ProgressBar } from "@/components/core/progress-bar";
import { GOAL_STATUS_LABELS } from "@/domain/goal/status";
import { cn } from "@/lib/utils";

export function GoalCard({
  goal,
  milestones,
  projects,
  tasks,
  now = new Date(),
}: {
  goal: Goal;
  milestones: Milestone[];
  projects: Project[];
  tasks: Task[];
  now?: Date;
}) {
  const progress = computeGoalProgress(goal, milestones, projects, tasks);
  const ms = milestones.filter((item) => item.goalId === goal.id && item.status !== "archived");
  const pr = projects.filter((item) => item.goalId === goal.id && item.status !== "archived");
  const deadline = classifyDeadline(goal.targetDate, goal.status, now);

  return (
    <Link
      href={`/goals/${goal.id}`}
      className={cn(
        "block py-4 border-b border-border-primary/80 hover:bg-bg-tertiary/30 transition-colors duration-fast",
        goal.accent === "purple" && "border-l-2 border-l-accent-purple",
        goal.accent === "pink" && "border-l-2 border-l-accent-pink",
        goal.accent === "orange" && "border-l-2 border-l-accent-orange",
        goal.accent === "teal" && "border-l-2 border-l-accent-teal",
        goal.accent === "indigo" && "border-l-2 border-l-accent-indigo"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">{goal.title}</h3>
        <span className="text-[11px] text-text-tertiary">{GOAL_STATUS_LABELS[goal.status]}</span>
      </div>
      {goal.description && (
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">{goal.description}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={progress} className="flex-1" />
        <span className="text-sm tabular-nums text-text-secondary">{progress}%</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-text-tertiary">
        <span>
          {ms.length} milestone{ms.length === 1 ? "" : "s"}
        </span>
        <span>
          {pr.length} project{pr.length === 1 ? "" : "s"}
        </span>
        {goal.targetDate && (
          <span>
            {format(goal.targetDate, "MMM d")}
            {deadline !== "none" && deadline !== "completed" ? ` · ${deadlineLabel(deadline)}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

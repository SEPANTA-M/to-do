"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { Project, Task } from "@/domain/types";
import { computeProjectProgress, countProjectTasks } from "@/domain/progress";
import { classifyDeadline, deadlineLabel } from "@/domain/deadlines";
import { ProgressBar } from "@/components/core/progress-bar";
import { PROJECT_STATUS_LABELS } from "@/domain/project/status";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  tasks,
  now = new Date(),
}: {
  project: Project;
  tasks: Task[];
  now?: Date;
}) {
  const progress = computeProjectProgress(project, tasks);
  const counts = countProjectTasks(project.id, tasks);
  const deadline = classifyDeadline(project.targetDate, project.status, now);

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "block py-3 border-b border-border-primary/80 hover:bg-bg-tertiary/40 transition-colors duration-fast",
        project.accent === "purple" && "border-l-2 border-l-accent-purple",
        project.accent === "pink" && "border-l-2 border-l-accent-pink",
        project.accent === "orange" && "border-l-2 border-l-accent-orange",
        project.accent === "teal" && "border-l-2 border-l-accent-teal",
        project.accent === "indigo" && "border-l-2 border-l-accent-indigo",
        project.priority === "critical" && !project.accent && "border-l-2 border-l-status-error"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary truncate">{project.name}</h3>
        <span className="text-[11px] text-text-tertiary flex-shrink-0">
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <ProgressBar value={progress} className="flex-1" />
        <span className="text-[11px] tabular-nums text-text-secondary">{progress}%</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
        <span>
          {counts.completed}/{counts.total} tasks
        </span>
        {project.targetDate && (
          <span>
            {format(project.targetDate, "MMM d")}
            {deadline !== "none" && deadline !== "completed" ? ` · ${deadlineLabel(deadline)}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

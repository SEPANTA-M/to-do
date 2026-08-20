"use client";

import Link from "next/link";
import { EmptyState } from "@/components/core/empty-state";
import { PageSkeleton } from "@/components/core/skeleton";
import { ProgressBar } from "@/components/core/progress-bar";
import { SectionLabel } from "@/components/core/section-label";
import { Button } from "@/components/primitives/button";
import { useTaskStore } from "@/state/task-store";
import { useFocusStore } from "@/state/focus-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { computeInsights } from "@/domain/insights/compute";

export function InsightsView() {
  const tasks = useTaskStore((s) => s.tasks);
  const history = useTaskStore((s) => s.history);
  const hydrated = useTaskStore((s) => s.hydrated);
  const sessions = useFocusStore((s) => s.sessions);
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);

  if (!hydrated) return <PageSkeleton />;

  const report = computeInsights(new Date(), tasks, history, sessions, projects, goals, milestones);
  const hasAnyWork = tasks.some((task) => task.status === "completed") || sessions.some((s) => (s.duration ?? 0) > 0);

  return (
    <div className="container max-w-3xl mx-auto px-5 py-10 lg:px-0">
      <p className="label-caps mb-2">Insights</p>
      <h1 className="text-xl font-medium tracking-tight text-text-primary mb-8">
        How the work actually went
      </h1>

      {!hasAnyWork && (
        <EmptyState
          title="Not enough data yet."
          description="Complete real work. Analytics read from history — nothing is invented here."
        />
      )}

      <div className="space-y-10">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {report.metrics.map((metric) => (
            <div key={metric.key}>
              <SectionLabel>{metric.label}</SectionLabel>
              {metric.available ? (
                <>
                  <p className="text-2xl font-medium tracking-tight text-text-primary font-mono">
                    {metric.value}
                  </p>
                  {metric.detail && (
                    <p className="mt-1 text-xs text-text-tertiary">{metric.detail}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed">{metric.requirement}</p>
              )}
            </div>
          ))}
        </section>

        {report.projectProgress.length > 0 && (
          <section>
            <SectionLabel>Projects</SectionLabel>
            <ul className="space-y-4">
              {report.projectProgress.map((project) => (
                <li key={project.id}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <Link href={`/projects/${project.id}`} className="text-sm text-text-primary hover:text-interactive-primary">
                      {project.name}
                    </Link>
                    <span className="font-mono text-xs text-text-tertiary">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.goalProgress.length > 0 && (
          <section>
            <SectionLabel>Goals</SectionLabel>
            <ul className="space-y-4">
              {report.goalProgress.map((goal) => (
                <li key={goal.id}>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <Link href={`/goals/${goal.id}`} className="text-sm text-text-primary hover:text-interactive-primary">
                      {goal.title}
                    </Link>
                    <span className="font-mono text-xs text-text-tertiary">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/review">Weekly review</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

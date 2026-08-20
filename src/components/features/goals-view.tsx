"use client";

import * as React from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { EmptyState } from "@/components/core/empty-state";
import { GoalCard } from "./goal-card";
import { GoalComposer } from "./goal-composer";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { searchGoals } from "@/domain/search";

export function GoalsView() {
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const createGoal = useWorkspaceStore((s) => s.createGoal);
  const tasks = useTaskStore((s) => s.tasks);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  if (!hydrated) {
    return <div className="px-4 py-8 text-sm text-text-tertiary">Loading goals…</div>;
  }

  const visible = searchGoals(goals, query);
  const active = visible.filter((g) => g.status === "active" || g.status === "paused" || g.status === "draft");
  const upcoming = visible.filter((g) => g.status === "draft");
  const completed = visible.filter((g) => g.status === "completed");
  const working = visible.filter((g) => g.status === "active" || g.status === "paused");

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-primary mb-1">Goals</h1>
          <p className="text-sm text-text-secondary">Why the work exists.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New goal
        </Button>
      </header>

      <Input
        placeholder="Search goals"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-6 max-w-sm"
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="No goals yet"
          description="Name the outcome. Projects and tasks will hang from it."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Create goal
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {working.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Active
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {working.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    milestones={milestones}
                    projects={projects}
                    tasks={tasks}
                  />
                ))}
              </div>
            </section>
          )}
          {upcoming.length > 0 && working.length === 0 && null}
          {active.filter((g) => g.status === "draft").length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Upcoming
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {active
                  .filter((g) => g.status === "draft")
                  .map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      milestones={milestones}
                      projects={projects}
                      tasks={tasks}
                    />
                  ))}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Completed
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {completed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    milestones={milestones}
                    projects={projects}
                    tasks={tasks}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <GoalComposer
        key={open ? "open" : "closed"}
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (input) => {
          await createGoal(input);
        }}
      />
    </div>
  );
}

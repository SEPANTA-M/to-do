"use client";

import * as React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { EmptyState } from "@/components/core/empty-state";
import { ProjectCard } from "./project-card";
import { ProjectComposer } from "./project-composer";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { searchProjects } from "@/domain/search";
import type { ProjectStatus } from "@/domain/types";

type SortKey = "manual" | "name" | "deadline" | "priority";

export function ProjectsView() {
  const projects = useWorkspaceStore((s) => s.projects);
  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const createProject = useWorkspaceStore((s) => s.createProject);
  const tasks = useTaskStore((s) => s.tasks);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus | "all">("all");
  const [sort, setSort] = React.useState<SortKey>("manual");
  const [open, setOpen] = React.useState(false);

  if (!hydrated) {
    return <div className="px-4 py-8 text-sm text-text-tertiary">Loading projects…</div>;
  }

  let visible = searchProjects(projects, query);
  if (status !== "all") visible = visible.filter((p) => p.status === status);

  visible = [...visible].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "deadline") {
      return (a.targetDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (b.targetDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
    }
    if (sort === "priority") {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[a.priority] - rank[b.priority];
    }
    return a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime();
  });

  const active = visible.filter((p) => p.status === "active" || p.status === "planned" || p.status === "paused");
  const rest = visible.filter((p) => p.status === "completed");

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-primary mb-1">Projects</h1>
          <p className="text-sm text-text-secondary">What you are building.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus | "all")}
          className="h-11 rounded border border-border-secondary bg-bg-field px-3 text-sm text-text-primary"
        >
          <option value="all">All statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="h-11 rounded border border-border-secondary bg-bg-field px-3 text-sm text-text-primary"
        >
          <option value="manual">Manual</option>
          <option value="name">Name</option>
          <option value="priority">Priority</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-16 w-16" />}
          title="No projects yet"
          description="A project can stand alone, or hang from a goal."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} tasks={tasks} />
            ))}
          </div>
          {rest.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-3">
                Completed
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((project) => (
                  <ProjectCard key={project.id} project={project} tasks={tasks} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ProjectComposer
        key={open ? "open" : "closed"}
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (input) => {
          await createProject(input);
        }}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/core/empty-state";
import { PageSkeleton } from "@/components/core/skeleton";
import { ProgressBar } from "@/components/core/progress-bar";
import { Button } from "@/components/primitives/button";
import { useTaskStore } from "@/state/task-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useUiStore } from "@/state/ui-store";
import { buildLifeMap, type LifeMapNode } from "@/domain/lifemap/tree";
import { cn } from "@/lib/utils";

export function LifeMapView() {
  const router = useRouter();
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const openInspector = useUiStore((s) => s.openInspector);

  const tree = React.useMemo(
    () => buildLifeMap(goals, milestones, projects, tasks),
    [goals, milestones, projects, tasks]
  );

  const [expanded, setExpanded] = React.useState<Set<string> | null>(null);
  const [selected, setSelected] = React.useState<LifeMapNode | null>(null);
  const [pan, setPan] = React.useState({ x: 24, y: 24, scale: 1 });
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const openSet = expanded ?? new Set(tree.map((node) => node.id));

  if (!hydrated) return <PageSkeleton />;

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current ?? tree.map((node) => node.id));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openNode = (node: LifeMapNode) => {
    if (node.kind === "task") {
      openInspector(node.id);
      router.push("/tasks");
      return;
    }
    router.push(node.href);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="px-5 pt-8 pb-4 lg:px-10 lg:pt-10 flex items-start justify-between gap-3">
          <div>
            <p className="label-caps mb-2">Life map</p>
            <h1 className="text-xl font-medium tracking-tight text-text-primary">
              Why the work exists
            </h1>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPan((p) => ({ ...p, scale: Math.min(1.8, p.scale + 0.1) }))}>
              Zoom in
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPan((p) => ({ ...p, scale: Math.max(0.6, p.scale - 0.1) }))}>
              Zoom out
            </Button>
          </div>
        </header>
        {tree.length === 0 ? (
          <div className="px-5 lg:px-10">
            <EmptyState
              title="No map yet."
              description="Create a goal or a project. This view never invents nodes."
            />
          </div>
        ) : (
          <div
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              drag.current = { x: pan.x, y: pan.y, px: event.clientX, py: event.clientY };
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              setPan((p) => ({
                ...p,
                x: drag.current!.x + (event.clientX - drag.current!.px),
                y: drag.current!.y + (event.clientY - drag.current!.py),
              }));
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onWheel={(event) => {
              event.preventDefault();
              const delta = event.deltaY > 0 ? -0.06 : 0.06;
              setPan((p) => ({ ...p, scale: Math.min(1.8, Math.max(0.6, p.scale + delta)) }));
            }}
          >
            <div
              className="origin-top-left px-5 pb-20"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${pan.scale})` }}
            >
              {tree.map((node) => (
                <MapBranch
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={openSet}
                  selectedId={selected?.id}
                  onToggle={toggle}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {selected && (
        <aside className="hidden lg:flex w-80 flex-col border-l border-border-primary px-5 py-8">
          <p className="label-caps mb-2">{selected.kind}</p>
          <h2 className="text-lg font-medium text-text-primary mb-3">{selected.title}</h2>
          <p className="text-xs text-text-tertiary font-mono mb-4">{selected.status}</p>
          <ProgressBar value={selected.progress} />
          <p className="mt-2 font-mono text-xs text-text-tertiary">{selected.progress}%</p>
          <Button className="mt-6" size="sm" onClick={() => openNode(selected)}>
            Open
          </Button>
        </aside>
      )}
    </div>
  );
}

function MapBranch({
  node,
  depth,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: LifeMapNode;
  depth: number;
  expanded: Set<string>;
  selectedId?: string;
  onToggle: (id: string) => void;
  onSelect: (node: LifeMapNode) => void;
}) {
  const open = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  return (
    <div className="mb-1" style={{ marginLeft: depth * 20 }}>
      <button
        type="button"
        onClick={() => {
          onSelect(node);
          if (hasChildren) onToggle(node.id);
        }}
        className={cn(
          "flex items-center gap-2 min-h-9 px-2 py-1 rounded text-left w-full max-w-xl",
          selectedId === node.id ? "bg-bg-tertiary" : "hover:bg-bg-secondary"
        )}
      >
        <span className="w-3 text-[11px] text-text-tertiary font-mono">
          {hasChildren ? (open ? "–" : "+") : "·"}
        </span>
        <span className="label-caps w-16 mb-0">{node.kind}</span>
        <span className="text-sm text-text-primary truncate">{node.title}</span>
        <span className="ml-auto font-mono text-[11px] text-text-tertiary">{node.progress}%</span>
      </button>
      {open &&
        hasChildren &&
        node.children.map((child) => (
          <MapBranch
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            selectedId={selectedId}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

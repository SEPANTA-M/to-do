"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { CommandPalette } from "@/components/features/command-palette";
import { TaskProvider } from "@/components/providers/task-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { QuickCapture } from "@/components/features/quick-capture";
import { TaskComposer } from "@/components/features/task-composer";
import { Onboarding } from "@/components/features/onboarding";
import { Button } from "@/components/primitives/button";
import { useTaskStore } from "@/state/task-store";
import { useUiStore } from "@/state/ui-store";
import { detectConflicts } from "@/domain/task/conflicts";
import { useWorkspaceStore } from "@/state/workspace-store";
import { recordActivity } from "@/domain/activity";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const pathname = usePathname();
  const composerOpen = useUiStore((state) => state.composerOpen);
  const composerDefaults = useUiStore((state) => state.composerDefaults);
  const openComposer = useUiStore((state) => state.openComposer);
  const closeComposer = useUiStore((state) => state.closeComposer);
  const createTask = useTaskStore((state) => state.createTask);
  const record = useWorkspaceStore((state) => state.record);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const error = useTaskStore((state) => state.error);
  const retryPersist = useTaskStore((state) => state.retryPersist);
  const immersive = pathname === "/focus";

  return (
    <TaskProvider>
      <PwaProvider>
        <NotificationsProvider>
          <div className="min-h-screen bg-bg-primary">
            {!immersive && <Sidebar onNewTask={() => openComposer()} />}

            <div
              className={cn(
                immersive
                  ? ""
                  : sidebarCollapsed
                    ? "lg:pl-14 transition-[padding] duration-base"
                    : "lg:pl-[13.75rem] transition-[padding] duration-base"
              )}
            >
              {!immersive && <Header onCommandOpen={() => setCommandOpen(true)} />}

              <main className={immersive ? "" : "pb-16 lg:pb-0"}>
                {error && (
                  <div
                    role="alert"
                    className="mx-4 mt-3 lg:mx-8 rounded border border-status-error/25 bg-status-error-subtle px-3 py-2 text-sm text-text-primary flex items-center justify-between gap-3"
                  >
                    <span>Unable to save changes. Your local changes are safe.</span>
                    <Button size="sm" variant="secondary" onClick={() => void retryPersist()}>
                      Retry
                    </Button>
                  </div>
                )}
                {pathname === "/" && <Onboarding />}
                {children}
              </main>
            </div>

            {!immersive && <MobileNav />}
            {!immersive && <QuickCapture />}

            <CommandPalette
              open={commandOpen}
              onOpenChange={setCommandOpen}
              onNewTask={() => openComposer()}
            />

            <TaskComposer
              key={
                composerOpen
                  ? `${composerDefaults?.startTime?.toISOString() ?? "new"}-${composerDefaults?.title ?? ""}`
                  : "closed"
              }
              open={composerOpen}
              onOpenChange={(open) =>
                open ? openComposer(composerDefaults ?? undefined) : closeComposer()
              }
              onSubmit={async (input) => {
                const created = await createTask(input);
                if (created.projectId) {
                  await record(
                    recordActivity(
                      "task_added",
                      "task",
                      created.id,
                      `Task added: ${created.title}`
                    )
                  );
                }
                if (!created.startTime) return;
                const conflicts = detectConflicts(created, useTaskStore.getState().tasks);
                if (conflicts.length > 0) {
                  useUiStore.getState().setPendingConflict({
                    taskId: created.id,
                    proposed: created,
                    conflicts,
                    kind: "create",
                  });
                }
              }}
              defaults={composerDefaults}
            />
          </div>
        </NotificationsProvider>
      </PwaProvider>
    </TaskProvider>
  );
}

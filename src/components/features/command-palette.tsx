"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import {
  Search,
  Inbox,
  ListTodo,
  Target,
  Calendar,
  StickyNote,
  Settings,
  Moon,
  Sun,
  Monitor,
  Plus,
  FolderKanban,
  Zap,
  BarChart3,
  Map,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PANEL_CLASS } from "@/lib/surfaces";
import { useThemeStore } from "@/state/theme-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { useNotesStore } from "@/state/notes-store";
import { useCalendarStore } from "@/state/calendar-store";
import { useUiStore } from "@/state/ui-store";
import { searchAll } from "@/domain/search";
import { useT } from "@/i18n/use-t";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTask?: () => void;
}

export function CommandPalette({ open, onOpenChange, onNewTask }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const t = useT();
  const [search, setSearch] = React.useState("");
  const goals = useWorkspaceStore((s) => s.goals);
  const projects = useWorkspaceStore((s) => s.projects);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const tasks = useTaskStore((s) => s.tasks);
  const notes = useNotesStore((s) => s.notes);
  const events = useCalendarStore((s) => s.events);
  const openInspector = useUiStore((s) => s.openInspector);
  const openComposer = useUiStore((s) => s.openComposer);

  const results = React.useMemo(
    () =>
      search.trim()
        ? searchAll(search, { tasks, projects, goals, milestones, notes, events })
        : { tasks: [], projects: [], goals: [], milestones: [], notes: [], events: [] },
    [search, tasks, projects, goals, milestones, notes, events]
  );

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (!next) setSearch("");
    onOpenChange(next);
  }, [onOpenChange]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, handleOpenChange]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      handleOpenChange(false);
      command();
    },
    [handleOpenChange]
  );

  return (
    <CommandPrimitive.Dialog
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="fixed inset-0 z-[9990] bg-black/55"
      contentClassName={cn(
        "fixed left-[50%] top-[18%] z-[10000] w-full max-w-xl translate-x-[-50%]",
        "overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700",
        PANEL_CLASS
      )}
      className={PANEL_CLASS}
      label="Command Menu"
    >
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-500" />
          <CommandPrimitive.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t("command.search")}
            className="flex h-11 w-full bg-transparent text-sm text-neutral-950 dark:text-neutral-50 outline-none placeholder:text-neutral-500"
          />
        </div>

        <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-text-secondary">
            {t("command.empty")}
          </CommandPrimitive.Empty>

          <CommandPrimitive.Group heading="Create" className="mb-2">
            <CommandGroupHeading>{t("command.create")}</CommandGroupHeading>
            <CommandItem onSelect={() => runCommand(() => (onNewTask ? onNewTask() : openComposer()))}>
              <Plus className="mr-2 h-4 w-4" />
              {t("action.newTask")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes"))}>
              <StickyNote className="mr-2 h-4 w-4" />
              {t("action.createNote")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              Create event
            </CommandItem>
          </CommandPrimitive.Group>

          {results.tasks.length > 0 && (
            <CommandPrimitive.Group heading="Tasks" className="mb-2">
              <CommandGroupHeading>Tasks</CommandGroupHeading>
              {results.tasks.slice(0, 6).map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() =>
                    runCommand(() => {
                      openInspector(task.id);
                      router.push("/tasks");
                    })
                  }
                >
                  <ListTodo className="mr-2 h-4 w-4" />
                  {task.title}
                </CommandItem>
              ))}
            </CommandPrimitive.Group>
          )}

          {results.projects.length > 0 && (
            <CommandPrimitive.Group heading="Projects" className="mb-2">
              <CommandGroupHeading>Projects</CommandGroupHeading>
              {results.projects.slice(0, 6).map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  {project.name}
                </CommandItem>
              ))}
            </CommandPrimitive.Group>
          )}

          {results.goals.length > 0 && (
            <CommandPrimitive.Group heading="Goals" className="mb-2">
              <CommandGroupHeading>Goals</CommandGroupHeading>
              {results.goals.slice(0, 6).map((goal) => (
                <CommandItem
                  key={goal.id}
                  onSelect={() => runCommand(() => router.push(`/goals/${goal.id}`))}
                >
                  <Target className="mr-2 h-4 w-4" />
                  {goal.title}
                </CommandItem>
              ))}
            </CommandPrimitive.Group>
          )}

          {results.notes.length > 0 && (
            <CommandPrimitive.Group heading="Notes" className="mb-2">
              <CommandGroupHeading>Notes</CommandGroupHeading>
              {results.notes.slice(0, 6).map((note) => (
                <CommandItem
                  key={note.id}
                  onSelect={() => runCommand(() => router.push("/notes"))}
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  {note.title || note.content.slice(0, 40)}
                </CommandItem>
              ))}
            </CommandPrimitive.Group>
          )}

          {results.events.length > 0 && (
            <CommandPrimitive.Group heading="Events" className="mb-2">
              <CommandGroupHeading>Calendar</CommandGroupHeading>
              {results.events.slice(0, 6).map((event) => (
                <CommandItem
                  key={event.id}
                  onSelect={() => runCommand(() => router.push("/calendar"))}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.title}
                </CommandItem>
              ))}
            </CommandPrimitive.Group>
          )}

          <CommandPrimitive.Group heading="Navigation" className="mb-2">
            <CommandGroupHeading>{t("command.navigation")}</CommandGroupHeading>
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Inbox className="mr-2 h-4 w-4" />
              {t("nav.today")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tasks"))}>
              <ListTodo className="mr-2 h-4 w-4" />
              {t("command.allTasks")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/projects"))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              {t("nav.projects")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/goals"))}>
              <Target className="mr-2 h-4 w-4" />
              {t("nav.goals")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/focus"))}>
              <Zap className="mr-2 h-4 w-4" />
              {t("nav.focus")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              {t("nav.calendar")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/life-map"))}>
              <Map className="mr-2 h-4 w-4" />
              {t("nav.lifeMap")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/insights"))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {t("nav.insights")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/review"))}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {t("nav.review")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notes"))}>
              <StickyNote className="mr-2 h-4 w-4" />
              {t("nav.notes")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.settings")}
            </CommandItem>
          </CommandPrimitive.Group>

          <CommandPrimitive.Separator className="h-[1px] bg-border-primary my-2" />

          <CommandPrimitive.Group heading="Theme">
            <CommandGroupHeading>{t("command.theme")}</CommandGroupHeading>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              {t("settings.light")}
              {theme === "light" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              {t("settings.dark")}
              {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Monitor className="mr-2 h-4 w-4" />
              System
              {theme === "system" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
          </CommandPrimitive.Group>
        </CommandPrimitive.List>
    </CommandPrimitive.Dialog>
  );
}

function CommandGroupHeading({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-1.5 label-caps">{children}</div>;
}

function CommandItem({ onSelect, children }: { onSelect: () => void; children: React.ReactNode }) {
  return (
    <CommandPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm px-2 py-2 text-[13px]",
        "text-text-primary outline-none transition-colors duration-fast",
        "hover:bg-bg-tertiary data-[selected=true]:bg-bg-tertiary",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      )}
    >
      {children}
    </CommandPrimitive.Item>
  );
}

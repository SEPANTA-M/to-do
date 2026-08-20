"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Label } from "@/components/primitives/label";
import type { SchedulingBehavior, TaskPriority, TaskReminder } from "@/domain/types";
import { parseTaskText } from "@/domain/task/parser";
import { atTimeOnDate } from "@/domain/task/time";
import type { CreateTaskInput } from "@/domain/task/factory";
import type { ComposerDefaults } from "@/state/ui-store";
import { HierarchyPicker, type HierarchyValue } from "./hierarchy-picker";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useSettingsStore } from "@/state/settings-store";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/use-t";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];

interface TaskComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => Promise<void> | void;
  defaults?: ComposerDefaults | null;
}

export function TaskComposer({
  open,
  onOpenChange,
  onSubmit,
  defaults,
}: TaskComposerProps) {
  const t = useT();
  const defaultDuration = useSettingsStore((s) => s.settings.defaultDurationMinutes);
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);

  const [title, setTitle] = React.useState(defaults?.title ?? "");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = React.useState(
    defaults?.date ? format(defaults.date, "yyyy-MM-dd") : ""
  );
  const [startTime, setStartTime] = React.useState(
    defaults?.startTime ? format(defaults.startTime, "HH:mm") : ""
  );
  const [duration, setDuration] = React.useState(
    String(defaults?.estimatedDuration ?? defaultDuration ?? 30)
  );
  const [tags, setTags] = React.useState("");
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [behavior, setBehavior] = React.useState<SchedulingBehavior>("flexible");
  const [showMore, setShowMore] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hierarchy, setHierarchy] = React.useState<HierarchyValue>({
    projectId: defaults?.projectId,
    goalId: defaults?.goalId,
  });
  const inputRef = React.useRef<HTMLInputElement>(null);

  const fromTimeline = Boolean(defaults?.startTime || defaults?.prompt);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  const parsed = React.useMemo(() => parseTaskText(title), [title]);
  const showParseHint =
    title.trim().length > 0 &&
    (parsed.startTime || parsed.dueDate || parsed.estimatedDuration || parsed.priority);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const raw = title.trim();
    if (!raw || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsedNow = parseTaskText(raw);
      const resolvedTitle = parsedNow.title || raw;

      let start: Date | undefined;
      if (startTime) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const base = dueDate
          ? new Date(`${dueDate}T00:00:00`)
          : defaults?.date ?? defaults?.startTime ?? new Date();
        start = atTimeOnDate(base, hours, minutes);
      } else if (parsedNow.startTime && !dueDate && !startTime) {
        start = parsedNow.startTime;
      } else if (defaults?.startTime && !startTime) {
        start = defaults.startTime;
      }

      let due: Date | undefined;
      if (dueDate) {
        due = new Date(`${dueDate}T00:00:00`);
      } else if (parsedNow.dueDate && !dueDate) {
        due = parsedNow.dueDate;
      } else if (start) {
        due = new Date(start);
        due.setHours(0, 0, 0, 0);
      }

      const estimatedDuration = duration
        ? parseInt(duration, 10)
        : parsedNow.estimatedDuration;

      const reminder: TaskReminder | undefined = reminderEnabled
        ? {
            enabled: true,
            offsetMinutes: 10,
            remindAt: start ? new Date(start.getTime() - 10 * 60_000) : undefined,
          }
        : undefined;

      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await onSubmit({
        title: resolvedTitle,
        description: description.trim() || undefined,
        priority: parsedNow.priority ?? priority,
        dueDate: due,
        startTime: start,
        estimatedDuration: Number.isFinite(estimatedDuration) ? estimatedDuration : undefined,
        tags: [...(parsedNow.tags ?? []), ...tagList],
        reminder,
        recurrence: parsedNow.recurrence,
        schedulingBehavior: behavior,
        projectId: hierarchy.projectId,
        goalId: hierarchy.goalId,
        parentTaskId: defaults?.parentTaskId,
      });

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <p className="label-caps mb-1">{t("action.newTask")}</p>
          <DialogTitle className="text-xl font-medium tracking-tight">
            {fromTimeline ? t("composer.schedule") : t("composer.heading")}
          </DialogTitle>
          <DialogDescription>{t("composer.hint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {defaults?.startTime && (
            <p className="font-mono text-xs text-text-tertiary">
              Slot · {format(defaults.startTime, "EEEE d MMM · HH:mm")}
            </p>
          )}

          <section className="space-y-2">
            <Label htmlFor="task-title">{t("field.title")}</Label>
            <Input
              id="task-title"
              ref={inputRef}
              placeholder={t("composer.placeholder")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoComplete="off"
              required
            />
            {showParseHint && (
              <p className="text-xs text-text-secondary">
                {t("composer.readsAs")}{" "}
                <span className="text-text-primary">
                  {parsed.title !== title.trim() ? parsed.title : title.trim()}
                </span>
                {parsed.startTime ? ` · ${format(parsed.startTime, "EEE HH:mm")}` : ""}
                {parsed.dueDate && !parsed.startTime ? ` · ${format(parsed.dueDate, "EEE d MMM")}` : ""}
                {parsed.estimatedDuration ? ` · ${parsed.estimatedDuration} min` : ""}
                {parsed.priority ? ` · ${parsed.priority}` : ""}
              </p>
            )}
          </section>

          <section>
            <p className="label-caps mb-2">{t("field.when")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-date">{t("field.date")}</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-time">{t("field.time")}</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-duration">{t("field.duration")}</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <p className="label-caps mb-2">{t("field.priority")}</p>
            <div className="grid grid-cols-4 gap-1">
              {PRIORITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={priority === item}
                  onClick={() => setPriority(item)}
                  className={cn(
                    "h-11 rounded text-xs font-medium border transition-colors duration-fast",
                    priority === item
                      ? "bg-bg-tertiary text-text-primary border-border-secondary"
                      : "bg-bg-field text-text-secondary border-border-secondary hover:text-text-primary"
                  )}
                >
                  {t(`priority.${item}`)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="label-caps mb-2">{t("field.belongs")}</p>
            <HierarchyPicker
              goals={goals}
              milestones={milestones}
              projects={projects}
              value={hierarchy}
              onChange={setHierarchy}
            />
          </section>

          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="text-xs text-text-tertiary hover:text-text-primary min-h-9"
            >
              {t("composer.more")}
            </button>
          ) : (
            <section className="space-y-3 border-t border-border-primary pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-description">{t("field.description")}</Label>
                <Textarea
                  id="task-description"
                  placeholder="Context, links, notes"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-tags">{t("field.tags")}</Label>
                <Input
                  id="task-tags"
                  placeholder="focus, deep-work"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary min-h-11">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(event) => setReminderEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border-primary"
                />
                {t("composer.reminder")}
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary min-h-11">
                <input
                  type="checkbox"
                  checked={behavior === "fixed"}
                  onChange={(event) => setBehavior(event.target.checked ? "fixed" : "flexible")}
                  className="h-4 w-4 rounded border-border-primary"
                />
                Fixed time — do not auto-move
              </label>
            </section>
          )}

          {error && <p className="text-sm text-status-error">{error}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting ? t("action.saving") : t("action.createTask")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

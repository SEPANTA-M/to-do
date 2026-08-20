"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Label } from "@/components/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import type { TaskPriority, TaskReminder } from "@/domain/types";
import { parseTaskText } from "@/domain/task/parser";
import { atTimeOnDate } from "@/domain/task/time";
import type { CreateTaskInput } from "@/domain/task/factory";
import type { ComposerDefaults } from "@/state/ui-store";

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
    String(defaults?.estimatedDuration ?? 30)
  );
  const [tags, setTags] = React.useState("");
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
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
    } else if (parsedNow.startTime && !showDetails) {
      start = parsedNow.startTime;
    } else if (defaults?.startTime && !startTime) {
      start = defaults.startTime;
    }

    let due: Date | undefined;
    if (dueDate) {
      due = new Date(`${dueDate}T00:00:00`);
    } else if (parsedNow.dueDate && !showDetails) {
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
          remindAt: start
            ? new Date(start.getTime() - 10 * 60_000)
            : undefined,
        }
      : undefined;

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    await onSubmit({
      title: resolvedTitle,
      description: description.trim() || undefined,
      priority: showDetails ? priority : parsedNow.priority ?? priority,
      dueDate: due,
      startTime: start,
      estimatedDuration: Number.isFinite(estimatedDuration)
        ? estimatedDuration
        : undefined,
      tags: [...(parsedNow.tags ?? []), ...tagList],
      reminder,
      recurrence: parsedNow.recurrence,
      projectId: defaults?.projectId,
      goalId: defaults?.goalId,
      parentTaskId: defaults?.parentTaskId,
    });

      onOpenChange(false);
    } catch {
      /* keep the dialog open with a usable button */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            {fromTimeline ? "What's happening?" : "Capture"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaults?.startTime && (
            <p className="text-sm text-text-secondary">
              {format(defaults.startTime, "EEEE, MMM d · h:mm a")}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-title" className="sr-only">
              Task title
            </Label>
            <Input
              id="task-title"
              ref={inputRef}
              placeholder={fromTimeline ? "What's happening?" : "What needs to be done?"}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoComplete="off"
            />
            {showParseHint && !showDetails && (
              <p className="text-xs text-text-tertiary">
                {parsed.title !== title.trim() ? `“${parsed.title}”` : null}
                {parsed.startTime ? ` · ${format(parsed.startTime, "EEE h:mm a")}` : null}
                {parsed.dueDate && !parsed.startTime
                  ? ` · ${format(parsed.dueDate, "EEE MMM d")}`
                  : null}
                {parsed.estimatedDuration ? ` · ${parsed.estimatedDuration} min` : null}
                {parsed.priority ? ` · ${parsed.priority}` : null}
              </p>
            )}
          </div>

          {!showDetails && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Add details
            </Button>
          )}

          {showDetails && (
            <div className="space-y-4 pt-1 border-t border-border-primary">
              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Notes, context, links…"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-duration">Duration (min)</Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="task-date">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Date
                  </Label>
                  <Input
                    id="task-date"
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-time">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Start time
                  </Label>
                  <Input
                    id="task-time"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-tags">Tags</Label>
                <Input
                  id="task-tags"
                  placeholder="focus, deep-work"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(event) => setReminderEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-border-primary"
                />
                Remind me 10 minutes before
              </label>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

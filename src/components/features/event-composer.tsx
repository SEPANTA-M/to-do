"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Textarea } from "@/components/primitives/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import type { CalendarEvent, SchedulingBehavior } from "@/domain/types";
import type { CreateEventInput, UpdateEventInput } from "@/domain/calendar/factory";
import { atTimeOnDate } from "@/domain/task/time";

interface EventComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultStart?: Date;
  onCreate: (input: CreateEventInput) => Promise<void>;
  onUpdate?: (id: string, updates: UpdateEventInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EventComposer({
  open,
  onOpenChange,
  event,
  defaultStart,
  onCreate,
  onUpdate,
  onDelete,
}: EventComposerProps) {
  const startDefault = event?.startTime ?? defaultStart ?? new Date();
  const endDefault = event?.endTime ?? new Date(startDefault.getTime() + 30 * 60_000);
  const [title, setTitle] = React.useState(event?.title ?? "");
  const [description, setDescription] = React.useState(event?.description ?? "");
  const [location, setLocation] = React.useState(event?.location ?? "");
  const [date, setDate] = React.useState(format(startDefault, "yyyy-MM-dd"));
  const [start, setStart] = React.useState(format(startDefault, "HH:mm"));
  const [end, setEnd] = React.useState(format(endDefault, "HH:mm"));
  const [allDay, setAllDay] = React.useState(event?.isAllDay ?? false);
  const [behavior, setBehavior] = React.useState<SchedulingBehavior>(
    event?.schedulingBehavior ?? "fixed"
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (eventObj: React.FormEvent) => {
    eventObj.preventDefault();
    if (!title.trim()) {
      setError("Event title is required");
      return;
    }
    setSubmitting(true);
    try {
      const day = new Date(`${date}T00:00:00`);
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const startTime = allDay ? atTimeOnDate(day, 0, 0) : atTimeOnDate(day, sh, sm);
      const endTime = allDay ? atTimeOnDate(day, 23, 59) : atTimeOnDate(day, eh, em);
      if (event && onUpdate) {
        await onUpdate(event.id, {
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          startTime,
          endTime,
          isAllDay: allDay,
          schedulingBehavior: behavior,
        });
      } else {
        await onCreate({
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime,
          endTime,
          isAllDay: allDay,
          schedulingBehavior: behavior,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={(e) => void submit(e)}>
          <DialogHeader>
            <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
            <DialogDescription>
              Events occupy time like fixed tasks. They share the same schedule as Day Flow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-3 sm:col-span-1">
                <Label htmlFor="event-date">Date</Label>
                <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-start">Start</Label>
                <Input id="event-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} disabled={allDay} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-end">End</Label>
                <Input id="event-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} disabled={allDay} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4"
              />
              All day
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="event-location">Location</Label>
              <Input id="event-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-notes">Notes</Label>
              <Textarea id="event-notes" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={behavior === "fixed"}
                onChange={(e) => setBehavior(e.target.checked ? "fixed" : "flexible")}
                className="h-4 w-4"
              />
              Fixed (won&apos;t be suggested for auto-move)
            </label>
            {error && <p className="text-sm text-status-error">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            {event && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  void onDelete(event.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

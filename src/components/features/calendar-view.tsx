"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { SectionLabel } from "@/components/core/section-label";
import { EmptyState } from "@/components/core/empty-state";
import { PageSkeleton } from "@/components/core/skeleton";
import { DayFlow } from "./day-flow";
import { EventComposer } from "./event-composer";
import { ConflictDialog } from "./conflict-dialog";
import { TaskInspector } from "./task-inspector";
import { useTaskStore } from "@/state/task-store";
import { useCalendarStore } from "@/state/calendar-store";
import { useUiStore } from "@/state/ui-store";
import { useSettingsStore } from "@/state/settings-store";
import type { CalendarEvent, Task } from "@/domain/types";
import { detectConflicts, getScheduledInterval } from "@/domain/task/conflicts";
import { dateFromMinutes, minutesFromMidnight, snapMinutes } from "@/domain/task/time";
import { buildSchedulePreview } from "@/domain/scheduling/smart";
import { getScheduledTasksOnDay } from "@/domain/task/today";
import { cn } from "@/lib/utils";
import type { UpdateTaskInput } from "@/domain/task/service";

type CalendarMode = "day" | "3day" | "week" | "month";

export function CalendarView() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const resizeTask = useTaskStore((s) => s.resizeTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const events = useCalendarStore((s) => s.events);
  const eventsHydrated = useCalendarStore((s) => s.hydrated);
  const createEvent = useCalendarStore((s) => s.createEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const moveEvent = useCalendarStore((s) => s.moveEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const settings = useSettingsStore((s) => s.settings);
  const openComposer = useUiStore((s) => s.openComposer);
  const inspectorTaskId = useUiStore((s) => s.inspectorTaskId);
  const openInspector = useUiStore((s) => s.openInspector);
  const closeInspector = useUiStore((s) => s.closeInspector);
  const granularity = useUiStore((s) => s.granularity);
  const pendingConflict = useUiStore((s) => s.pendingConflict);
  const setPendingConflict = useUiStore((s) => s.setPendingConflict);

  const weekStartsOn = settings.startOfWeek === 6 ? 6 : settings.startOfWeek;
  const [mode, setMode] = React.useState<CalendarMode>("week");
  const [cursor, setCursor] = React.useState(() => startOfDay(new Date()));
  const [eventOpen, setEventOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null);
  const [eventStart, setEventStart] = React.useState<Date | undefined>();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const inspectorTask = tasks.find((task) => task.id === inspectorTaskId) ?? null;

  const range = React.useMemo(() => {
    if (mode === "day") return [cursor];
    if (mode === "3day") return [cursor, addDays(cursor, 1), addDays(cursor, 2)];
    if (mode === "week") {
      const start = startOfWeek(cursor, { weekStartsOn });
      return eachDayOfInterval({ start, end: addDays(start, 6) });
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [mode, cursor, weekStartsOn]);

  const preview = React.useMemo(
    () => buildSchedulePreview(cursor, tasks, events, settings),
    [cursor, tasks, events, settings]
  );

  const proposeChange = (original: Task, proposed: Task, kind: "move" | "resize") => {
    const conflicts = detectConflicts(proposed, tasks);
    if (conflicts.length > 0) {
      setPendingConflict({ taskId: original.id, proposed, conflicts, kind });
      return;
    }
    void commitProposed(proposed, kind);
  };

  const commitProposed = async (proposed: Task, kind: "move" | "resize" | "create") => {
    if (kind === "resize") {
      await resizeTask(proposed.id, proposed.estimatedDuration ?? 30);
    } else if (proposed.startTime) {
      await rescheduleTask(proposed.id, proposed.startTime);
      if (proposed.estimatedDuration) await resizeTask(proposed.id, proposed.estimatedDuration);
    }
  };

  const handleKeepOverlap = async () => {
    if (!pendingConflict) return;
    await commitProposed(pendingConflict.proposed, pendingConflict.kind);
    setPendingConflict(null);
  };
  const handleCancelConflict = async () => {
    if (!pendingConflict) return;
    if (pendingConflict.kind === "create") await deleteTask(pendingConflict.taskId);
    setPendingConflict(null);
  };
  const handleMoveLater = async () => {
    if (!pendingConflict) return;
    const latest = Math.max(
      ...pendingConflict.conflicts.map((task) => {
        const interval = getScheduledInterval(task);
        return interval ? interval.end.getTime() : 0;
      })
    );
    const start = new Date(latest);
    await rescheduleTask(pendingConflict.taskId, dateFromMinutes(start, snapMinutes(minutesFromMidnight(start), granularity)));
    setPendingConflict(null);
  };
  const handleResizeToFit = async () => {
    if (!pendingConflict?.proposed.startTime) {
      setPendingConflict(null);
      return;
    }
    const earliest = Math.min(
      ...pendingConflict.conflicts.map((task) => {
        const interval = getScheduledInterval(task);
        return interval ? interval.start.getTime() : Number.MAX_SAFE_INTEGER;
      })
    );
    const minutes = Math.floor((earliest - pendingConflict.proposed.startTime.getTime()) / 60_000);
    if (minutes < 15) {
      await handleMoveLater();
      return;
    }
    await resizeTask(pendingConflict.taskId, minutes);
    setPendingConflict(null);
  };

  const shift = (dir: number) => {
    if (mode === "month") setCursor((d) => addMonths(d, dir));
    else if (mode === "week") setCursor((d) => addDays(d, dir * 7));
    else if (mode === "3day") setCursor((d) => addDays(d, dir * 3));
    else setCursor((d) => addDays(d, dir));
  };

  const moveTaskToDay = async (taskId: string, day: Date) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const minutes = task.startTime ? minutesFromMidnight(task.startTime) : settings.dayStartHour * 60;
    const proposedStart = dateFromMinutes(day, minutes);
    const proposed: Task = { ...task, startTime: proposedStart };
    const conflicts = detectConflicts(proposed, tasks);
    if (conflicts.length > 0) {
      setPendingConflict({ taskId, proposed, conflicts, kind: "move" });
      return;
    }
    await rescheduleTask(taskId, proposedStart);
  };

  const handleDropOnDay = (day: Date) => async (event: React.DragEvent) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("application/x-nexus-task");
    const eventId = event.dataTransfer.getData("application/x-nexus-event");
    if (taskId) await moveTaskToDay(taskId, day);
    if (eventId) {
      const current = events.find((item) => item.id === eventId);
      if (!current) return;
      const minutes = minutesFromMidnight(current.startTime);
      await moveEvent(eventId, dateFromMinutes(day, minutes));
    }
  };

  if (!hydrated || !eventsHydrated) return <PageSkeleton />;

  const heading =
    mode === "month"
      ? format(cursor, "MMMM yyyy")
      : mode === "day"
        ? format(cursor, "EEEE d MMMM")
        : `${format(range[0]!, "d MMM")} – ${format(range[range.length - 1]!, "d MMM")}`;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="px-5 pt-8 pb-4 lg:px-10 lg:pt-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label-caps mb-2">Calendar</p>
              <h1 className="text-xl font-medium tracking-tight text-text-primary">{heading}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => shift(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCursor(startOfDay(new Date()))}>
                Today
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => shift(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {(["day", "3day", "week", "month"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={cn(
                    "px-2 py-1 text-[11px] font-mono min-h-8 rounded-sm",
                    mode === value ? "bg-bg-tertiary text-text-primary" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {value === "3day" ? "3-day" : value}
                </button>
              ))}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingEvent(null);
                  setEventStart(cursor);
                  setEventOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Event
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto px-5 pb-16 lg:px-10">
          {mode === "day" && (
            <div className="max-w-3xl space-y-8">
              <AllDayRow
                day={cursor}
                events={events}
                onOpen={(item) => {
                  setEditingEvent(item);
                  setEventOpen(true);
                }}
              />
              <DayFlow
                date={cursor}
                tasks={tasks}
                granularity={granularity}
                selectedTaskId={inspectorTaskId}
                onSelect={(task) => openInspector(task.id)}
                onOpen={(task) => openInspector(task.id)}
                onComplete={(task) => void completeTask(task.id)}
                onDelete={(task) => void deleteTask(task.id)}
                onDuplicate={(task) => void duplicateTask(task.id)}
                onMove={(task, proposed) => proposeChange(task, proposed, "move")}
                onResize={(task, proposed) => proposeChange(task, proposed, "resize")}
                onEmptySlotClick={(time) => {
                  setEditingEvent(null);
                  setEventStart(time);
                  setEventOpen(true);
                }}
                className="h-[40rem]"
              />
              <section>
                <SectionLabel>Events</SectionLabel>
                <EventList
                  day={cursor}
                  events={events}
                  onOpen={(item) => {
                    setEditingEvent(item);
                    setEventOpen(true);
                  }}
                />
              </section>
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel className="mb-0">Open time</SectionLabel>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewOpen((v) => !v)}>
                    {previewOpen ? "Hide suggestions" : "Suggest placement"}
                  </Button>
                </div>
                {preview.descriptions.length === 0 ? (
                  <p className="text-sm text-text-secondary">No free blocks in your working hours.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {preview.descriptions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                {previewOpen && (
                  <div className="mt-4 space-y-2">
                    {preview.suggestions.length === 0 ? (
                      <p className="text-sm text-text-tertiary">
                        No unscheduled tasks fit the open slots. Nothing was moved.
                      </p>
                    ) : (
                      preview.suggestions.map((suggestion) => (
                        <div
                          key={suggestion.taskId}
                          className="flex items-center justify-between gap-3 py-2 border-b border-border-primary"
                        >
                          <div>
                            <div className="text-sm text-text-primary">{suggestion.title}</div>
                            <div className="text-xs text-text-tertiary">
                              {format(suggestion.slot.start, "HH:mm")}–{format(suggestion.slot.end, "HH:mm")} · {suggestion.reason}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void rescheduleTask(suggestion.taskId, suggestion.slot.start)}
                          >
                            Place
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {(mode === "3day" || mode === "week") && (
            <div className={cn("grid gap-px bg-border-primary border border-border-primary min-w-[640px]", mode === "week" ? "grid-cols-7" : "grid-cols-3")}>
              {range.map((day) => (
                <DayColumn
                  key={day.toISOString()}
                  day={day}
                  tasks={getScheduledTasksOnDay(tasks, day)}
                  events={events.filter((event) => isSameDay(event.startTime, day))}
                  onSelectTask={(task) => openInspector(task.id)}
                  onSelectEvent={(item) => {
                    setEditingEvent(item);
                    setEventOpen(true);
                  }}
                  onEmpty={() => {
                    setCursor(day);
                    setEditingEvent(null);
                    setEventStart(day);
                    setEventOpen(true);
                  }}
                  onDrop={handleDropOnDay(day)}
                  isToday={isSameDay(day, new Date())}
                />
              ))}
            </div>
          )}

          {mode === "month" && (
            <div className="grid grid-cols-7 gap-px bg-border-primary border border-border-primary min-w-[640px]">
              {range.slice(0, 7).map((day) => (
                <div key={`h-${day.toISOString()}`} className="bg-bg-secondary px-2 py-2 label-caps">
                  {format(day, "EEE")}
                </div>
              ))}
              {range.map((day) => {
                const dayTasks = getScheduledTasksOnDay(tasks, day);
                const dayEvents = events.filter((event) => isSameDay(event.startTime, day));
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "bg-bg-primary min-h-[7rem] p-2",
                      !isSameMonth(day, cursor) && "opacity-40"
                    )}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => void handleDropOnDay(day)(event)}
                  >
                    <button
                      type="button"
                      className={cn(
                        "text-xs font-mono mb-2",
                        isSameDay(day, new Date()) ? "text-interactive-primary" : "text-text-tertiary"
                      )}
                      onClick={() => {
                        setCursor(day);
                        setMode("day");
                      }}
                    >
                      {format(day, "d")}
                    </button>
                    <ul className="space-y-1">
                      {dayEvents.slice(0, 2).map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            draggable
                            onDragStart={(event) => event.dataTransfer.setData("application/x-nexus-event", item.id)}
                            onClick={() => {
                              setEditingEvent(item);
                              setEventOpen(true);
                            }}
                            className="block w-full text-left text-[11px] truncate text-text-primary"
                          >
                            {item.title}
                          </button>
                        </li>
                      ))}
                      {dayTasks.slice(0, 3).map((task) => (
                        <li key={task.id}>
                          <button
                            type="button"
                            draggable
                            onDragStart={(event) => event.dataTransfer.setData("application/x-nexus-task", task.id)}
                            onClick={() => openInspector(task.id)}
                            className={cn(
                              "block w-full text-left text-[11px] truncate",
                              task.schedulingBehavior === "fixed" ? "text-text-primary" : "text-text-secondary"
                            )}
                          >
                            {task.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {inspectorTask && (
        <aside className="hidden lg:flex w-80 flex-shrink-0">
          <TaskInspector
            key={inspectorTask.id}
            task={inspectorTask}
            variant="panel"
            onChange={(updates: UpdateTaskInput) => void updateTask(inspectorTask.id, updates)}
            onComplete={() => void completeTask(inspectorTask.id)}
            onDelete={() => {
              void deleteTask(inspectorTask.id);
              closeInspector();
            }}
            onDuplicate={() => void duplicateTask(inspectorTask.id)}
            onClose={closeInspector}
          />
        </aside>
      )}

      <EventComposer
        key={`${editingEvent?.id ?? "new"}-${eventStart?.toISOString() ?? "none"}-${eventOpen}`}
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={editingEvent}
        defaultStart={eventStart}
        onCreate={async (input) => {
          await createEvent(input);
        }}
        onUpdate={async (id, updates) => {
          await updateEvent(id, updates);
        }}
        onDelete={async (id) => {
          await deleteEvent(id);
        }}
      />

      <ConflictDialog
        conflict={pendingConflict}
        onKeepOverlap={() => void handleKeepOverlap()}
        onCancel={() => void handleCancelConflict()}
        onMoveLater={() => void handleMoveLater()}
        onResizeToFit={() => void handleResizeToFit()}
      />
    </div>
  );
}

function AllDayRow({
  day,
  events,
  onOpen,
}: {
  day: Date;
  events: CalendarEvent[];
  onOpen: (event: CalendarEvent) => void;
}) {
  const allDay = events.filter((event) => event.isAllDay && isSameDay(event.startTime, day));
  if (allDay.length === 0) return null;
  return (
    <div>
      <SectionLabel>All day</SectionLabel>
      <ul className="space-y-1">
        {allDay.map((event) => (
          <li key={event.id}>
            <button type="button" className="text-sm text-text-primary hover:text-interactive-primary" onClick={() => onOpen(event)}>
              {event.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventList({
  day,
  events,
  onOpen,
}: {
  day: Date;
  events: CalendarEvent[];
  onOpen: (event: CalendarEvent) => void;
}) {
  const timed = events.filter((event) => isSameDay(event.startTime, day) && !event.isAllDay);
  if (timed.length === 0) {
    return <EmptyState title="No events." description="Tasks already on Day Flow still appear above. Add an event only for appointments." />;
  }
  return (
    <ul className="space-y-2">
      {timed.map((event) => (
        <li key={event.id}>
          <button type="button" className="text-left" onClick={() => onOpen(event)}>
            <div className="text-sm text-text-primary">{event.title}</div>
            <div className="font-mono text-[11px] text-text-tertiary">
              {format(event.startTime, "HH:mm")}–{format(event.endTime, "HH:mm")}
              {event.schedulingBehavior === "fixed" ? " · fixed" : " · flexible"}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DayColumn({
  day,
  tasks,
  events,
  onSelectTask,
  onSelectEvent,
  onEmpty,
  onDrop,
  isToday,
}: {
  day: Date;
  tasks: Task[];
  events: CalendarEvent[];
  onSelectTask: (task: Task) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onEmpty: () => void;
  onDrop: (event: React.DragEvent) => void;
  isToday: boolean;
}) {
  const items = [
    ...events.map((event) => ({
      id: event.id,
      kind: "event" as const,
      title: event.title,
      start: event.startTime,
      behavior: event.schedulingBehavior,
      event,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      kind: "task" as const,
      title: task.title,
      start: task.startTime ?? day,
      behavior: task.schedulingBehavior,
      task,
    })),
  ].sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div
      className="bg-bg-primary min-h-[28rem] p-2"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <button type="button" onClick={onEmpty} className={cn("label-caps mb-3", isToday && "text-interactive-primary")}>
        {format(day, "EEE d")}
      </button>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <button
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  item.kind === "task" ? "application/x-nexus-task" : "application/x-nexus-event",
                  item.id
                );
              }}
              onClick={() => {
                if (item.kind === "task" && item.task) onSelectTask(item.task);
                if (item.kind === "event" && item.event) onSelectEvent(item.event);
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 border-l-2",
                item.behavior === "fixed" ? "border-l-text-primary" : "border-l-interactive-primary/60 border-dashed"
              )}
            >
              <div className="text-[12px] text-text-primary truncate">{item.title}</div>
              <div className="font-mono text-[10px] text-text-tertiary">{format(item.start, "HH:mm")}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

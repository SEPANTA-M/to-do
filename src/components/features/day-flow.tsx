"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { Copy, Check, Trash2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/domain/types";
import {
  createDayFlowLayout,
  getBlockGeometry,
  minutesToY,
  yToMinutes,
  type TimeGranularity,
} from "@/domain/task/geometry";
import { detectConflicts } from "@/domain/task/conflicts";
import { dateFromMinutes, getTaskDurationMinutes, minutesFromMidnight } from "@/domain/task/time";
import { moveTaskToStart, resizeTaskDuration } from "@/domain/task/scheduling";

interface DayFlowProps {
  date: Date;
  tasks: Task[];
  granularity: TimeGranularity;
  selectedTaskId?: string | null;
  onSelect?: (task: Task) => void;
  onOpen?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
  onMove?: (task: Task, proposed: Task) => void;
  onResize?: (task: Task, proposed: Task) => void;
  onEmptySlotClick?: (time: Date) => void;
  className?: string;
}

type DragMode = "move" | "resize";

interface DragState {
  taskId: string;
  mode: DragMode;
  originY: number;
  originStart: number;
  originDuration: number;
  previewStart: number;
  previewDuration: number;
  moved: boolean;
}

const LONG_PRESS_MS = 420;

export function DayFlow({
  date,
  tasks,
  granularity,
  selectedTaskId,
  onSelect,
  onOpen,
  onComplete,
  onDelete,
  onDuplicate,
  onMove,
  onResize,
  onEmptySlotClick,
  className,
}: DayFlowProps) {
  const layout = React.useMemo(
    () => createDayFlowLayout(granularity),
    [granularity]
  );
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const didAutoScroll = React.useRef(false);
  const [now, setNow] = React.useState(() => new Date());
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const [menu, setMenu] = React.useState<{ task: Task; x: number; y: number } | null>(null);
  const longPress = React.useRef<number | null>(null);

  const scheduled = React.useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.startTime &&
          isSameDay(task.startTime, date) &&
          task.status !== "archived"
      ),
    [tasks, date]
  );

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (didAutoScroll.current || !scrollRef.current) return;
    if (!isSameDay(date, now)) return;
    const y = minutesToY(minutesFromMidnight(now), layout);
    scrollRef.current.scrollTop = Math.max(0, y - 160);
    didAutoScroll.current = true;
  }, [date, layout, now]);

  React.useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!selectedTaskId) return;
      const task = scheduled.find((item) => item.id === selectedTaskId);
      if (!task) return;
      if (event.key === "Enter") {
        event.preventDefault();
        onOpen?.(task);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete?.(task);
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const delta = event.key === "ArrowUp" ? -granularity : granularity;
        const start = minutesFromMidnight(task.startTime ?? date) + delta;
        const snapped = Math.max(0, Math.min(24 * 60 - 15, start));
        onMove?.(task, moveTaskToStart(task, dateFromMinutes(date, snapped), new Date()));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTaskId, scheduled, granularity, date, onOpen, onDelete, onMove]);

  const hours = React.useMemo(
    () => Array.from({ length: layout.totalHours }, (_, i) => layout.dayStartHour + i),
    [layout]
  );

  const gridBackground = React.useMemo(() => {
    const hour = layout.hourHeight;
    const minor = hour / (60 / layout.granularity);
    return {
      backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent ${minor - 1}px,
          hsl(var(--border-primary) / 0.35) ${minor - 1}px,
          hsl(var(--border-primary) / 0.35) ${minor}px
        ),
        repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent ${hour - 1}px,
          hsl(var(--border-primary) / 0.8) ${hour - 1}px,
          hsl(var(--border-primary) / 0.8) ${hour}px
        )`,
    };
  }, [layout]);

  const pointerToMinutes = React.useCallback((clientY: number) => {
    const canvas = canvasRef.current;
    const scroll = scrollRef.current;
    if (!canvas || !scroll) return 0;
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top + scroll.scrollTop;
    return yToMinutes(y, layout);
  }, [layout]);

  const clearLongPress = () => {
    if (longPress.current) {
      window.clearTimeout(longPress.current);
      longPress.current = null;
    }
  };

  const beginDrag = (
    event: React.PointerEvent,
    task: Task,
    mode: DragMode
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const start = minutesFromMidnight(task.startTime ?? date);
    const duration = getTaskDurationMinutes(task);
    const nextDrag: DragState = {
      taskId: task.id,
      mode,
      originY: event.clientY,
      originStart: start,
      originDuration: duration,
      previewStart: start,
      previewDuration: duration,
      moved: false,
    };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
    onSelect?.(task);
  };

  const dragging = drag !== null;

  React.useEffect(() => {
    if (!dragging) return;

    const handleWindowMove = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      if (current.mode === "move") {
        const deltaPx = event.clientY - current.originY;
        const deltaMin =
          Math.round(((deltaPx / layout.hourHeight) * 60) / layout.granularity) *
          layout.granularity;
        const previewStart = Math.max(
          0,
          Math.min(24 * 60 - current.originDuration, current.originStart + deltaMin)
        );
        const moved =
          Math.abs(event.clientY - current.originY) > 4 ||
          previewStart !== current.originStart;
        const next = { ...current, previewStart, moved };
        dragRef.current = next;
        setDrag(next);
      } else {
        const minutes = pointerToMinutes(event.clientY);
        const previewDuration = Math.max(
          layout.granularity,
          minutes - current.originStart
        );
        const moved =
          Math.abs(event.clientY - current.originY) > 4 ||
          previewDuration !== current.originDuration;
        const next = { ...current, previewDuration, moved };
        dragRef.current = next;
        setDrag(next);
      }
    };

    const handleWindowUp = () => {
      const snapshot = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!snapshot) return;
      const task = scheduled.find((item) => item.id === snapshot.taskId);
      if (!task) return;
      const nowDate = new Date();
      if (snapshot.mode === "move") {
        if (snapshot.moved && snapshot.previewStart !== snapshot.originStart) {
          const newStart = dateFromMinutes(date, snapshot.previewStart);
          onMove?.(task, moveTaskToStart(task, newStart, nowDate));
          return;
        }
        if (!snapshot.moved) onOpen?.(task);
        return;
      }
      if (snapshot.previewDuration !== snapshot.originDuration) {
        onResize?.(task, resizeTaskDuration(task, snapshot.previewDuration, nowDate));
      }
    };

    window.addEventListener("pointermove", handleWindowMove);
    window.addEventListener("pointerup", handleWindowUp);
    window.addEventListener("pointercancel", handleWindowUp);
    return () => {
      window.removeEventListener("pointermove", handleWindowMove);
      window.removeEventListener("pointerup", handleWindowUp);
      window.removeEventListener("pointercancel", handleWindowUp);
    };
  }, [dragging, layout, scheduled, date, onMove, onResize, onOpen, pointerToMinutes]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (drag) return;
    const minutes = pointerToMinutes(event.clientY);
    onEmptySlotClick?.(dateFromMinutes(date, minutes));
  };

  const handleTaskPointerDown = (task: Task) => (event: React.PointerEvent) => {
    if (event.pointerType === "touch") {
      clearLongPress();
      longPress.current = window.setTimeout(() => {
        setMenu({ task, x: event.clientX, y: event.clientY });
      }, LONG_PRESS_MS);
    }
    beginDrag(event, task, "move");
  };

  const currentMinutes = minutesFromMidnight(now);
  const showNow = isSameDay(date, now);

  return (
    <div className={cn("relative flex flex-col min-h-0", className)}>
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="flex min-h-full">
          <div
            className="sticky left-0 z-20 w-12 flex-shrink-0 bg-bg-primary"
            style={{ height: layout.totalHeight }}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 font-mono text-[10px] text-text-tertiary"
                style={{ top: hour * layout.hourHeight + 2 }}
              >
                {format(new Date(2000, 0, 1, hour), "HH:mm")}
              </div>
            ))}
          </div>

          <div
            ref={canvasRef}
            className="relative flex-1 touch-none"
            style={{ height: layout.totalHeight, ...gridBackground }}
            onClick={handleCanvasClick}
          >
            {showNow && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ top: minutesToY(currentMinutes, layout) }}
              >
                <div className="flex items-center">
                  <div className="now-dot h-1.5 w-1.5 rounded-full bg-interactive-primary" />
                  <div className="h-px flex-1 bg-interactive-primary/70" />
                </div>
              </div>
            )}

            {scheduled.map((task) => {
              const geometry = getBlockGeometry(task, layout);
              if (!geometry) return null;
              const isDragging = drag?.taskId === task.id;
              const start = isDragging ? drag.previewStart : geometry.startMinutes;
              const duration = isDragging
                ? drag.previewDuration
                : geometry.durationMinutes;
              const top = minutesToY(start, layout);
              const height = Math.max((duration / 60) * layout.hourHeight, 28);
              const proposed: Task = isDragging
                ? {
                    ...task,
                    startTime: dateFromMinutes(date, start),
                    endTime: dateFromMinutes(date, start + duration),
                    estimatedDuration: duration,
                  }
                : task;
              const overlapping = detectConflicts(proposed, scheduled).length > 0;
              const isSelected = selectedTaskId === task.id;
              const isCritical = task.priority === "critical";
              const isHigh = task.priority === "high";

              return (
                <div
                  key={task.id}
                  className={cn(
                    "absolute left-3 right-1 z-20 px-2.5 py-1.5",
                    "select-none cursor-grab active:cursor-grabbing",
                    "transition-[opacity,background-color] duration-fast",
                    "bg-bg-elevated/80 border-l-2",
                    task.schedulingBehavior === "fixed"
                      ? "border-l-text-primary"
                      : "border-dashed border-l-interactive-primary/60",
                    task.status === "completed" && "opacity-40",
                    isSelected && "bg-bg-tertiary",
                    overlapping && "border-l-status-error",
                    isCritical && "border-l-status-error",
                    isHigh && !isCritical && !overlapping && "border-l-accent-orange"
                  )}
                  style={{ top, height }}
                  onPointerDown={handleTaskPointerDown(task)}
                  onPointerUp={() => {
                    clearLongPress();
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMenu({ task, x: event.clientX, y: event.clientY });
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onOpen?.(task);
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-[13px] font-medium text-text-primary truncate",
                          task.status === "completed" && "text-text-tertiary"
                        )}
                      >
                        {task.title}
                      </div>
                      {height > 40 && (
                        <div className="text-[11px] text-text-tertiary">
                          {format(dateFromMinutes(date, start), "h:mm a")} · {duration} min
                          {task.schedulingBehavior === "fixed" ? " · fixed" : ""}
                        </div>
                      )}
                    </div>
                    {task.schedulingBehavior === "fixed" && (
                      <Pin className="h-3 w-3 text-text-tertiary flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Resize duration"
                    className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      beginDrag(event, task, "resize");
                    }}
                  >
                    <span className="mx-auto mt-1 block h-1 w-8 rounded-full bg-border-secondary" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {menu && (
        <div
          className="fixed z-[1400] min-w-[160px] rounded-md border border-border-secondary bg-bg-elevated py-1 shadow-lg"
          style={{ left: menu.x, top: menu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <MenuButton
            icon={<Check className="h-4 w-4" />}
            label={menu.task.status === "completed" ? "Reopen" : "Complete"}
            onClick={() => {
              onComplete?.(menu.task);
              setMenu(null);
            }}
          />
          <MenuButton
            icon={<Copy className="h-4 w-4" />}
            label="Duplicate"
            onClick={() => {
              onDuplicate?.(menu.task);
              setMenu(null);
            }}
          />
          <MenuButton
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            danger
            onClick={() => {
              onDelete?.(menu.task);
              setMenu(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-secondary min-h-11",
        danger ? "text-status-error" : "text-text-primary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

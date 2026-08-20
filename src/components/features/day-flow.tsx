"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Task } from "@/domain/types";
import { format, addMinutes, startOfDay, differenceInMinutes, isSameDay } from "date-fns";
import { TaskItem } from "./task-item";

interface DayFlowProps {
  date: Date;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskMove?: (taskId: string, newStartTime: Date) => void;
  onEmptySlotClick?: (time: Date) => void;
  className?: string;
}

const HOUR_HEIGHT = 60; // pixels per hour
const HOURS_START = 6; // 6 AM
const HOURS_END = 23; // 11 PM
const HOURS_VISIBLE = HOURS_END - HOURS_START + 1;

export function DayFlow({
  date,
  tasks,
  onTaskClick,
  onTaskComplete,
  onTaskMove,
  onEmptySlotClick,
  className,
}: DayFlowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [currentTimePosition, setCurrentTimePosition] = React.useState(0);
  const [draggedTask, setDraggedTask] = React.useState<string | null>(null);

  // Filter tasks for today
  const todayTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (!task.startTime) return false;
      return isSameDay(new Date(task.startTime), date);
    });
  }, [tasks, date]);

  // Update current time indicator
  React.useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      if (isSameDay(now, date)) {
        const minutesSinceStart = (now.getHours() - HOURS_START) * 60 + now.getMinutes();
        setCurrentTimePosition((minutesSinceStart / 60) * HOUR_HEIGHT);
      }
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  // Auto-scroll to current time on mount
  React.useEffect(() => {
    if (containerRef.current && isSameDay(date, new Date())) {
      const scrollTarget = Math.max(0, currentTimePosition - 200);
      containerRef.current.scrollTop = scrollTarget;
    }
  }, []);

  const getTaskPosition = (task: Task) => {
    if (!task.startTime || !task.endTime) return null;

    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    const minutesFromStart = differenceInMinutes(start, startOfDay(date));
    const taskDuration = differenceInMinutes(end, start);

    const top = ((minutesFromStart / 60) - HOURS_START) * HOUR_HEIGHT;
    const height = (taskDuration / 60) * HOUR_HEIGHT;

    return { top, height };
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + (containerRef.current?.scrollTop || 0);
    const hours = Math.floor(y / HOUR_HEIGHT) + HOURS_START;
    const minutes = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15; // Snap to 15min

    const clickedTime = new Date(date);
    clickedTime.setHours(hours, minutes, 0, 0);

    onEmptySlotClick?.(clickedTime);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full overflow-y-auto bg-bg-secondary rounded-lg",
        className
      )}
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="relative" style={{ height: `${HOURS_VISIBLE * HOUR_HEIGHT}px` }}>
        {/* Time labels and grid */}
        {Array.from({ length: HOURS_VISIBLE }, (_, i) => {
          const hour = HOURS_START + i;
          const timeLabel = format(new Date().setHours(hour, 0), "h a");

          return (
            <div
              key={hour}
              className="absolute w-full flex border-t border-border-primary"
              style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              onClick={handleTimelineClick}
            >
              {/* Time label */}
              <div className="sticky left-0 w-16 flex-shrink-0 px-2 py-1 text-xs text-text-tertiary bg-bg-secondary">
                {timeLabel}
              </div>

              {/* Grid area */}
              <div className="flex-1 relative">
                {/* 15-minute subdivisions */}
                <div className="absolute top-[25%] left-0 right-0 h-px bg-border-primary opacity-20" />
                <div className="absolute top-[50%] left-0 right-0 h-px bg-border-primary opacity-40" />
                <div className="absolute top-[75%] left-0 right-0 h-px bg-border-primary opacity-20" />
              </div>
            </div>
          );
        })}

        {/* Current time indicator */}
        {isSameDay(date, new Date()) && (
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center">
              <div className="w-16 flex-shrink-0" />
              <div className="flex-1 flex items-center">
                <div className="w-2 h-2 rounded-full bg-interactive-primary" />
                <div className="flex-1 h-0.5 bg-interactive-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {todayTasks.map((task) => {
          const position = getTaskPosition(task);
          if (!position) return null;

          const isPriority = task.priority === "high" || task.priority === "critical";

          return (
            <div
              key={task.id}
              className={cn(
                "absolute left-16 right-4 z-20",
                "cursor-pointer transition-all",
                draggedTask === task.id && "opacity-50"
              )}
              style={{
                top: `${position.top}px`,
                height: `${position.height}px`,
                minHeight: "40px",
              }}
            >
              <div
                className={cn(
                  "h-full rounded-md border p-2 overflow-hidden",
                  "bg-bg-elevated border-border-secondary",
                  "hover:border-border-hover hover:shadow-md",
                  isPriority && "border-l-4 border-l-accent-orange",
                  task.status === "completed" && "opacity-50"
                )}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="text-sm font-medium text-text-primary line-clamp-1">
                  {task.title}
                </div>
                {task.estimatedDuration && position.height > 50 && (
                  <div className="text-xs text-text-tertiary mt-1">
                    {task.estimatedDuration} min
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

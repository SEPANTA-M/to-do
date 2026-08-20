import {
  addDays,
  endOfDay,
  isWithinInterval,
  startOfDay,
  startOfWeek as dfStartOfWeek,
} from "date-fns";
import type {
  AppSettings,
  FocusSession,
  Goal,
  Project,
  Task,
  TaskHistory,
  WeeklyReview,
} from "@/domain/types";
import { createId } from "@/domain/ids";
import { LOCAL_USER_ID } from "@/domain/task/constants";
import { isOverdue } from "@/domain/task/overdue";

export interface WeekWindow {
  start: Date;
  end: Date;
}

export function weekWindowFor(date: Date, startOfWeek: AppSettings["startOfWeek"]): WeekWindow {
  const start = startOfDay(
    dfStartOfWeek(date, { weekStartsOn: startOfWeek === 6 ? 6 : startOfWeek })
  );
  const end = endOfDay(addDays(start, 6));
  return { start, end };
}

export interface WeekSummary {
  window: WeekWindow;
  completed: Task[];
  incomplete: Task[];
  carriedOver: Task[];
  overdue: Task[];
  focusMinutes: number;
  projectMovement: { id: string; name: string; completedTasks: number }[];
  goalMovement: { id: string; title: string; completedTasks: number }[];
}

export function computeWeekSummary(
  now: Date,
  settings: Pick<AppSettings, "startOfWeek">,
  tasks: Task[],
  history: TaskHistory[],
  sessions: FocusSession[],
  projects: Project[],
  goals: Goal[]
): WeekSummary {
  const window = weekWindowFor(now, settings.startOfWeek);
  const inWeek = (date: Date | undefined) =>
    Boolean(date && isWithinInterval(date, { start: window.start, end: window.end }));

  const completed = tasks.filter(
    (task) => task.status === "completed" && inWeek(task.completedAt)
  );
  const plannedThisWeek = tasks.filter((task) => {
    if (task.status === "archived") return false;
    const date = task.startTime ?? task.scheduledDate ?? task.dueDate;
    return inWeek(date);
  });
  const incomplete = plannedThisWeek.filter((task) => task.status !== "completed");
  const carriedOver = tasks.filter((task) => {
    if (task.status === "archived" || task.status === "completed") return false;
    const date = task.startTime ?? task.scheduledDate ?? task.dueDate;
    return Boolean(date && date.getTime() < window.start.getTime());
  });
  const overdue = tasks.filter((task) => isOverdue(task, now));

  const focusMinutes = sessions
    .filter((session) => inWeek(session.startTime) && session.duration && session.duration > 0)
    .reduce((sum, session) => sum + (session.duration ?? 0), 0);

  const completedIds = new Set(completed.map((task) => task.id));
  const projectMovement = projects
    .filter((project) => project.status !== "archived")
    .map((project) => ({
      id: project.id,
      name: project.name,
      completedTasks: completed.filter((task) => task.projectId === project.id).length,
    }))
    .filter((item) => item.completedTasks > 0);

  const goalMovement = goals
    .filter((goal) => goal.status !== "archived")
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      completedTasks: completed.filter((task) => task.goalId === goal.id).length,
    }))
    .filter((item) => item.completedTasks > 0);

  return {
    window,
    completed,
    incomplete,
    carriedOver,
    overdue,
    focusMinutes,
    projectMovement,
    goalMovement,
  };
}

export interface CreateReviewInput {
  weekStart: Date;
  weekEnd: Date;
  workedWell?: string;
  didntWork?: string;
  shouldChange?: string;
  userId?: string;
  now?: Date;
}

export function createWeeklyReview(input: CreateReviewInput): WeeklyReview {
  const now = input.now ?? new Date();
  return {
    id: createId("review"),
    weekStart: startOfDay(input.weekStart),
    weekEnd: input.weekEnd,
    workedWell: input.workedWell?.trim() ?? "",
    didntWork: input.didntWork?.trim() ?? "",
    shouldChange: input.shouldChange?.trim() ?? "",
    userId: input.userId ?? LOCAL_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
}

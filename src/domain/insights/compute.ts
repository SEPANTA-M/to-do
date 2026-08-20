import { startOfDay, subDays } from "date-fns";
import type { FocusSession, Goal, Milestone, Project, Task, TaskHistory } from "@/domain/types";
import { computeGoalProgress, computeProjectProgress } from "@/domain/progress";
import { isOverdue } from "@/domain/task/overdue";

export const MIN_COMPLETED_FOR_RATE = 3;
export const MIN_COMPLETED_FOR_PATTERNS = 8;

export interface InsightMetric {
  key: string;
  label: string;
  value: string | null;
  detail?: string;
  available: boolean;
  requirement?: string;
}

export interface InsightReport {
  windowDays: number;
  completedCount: number;
  createdCount: number;
  overdueCount: number;
  carryOverCount: number;
  focusMinutes: number;
  completionRate: number | null;
  planningAccuracy: number | null;
  projectProgress: { id: string; name: string; progress: number }[];
  goalProgress: { id: string; title: string; progress: number }[];
  productiveHours: { hour: number; completions: number }[] | null;
  metrics: InsightMetric[];
}

export function computeInsights(
  now: Date,
  tasks: Task[],
  _history: TaskHistory[],
  sessions: FocusSession[],
  projects: Project[],
  goals: Goal[],
  milestones: Milestone[],
  windowDays = 14
): InsightReport {
  const from = startOfDay(subDays(now, windowDays - 1));
  const inWindow = (date: Date | undefined) =>
    Boolean(date && date.getTime() >= from.getTime() && date.getTime() <= now.getTime());

  const completed = tasks.filter(
    (task) => task.status === "completed" && inWindow(task.completedAt)
  );
  const created = tasks.filter((task) => inWindow(task.createdAt));
  const overdueCount = tasks.filter((task) => isOverdue(task, now)).length;
  const carryOverCount = tasks.filter((task) => {
    if (task.status === "archived" || task.status === "completed") return false;
    const date = task.startTime ?? task.scheduledDate ?? task.dueDate;
    return Boolean(date && date.getTime() < startOfDay(now).getTime());
  }).length;

  const focusMinutes = sessions
    .filter((session) => inWindow(session.startTime) && (session.duration ?? 0) > 0)
    .reduce((sum, session) => sum + (session.duration ?? 0), 0);

  const completionRate =
    completed.length >= MIN_COMPLETED_FOR_RATE && created.length > 0
      ? Math.round((completed.length / Math.max(created.length, completed.length)) * 100)
      : completed.length >= MIN_COMPLETED_FOR_RATE
        ? 100
        : null;

  const withBothDurations = completed.filter(
    (task) =>
      typeof task.estimatedDuration === "number" &&
      task.estimatedDuration > 0 &&
      typeof task.actualDuration === "number" &&
      task.actualDuration > 0
  );
  let planningAccuracy: number | null = null;
  if (withBothDurations.length >= MIN_COMPLETED_FOR_RATE) {
    const ratios = withBothDurations.map((task) => {
      const estimated = task.estimatedDuration!;
      const actual = task.actualDuration!;
      const error = Math.abs(estimated - actual) / estimated;
      return Math.max(0, 1 - error);
    });
    planningAccuracy = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  }

  const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({ hour, completions: 0 }));
  for (const task of completed) {
    if (!task.completedAt) continue;
    hourBuckets[task.completedAt.getHours()]!.completions += 1;
  }
  const productiveHours =
    completed.length >= MIN_COMPLETED_FOR_PATTERNS ? hourBuckets.filter((b) => b.completions > 0) : null;

  const projectProgress = projects
    .filter((project) => project.status !== "archived")
    .map((project) => ({
      id: project.id,
      name: project.name,
      progress: computeProjectProgress(project, tasks),
    }));

  const goalProgress = goals
    .filter((goal) => goal.status !== "archived")
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      progress: computeGoalProgress(goal, milestones, projects, tasks),
    }));

  const metrics: InsightMetric[] = [
    {
      key: "completed",
      label: "Completed",
      value: String(completed.length),
      detail: `in the last ${windowDays} days`,
      available: true,
    },
    {
      key: "focus",
      label: "Focus time",
      value: focusMinutes > 0 ? formatMinutes(focusMinutes) : null,
      available: focusMinutes > 0,
      requirement: "Start a focus session to record time.",
    },
    {
      key: "completionRate",
      label: "Completion rate",
      value: completionRate !== null ? `${completionRate}%` : null,
      available: completionRate !== null,
      requirement: `You need at least ${MIN_COMPLETED_FOR_RATE} completed tasks before a completion rate can be calculated.`,
    },
    {
      key: "overdue",
      label: "Overdue",
      value: String(overdueCount),
      available: true,
    },
    {
      key: "carry",
      label: "Carry-over",
      value: String(carryOverCount),
      detail: "Open work scheduled before today",
      available: true,
    },
    {
      key: "planning",
      label: "Planning accuracy",
      value: planningAccuracy !== null ? `${planningAccuracy}%` : null,
      available: planningAccuracy !== null,
      requirement:
        "Planning accuracy needs several completed tasks with both estimated and actual duration.",
    },
    {
      key: "patterns",
      label: "Productive periods",
      value: productiveHours ? describePeak(productiveHours) : null,
      available: Boolean(productiveHours),
      requirement: `You need at least ${MIN_COMPLETED_FOR_PATTERNS} completed tasks before productivity patterns can be calculated.`,
    },
  ];

  return {
    windowDays,
    completedCount: completed.length,
    createdCount: created.length,
    overdueCount,
    carryOverCount,
    focusMinutes,
    completionRate,
    planningAccuracy,
    projectProgress,
    goalProgress,
    productiveHours,
    metrics,
  };
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function describePeak(hours: { hour: number; completions: number }[]): string {
  if (hours.length === 0) return "";
  const peak = [...hours].sort((a, b) => b.completions - a.completions)[0]!;
  const label = `${String(peak.hour).padStart(2, "0")}:00`;
  return `Most completions around ${label}`;
}

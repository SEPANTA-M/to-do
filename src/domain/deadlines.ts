import { addDays, startOfDay } from "date-fns";

export type DeadlineKind = "none" | "upcoming" | "due_soon" | "overdue" | "completed";

export function classifyDeadline(
  targetDate: Date | undefined,
  status: string,
  now: Date,
  soonDays = 7
): DeadlineKind {
  if (status === "completed") return "completed";
  if (status === "archived") return "none";
  if (!targetDate) return "none";
  const today = startOfDay(now);
  const due = startOfDay(targetDate);
  if (due.getTime() < today.getTime()) return "overdue";
  const soon = addDays(today, soonDays);
  if (due.getTime() <= soon.getTime()) return "due_soon";
  return "upcoming";
}

export function deadlineLabel(kind: DeadlineKind): string {
  switch (kind) {
    case "overdue":
      return "Overdue";
    case "due_soon":
      return "Due soon";
    case "upcoming":
      return "Upcoming";
    case "completed":
      return "Completed";
    default:
      return "";
  }
}

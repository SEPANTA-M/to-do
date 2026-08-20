import type { CalendarEvent, Goal, Milestone, Note, Project, Task } from "@/domain/types";

export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.toLowerCase().includes(q);
}

export function searchGoals(goals: Goal[], query: string): Goal[] {
  return goals.filter(
    (goal) =>
      goal.status !== "archived" &&
      (matchesQuery(goal.title, query) || matchesQuery(goal.description ?? "", query))
  );
}

export function searchProjects(projects: Project[], query: string): Project[] {
  return projects.filter(
    (project) =>
      project.status !== "archived" &&
      (matchesQuery(project.name, query) ||
        matchesQuery(project.description ?? "", query) ||
        project.tags.some((tag) => matchesQuery(tag, query)))
  );
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  return tasks.filter(
    (task) =>
      task.status !== "archived" &&
      (matchesQuery(task.title, query) ||
        matchesQuery(task.description ?? "", query) ||
        task.tags.some((tag) => matchesQuery(tag, query)))
  );
}

export function searchMilestones(milestones: Milestone[], query: string): Milestone[] {
  return milestones.filter(
    (milestone) =>
      milestone.status !== "archived" &&
      (matchesQuery(milestone.title, query) || matchesQuery(milestone.description ?? "", query))
  );
}

export function searchNotes(notes: Note[], query: string): Note[] {
  return notes.filter(
    (note) =>
      !note.archived &&
      (matchesQuery(note.title ?? "", query) ||
        matchesQuery(note.content, query) ||
        note.tags.some((tag) => matchesQuery(tag, query)))
  );
}

export function searchEvents(events: CalendarEvent[], query: string): CalendarEvent[] {
  return events.filter(
    (event) =>
      matchesQuery(event.title, query) ||
      matchesQuery(event.description ?? "", query) ||
      matchesQuery(event.location ?? "", query)
  );
}

export interface SearchFilters {
  status?: string;
  projectId?: string;
  goalId?: string;
  date?: Date;
}

export interface UnifiedSearchResults {
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  milestones: Milestone[];
  notes: Note[];
  events: CalendarEvent[];
}

export function searchAll(
  query: string,
  data: {
    tasks: Task[];
    projects: Project[];
    goals: Goal[];
    milestones: Milestone[];
    notes: Note[];
    events: CalendarEvent[];
  },
  filters: SearchFilters = {}
): UnifiedSearchResults {
  let tasks = searchTasks(data.tasks, query);
  if (filters.status) tasks = tasks.filter((task) => task.status === filters.status);
  if (filters.projectId) tasks = tasks.filter((task) => task.projectId === filters.projectId);
  if (filters.goalId) tasks = tasks.filter((task) => task.goalId === filters.goalId);
  if (filters.date) {
    const day = filters.date.toDateString();
    tasks = tasks.filter((task) => {
      const dates = [task.startTime, task.dueDate, task.scheduledDate];
      return dates.some((date) => date && date.toDateString() === day);
    });
  }

  let events = searchEvents(data.events, query);
  if (filters.date) {
    const day = filters.date.toDateString();
    events = events.filter((event) => event.startTime.toDateString() === day);
  }

  return {
    tasks,
    projects: searchProjects(data.projects, query),
    goals: searchGoals(data.goals, query),
    milestones: searchMilestones(data.milestones, query),
    notes: searchNotes(data.notes, query),
    events,
  };
}

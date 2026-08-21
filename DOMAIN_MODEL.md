# NEXUS Domain Model — Phase 2

## Hierarchy

```
GOAL
  └── MILESTONE
        └── PROJECT
              └── TASK
                    └── SUBTASK (a Task with parentTaskId)
```

Projects may also exist **without** a Goal. Tasks may exist without a Project.

Canonical foreign keys:

- `Milestone.goalId` (required)
- `Project.goalId` (optional)
- `Project.milestoneId` (optional; if set, `goalId` is taken from the milestone)
- `Task.projectId` (optional)
- `Task.goalId` (optional; used only when there is no project)
- `Task.parentTaskId` (optional; subtask)

Do not store milestone on the task. Resolve:

`Task → Project → Milestone → Goal`

## Status machines

### Goal: draft → active → paused | completed | archived

- `draft` → active, archived
- `active` → paused, completed, archived, draft
- `paused` → active, archived
- `completed` → active, archived
- `archived` → draft

### Milestone: planned → active → completed | archived

### Project: planned → active → paused | completed | archived

Completing a parent **never** mutates children. The user stays in control.

## Progress (deterministic)

Progress is **calculated**, not stored as source of truth.

**Task:** done iff `status === "completed"`. Archived tasks are excluded.

**Project:** `round(100 * completed / countable tasks in this project)`. Empty → 0.

**Milestone:** equal-weight mean of its non-archived projects. No projects → 100 if the milestone is completed, else 0.

**Goal:**

1. If it has milestones → mean of milestone progress
2. Else if it has un-milestoned projects → mean of those projects
3. Else if it has direct tasks (`goalId`, no `projectId`) → completed / total
4. Else → 0

Weights are currently 1. `averageProgress({ progress, weight? })` is the extension point.

This is **not** a flat `completed tasks / all tasks` rollup at the goal when milestones exist. Two milestones at 100% and 0% yield 50% even if task counts differ.

## Deletion

Preferred action: **archive**.

Hard detach (explicit):

- Archive goal + optionally clear `project.goalId` / `milestoneId`
- Archive project + optionally clear `task.projectId`
- Archive milestone + optionally clear `project.milestoneId`

Children are never silently deleted. Missing parents are sanitized on load (`sanitizeProjectLinks`, `sanitizeTaskLinks`).

## Deadlines

Relative to the start of the local calendar day:

- `completed` — entity status is completed
- `overdue` — target date before today
- `due_soon` — today through +7 days
- `upcoming` — after that
- `none` — no date, or archived

## Activity

Append-only events from real mutations (`goal_created`, `task_completed`, `deadline_changed`, …). Never generated as decoration.

## Calendar events

Appointments occupy time the same way scheduled tasks do. Default scheduling behavior is `fixed`. Dragging a task in Calendar updates `Task.startTime` / `endTime` — the same fields Day Flow uses.

## Focus sessions

A session records real elapsed milliseconds (`accumulatedMs` + live delta while `active`). Pause increments `interruptions` and freezes elapsed time. Duration in minutes is written when the session completes or is abandoned. Insights only count persisted duration.

## Notes

Lightweight records (`title`, `content`, optional `taskId` / `projectId` / `goalId`). Not a document editor.

## Insights

Computed from tasks, history, and focus sessions. Missing metrics stay unavailable with an explanation — they are never invented.

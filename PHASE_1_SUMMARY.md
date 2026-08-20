# PHASE 1: TASK ENGINE + TODAY + DAY FLOW

**Status:** Implemented on the existing PHASE 0 codebase  
**Verification:** tests 34/34, `tsc --noEmit` clean, production build passing, ESLint clean

---

## 1. What was inspected

PHASE 0 foundation is real: Next.js App Router, design tokens, light/dark theme, app shell, command palette, routing, Drizzle schema.

The previous PHASE 1 pass was **not** a working product core:

- Tasks lived only in memory and reset on refresh
- Today loaded an empty demo array and never called persistence
- Day Flow had no drag, resize, or model updates
- Task Inspector did not exist
- Status transitions were not enforced
- Natural-language parsing did not exist
- No tests
- Completion % excluded completed tasks (always 0)
- Start / Complete buttons in Currently did nothing
- `userId: "demo-user"` would not fit the UUID column
- TaskService imported PostgreSQL and could not run offline

Foundational blockers that were fixed (only because they blocked this phase):

- Persistence was in-memory only → local-first repository
- `DATABASE_URL` throw at import time broke offline / DB-less builds → optional Postgres client

---

## 2. What was implemented

### Task engine (one domain model)

Tasks now include: id, title, description, status, priority, estimatedDuration, actualDuration, dueDate, startTime, endTime, projectId, goalId, parentTaskId, tags, recurrence, reminder, schedulingBehavior (fixed | flexible), createdAt, updatedAt, completedAt.

Statuses: INBOX, PLANNED, READY, IN_PROGRESS, PAUSED, BLOCKED, COMPLETED, ARCHIVED with explicit allowed transitions.

Priorities: LOW, MEDIUM, HIGH, CRITICAL — critical uses a restrained left edge, not a loud palette.

### Persistence (offline-first)

- IndexedDB via a repository (not `localStorage` in components)
- Every mutation writes through the repository
- A pending-mutation ledger is recorded for future sync
- PostgreSQL / Drizzle schema is retained and extended; it is not a second product database
- The UI does not fake a backend

### Composer + natural language

Fast capture (title + Enter). Details are progressive disclosure.

Deterministic local parser (not AI), e.g.

`Finish physics homework tomorrow at 7pm for 60 minutes`

→ title, tomorrow, 19:00, 60 minutes.

### Task Inspector

Opens in place: desktop right panel (collapsible), mobile bottom sheet. Edits persist on blur / change.

### TaskList

Reusable list with sort, filter, selection, multi-select, complete, reorder.

### Today + Currently + Momentum

Greeting, real momentum (completed / remaining / focus minutes / %), deterministic Currently (in progress → happening now → ready by priority), START / PAUSE / COMPLETE.

Empty day: “Your day is clear.” / “Plan something?” / Create task — timeline still available.

Overdue tasks stay in the system with Reschedule / Complete / Archive.

### Day Flow

Interactive 24-hour timeline:

- Drag vertically → updates startTime, endTime, dueDate; duration preserved
- Resize handle → estimatedDuration + endTime
- Click empty slot → “What’s happening?” at that time
- Complete / duplicate / delete
- Current-time indicator (updates; auto-scrolls once)
- 15 / 30 / 60 minute granularity
- CSS grid, not hundreds of DOM nodes
- Fixed vs flexible is visible; nothing auto-rearranges
- Conflicts: dialog with Move / Resize / Keep overlap / Cancel — never silent overwrite
- Mobile: vertical scroll, touch drag, long-press menu, large targets
- Desktop: timeline + inspector + keyboard (arrows, Enter, Delete)

### Quick capture

- `N` (not in inputs)
- ⌘/Ctrl+K still opens Command Center (now includes New task)
- Mobile FAB
- Desktop sidebar +

### History

Lightweight records: created, updated, rescheduled, priority_changed, started, paused, completed, reopened, archived, deleted.

---

## 3. Files created

- `src/domain/task/*` — engine (status, scheduling, conflicts, parser, factory, history, geometry, today, overdue, current)
- `src/persistence/storage.ts`, `task-repository.ts`
- `src/state/ui-store.ts`
- `src/components/features/task-composer.tsx`
- `src/components/features/task-inspector.tsx`
- `src/components/features/task-list.tsx`
- `src/components/features/conflict-dialog.tsx`
- `src/components/features/quick-capture.tsx`
- `src/components/providers/task-provider.tsx`
- `src/**/*.test.ts` and `vitest.config.ts`

## 4. Files modified

- Domain types, schema, task store, Today view, Day Flow, Task item, Tasks page
- App shell, sidebar, command palette, globals.css, db client, health route, package.json

## 5. Architecture changes

- Domain logic is pure and UI-agnostic
- Zustand is a reactive cache over the repository
- Local IndexedDB is the Phase 1 source of truth
- Postgres remains the future sync target (optional at runtime)
- Mutations are ledgered, not silently dropped

## 6. Tests executed

```
npx vitest run     → 34 passed
npx tsc --noEmit   → clean
npx eslint .       → clean
npx next build     → success
GET / and /tasks   → 200
GET /api/health    → {"ok":true,"persistence":"local"}
```

Covered: creation, editing, completion, status transitions, priority, duration, scheduling, rescheduling (14:00 → 16:00 in the model), overdue, conflicts, persistence, Day Flow geometry, parser.

## 7. Bugs found (in the previous PHASE 1)

- No persistence
- Fake / empty Today data
- Broken completion percentage
- Dead Currently actions
- Day Flow drag was visual-only (not even that)
- `any` on recurrence
- Impossible to run offline against Postgres-coupled service

## 8. Bugs fixed

All of the above, plus:

- Status machine now rejects illegal jumps
- Build no longer requires DATABASE_URL to collect pages
- Composer / inspector lint (setState-in-effect) resolved via remount keys

## 9. Known limitations

- No live PostgreSQL sync (ledger exists; worker does not)
- Parser is deterministic, not AI
- Reminders are stored, not delivered
- Recurrence is stored, instances are not generated
- Projects / goals / calendar / insights remain future phases (inspector says so)
- No service worker; offline works for mutations after the app is loaded
- Subtasks: `parentTaskId` exists, no hierarchy UI

## 10. Recommended next phase

Do **not** start Projects / Goals / Calendar / Life Map / Insights / AI.

Harden this core: Postgres sync from the mutation ledger, reminder delivery, recurring expansion, then Projects.

---

PHASE 1 is the beginning of a scheduling OS: one task model, a real Today, and a Day Flow that writes through to the data.

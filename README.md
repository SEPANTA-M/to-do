# NEXUS

**Turn chaos into visible flow.**

NEXUS is a personal productivity operating system. It connects tasks, projects, goals, day flow, calendar, focus, notes, and insights into one local-first product.

It is not a simple to-do list.

## What it does

| Question | Surface |
| --- | --- |
| What should I do? | Task / Today |
| What am I building? | Project |
| Why am I doing it? | Goal |
| When should I do it? | Day Flow / Calendar |
| What should I focus on right now? | Focus |
| How well am I working? | Insights / Weekly review |

## Features

- Task engine with real statuses, priorities, duration, scheduling, tags, and subtasks
- Today as a command center (Now → flow → up next)
- Interactive Day Flow (drag, resize, conflicts)
- Goals, milestones, projects with hierarchical progress
- Calendar (day / 3-day / week / month) on the same schedule
- Deterministic smart-scheduling suggestions (preview, never auto-applied)
- Focus mode with real elapsed time and persisted sessions
- Life map of GOAL → MILESTONE → PROJECT → TASK
- Insights and weekly review from real history
- Lightweight notes with task / project / goal links
- Command palette (⌘/Ctrl+K) across the system
- Light / dark / system theme
- Export JSON + CSV, import that never overwrites existing ids
- Offline-first IndexedDB persistence
- Installable PWA (where the browser allows)

## What it is not

- There is **no cloud login**. This build is local-first. Display name is optional.
- **Cloud sync is not configured.** A mutation ledger is stored for a future worker.
- Recurrence is stored on tasks; instances are not generated.
- Reminders are stored and can surface in-app / via the browser Notification API when you allow them. There is no push server.
- No AI. Scheduling suggestions are deterministic.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript strict
- Tailwind CSS 4
- Zustand
- IndexedDB (`nexus-local`) via `KeyValueStorage`
- Optional PostgreSQL + Drizzle (unused at runtime unless `DATABASE_URL` is set)
- Vitest

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). PostgreSQL is **not** required.

```bash
cp .env.example .env.local   # optional
```

## Test

```bash
npm test
npm run typecheck
npm run lint
```

## Production build

```bash
npm run build
npm run start
```

## Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [ENVIRONMENT.md](./ENVIRONMENT.md).

## Architecture

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## Keyboard

- `N` — new task (not while typing)
- `⌘/Ctrl+K` — command palette
- Day Flow: arrows move, Enter opens, Delete removes

# Environment

NEXUS does not require secrets to run.

## Variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | PostgreSQL connection string for a **future** sync worker. When unset the UI stays on IndexedDB. |
| `NODE_ENV` | Set by Next.js | `development` / `production` / `test` |

Copy `.env.example` to `.env.local` during development.

## Rules

- Never put API keys, tokens, or passwords in client components.
- Never commit `.env`, `.env.local`, or credential files.
- Authorization for cloud APIs must be enforced server-side. This build has no cloud auth because there is no cloud account system.
- Logging (`src/lib/logger.ts`) must not print payloads that could contain titles you consider private in a shared log drain. The default sink writes only a short message + code.

## Persistence keys (IndexedDB `nexus-local`)

- `nexus.tasks`
- `nexus.task-history`
- `nexus.mutations`
- `nexus.goals`
- `nexus.milestones`
- `nexus.projects`
- `nexus.activity`
- `nexus.notes`
- `nexus.events`
- `nexus.focus-sessions`
- `nexus.settings`
- `nexus.reviews`
- `nexus.notifications`

Theme uses Zustand persist name `nexus-theme` in `localStorage`.

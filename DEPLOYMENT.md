# Deployment

NEXUS is a Next.js application. The runtime default is **local-first**: each user's browser holds their data in IndexedDB. A PostgreSQL database is optional and unused unless you later enable a sync worker.

## Recommended: Vercel or any Node host

```bash
npm install
npm run build
npm run start
```

Or:

```bash
npx vercel
```

## Requirements

- Node.js 18+ (20 or 22 recommended)
- No database required for the current product
- HTTPS in production (service worker / PWA / notifications)

## Environment

See [ENVIRONMENT.md](./ENVIRONMENT.md). Do not commit secrets.

`DATABASE_URL` is optional. If unset:

- `GET /api/health` → `{ ok: true, persistence: "local", database: "unavailable" }`
- `GET /api/sync` → `503` with an honest "not configured" payload

## Build checklist

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Service worker

`public/sw.js` is registered from the client. It uses a versioned cache and network-first navigation with an `/offline` fallback. It does **not** cache IndexedDB contents. The worker file is served with `Cache-Control: no-cache` so deploys are not sticky.

## Static assets

App icons live in `public/icons/`. The web app manifest is `public/manifest.webmanifest`.

## Database (optional, future sync)

If you later wire PostgreSQL:

```bash
npx drizzle-kit push
```

Do not point production at a local `.env` file. Inject `DATABASE_URL` from the host.

## After deploy

1. Open the site over HTTPS
2. Create a task, reload, confirm it persists
3. Toggle offline in DevTools, create another task, confirm it remains
4. Optional: install as a PWA

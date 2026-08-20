import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool | null {
  if (!databaseUrl) return null;
  return (
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    })
  );
}

export const pool = createPool();

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

/**
 * PostgreSQL client for future sync. Phase 1 is local-first;
 * the database is optional at runtime so the app stays usable offline.
 */
export const db = pool ? drizzle(pool) : null;

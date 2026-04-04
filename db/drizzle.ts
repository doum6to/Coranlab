import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

// Prevent multiple pools during Next.js HMR in dev
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

// Detect if we're using PgBouncer transaction mode (Supabase port 6543)
const dbUrl = process.env.DATABASE_URL!;
const isTransactionMode = dbUrl.includes(":6543");

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: dbUrl,
    // In transaction mode, PgBouncer multiplexes for us so we need very few
    // per-process connections. In session mode we can keep a small pool.
    max: isTransactionMode ? 1 : 3,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    // PgBouncer transaction mode doesn't support prepared statements
    ...(isTransactionMode && {
      statement_timeout: 15000,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

const db = drizzle(pool, { schema });

export default db;

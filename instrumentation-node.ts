import { ensureDbLockdown } from "./lib/db-security";

// Skipped during `next build` and when no database is configured.
if (process.env.DATABASE_URL && process.env.NEXT_PHASE !== "phase-production-build") {
  void ensureDbLockdown();
}

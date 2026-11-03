import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

/**
 * Closes the Supabase Data API (PostgREST) on every table of the `public`
 * schema — fixes the Supabase advisor alerts "rls_disabled_in_public" and
 * "sensitive_columns_exposed".
 *
 * Why it is safe: the app NEVER reads tables through the Supabase API with
 * the anon/authenticated keys. Every query goes through Drizzle on the direct
 * Postgres connection (DATABASE_URL, table owner), which bypasses RLS. Auth
 * (schema `auth`) and Storage (schema `storage`) are separate and untouched.
 *
 * What it does (idempotent, only touches what still needs it):
 *  1. ENABLE ROW LEVEL SECURITY on every public table, with NO policy →
 *     anon/authenticated get zero rows through the API;
 *  2. REVOKE table/sequence privileges from anon and authenticated, and the
 *     same for future tables (defence in depth);
 *  3. installs an event trigger that enables RLS automatically on any table
 *     created later (drizzle push, self-healing CREATE TABLE…), when the
 *     database role is allowed to (Supabase "postgres" role is).
 */
export const LOCKDOWN_SQL = `
DO $$
DECLARE
  t record;
  has_anon boolean := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon');
  has_auth boolean := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  -- 1. Row Level Security on every table still missing it.
  FOR t IN
    SELECT c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
  END LOOP;

  -- 2. No API role may touch public tables or sequences.
  IF has_anon AND (
    EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee = 'anon')
  ) THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
  END IF;
  IF has_auth AND (
    EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee = 'authenticated')
  ) THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated';
  END IF;
  BEGIN
    IF has_anon THEN
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon';
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon';
    END IF;
    IF has_auth THEN
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated';
      EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated';
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'default privileges unchanged (insufficient privilege)';
  END;
END $$;

-- 3. Future tables: RLS switched on automatically at creation.
CREATE OR REPLACE FUNCTION public.quranlab_rls_auto_enable()
RETURNS event_trigger LANGUAGE plpgsql SET search_path = '' AS $fn$
DECLARE obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO') AND schema_name = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END $fn$;
REVOKE ALL ON FUNCTION public.quranlab_rls_auto_enable() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'quranlab_rls_auto_enable') THEN
    CREATE EVENT TRIGGER quranlab_rls_auto_enable ON ddl_command_end
      WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      EXECUTE FUNCTION public.quranlab_rls_auto_enable();
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'event trigger not installed (insufficient privilege)';
END $$;
`;

/** Lists public tables that are still exposed (RLS off), for the report. */
async function exposedTables(): Promise<string[]> {
  const res: any = await db.execute(sql`
    SELECT c.relname AS name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
    ORDER BY 1
  `);
  const rows = (res?.rows ?? res) as { name: string }[];
  return rows.map((r) => r.name);
}

export type LockdownReport = { securedBefore: string[]; remaining: string[]; autoTrigger: boolean };

/** Applies LOCKDOWN_SQL and returns which tables were fixed / still exposed. */
export async function lockDownPublicSchema(): Promise<LockdownReport> {
  const before = await exposedTables();
  await db.execute(sql.raw(LOCKDOWN_SQL));
  const after = await exposedTables();
  const trig: any = await db.execute(sql`SELECT 1 FROM pg_event_trigger WHERE evtname = 'quranlab_rls_auto_enable'`);
  return {
    securedBefore: before.filter((t) => !after.includes(t)),
    remaining: after,
    autoTrigger: ((trig?.rows ?? trig) as unknown[]).length > 0,
  };
}

let ran: Promise<void> | null = null;
/**
 * Runs the lockdown once per server process (cheap after the first time:
 * every step is skipped when nothing needs fixing). Never throws.
 */
export function ensureDbLockdown(): Promise<void> {
  if (!ran) {
    ran = lockDownPublicSchema()
      .then((r) => {
        if (r.securedBefore.length) console.log("[db-security] RLS enabled on:", r.securedBefore.join(", "));
        if (r.remaining.length) console.error("[db-security] still exposed:", r.remaining.join(", "));
      })
      .catch((e) => console.error("[db-security] lockdown failed:", e?.message || e));
  }
  return ran;
}

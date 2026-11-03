-- Paste into Supabase → SQL Editor → Run. Idempotent. Same SQL that the app
-- applies automatically at server start (lib/db-security.ts).


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

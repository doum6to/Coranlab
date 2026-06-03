import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service-role key. Server-only — never import
 * this into a client component. Used to list/manage auth users from the
 * admin portal.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}

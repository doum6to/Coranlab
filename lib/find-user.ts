import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Supabase auth user id for an email (case-insensitive), or null. */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createAdminClient();
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found.id;
    if (data.users.length < 1000) break;
  }
  return null;
}

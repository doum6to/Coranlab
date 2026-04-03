import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export async function auth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    userId: user?.id ?? null,
  };
}

export async function currentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    firstName: user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User",
    imageUrl: user.user_metadata?.avatar_url || "/mascot.svg",
    emailAddresses: [{ emailAddress: user.email || "" }],
  };
}

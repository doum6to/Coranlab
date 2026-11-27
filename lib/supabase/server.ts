import { cache } from "react";
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

/**
 * The signed-in user, asked to Supabase once per page render. Every query of a page starts by
 * asking who the learner is: without this, each one made its own network call to Supabase.
 * (`cache` is scoped to one render; in a server action each call still goes through.)
 */
const getUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export async function auth() {
  const user = await getUser();

  return {
    userId: user?.id ?? null,
  };
}

export async function currentUser() {
  const user = await getUser();

  if (!user) return null;

  return {
    id: user.id,
    firstName: user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User",
    imageUrl: user.user_metadata?.avatar_url || "/mascot.svg",
    emailAddresses: [{ emailAddress: user.email || "" }],
  };
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const publicRoutes = ["/", "/api/webhooks/stripe", "/api/auth/signup", "/api/course/activate", "/auth/login", "/auth/signup", "/auth/callback", "/auth/forgot-password", "/auth/reset-password", "/onboarding", "/carrousel"];
  const isPublicRoute =
    publicRoutes.some(route => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/blog") ||
    request.nextUrl.pathname.startsWith("/85motscoran") ||
    request.nextUrl.pathname.startsWith("/offre-a-vie") ||
    // Localized offer landings live under /en and /es (e.g. /en/offre-a-vie,
    // /es/offre-a-vie-v4) — they must be public too, or cold traffic in those
    // languages hits the login wall.
    request.nextUrl.pathname.startsWith("/en/offre-a-vie") ||
    request.nextUrl.pathname.startsWith("/es/offre-a-vie") ||
    request.nextUrl.pathname.startsWith("/comprendre-le-coran") ||
    request.nextUrl.pathname.startsWith("/lire-larabe") ||
    // VIP redemption link for buyers coming from another platform: must be
    // reachable logged-out (the code in ?c= is the gate).
    request.nextUrl.pathname.startsWith("/acces-vip") ||
    // Admin API endpoints are token-gated (ADMIN_TOKEN query param) at
    // the route level — they must be reachable without a Supabase session.
    request.nextUrl.pathname.startsWith("/api/admin/") ||
    // The premium management portal has its own credential auth (admin
    // session cookie), separate from Supabase user auth — don't bounce it
    // to the user login.
    request.nextUrl.pathname.startsWith("/admin/premium");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  } catch {
    // If auth parsing fails, redirect to login for protected routes
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

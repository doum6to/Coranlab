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

  const publicRoutes = ["/", "/api/webhooks/stripe", "/api/auth/signup", "/api/course/activate", "/auth/login", "/auth/signup", "/auth/callback", "/onboarding", "/carrousel"];
  const isPublicRoute =
    publicRoutes.some(route => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/blog") ||
    request.nextUrl.pathname.startsWith("/85motscoran");

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

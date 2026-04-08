import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Server-side signup that auto-confirms the user so no email
 * verification is required. Uses the Supabase Admin API via
 * the service role key.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim();
    const password = body.password;
    const name = body.name?.trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, mot de passe et nom sont requis." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create user with email_confirm: true to skip verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error) {
      // Handle "user already exists" gracefully
      if (error.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "Un compte avec cet e-mail existe déjà." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: { id: data.user.id } });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur interne" },
      { status: 500 }
    );
  }
}

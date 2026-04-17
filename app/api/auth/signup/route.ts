import { createClient } from "@supabase/supabase-js";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { coursePurchase, userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";

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

    // If this email has a pending course purchase with an app subscription,
    // link it so the user gets Premium access immediately.
    try {
      await linkCoursePurchaseIfAny(data.user.id, email);
    } catch (e) {
      console.error("[Signup] linkCoursePurchase failed:", e);
      // Non-fatal: the signup itself succeeded.
    }

    return NextResponse.json({ user: { id: data.user.id } });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur interne" },
      { status: 500 }
    );
  }
}

/**
 * Finds any unlinked course_purchase with hasAppSubscription=true for this
 * email, links it to the newly-created userId, and creates a matching
 * user_subscription row so /learn grants premium access immediately.
 */
async function linkCoursePurchaseIfAny(userId: string, email: string) {
  const normalizedEmail = email.toLowerCase();

  const purchase = await db.query.coursePurchase.findFirst({
    where: and(
      eq(coursePurchase.email, normalizedEmail),
      eq(coursePurchase.hasAppSubscription, true),
      isNull(coursePurchase.linkedUserId)
    ),
  });

  if (!purchase || !purchase.stripeSubscriptionId) return;

  const sub = await stripe.subscriptions.retrieve(
    purchase.stripeSubscriptionId
  );

  await db
    .insert(userSubscription)
    .values({
      userId,
      stripeCustomerId: purchase.stripeCustomerId!,
      stripeSubscriptionId: purchase.stripeSubscriptionId,
      stripePriceId: sub.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
      isLifetime: false,
    })
    .onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        stripeCustomerId: purchase.stripeCustomerId!,
        stripeSubscriptionId: purchase.stripeSubscriptionId,
        stripePriceId: sub.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        isLifetime: false,
      },
    });

  await db
    .update(coursePurchase)
    .set({ linkedUserId: userId })
    .where(eq(coursePurchase.id, purchase.id));
}

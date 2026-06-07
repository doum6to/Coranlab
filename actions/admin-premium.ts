"use server";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { coursePurchase, userSubscription } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";

// Lifetime marker far in the future; revoked marker far in the past so it
// defeats the DAY_IN_MS grace in getUserSubscription()'s isActive check.
const LIFETIME_END = new Date("2099-12-31T23:59:59Z");
const REVOKED = new Date(0);

/**
 * Manually grant premium to a user. Reuses the existing userSubscription
 * row if any (keeping the real Stripe customer id), otherwise creates a
 * row flagged with a "manual_" customer id so the portal can tell admin
 * grants apart from real Stripe subscriptions.
 */
export async function grantPremium(userId: string) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  await db
    .insert(userSubscription)
    .values({
      userId,
      stripeCustomerId: `manual_${userId}`,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: LIFETIME_END,
      isLifetime: true,
    })
    .onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        stripeCurrentPeriodEnd: LIFETIME_END,
        isLifetime: true,
      },
    });

  revalidatePath("/admin");
}

/**
 * Revoke premium from a user. Works whether the access came from Stripe or
 * a manual grant. Note: if the user still has a live Stripe subscription, a
 * future successful renewal will restore access — cancel it in Stripe too
 * to revoke permanently.
 */
export async function revokePremium(userId: string) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  await db
    .update(userSubscription)
    .set({
      stripeCurrentPeriodEnd: REVOKED,
      isLifetime: false,
    })
    .where(eq(userSubscription.userId, userId));

  revalidatePath("/admin");
}

const ARABIC_SLUG = "arabic_course";

/**
 * Grant access to the standalone "Lire l'arabe en 7h" course by email.
 * Access is matched on the email, so we record a manual course_purchase row
 * (idempotent — no-op if one already exists for this email).
 */
export async function grantArabicCourse(email: string) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { error: "Email manquant." };

  const existing = await db.query.coursePurchase.findFirst({
    where: and(
      eq(coursePurchase.email, normalized),
      eq(coursePurchase.productType, ARABIC_SLUG),
    ),
  });
  if (!existing) {
    await db.insert(coursePurchase).values({
      email: normalized,
      stripeSessionId: `manual_arabic_${crypto.randomUUID()}`,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      hasAppSubscription: false,
      productType: ARABIC_SLUG,
      activationToken: crypto.randomUUID(),
    });
  }

  revalidatePath("/admin/premium");
  return { ok: true };
}

/** Revoke access to the arabic course for an email (deletes its purchase rows). */
export async function revokeArabicCourse(email: string) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { error: "Email manquant." };

  await db
    .delete(coursePurchase)
    .where(
      and(
        eq(coursePurchase.email, normalized),
        eq(coursePurchase.productType, ARABIC_SLUG),
      ),
    );

  revalidatePath("/admin/premium");
  return { ok: true };
}

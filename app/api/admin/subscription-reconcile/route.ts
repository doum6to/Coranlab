import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { upsertSubscriptionRow } from "@/lib/stripe-sync";

const DAY_IN_MS = 86_400_000;

/**
 * GET /api/admin/subscription-reconcile?token=...[&limit=100][&fix=1]
 *
 * Backfills the `user_subscription` table from Stripe for customers who
 * paid / started a trial but whose row was never written (e.g. the webhook
 * failed silently, or the checkout.session.completed event was missed).
 *
 * This is the subscription counterpart of /api/admin/stripe-reconcile,
 * which only handles one-time course purchases.
 *
 * It scans recent completed Checkout Sessions that carry a `metadata.userId`
 * (set by both actions/trial-checkout.ts and actions/user-subscription.ts),
 * and for each:
 *   - subscription mode  → upserts the recurring/trial subscription row
 *   - payment mode       → upserts a lifetime row
 *
 * Query params:
 *   token   (required)  admin auth (ADMIN_TOKEN env var)
 *   limit   (default 100, max 300)  how many recent sessions to scan
 *   fix=1   actually write the missing/updated rows (otherwise read-only)
 *
 * Without `fix=1` this endpoint is read-only and safe to hit from a browser:
 *   https://www.quranlab.app/api/admin/subscription-reconcile?token=<token>
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not set" }, { status: 500 });
  }
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Number(url.searchParams.get("limit") || "100") || 100,
    300,
  );
  const fix = url.searchParams.get("fix") === "1";

  const sessions = await stripe.checkout.sessions.list({ limit });

  // Completed sessions tied to one of our app users (course purchases are
  // anonymous and handled by the other reconcile endpoint).
  const subSessions = sessions.data.filter(
    (s) =>
      s.status === "complete" &&
      !!s.metadata?.userId &&
      s.metadata?.productType !== "course",
  );

  const report: Array<Record<string, unknown>> = [];

  for (const s of subSessions) {
    const userId = s.metadata!.userId;
    const email = s.customer_details?.email || s.customer_email;

    const existing = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    // Compute what isActive() would currently return for the existing row.
    const isActiveNow = existing
      ? existing.isLifetime ||
        (existing.stripeCurrentPeriodEnd instanceof Date &&
          !Number.isNaN(existing.stripeCurrentPeriodEnd.getTime()) &&
          existing.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now())
      : false;

    const base = {
      stripeSessionId: s.id,
      userId,
      email,
      mode: s.mode,
      createdAt: new Date(s.created * 1000),
      existingRow: existing
        ? {
            stripeCurrentPeriodEnd: existing.stripeCurrentPeriodEnd,
            stripePriceId: existing.stripePriceId,
            isLifetime: existing.isLifetime,
            isActiveNow,
          }
        : null,
    };

    // Already in DB and already active → nothing to do.
    if (existing && isActiveNow) {
      report.push({ ...base, status: "OK_ACTIVE" });
      continue;
    }

    if (!fix) {
      report.push({
        ...base,
        status: existing ? "EXISTS_BUT_INACTIVE" : "MISSING_IN_DB",
      });
      continue;
    }

    // --- fix=1: write the row from Stripe's source of truth ---
    try {
      if (s.mode === "subscription" && s.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          s.subscription as string,
        );

        // Skip subscriptions that are no longer live (canceled/expired) —
        // we don't want to grant access to someone who churned.
        if (
          subscription.status !== "active" &&
          subscription.status !== "trialing" &&
          subscription.status !== "past_due"
        ) {
          report.push({
            ...base,
            status: `SKIPPED_${subscription.status.toUpperCase()}`,
          });
          continue;
        }

        await upsertSubscriptionRow(userId, subscription);
        report.push({
          ...base,
          status: "RECONCILED",
          subscriptionStatus: subscription.status,
          newPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
      } else if (s.mode === "payment") {
        // One-time lifetime purchase — mirror the webhook's lifetime branch.
        const lifetimeEnd = new Date("2099-12-31T23:59:59Z");
        await db
          .insert(userSubscription)
          .values({
            userId,
            stripeCustomerId: s.customer as string,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: lifetimeEnd,
            isLifetime: true,
          })
          .onConflictDoUpdate({
            target: userSubscription.userId,
            set: {
              stripeCustomerId: s.customer as string,
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: lifetimeEnd,
              isLifetime: true,
            },
          });
        report.push({ ...base, status: "RECONCILED_LIFETIME" });
      } else {
        report.push({ ...base, status: "SKIPPED_NO_SUBSCRIPTION" });
      }
    } catch (err: any) {
      report.push({
        ...base,
        status: "RECONCILE_FAILED",
        error: err?.message || String(err),
      });
    }
  }

  return NextResponse.json({
    scannedSessions: sessions.data.length,
    subscriptionSessionsFound: subSessions.length,
    missingInDb: report.filter((r) => r.status === "MISSING_IN_DB").length,
    existsButInactive: report.filter((r) => r.status === "EXISTS_BUT_INACTIVE")
      .length,
    reconciled: report.filter(
      (r) =>
        r.status === "RECONCILED" || r.status === "RECONCILED_LIFETIME",
    ).length,
    report,
    hint: fix
      ? "fix=1 → missing/inactive subscriptions have been written from Stripe."
      : "Read-only scan. Add &fix=1 to write the missing rows from Stripe.",
  });
}

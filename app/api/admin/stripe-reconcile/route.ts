import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { sendCoursePurchaseEmail } from "@/lib/email/send-course-email";

/**
 * GET  /api/admin/stripe-reconcile?token=...[&limit=50][&fix=1][&send=1]
 *
 * Compares recent Stripe checkout sessions against our course_purchase
 * table and reports every course-type paid session that is missing from
 * the DB (usually because the webhook failed silently and Stripe later
 * gave up retrying).
 *
 * Query params:
 *   token   (required)  admin auth
 *   limit   (default 100, max 300)  how many recent sessions to scan
 *   fix=1   insert any missing rows into course_purchase
 *   send=1  also attempt to send the welcome email for newly-inserted rows
 *
 * Without `fix=1` this endpoint is read-only (safe to hit from the browser).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not set" },
      { status: 500 }
    );
  }
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Number(url.searchParams.get("limit") || "100") || 100,
    300
  );
  const fix = url.searchParams.get("fix") === "1";
  const send = url.searchParams.get("send") === "1";

  // Fetch recent sessions from Stripe
  const sessions = await stripe.checkout.sessions.list({ limit });

  const coursesSessions = sessions.data.filter(
    (s) =>
      s.status === "complete" &&
      s.metadata?.productType === "course"
  );

  const report: Array<Record<string, unknown>> = [];

  for (const s of coursesSessions) {
    const email = s.customer_details?.email || s.customer_email;
    const existing = await db.query.coursePurchase.findFirst({
      where: eq(coursePurchase.stripeSessionId, s.id),
    });

    if (existing) {
      report.push({
        stripeSessionId: s.id,
        email,
        createdAt: new Date(s.created * 1000),
        amountTotal: s.amount_total,
        status: "IN_DB",
        emailSentAt: existing.emailSentAt,
      });
      continue;
    }

    // Missing from DB. Optionally insert + optionally send.
    if (fix) {
      if (!email) {
        report.push({
          stripeSessionId: s.id,
          status: "MISSING_NO_EMAIL — cannot insert",
        });
        continue;
      }

      const hasApp = s.metadata?.hasApp === "true";
      const activationToken = crypto.randomUUID();

      try {
        await db
          .insert(coursePurchase)
          .values({
            email: email.toLowerCase(),
            stripeSessionId: s.id,
            stripeCustomerId: (s.customer as string) || null,
            stripeSubscriptionId: (s.subscription as string | null) || null,
            hasAppSubscription: hasApp,
            activationToken,
          })
          .onConflictDoNothing({ target: coursePurchase.stripeSessionId });

        let emailResult: unknown = "not attempted";
        if (send) {
          const r = await sendCoursePurchaseEmail({
            email,
            hasApp,
            activationToken,
          });
          emailResult = r;
          if (r.ok) {
            await db
              .update(coursePurchase)
              .set({ emailSentAt: new Date() })
              .where(eq(coursePurchase.stripeSessionId, s.id));
          }
        }

        report.push({
          stripeSessionId: s.id,
          email,
          createdAt: new Date(s.created * 1000),
          amountTotal: s.amount_total,
          status: "INSERTED",
          emailResult,
        });
      } catch (err: any) {
        report.push({
          stripeSessionId: s.id,
          email,
          status: "INSERT_FAILED",
          error: err?.message || String(err),
        });
      }
    } else {
      report.push({
        stripeSessionId: s.id,
        email,
        createdAt: new Date(s.created * 1000),
        amountTotal: s.amount_total,
        status: "MISSING_IN_DB",
      });
    }
  }

  return NextResponse.json({
    scannedSessions: sessions.data.length,
    courseSessionsFound: coursesSessions.length,
    missingFromDb: report.filter((r) => r.status === "MISSING_IN_DB").length,
    inserted: report.filter((r) => r.status === "INSERTED").length,
    report,
    hint: fix
      ? send
        ? "fix=1 + send=1 → missing rows inserted AND emails sent."
        : "fix=1 → missing rows inserted (without sending emails). Add &send=1 to also send."
      : "Read-only scan. Add &fix=1 to insert missing rows. Add &send=1 to send emails too.",
  });
}

import { desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/admin/webhook-activity?token=...
 *
 * Diagnostic for the "emails aren't sent automatically" scenario.
 * Shows, side by side:
 *   1. Recent Stripe checkout sessions (the source of truth for paid orders)
 *   2. Recent course_purchase rows in our DB
 *   3. Stripe webhook endpoints registered on the account + what events
 *      they subscribe to.
 *
 * If stripe has a checkout.session.completed for a course purchase but
 * our DB has no matching row, the webhook isn't reaching our server.
 * If the row is present but emailSentAt is null, Resend failed.
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

  const since =
    Number(url.searchParams.get("sinceHours") || "48") * 60 * 60 * 1000;
  const sinceDate = new Date(Date.now() - since);

  // 1. Recent Stripe sessions (last N hours)
  const sessions = await stripe.checkout.sessions.list({
    limit: 50,
    created: { gte: Math.floor(sinceDate.getTime() / 1000) },
  });
  const completedSessions = sessions.data.filter(
    (s) => s.status === "complete"
  );
  const courseSessions = completedSessions.filter(
    (s) => s.metadata?.productType === "course"
  );

  // 2. Recent coursePurchase rows
  const rows = await db.query.coursePurchase.findMany({
    where: gte(coursePurchase.createdAt, sinceDate),
    orderBy: [desc(coursePurchase.createdAt)],
    limit: 50,
  });

  // 3. Stripe webhook endpoints (their URL + subscribed events)
  let endpoints: any = null;
  try {
    const list = await stripe.webhookEndpoints.list({ limit: 10 });
    endpoints = list.data.map((e) => ({
      id: e.id,
      url: e.url,
      status: e.status,
      enabled_events: e.enabled_events,
      livemode: e.livemode,
      apiVersion: e.api_version,
    }));
  } catch (err: any) {
    endpoints = { error: err?.message || String(err) };
  }

  // Correlate: for each course session, does our DB have it?
  const correlated = courseSessions.map((s) => {
    const dbRow = rows.find((r) => r.stripeSessionId === s.id);
    return {
      stripeSessionId: s.id,
      email: s.customer_details?.email || s.customer_email,
      created: new Date(s.created * 1000),
      amount: s.amount_total,
      inDb: !!dbRow,
      emailSent: !!dbRow?.emailSentAt,
    };
  });

  return NextResponse.json({
    window: `last ${Number(url.searchParams.get("sinceHours") || "48")}h`,
    stripe: {
      sessionsSeen: sessions.data.length,
      completedCourses: courseSessions.length,
      correlated,
    },
    db: {
      recentRows: rows.map((r) => ({
        email: r.email,
        stripeSessionId: r.stripeSessionId,
        createdAt: r.createdAt,
        emailSentAt: r.emailSentAt,
      })),
    },
    webhookEndpoints: endpoints,
    hint:
      "If completedCourses > 0 but inDb = false, Stripe thinks there's a sale but your server never processed it. Check that webhook endpoint URL + STRIPE_WEBHOOK_SECRET match between Stripe Dashboard and Vercel, and that checkout.session.completed is in the enabled_events list.",
  });
}

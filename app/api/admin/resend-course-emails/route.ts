import { isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { sendCoursePurchaseEmail } from "@/lib/email/send-course-email";

/**
 * POST /api/admin/resend-course-emails?token=ADMIN_TOKEN&dryRun=0
 *
 * Finds every coursePurchase row where emailSentAt is NULL, and attempts
 * to resend the welcome email. Updates emailSentAt on success.
 *
 * Query params:
 *   - token   (required)       admin auth
 *   - dryRun  (optional, "1")  list recipients without actually sending
 *   - limit   (optional)       max rows to process this run (default 50)
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not set on the server" },
      { status: 500 }
    );
  }
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = url.searchParams.get("dryRun") === "1";
  const limit = Math.min(
    Number(url.searchParams.get("limit") || "50") || 50,
    500
  );

  const pending = await db.query.coursePurchase.findMany({
    where: isNull(coursePurchase.emailSentAt),
    limit,
  });

  const results: Array<{
    email: string;
    stripeSessionId: string;
    status: "skipped" | "sent" | "failed";
    error?: string;
  }> = [];

  for (const row of pending) {
    if (dryRun) {
      results.push({
        email: row.email,
        stripeSessionId: row.stripeSessionId,
        status: "skipped",
      });
      continue;
    }

    const result = await sendCoursePurchaseEmail({
      email: row.email,
      hasApp: row.hasAppSubscription,
      activationToken: row.activationToken,
    });

    if (result.ok) {
      await db
        .update(coursePurchase)
        .set({ emailSentAt: new Date() })
        .where(eq(coursePurchase.id, row.id));
      results.push({
        email: row.email,
        stripeSessionId: row.stripeSessionId,
        status: "sent",
      });
    } else {
      results.push({
        email: row.email,
        stripeSessionId: row.stripeSessionId,
        status: "failed",
        error: result.error,
      });
    }
  }

  return NextResponse.json({
    dryRun,
    processed: results.length,
    results,
  });
}

// Also support GET for convenience (browser-friendly, dry-run only)
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

  const pending = await db.query.coursePurchase.findMany({
    where: isNull(coursePurchase.emailSentAt),
    limit: 500,
  });

  return NextResponse.json({
    pendingCount: pending.length,
    pending: pending.map((p) => ({
      email: p.email,
      stripeSessionId: p.stripeSessionId,
      hasAppSubscription: p.hasAppSubscription,
      createdAt: p.createdAt,
    })),
    advice:
      "POST to this endpoint (same URL, same token) to actually retry sending.",
  });
}

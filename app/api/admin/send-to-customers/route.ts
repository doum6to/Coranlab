import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { sendCoursePurchaseEmail } from "@/lib/email/send-course-email";

/**
 * Manually send the course-purchase welcome email to a list of customers.
 *
 * Designed for rescue cases: customers who bought but — for whatever
 * reason (early webhook bug, Stripe event missed, etc.) — never got
 * their welcome email.
 *
 * ┌─ GET (browser-friendly) ──────────────────────────────────────────┐
 * │  /api/admin/send-to-customers?token=ADMIN_TOKEN                    │
 * │     &emails=a@b.com,c@d.com,e@f.com                                │
 * │     &hasApp=false   (optional, defaults to false)                  │
 * │     &dryRun=1       (optional, just shows what would be sent)      │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * ┌─ POST (JSON body) ────────────────────────────────────────────────┐
 * │  POST /api/admin/send-to-customers?token=ADMIN_TOKEN               │
 * │  Content-Type: application/json                                    │
 * │  { "emails": ["a@b.com"], "hasApp": false, "dryRun": false }       │
 * └───────────────────────────────────────────────────────────────────┘
 *
 * Creates a course_purchase row for each email (with a synthetic
 * stripe_session_id so the unique constraint is satisfied) if one
 * doesn't already exist, then sends the welcome email. Marks
 * emailSentAt on success.
 */

type Params = {
  emails: string[];
  hasApp: boolean;
  dryRun: boolean;
};

async function processSend(p: Params) {
  const results: Array<{
    email: string;
    status: "sent" | "failed" | "invalid" | "dry-run";
    id?: string;
    error?: string;
    reusedExisting?: boolean;
  }> = [];

  for (const raw of p.emails) {
    const email = raw.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      results.push({ email: raw, status: "invalid" });
      continue;
    }

    if (p.dryRun) {
      results.push({ email, status: "dry-run" });
      continue;
    }

    // Find any existing row for this email (any session).
    const existing = await db.query.coursePurchase.findFirst({
      where: eq(coursePurchase.email, email),
    });

    let rowId: number;
    let activationToken: string;
    let reusedExisting = false;
    let hasApp = p.hasApp;

    if (existing) {
      rowId = existing.id;
      activationToken = existing.activationToken;
      hasApp = existing.hasAppSubscription || p.hasApp;
      reusedExisting = true;
    } else {
      activationToken = crypto.randomUUID();
      const syntheticSessionId = `manual-${email}-${Date.now()}`;
      const inserted = await db
        .insert(coursePurchase)
        .values({
          email,
          stripeSessionId: syntheticSessionId,
          hasAppSubscription: hasApp,
          activationToken,
        })
        .returning({ id: coursePurchase.id });
      rowId = inserted[0].id;
    }

    const r = await sendCoursePurchaseEmail({
      email,
      hasApp,
      activationToken,
    });

    if (r.ok) {
      await db
        .update(coursePurchase)
        .set({ emailSentAt: new Date() })
        .where(eq(coursePurchase.id, rowId));
      results.push({ email, status: "sent", id: r.id, reusedExisting });
    } else {
      results.push({
        email,
        status: "failed",
        error: r.error,
        reusedExisting,
      });
    }
  }

  return results;
}

function unauthorizedIfBadToken(req: Request) {
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
  return null;
}

export async function GET(req: Request) {
  const authFail = unauthorizedIfBadToken(req);
  if (authFail) return authFail;

  const url = new URL(req.url);
  const emailsParam = url.searchParams.get("emails") || "";
  const emails = emailsParam
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const hasApp = url.searchParams.get("hasApp") === "true";
  const dryRun = url.searchParams.get("dryRun") === "1";

  if (emails.length === 0) {
    return NextResponse.json(
      {
        error: "Missing &emails=a@b.com,c@d.com",
        hint:
          "Example: /api/admin/send-to-customers?token=...&emails=a@b.com,c@d.com&hasApp=false",
      },
      { status: 400 }
    );
  }

  const results = await processSend({ emails, hasApp, dryRun });

  return NextResponse.json({
    dryRun,
    hasApp,
    processed: results.length,
    results,
  });
}

export async function POST(req: Request) {
  const authFail = unauthorizedIfBadToken(req);
  if (authFail) return authFail;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const emails = Array.isArray(body?.emails) ? body.emails : [];
  const hasApp = Boolean(body?.hasApp);
  const dryRun = Boolean(body?.dryRun);

  if (emails.length === 0) {
    return NextResponse.json(
      { error: "body.emails must be a non-empty array" },
      { status: 400 }
    );
  }

  const results = await processSend({ emails, hasApp, dryRun });

  return NextResponse.json({
    dryRun,
    hasApp,
    processed: results.length,
    results,
  });
}

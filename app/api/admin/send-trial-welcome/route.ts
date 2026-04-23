import { NextResponse } from "next/server";

import { sendTrialWelcome } from "@/lib/email/send-trial-emails";

/**
 * Send the trial-welcome email manually to one or more recipients.
 *
 * GET  /api/admin/send-trial-welcome?token=...&emails=a@b.com,c@d.com
 *      [&trialEnds=2026-05-01]  (defaults to now + 7 days)
 *      [&dryRun=1]
 *
 * POST same URL, with JSON body:
 *      { "emails": ["a@b.com"], "trialEndsAt": "2026-05-01", "dryRun": false }
 */

function unauth(req: Request) {
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
  return null;
}

type Params = {
  emails: string[];
  trialEndsAt: Date;
  dryRun: boolean;
};

async function sendBatch(p: Params) {
  const results: Array<{
    email: string;
    status: "sent" | "failed" | "invalid" | "dry-run";
    id?: string;
    error?: string;
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
    const r = await sendTrialWelcome({
      email,
      trialEndsAt: p.trialEndsAt,
    });
    if (r.ok) {
      results.push({ email, status: "sent", id: r.id });
    } else {
      results.push({ email, status: "failed", error: r.error });
    }
  }
  return results;
}

function defaultTrialEnd(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export async function GET(req: Request) {
  const fail = unauth(req);
  if (fail) return fail;

  const url = new URL(req.url);
  const emailsParam = url.searchParams.get("emails") || "";
  const emails = emailsParam
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const trialEndsStr = url.searchParams.get("trialEnds");
  const trialEndsAt = trialEndsStr ? new Date(trialEndsStr) : defaultTrialEnd();
  const dryRun = url.searchParams.get("dryRun") === "1";

  if (emails.length === 0) {
    return NextResponse.json(
      {
        error: "Missing &emails=a@b.com,c@d.com",
        hint: "e.g. ?token=...&emails=x@y.com&trialEnds=2026-05-01",
      },
      { status: 400 }
    );
  }

  const results = await sendBatch({ emails, trialEndsAt, dryRun });
  return NextResponse.json({
    dryRun,
    trialEndsAt: trialEndsAt.toISOString(),
    processed: results.length,
    results,
  });
}

export async function POST(req: Request) {
  const fail = unauth(req);
  if (fail) return fail;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const emails = Array.isArray(body?.emails) ? body.emails : [];
  const trialEndsAt = body?.trialEndsAt
    ? new Date(body.trialEndsAt)
    : defaultTrialEnd();
  const dryRun = Boolean(body?.dryRun);

  if (emails.length === 0) {
    return NextResponse.json(
      { error: "body.emails must be a non-empty array" },
      { status: 400 }
    );
  }

  const results = await sendBatch({ emails, trialEndsAt, dryRun });
  return NextResponse.json({
    dryRun,
    trialEndsAt: trialEndsAt.toISOString(),
    processed: results.length,
    results,
  });
}

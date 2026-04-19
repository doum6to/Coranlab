import { NextResponse } from "next/server";

/**
 * GET /api/admin/resend-diagnose?token=ADMIN_TOKEN
 *
 * Returns a status report on the Resend integration:
 *   - Is RESEND_API_KEY present?
 *   - What FROM address is configured?
 *   - Which domains are verified in Resend?
 *
 * Protected by the ADMIN_TOKEN env var — set it in Vercel and hit:
 *   https://www.quranlab.app/api/admin/resend-diagnose?token=<the token>
 */
export async function GET(req: Request) {
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  const replyTo = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";
  const driveUrl = process.env.COURSE_DRIVE_URL || "(default fallback)";

  const report: Record<string, unknown> = {
    env: {
      RESEND_API_KEY: apiKey ? "set (hidden)" : "MISSING",
      RESEND_FROM_EMAIL: from,
      RESEND_REPLY_TO: replyTo,
      COURSE_DRIVE_URL: driveUrl === "(default fallback)"
        ? "not set (using fallback Drive URL)"
        : "set",
    },
  };

  if (!apiKey) {
    report.advice =
      "Add RESEND_API_KEY to Vercel env vars. Generate one at https://resend.com/api-keys";
    return NextResponse.json(report, { status: 200 });
  }

  // Fetch verified domains from Resend API
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();
    report.resendDomains = json;

    if (Array.isArray(json?.data)) {
      const verified = json.data.filter((d: any) => d.status === "verified");
      const fromDomain = from.match(/@([^>\s]+)/)?.[1];
      const fromVerified = verified.some((d: any) => d.name === fromDomain);

      report.summary = {
        fromDomain,
        fromDomainVerified: fromVerified,
        totalDomains: json.data.length,
        verifiedDomains: verified.map((d: any) => d.name),
      };

      if (!fromVerified) {
        report.advice =
          `The FROM domain "${fromDomain}" is NOT verified in Resend. ` +
          `Either verify it at https://resend.com/domains (add DNS records), or ` +
          `change RESEND_FROM_EMAIL to use a verified domain. ` +
          `Available verified domains: ${
            verified.map((d: any) => d.name).join(", ") || "none"
          }`;
      } else {
        report.advice =
          "Setup looks healthy. FROM domain is verified — try a test send via /api/admin/resend-test.";
      }
    }
  } catch (e: any) {
    report.resendApiError = e?.message || String(e);
    report.advice =
      "Could not reach Resend API. Check that the API key is valid.";
  }

  return NextResponse.json(report, { status: 200 });
}

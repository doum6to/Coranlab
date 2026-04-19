import { NextResponse } from "next/server";

import { getResend } from "@/lib/email/resend";

/**
 * GET /api/admin/resend-test?token=ADMIN_TOKEN&to=you@example.com
 *
 * Fires a plain test email through the same Resend client used by the
 * rest of the app. Returns the Resend response verbatim so you can see
 * exactly what is failing (unverified domain, invalid API key, rate
 * limit, etc.).
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

  const to = url.searchParams.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "missing ?to=<email>" },
      { status: 400 }
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  const replyTo = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY missing" },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to,
      replyTo,
      subject: "Quranlab — test email from Resend",
      text:
        "Ceci est un test envoyé depuis /api/admin/resend-test.\n\n" +
        "Si tu reçois cet email, Resend est correctement configuré.\n" +
        "FROM: " +
        from +
        "\nREPLY-TO: " +
        replyTo,
    });

    return NextResponse.json(
      {
        ok: !error,
        from,
        to,
        replyTo,
        id: data?.id,
        error: error ? { name: error.name, message: error.message } : null,
      },
      { status: error ? 400 : 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        from,
        to,
        replyTo,
        unexpectedError: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}

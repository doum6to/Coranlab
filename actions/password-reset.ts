"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";
import { passwordResetSubject, renderPasswordResetEmailHtml } from "@/lib/email/templates/password-reset";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { absoluteUrl } from "@/lib/utils";

/**
 * Password reset with OUR email (branded, in the user's language) instead of
 * Supabase's default template: the recovery link is generated server-side
 * with the admin API and sent through Resend. The link lands on
 * /auth/callback?token_hash=…&type=recovery, which opens a session and
 * forwards to /auth/reset-password.
 *
 * Always answers `ok` for unknown emails (no account enumeration).
 */
export async function requestPasswordReset(
  rawEmail: string,
): Promise<{ ok: true } | { error: "rate_limited" | "send_failed" }> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: true };
  const locale = getRequestLocale();

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: absoluteUrl("/auth/reset-password") },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    // Unknown user → pretend we sent it.
    if (msg.includes("not found") || msg.includes("no user")) return { ok: true };
    console.error("[password-reset] generateLink failed:", error.message);
    return { error: msg.includes("rate limit") ? "rate_limited" : "send_failed" };
  }

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) {
    console.error("[password-reset] no hashed_token in generateLink response");
    return { error: "send_failed" };
  }

  const url = absoluteUrl(
    `/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${encodeURIComponent("/auth/reset-password")}`,
  );

  if (!process.env.RESEND_API_KEY) {
    console.error("[password-reset] RESEND_API_KEY missing");
    return { error: "send_failed" };
  }
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>",
      replyTo: process.env.RESEND_REPLY_TO || "qalbanah@gmail.com",
      to: email,
      subject: passwordResetSubject(locale),
      html: renderPasswordResetEmailHtml({ url, locale }),
    });
    if (result.error) {
      console.error("[password-reset] Resend failed:", result.error.message);
      return { error: /rate/i.test(result.error.message) ? "rate_limited" : "send_failed" };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[password-reset] send threw:", e?.message || e);
    return { error: "send_failed" };
  }
}

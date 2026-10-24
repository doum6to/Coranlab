import { getResend } from "./resend";
import { renderSubscriptionWelcomeEmailHtml, subscriptionWelcomeSubject } from "./templates/subscription-welcome";
import type { Locale } from "@/lib/i18n/locales";
import { absoluteUrl } from "@/lib/utils";

/**
 * Sends the "create your account" email after a recurring subscription bought
 * anonymously via /apprendre-coran. Never throws (mirrors sendCoursePurchaseEmail):
 * the purchase is already recorded, so an email failure must not fail the webhook.
 */
export async function sendSubscriptionWelcomeEmail({
  email,
  activationToken,
  locale = "fr",
}: {
  email: string;
  activationToken: string;
  locale?: Locale;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const activationUrl = absoluteUrl(`/api/course/activate?token=${activationToken}`);
  const from = process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  const replyTo = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    const error = "RESEND_API_KEY missing.";
    console.error("[Resend]", error);
    return { ok: false, error };
  }

  try {
    const html = renderSubscriptionWelcomeEmailHtml({ activationUrl, locale });
    const result = await getResend().emails.send({
      from,
      to: email,
      replyTo,
      subject: subscriptionWelcomeSubject(locale),
      html,
    });
    if (result.error) {
      const summary = `${result.error.name || "error"}: ${result.error.message}`;
      console.error("[Resend] subscription email failed", summary);
      return { ok: false, error: summary };
    }
    const id = result.data?.id || "unknown";
    console.log(`[Resend] subscription email sent to ${email} (id=${id})`);
    return { ok: true, id };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[Resend] subscription email unexpected error", msg);
    return { ok: false, error: msg };
  }
}

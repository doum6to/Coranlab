import { getResend } from "./resend";
import { renderLeadMagnetEmailHtml } from "./templates/lead-magnet";
import { renderNurtureEmailHtml } from "./templates/nurture";
import { absoluteUrl } from "@/lib/utils";
import { unsubscribeUrl } from "@/lib/leads/unsub";
import type { LeadMagnetContent } from "@/lib/lead-magnet-content";

type Result = { ok: true; id: string } | { ok: false; error: string };

const FROM = () =>
  process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
const REPLY_TO = () => process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

/** Makes a possibly-relative CTA URL absolute for use inside an email. */
function absCta(url: string): string {
  const u = (url || "/coran").trim();
  return /^https?:\/\//i.test(u) ? u : absoluteUrl(u.startsWith("/") ? u : `/${u}`);
}

/** Sends the free lead-magnet email (the words + CTA). Never throws. */
export async function sendLeadMagnetEmail(
  email: string,
  content: LeadMagnetContent,
): Promise<Result> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[lead-email] RESEND_API_KEY missing.");
    return { ok: false, error: "RESEND_API_KEY missing." };
  }
  try {
    const html = renderLeadMagnetEmailHtml({
      heading: content.emailHeading,
      introHtml: content.emailIntro,
      words: content.words,
      ctaLabel: content.ctaLabel,
      ctaUrl: absCta(content.ctaUrl),
      unsubscribeUrl: unsubscribeUrl(email),
    });
    const result = await getResend().emails.send({
      from: FROM(),
      to: email,
      replyTo: REPLY_TO(),
      subject: content.emailSubject,
      html,
    });
    if (result.error) {
      const e = `${result.error.name || "error"}: ${result.error.message}`;
      console.error("[lead-email] magnet failed", e);
      return { ok: false, error: e };
    }
    return { ok: true, id: result.data?.id || "unknown" };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[lead-email] magnet unexpected error", msg);
    return { ok: false, error: msg };
  }
}

/** Sends one nurture (drip) email. Never throws. */
export async function sendNurtureEmail(
  email: string,
  step: { subject: string; bodyHtml: string },
  content: LeadMagnetContent,
): Promise<Result> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[lead-email] RESEND_API_KEY missing.");
    return { ok: false, error: "RESEND_API_KEY missing." };
  }
  try {
    const html = renderNurtureEmailHtml({
      heading: step.subject,
      bodyHtml: step.bodyHtml,
      ctaLabel: content.ctaLabel,
      ctaUrl: absCta(content.ctaUrl),
      unsubscribeUrl: unsubscribeUrl(email),
    });
    const result = await getResend().emails.send({
      from: FROM(),
      to: email,
      replyTo: REPLY_TO(),
      subject: step.subject,
      html,
    });
    if (result.error) {
      const e = `${result.error.name || "error"}: ${result.error.message}`;
      console.error("[lead-email] nurture failed", e);
      return { ok: false, error: e };
    }
    return { ok: true, id: result.data?.id || "unknown" };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[lead-email] nurture unexpected error", msg);
    return { ok: false, error: msg };
  }
}

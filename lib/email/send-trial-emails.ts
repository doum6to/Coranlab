import { getResend } from "./resend";
import { renderTrialWelcomeHtml, trialWelcomeSubject } from "./templates/trial-welcome";
import { renderTrialEndingSoonHtml, trialEndingSoonSubject } from "./templates/trial-ending-soon";
import { renderPaymentSucceededHtml, paymentSucceededSubject } from "./templates/payment-succeeded";
import { renderPaymentFailedHtml, paymentFailedSubject } from "./templates/payment-failed";
import { formatEmailAmount, formatEmailDate } from "./locale";
import type { Locale } from "@/lib/i18n/locales";
import { absoluteUrl } from "@/lib/utils";

const FROM =
  process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";


type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; details?: unknown };

async function safeSend(params: {
  to: string;
  subject: string;
  html: string;
  label: string;
}): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    const error = "RESEND_API_KEY missing";
    console.error(`[Resend] ${params.label}`, error);
    return { ok: false, error };
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM,
      to: params.to,
      replyTo: REPLY_TO,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      const summary = `${error.name || "error"}: ${error.message}`;
      console.error(
        `[Resend] ${params.label} failed`,
        JSON.stringify(
          {
            to: params.to,
            from: FROM,
            errorName: error.name,
            errorMessage: error.message,
          },
          null,
          2
        )
      );
      return { ok: false, error: summary, details: error };
    }
    const id = data?.id || "unknown";
    console.log(`[Resend] ${params.label} sent to ${params.to} (id=${id})`);
    return { ok: true, id };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error(
      `[Resend] ${params.label} threw`,
      JSON.stringify({ to: params.to, from: FROM, error: msg }, null, 2)
    );
    return { ok: false, error: msg, details: e };
  }
}

export async function sendTrialWelcome(params: {
  email: string;
  trialEndsAt: Date;
  locale?: Locale;
}) {
  const locale = params.locale ?? "fr";
  return safeSend({
    to: params.email,
    subject: trialWelcomeSubject(locale),
    html: renderTrialWelcomeHtml({
      appUrl: absoluteUrl("/learn"),
      trialEndsAt: formatEmailDate(params.trialEndsAt, locale),
      locale,
    }),
    label: "trial-welcome",
  });
}

export async function sendTrialEndingSoon(params: {
  email: string;
  trialEndsAt: Date;
  billingPortalUrl: string;
  locale?: Locale;
}) {
  const locale = params.locale ?? "fr";
  return safeSend({
    to: params.email,
    subject: trialEndingSoonSubject(locale),
    html: renderTrialEndingSoonHtml({
      billingPortalUrl: params.billingPortalUrl,
      trialEndsAt: formatEmailDate(params.trialEndsAt, locale),
      locale,
    }),
    label: "trial-ending-soon",
  });
}

export async function sendPaymentSucceeded(params: {
  email: string;
  amountCents: number;
  nextBillingAt: Date;
  locale?: Locale;
}) {
  const locale = params.locale ?? "fr";
  return safeSend({
    to: params.email,
    subject: paymentSucceededSubject(locale),
    html: renderPaymentSucceededHtml({
      appUrl: absoluteUrl("/learn"),
      amount: formatEmailAmount(params.amountCents, locale),
      nextBillingAt: formatEmailDate(params.nextBillingAt, locale),
      locale,
    }),
    label: "payment-succeeded",
  });
}

export async function sendPaymentFailed(params: {
  email: string;
  billingPortalUrl: string;
  locale?: Locale;
}) {
  const locale = params.locale ?? "fr";
  return safeSend({
    to: params.email,
    subject: paymentFailedSubject(locale),
    html: renderPaymentFailedHtml({
      billingPortalUrl: params.billingPortalUrl,
      locale,
    }),
    label: "payment-failed",
  });
}

import { getResend } from "./resend";
import { TrialWelcomeEmail } from "./templates/trial-welcome";
import { TrialEndingSoonEmail } from "./templates/trial-ending-soon";
import { PaymentSucceededEmail } from "./templates/payment-succeeded";
import { PaymentFailedEmail } from "./templates/payment-failed";
import { absoluteUrl } from "@/lib/utils";

const FROM =
  process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
// replyTo : replies land in the founder's Gmail.
const REPLY_TO = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; details?: unknown };

async function safeSend(params: {
  to: string;
  subject: string;
  react: React.ReactElement;
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
      react: params.react,
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
}) {
  return safeSend({
    to: params.email,
    subject: "Bienvenue dans Quranlab — ton essai 7 jours est actif",
    react: TrialWelcomeEmail({
      appUrl: absoluteUrl("/learn"),
      trialEndsAt: formatDate(params.trialEndsAt),
    }),
    label: "trial-welcome",
  });
}

export async function sendTrialEndingSoon(params: {
  email: string;
  trialEndsAt: Date;
  billingPortalUrl: string;
}) {
  return safeSend({
    to: params.email,
    subject: "Ton essai Quranlab se termine dans 3 jours",
    react: TrialEndingSoonEmail({
      billingPortalUrl: params.billingPortalUrl,
      trialEndsAt: formatDate(params.trialEndsAt),
    }),
    label: "trial-ending-soon",
  });
}

export async function sendPaymentSucceeded(params: {
  email: string;
  amountCents: number;
  nextBillingAt: Date;
}) {
  const amount =
    (params.amountCents / 100).toFixed(2).replace(".", ",") + "€";
  return safeSend({
    to: params.email,
    subject: "Paiement Quranlab confirmé",
    react: PaymentSucceededEmail({
      appUrl: absoluteUrl("/learn"),
      amount,
      nextBillingAt: formatDate(params.nextBillingAt),
    }),
    label: "payment-succeeded",
  });
}

export async function sendPaymentFailed(params: {
  email: string;
  billingPortalUrl: string;
}) {
  return safeSend({
    to: params.email,
    subject: "Ton paiement Quranlab n'est pas passé",
    react: PaymentFailedEmail({ billingPortalUrl: params.billingPortalUrl }),
    label: "payment-failed",
  });
}

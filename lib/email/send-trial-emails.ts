import { getResend } from "./resend";
import { TrialWelcomeEmail } from "./templates/trial-welcome";
import { TrialEndingSoonEmail } from "./templates/trial-ending-soon";
import { PaymentSucceededEmail } from "./templates/payment-succeeded";
import { PaymentFailedEmail } from "./templates/payment-failed";
import { absoluteUrl } from "@/lib/utils";

const FROM =
  process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function sendTrialWelcome(params: {
  email: string;
  trialEndsAt: Date;
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "Bienvenue dans Quranlab — ton essai 7 jours est actif",
    react: TrialWelcomeEmail({
      appUrl: absoluteUrl("/learn"),
      trialEndsAt: formatDate(params.trialEndsAt),
    }),
  });
  if (error) console.error("[Resend] trial-welcome error:", error);
}

export async function sendTrialEndingSoon(params: {
  email: string;
  trialEndsAt: Date;
  billingPortalUrl: string;
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "Ton essai Quranlab se termine dans 3 jours",
    react: TrialEndingSoonEmail({
      billingPortalUrl: params.billingPortalUrl,
      trialEndsAt: formatDate(params.trialEndsAt),
    }),
  });
  if (error) console.error("[Resend] trial-ending-soon error:", error);
}

export async function sendPaymentSucceeded(params: {
  email: string;
  amountCents: number;
  nextBillingAt: Date;
}) {
  const amount = (params.amountCents / 100)
    .toFixed(2)
    .replace(".", ",") + "€";
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "Paiement Quranlab confirmé",
    react: PaymentSucceededEmail({
      appUrl: absoluteUrl("/learn"),
      amount,
      nextBillingAt: formatDate(params.nextBillingAt),
    }),
  });
  if (error) console.error("[Resend] payment-succeeded error:", error);
}

export async function sendPaymentFailed(params: {
  email: string;
  billingPortalUrl: string;
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: "Ton paiement Quranlab n'est pas passé",
    react: PaymentFailedEmail({ billingPortalUrl: params.billingPortalUrl }),
  });
  if (error) console.error("[Resend] payment-failed error:", error);
}

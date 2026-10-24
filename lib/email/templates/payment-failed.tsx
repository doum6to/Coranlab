import { buildEmail, buttonHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Ton paiement Quranlab n'est pas passé",
    preview: "Ton paiement Quranlab n'est pas passé.",
    heading: "Paiement non abouti",
    body: "On a tenté de renouveler ton abonnement Quranlab, mais le paiement n'est pas passé (carte expirée, fonds insuffisants, ou refus bancaire).",
    keep: "<strong>Pour conserver ton accès</strong>, mets à jour ton moyen de paiement dans les prochains jours. Stripe retentera automatiquement.",
    button: "Mettre à jour ma carte",
    fine: "Si tu préfères arrêter, tu n'as rien à faire&nbsp;: ton abonnement sera annulé automatiquement après plusieurs échecs de paiement.",
  },
  en: {
    subject: "Your Quranlab payment didn't go through",
    preview: "Your Quranlab payment didn't go through.",
    heading: "Payment failed",
    body: "We tried to renew your Quranlab subscription, but the payment didn't go through (expired card, insufficient funds, or declined by the bank).",
    keep: "<strong>To keep your access</strong>, update your payment method in the next few days. Stripe will retry automatically.",
    button: "Update my card",
    fine: "If you'd rather stop, there's nothing to do: your subscription will be cancelled automatically after several failed attempts.",
  },
  es: {
    subject: "Tu pago de Quranlab no se ha realizado",
    preview: "Tu pago de Quranlab no se ha realizado.",
    heading: "Pago no completado",
    body: "Intentamos renovar tu suscripción a Quranlab, pero el pago no se realizó (tarjeta caducada, fondos insuficientes o rechazo del banco).",
    keep: "<strong>Para conservar tu acceso</strong>, actualiza tu método de pago en los próximos días. Stripe lo reintentará automáticamente.",
    button: "Actualizar mi tarjeta",
    fine: "Si prefieres parar, no tienes que hacer nada: tu suscripción se cancelará automáticamente tras varios intentos fallidos.",
  },
} as const;

export const paymentFailedSubject = (locale: Locale) => COPY[locale].subject;

export function renderPaymentFailedHtml({ billingPortalUrl, locale = "fr" }: { billingPortalUrl: string; locale?: Locale }): string {
  const c = COPY[locale];
  const body = [pHtml(c.body), pHtml(c.keep), buttonHtml({ href: billingPortalUrl, label: c.button, variant: "coral" }), fineHtml(c.fine)].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

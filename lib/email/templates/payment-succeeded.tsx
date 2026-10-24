import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Paiement Quranlab confirmé",
    preview: "Paiement confirmé. Ton abonnement Quranlab continue.",
    heading: "Paiement reçu, merci",
    body: (a: string) => `Ton paiement de <strong>${a}</strong> a bien été reçu. Ton abonnement Quranlab continue.`,
    next: (d: string) => `Prochaine facturation le <strong>${d}</strong>.`,
    button: "Retour à l'application →",
    fine: "Tu peux modifier ton moyen de paiement ou résilier à tout moment depuis tes paramètres.",
  },
  en: {
    subject: "Quranlab payment confirmed",
    preview: "Payment confirmed. Your Quranlab subscription continues.",
    heading: "Payment received, thank you",
    body: (a: string) => `Your payment of <strong>${a}</strong> was received. Your Quranlab subscription continues.`,
    next: (d: string) => `Next billing on <strong>${d}</strong>.`,
    button: "Back to the app →",
    fine: "You can update your payment method or cancel at any time from your settings.",
  },
  es: {
    subject: "Pago de Quranlab confirmado",
    preview: "Pago confirmado. Tu suscripción a Quranlab continúa.",
    heading: "Pago recibido, gracias",
    body: (a: string) => `Hemos recibido tu pago de <strong>${a}</strong>. Tu suscripción a Quranlab continúa.`,
    next: (d: string) => `Próximo cobro el <strong>${d}</strong>.`,
    button: "Volver a la aplicación →",
    fine: "Puedes cambiar tu método de pago o cancelar cuando quieras desde tus ajustes.",
  },
} as const;

export const paymentSucceededSubject = (locale: Locale) => COPY[locale].subject;

export function renderPaymentSucceededHtml({ appUrl, amount, nextBillingAt, locale = "fr" }: { appUrl: string; amount: string; nextBillingAt: string; locale?: Locale }): string {
  const c = COPY[locale];
  const body = [pHtml(c.body(escapeHtml(amount))), fineHtml(c.next(escapeHtml(nextBillingAt))), buttonHtml({ href: appUrl, label: c.button }), fineHtml(c.fine)].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

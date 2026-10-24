import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Ton essai Quranlab se termine dans 3 jours",
    preview: "Ton essai Quranlab se termine dans 3 jours.",
    heading: "Plus que 3 jours d'essai",
    ends: (d: string) => `Ton essai gratuit se termine le <strong>${d}</strong>. Si tu continues, ton abonnement passera à <strong>14,97&nbsp;€/mois</strong> automatiquement.`,
    keep: "<strong>Tu veux continuer&nbsp;?</strong> Tu n'as rien à faire. Tu restes dans l'app, la facturation se fait toute seule.",
    stop: "<strong>Tu préfères arrêter&nbsp;?</strong> Aucun souci&nbsp;: clique ci-dessous pour résilier, tu ne seras pas facturé.",
    button: "Gérer mon abonnement",
    fine: "Résiliation en 1 clic, aucun frais. Tu gardes l'accès jusqu'à la fin de ton essai.",
  },
  en: {
    subject: "Your Quranlab trial ends in 3 days",
    preview: "Your Quranlab trial ends in 3 days.",
    heading: "3 days of trial left",
    ends: (d: string) => `Your free trial ends on <strong>${d}</strong>. If you continue, your subscription switches to <strong>€14.97/month</strong> automatically.`,
    keep: "<strong>Want to continue?</strong> Nothing to do. Stay in the app, billing happens by itself.",
    stop: "<strong>Prefer to stop?</strong> No problem: click below to cancel, you won't be charged.",
    button: "Manage my subscription",
    fine: "One-click cancellation, no fees. You keep access until the end of your trial.",
  },
  es: {
    subject: "Tu prueba de Quranlab termina en 3 días",
    preview: "Tu prueba de Quranlab termina en 3 días.",
    heading: "Quedan 3 días de prueba",
    ends: (d: string) => `Tu prueba gratuita termina el <strong>${d}</strong>. Si continúas, tu suscripción pasará a <strong>14,97&nbsp;€/mes</strong> automáticamente.`,
    keep: "<strong>¿Quieres continuar?</strong> No tienes que hacer nada. Sigues en la app y el cobro se hace solo.",
    stop: "<strong>¿Prefieres parar?</strong> Sin problema: haz clic abajo para cancelar, no se te cobrará.",
    button: "Gestionar mi suscripción",
    fine: "Cancelación con un clic, sin costes. Mantienes el acceso hasta el final de tu prueba.",
  },
} as const;

export const trialEndingSoonSubject = (locale: Locale) => COPY[locale].subject;

export function renderTrialEndingSoonHtml({ billingPortalUrl, trialEndsAt, locale = "fr" }: { billingPortalUrl: string; trialEndsAt: string; locale?: Locale }): string {
  const c = COPY[locale];
  const body = [pHtml(c.ends(escapeHtml(trialEndsAt))), pHtml(c.keep), pHtml(c.stop), buttonHtml({ href: billingPortalUrl, label: c.button }), fineHtml(c.fine)].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Bienvenue dans Quranlab — ton essai 7 jours est actif",
    preview: "Ton essai Quranlab est actif. Commence dès maintenant.",
    heading: "Bienvenue dans Quranlab",
    hello: "Assalamu alaikum&nbsp;!",
    body: "Ton essai <strong>7 jours gratuits</strong> est actif. Tu as accès dès maintenant à toutes les leçons, exercices et documents PDF de Quranlab.",
    button: "Accéder à l'application →",
    ends: (d: string) => `Ton essai se termine le <strong>${d}</strong>. Après cette date, ton abonnement passera à 14,97&nbsp;€/mois si tu ne résilies pas. Tu peux annuler en 1 clic depuis tes paramètres.`,
    tip: "<strong>Petit conseil</strong>&nbsp;: même 5 minutes par jour suffisent. La répétition espacée fait le reste.",
  },
  en: {
    subject: "Welcome to Quranlab — your 7-day trial is active",
    preview: "Your Quranlab trial is active. Start right now.",
    heading: "Welcome to Quranlab",
    hello: "Assalamu alaikum!",
    body: "Your <strong>7-day free trial</strong> is active. You now have access to every lesson, exercise and PDF document in Quranlab.",
    button: "Open the app →",
    ends: (d: string) => `Your trial ends on <strong>${d}</strong>. After that date your subscription switches to €14.97/month unless you cancel. You can cancel in one click from your settings.`,
    tip: "<strong>A small tip</strong>: even 5 minutes a day is enough. Spaced repetition does the rest.",
  },
  es: {
    subject: "Bienvenido a Quranlab — tu prueba de 7 días está activa",
    preview: "Tu prueba de Quranlab está activa. Empieza ahora mismo.",
    heading: "Bienvenido a Quranlab",
    hello: "¡Assalamu alaikum!",
    body: "Tu <strong>prueba gratuita de 7 días</strong> está activa. Ya tienes acceso a todas las lecciones, ejercicios y documentos PDF de Quranlab.",
    button: "Abrir la aplicación →",
    ends: (d: string) => `Tu prueba termina el <strong>${d}</strong>. Después de esa fecha tu suscripción pasará a 14,97&nbsp;€/mes si no cancelas. Puedes cancelar con un clic desde tus ajustes.`,
    tip: "<strong>Un consejo</strong>: con 5 minutos al día basta. La repetición espaciada hace el resto.",
  },
} as const;

export const trialWelcomeSubject = (locale: Locale) => COPY[locale].subject;

export function renderTrialWelcomeHtml({ appUrl, trialEndsAt, locale = "fr" }: { appUrl: string; trialEndsAt: string; locale?: Locale }): string {
  const c = COPY[locale];
  const body = [pHtml(c.hello), pHtml(c.body), buttonHtml({ href: appUrl, label: c.button }), fineHtml(c.ends(escapeHtml(trialEndsAt))), pHtml(c.tip)].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

import { buildEmail, buttonHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Bienvenue ! Crée ton compte Quranlab Premium",
    preview: "Ton accès Premium est activé — crée ton compte pour commencer.",
    heading: "Bienvenue sur Quranlab Premium",
    hello: "Assalamu alaikum,",
    body: "Merci pour ta confiance — ton accès <strong>Quranlab Premium</strong> est activé.",
    step: "Dernière étape : crée ton compte en un clic pour commencer à comprendre le Coran, mot à mot.",
    button: "Créer mon compte",
    fine: "Utilise la même adresse e-mail que celle-ci pour que ton accès soit lié automatiquement.",
  },
  en: {
    subject: "Welcome! Create your Quranlab Premium account",
    preview: "Your Premium access is active — create your account to start.",
    heading: "Welcome to Quranlab Premium",
    hello: "Assalamu alaikum,",
    body: "Thank you for your trust — your <strong>Quranlab Premium</strong> access is active.",
    step: "Last step: create your account in one click to start understanding the Qur'an, word by word.",
    button: "Create my account",
    fine: "Use this same email address so your access is linked automatically.",
  },
  es: {
    subject: "¡Bienvenido! Crea tu cuenta Quranlab Premium",
    preview: "Tu acceso Premium está activo — crea tu cuenta para empezar.",
    heading: "Bienvenido a Quranlab Premium",
    hello: "Assalamu alaikum,",
    body: "Gracias por tu confianza — tu acceso <strong>Quranlab Premium</strong> está activo.",
    step: "Último paso: crea tu cuenta con un clic para empezar a entender el Corán, palabra por palabra.",
    button: "Crear mi cuenta",
    fine: "Usa esta misma dirección de correo para que tu acceso se vincule automáticamente.",
  },
} as const;

export const subscriptionWelcomeSubject = (locale: Locale) => COPY[locale].subject;

/** Post-purchase email for anonymous Premium purchases (subscription or lifetime). */
export function renderSubscriptionWelcomeEmailHtml({ activationUrl, locale = "fr" }: { activationUrl: string; locale?: Locale }): string {
  const c = COPY[locale];
  const body = [
    pHtml(c.hello, { bold: true }),
    pHtml(c.body),
    pHtml(c.step),
    buttonHtml({ href: activationUrl, label: c.button, variant: "coral" }),
    fineHtml(c.fine),
  ].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

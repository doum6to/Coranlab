import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: {
    subject: "Réinitialise ton mot de passe Quranlab",
    preview: "Un clic pour choisir un nouveau mot de passe.",
    heading: "Nouveau mot de passe",
    hello: "Assalamu alaikum,",
    body: "Tu as demandé à réinitialiser le mot de passe de ton compte Quranlab. Clique sur le bouton ci-dessous pour en choisir un nouveau.",
    button: "Choisir un nouveau mot de passe",
    expires: "Ce lien est valable 1 heure et ne peut être utilisé qu'une fois.",
    ignore: "Tu n'es pas à l'origine de cette demande ? Ignore simplement cet email : ton mot de passe reste inchangé.",
    fallback: "Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :",
  },
  en: {
    subject: "Reset your Quranlab password",
    preview: "One click to choose a new password.",
    heading: "New password",
    hello: "Assalamu alaikum,",
    body: "You asked to reset the password of your Quranlab account. Click the button below to choose a new one.",
    button: "Choose a new password",
    expires: "This link is valid for 1 hour and can only be used once.",
    ignore: "Didn't request this? Just ignore this email: your password stays unchanged.",
    fallback: "If the button doesn't work, copy this link into your browser:",
  },
  es: {
    subject: "Restablece tu contraseña de Quranlab",
    preview: "Un clic para elegir una nueva contraseña.",
    heading: "Nueva contraseña",
    hello: "Assalamu alaikum,",
    body: "Has pedido restablecer la contraseña de tu cuenta Quranlab. Haz clic en el botón para elegir una nueva.",
    button: "Elegir una nueva contraseña",
    expires: "Este enlace es válido durante 1 hora y solo puede usarse una vez.",
    ignore: "¿No has sido tú? Ignora este correo: tu contraseña no cambia.",
    fallback: "Si el botón no funciona, copia este enlace en tu navegador:",
  },
} as const;

export function passwordResetSubject(locale: Locale): string {
  return COPY[locale].subject;
}

/** Branded, localized password-reset email (replaces Supabase's template). */
export function renderPasswordResetEmailHtml({ url, locale }: { url: string; locale: Locale }): string {
  const c = COPY[locale];
  const body = [
    pHtml(c.hello, { bold: true }),
    pHtml(c.body),
    buttonHtml({ href: url, label: c.button, variant: "coral" }),
    fineHtml(c.expires),
    pHtml(`<span style="font-size:13px;color:#666">${c.fallback}<br /><a href="${escapeHtml(url)}" style="color:#6967FB;word-break:break-all">${escapeHtml(url)}</a></span>`),
    fineHtml(c.ignore),
  ].join("\n");
  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

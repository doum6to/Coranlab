import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  driveUrl: string;
  hasApp: boolean;
  activationUrl: string | null;
  locale?: Locale;
};

const COPY = {
  fr: {
    subject: "Bienvenue ! Ton cours 85% des mots du Coran est prêt",
    preview: "Ton pack 85% des mots du Coran est prêt. Un clic pour y accéder.",
    heading: "Ton pack est prêt.",
    hello: "Assalamu alaikum,",
    body: "Merci pour ta confiance. Ton pack <strong>85% des mots du Coran</strong> est disponible en un clic ci-dessous.",
    docs: "Accéder à mes documents →",
    fallback: "Si le bouton ne fonctionne pas, copie ce lien&nbsp;:",
    appTitle: "Et l&rsquo;application&nbsp;?",
    appBody: "Tu as aussi l'accès à l'application Quranlab. <strong>Tu n'as pas encore de compte</strong> : clique ci-dessous pour le CRÉER (n'essaie pas de « te connecter » avant de l'avoir créé). Ton accès Premium sera activé automatiquement.",
    appButton: "Créer mon compte premium",
    appFine: "Utilise la même adresse que celle-ci pour que l'accès soit lié automatiquement. Tu choisiras ton mot de passe à cette étape.",
  },
  en: {
    subject: "Welcome! Your 85% of the Qur'an course is ready",
    preview: "Your 85% of the Qur'an pack is ready. One click to open it.",
    heading: "Your pack is ready.",
    hello: "Assalamu alaikum,",
    body: "Thank you for your trust. Your <strong>85% of the words of the Qur'an</strong> pack is one click away below.",
    docs: "Open my documents →",
    fallback: "If the button doesn't work, copy this link:",
    appTitle: "And the app?",
    appBody: "You also get access to the Quranlab app. <strong>You don't have an account yet</strong>: click below to CREATE it (don't try to “log in” before creating it). Your Premium access will be activated automatically.",
    appButton: "Create my Premium account",
    appFine: "Use this same email address so the access is linked automatically. You'll choose your password at that step.",
  },
  es: {
    subject: "¡Bienvenido! Tu curso 85% de las palabras del Corán está listo",
    preview: "Tu pack 85% de las palabras del Corán está listo. Un clic para abrirlo.",
    heading: "Tu pack está listo.",
    hello: "Assalamu alaikum,",
    body: "Gracias por tu confianza. Tu pack <strong>85% de las palabras del Corán</strong> está a un clic, aquí abajo.",
    docs: "Abrir mis documentos →",
    fallback: "Si el botón no funciona, copia este enlace:",
    appTitle: "¿Y la aplicación?",
    appBody: "También tienes acceso a la app Quranlab. <strong>Aún no tienes cuenta</strong>: haz clic abajo para CREARLA (no intentes «iniciar sesión» antes de crearla). Tu acceso Premium se activará automáticamente.",
    appButton: "Crear mi cuenta Premium",
    appFine: "Usa esta misma dirección para que el acceso se vincule automáticamente. Elegirás tu contraseña en ese paso.",
  },
} as const;

export const coursePurchaseSubject = (locale: Locale) => COPY[locale].subject;

export function renderCoursePurchaseEmailHtml({ driveUrl, hasApp, activationUrl, locale = "fr" }: Props): string {
  const c = COPY[locale];
  const driveSafe = escapeHtml(driveUrl);

  const appBlock =
    hasApp && activationUrl
      ? `
  <hr style="border:none;border-top:1px solid #E8E4D8;margin:40px 0" />
  <h2 style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#1A1A1A;margin:0 0 16px;font-weight:400;line-height:1.1;text-align:center">
    ${c.appTitle}
  </h2>
  ${pHtml(c.appBody)}
  ${buttonHtml({ href: activationUrl, label: c.appButton, variant: "coral" })}
  ${fineHtml(c.appFine)}
`
      : "";

  const body = [
    pHtml(c.hello, { bold: true }),
    pHtml(c.body),
    buttonHtml({ href: driveUrl, label: c.docs }),
    fineHtml(`${c.fallback}<br /><a href="${driveSafe}" style="color:#6967fb;word-break:break-all">${driveSafe}</a>`),
    appBlock,
  ].join("\n");

  return buildEmail({ preview: c.preview, heading: c.heading, bodyHtml: body, locale });
}

/**
 * Tiny UI dictionary for /commencer strings that are not part of the admin
 * content. Plain module (no "use client") so server components can read it.
 */
/** Tiny UI dictionary for strings that are not part of the admin content. */
export const CM_UI = {
  fr: { continue: "Continuer", beginner: "Débutant", everyDay: "chaque jour", redirect: "Redirection…", error: "Une erreur est survenue.", terms: "Conditions", privacy: "Confidentialité", thanks: "Merci ! 🙏", nothing: "Rien reçu d'ici quelques minutes ? Écris-nous à contact@quranlab.app." },
  en: { continue: "Continue", beginner: "Beginner", everyDay: "every day", redirect: "Redirecting…", error: "Something went wrong.", terms: "Terms", privacy: "Privacy", thanks: "Thank you! 🙏", nothing: "Nothing after a few minutes? Write to us at contact@quranlab.app." },
  es: { continue: "Continuar", beginner: "Principiante", everyDay: "cada día", redirect: "Redirigiendo…", error: "Ha ocurrido un error.", terms: "Condiciones", privacy: "Privacidad", thanks: "¡Gracias! 🙏", nothing: "¿Nada en unos minutos? Escríbenos a contact@quranlab.app." },
} as const;
export type CmLocale = keyof typeof CM_UI;

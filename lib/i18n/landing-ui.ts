import type { Locale } from "./locales";

/**
 * Hardcoded UI micro-copy for the product landing and its CTAs/components.
 * Everything users see that isn't part of the editable landing content lives
 * here so it translates with the page.
 */
export type LandingUIStrings = {
  login: string;
  home: string;
  launchOffer: string;
  oneTime: string;
  imageSoon: string;
  redirecting: string;
  checkoutError: string;
  unknownError: string;
  /** Template: "{joined}/{total} … joined". */
  joined: string;
  /** Template: "… {n} … left." Rendered after the price as "— …". */
  spotsLeft: string;
  /** Label before the countdown in the timer scarcity mode. */
  offerEndsIn: string;
  /** BCP-47 tag used for number formatting. */
  numberLocale: string;
};

export const LANDING_UI: Record<Locale, LandingUIStrings> = {
  fr: {
    login: "Se connecter",
    home: "Accueil Quranlab",
    launchOffer: "Offre de lancement",
    oneTime: "une seule fois",
    imageSoon: "Image à venir",
    redirecting: "Redirection…",
    checkoutError: "Erreur lors de la création du paiement.",
    unknownError: "Erreur inconnue.",
    joined: "{joined}/{total} élèves ont rejoint",
    spotsLeft: "plus que {n} places à vie.",
    offerEndsIn: "L'offre se termine dans",
    numberLocale: "fr-FR",
  },
  en: {
    login: "Log in",
    home: "Quranlab home",
    launchOffer: "Launch offer",
    oneTime: "one time only",
    imageSoon: "Image coming soon",
    redirecting: "Redirecting…",
    checkoutError: "Error creating the payment.",
    unknownError: "Unknown error.",
    joined: "{joined}/{total} students joined",
    spotsLeft: "only {n} lifetime spots left.",
    offerEndsIn: "Offer ends in",
    numberLocale: "en-US",
  },
  es: {
    login: "Iniciar sesión",
    home: "Inicio Quranlab",
    launchOffer: "Oferta de lanzamiento",
    oneTime: "una sola vez",
    imageSoon: "Imagen próximamente",
    redirecting: "Redirigiendo…",
    checkoutError: "Error al crear el pago.",
    unknownError: "Error desconocido.",
    joined: "{joined}/{total} estudiantes se han unido",
    spotsLeft: "solo quedan {n} plazas de por vida.",
    offerEndsIn: "La oferta termina en",
    numberLocale: "es-ES",
  },
};

/** Copy for the "switch language" banner, shown in the suggested language. */
export const BANNER_UI: Record<Locale, { text: string; cta: string }> = {
  fr: {
    text: "Cette page est aussi disponible en français.",
    cta: "Voir en français",
  },
  en: {
    text: "This page is also available in English.",
    cta: "View in English",
  },
  es: {
    text: "Esta página también está disponible en español.",
    cta: "Ver en español",
  },
};

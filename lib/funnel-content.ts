import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** Admin-editable copy for the "funnel" landing variant (FR-only for now). */
export type FunnelContent = {
  capture: {
    title: string;
    subtitle: string;
    firstNameLabel: string;
    firstNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    cta: string;
    reassurance: string;
  };
  intro: {
    /** Supports the {name} placeholder. */
    greeting: string;
    subtitle: string;
    cta: string;
  };
  question: {
    title: string;
    options: { label: string; response: string }[];
  };
  exercise: {
    prompt: string;
    arabicWord: string;
    /** Correct translation (also the right answer button). */
    correct: string;
    /** Wrong answer buttons. */
    distractors: string[];
    /** Supports the {name} placeholder. */
    successText: string;
    retryText: string;
    cta: string;
  };
  offer: {
    /** Supports the {name} placeholder. */
    kicker: string;
    title: string;
    subtitle: string;
    priceSuffix: string;
    features: string[];
    cta: string;
    guarantee: string;
  };
};

export const FUNNEL_CONTENT_KEY = "funnel_content";

export const FUNNEL_DEFAULTS: FunnelContent = {
  capture: {
    title: "Teste Quranlab gratuitement",
    subtitle:
      "Apprends ton premier mot du Coran en 30 secondes. Sans carte bancaire, sans engagement.",
    firstNameLabel: "Ton prénom",
    firstNamePlaceholder: "Yusuf",
    emailLabel: "Ton e-mail",
    emailPlaceholder: "toi@exemple.com",
    cta: "Commencer gratuitement",
    reassurance: "Aucune carte demandée · Tu peux arrêter quand tu veux",
  },
  intro: {
    greeting: "Salam alaykoum {name} !\nJe suis Koji.",
    subtitle:
      "Je vais te faire apprendre ton tout premier mot du Coran, tout de suite. Prêt(e) ?",
    cta: "C'est parti",
  },
  question: {
    title: "Pourquoi veux-tu apprendre les mots du Coran ?",
    options: [
      { label: "Comprendre le sens pendant la prière", response: "Magnifique, chaque mot prendra vie !" },
      { label: "Lire le Coran sans traduction", response: "Bravo, un objectif puissant !" },
      { label: "Approfondir ma foi", response: "Superbe intention, on avance ensemble." },
      { label: "Enrichir mon vocabulaire arabe", response: "Excellent, on construit mot à mot !" },
    ],
  },
  exercise: {
    prompt: "Que signifie ce mot ?",
    arabicWord: "رَبّ",
    correct: "Seigneur",
    distractors: ["Le Tout-Puissant", "Le Miséricordieux"],
    successText: "Bravo {name} ! Premier mot appris 🎉",
    retryText: "Presque ! Réessaie 👇",
    cta: "Continuer",
  },
  offer: {
    kicker: "Bravo {name}, tu apprends vite !",
    title: "Débloque toute l'application Quranlab à vie",
    subtitle:
      "Tu viens d'apprendre 1 mot. L'application t'en fait apprendre des centaines, avec une méthode qui rend tout évident.",
    priceSuffix: "une fois",
    features: [
      "Accès à vie à toute l'application (tous les mots, tous les exercices)",
      "L'ebook « 85% des mots du Coran » en PDF",
      "3 bonus offerts pour accélérer ta progression",
      "Paiement unique — aucun abonnement",
    ],
    cta: "Obtenir l'accès à vie",
    guarantee: "Paiement sécurisé · Garantie satisfait ou remboursé 30 jours",
  },
};

/** Deep-merges a stored partial over the defaults (arrays are replaced wholesale). */
function mergeFunnel(base: FunnelContent, patch: any): FunnelContent {
  if (!patch || typeof patch !== "object") return base;
  const out: any = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = (base as any)[key];
    if (
      pv &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      bv &&
      typeof bv === "object" &&
      !Array.isArray(bv)
    ) {
      out[key] = mergeFunnel(bv, pv);
    } else if (pv !== undefined) {
      out[key] = pv;
    }
  }
  return out as FunnelContent;
}

/**
 * Reads the admin-editable funnel copy, falling back to defaults if the row or
 * table is missing. `cache()` dedupes within a request.
 */
export const getFunnelContent = cache(async (): Promise<FunnelContent> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, FUNNEL_CONTENT_KEY),
    });
    if (!row?.value) return FUNNEL_DEFAULTS;
    const parsed = JSON.parse(row.value);
    return mergeFunnel(FUNNEL_DEFAULTS, parsed);
  } catch (e) {
    console.error("[funnel] getFunnelContent failed, using defaults:", e);
    return FUNNEL_DEFAULTS;
  }
});

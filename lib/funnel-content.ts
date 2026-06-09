import "server-only";
import { cache } from "react";
import { inArray } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** One exercise of the funnel mini-lesson (an easy QCM). */
export type FunnelExercise = {
  /** Whether this exercise is shown (admin-toggleable). */
  enabled: boolean;
  arabicWord: string;
  /** Correct translation (also the right answer button). */
  correct: string;
  /** Wrong answer buttons. */
  distractors: string[];
};

/** Admin-editable copy for one funnel version (A or B). FR-only for now. */
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
    /** Shown after the LAST exercise is solved. Supports {name}. */
    successText: string;
    retryText: string;
    cta: string;
    /** The mini-lesson: a series of easy QCM (toggle each from the admin). */
    items: FunnelExercise[];
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

export type FunnelVersion = "a" | "b";

export const FUNNEL_CONTENT_KEY = "funnel_content"; // version A
export const FUNNEL_CONTENT_KEY_B = "funnel_content_b"; // version B

const KEY_BY_VERSION: Record<FunnelVersion, string> = {
  a: FUNNEL_CONTENT_KEY,
  b: FUNNEL_CONTENT_KEY_B,
};

export const FUNNEL_DEFAULTS: FunnelContent = {
  capture: {
    title: "Teste Quranlab gratuitement",
    subtitle:
      "Apprends tes premiers mots du Coran en moins d'une minute. Sans carte bancaire, sans engagement.",
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
      "Je vais te faire apprendre tes tout premiers mots du Coran, tout de suite. Prêt(e) ?",
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
    successText: "Bravo {name} ! Tu as appris tes premiers mots 🎉",
    retryText: "Presque ! Réessaie 👇",
    cta: "Continuer",
    items: [
      { enabled: true, arabicWord: "رَبّ", correct: "Seigneur", distractors: ["Le Tout-Puissant", "Le Miséricordieux"] },
      { enabled: true, arabicWord: "يَوْم", correct: "Jour", distractors: ["Nuit", "Heure"] },
      { enabled: true, arabicWord: "مَلِك", correct: "Roi", distractors: ["Serviteur", "Prophète"] },
      { enabled: true, arabicWord: "نَاس", correct: "Les gens", distractors: ["Les anges", "Les croyants"] },
      { enabled: true, arabicWord: "كِتَاب", correct: "Livre", distractors: ["Parole", "Lumière"] },
    ],
  },
  offer: {
    kicker: "Bravo {name}, tu apprends vite !",
    title: "Débloque toute l'application Quranlab à vie",
    subtitle:
      "Tu viens d'apprendre plusieurs mots. L'application t'en fait apprendre des centaines, avec une méthode qui rend tout évident.",
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
  const out: any = { ...base };
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
 * Reads the admin-editable funnel copy for a version (A or B), falling back to
 * defaults if the row/table is missing. Both versions are fetched in one query.
 */
export const getFunnelContent = cache(
  async (version: FunnelVersion = "a"): Promise<FunnelContent> => {
    try {
      const rows = await db
        .select()
        .from(appSetting)
        .where(inArray(appSetting.key, [KEY_BY_VERSION[version]]));
      const raw = rows[0]?.value;
      if (!raw) return FUNNEL_DEFAULTS;
      return mergeFunnel(FUNNEL_DEFAULTS, JSON.parse(raw));
    } catch (e) {
      console.error("[funnel] getFunnelContent failed, using defaults:", e);
      return FUNNEL_DEFAULTS;
    }
  },
);

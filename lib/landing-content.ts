import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

export type LandingRow = {
  image: string;
  tint: string;
  title: string;
  text: string;
};
export type LandingFaq = { q: string; a: string };
export type LandingReview = { author: string; handle: string; text: string };
export type LandingValueItem = {
  badge: string;
  title: string;
  description: string;
  value: string;
};

export type LandingContent = {
  hero: {
    socialProof: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  trust: string[];
  rows: LandingRow[];
  valueStack: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: LandingValueItem[];
    totalLabel: string;
  };
  priceAnchor: { eyebrow: string; heading: string; body: string };
  offer: {
    eyebrow: string;
    cycleNote: string;
    features: string[];
    buttonLabel: string;
    secure: string;
  };
  reviews: { eyebrow: string; heading: string; items: LandingReview[] };
  faq: { eyebrow: string; heading: string; items: LandingFaq[] };
  finalCta: { heading: string; subtitle: string };
};

const IMG =
  "https://geeipdnizshcpdmcgvdv.supabase.co/storage/v1/object/public/images/coranlab";

export const LANDING_DEFAULTS: LandingContent = {
  hero: {
    socialProof: "Plus de 1 000 apprenants",
    titleLead: "Comprends 85% des mots du Coran",
    titleHighlight: "aujourd'hui",
    subtitle:
      "L'ebook de référence + 3 bonus offerts (dont l'accès à vie à l'application). Téléchargement immédiat, paiement unique.",
    ctaPrimary: "Recevoir l'ebook + les bonus",
    ctaSecondary: "J'ai déjà un compte",
  },
  trust: [
    "Paiement sécurisé Stripe",
    "Aucun abonnement",
    "Accès activé en 2 minutes",
  ],
  rows: [
    {
      image: `${IMG}/01.png`,
      tint: "#6967fb",
      title: "Ludique, efficace, et à toi pour toujours",
      text: "Des leçons courtes et addictives, pensées pour que tu progresses vraiment — et un accès à vie, pour ne jamais t'arrêter.",
    },
    {
      image: `${IMG}/02.png`,
      tint: "#46c4f2",
      title: "Fondé sur la science",
      text: "La répétition espacée te fait réviser chaque mot juste avant que tu l'oublies. C'est prouvé : c'est comme ça qu'on mémorise durablement.",
    },
    {
      image: `${IMG}/03.png`,
      tint: "#f6923a",
      title: "Reste motivé",
      text: "Séries de jours, points d'XP, ligues et défis : on transforme l'apprentissage en une habitude qu'on a envie de tenir. Cinq minutes par jour suffisent.",
    },
  ],
  valueStack: {
    eyebrow: "Ce que tu reçois aujourd'hui",
    heading: "Tout le pack pour comprendre le Coran",
    intro:
      "Un seul paiement, téléchargement immédiat — l'ebook et ses 3 bonus offerts.",
    items: [
      {
        badge: "L'EBOOK",
        title: "85% des mots du Coran",
        description:
          "Les mots les plus fréquents du Coran, classés par fréquence, avec traduction et racines arabes. Comprends l'essentiel du texte en un temps record.",
        value: "27€",
      },
      {
        badge: "BONUS 1",
        title: "Accès à vie à l'application (places limitées)",
        description:
          "Apprends et révise le vocabulaire par la répétition espacée, sur tous tes appareils, à vie. Réservé aux premiers inscrits.",
        value: "97€",
      },
      {
        badge: "BONUS 2",
        title: "Du'as coraniques 🎁",
        description:
          "Transforme ta vie avec les Du'as puissantes du Coran. Plus de 240 pages de sagesses divines, disponibles instantanément. Traduction + Tafsir clair selon Ibn Kathir pour une compréhension ancrée.",
        value: "37€",
      },
      {
        badge: "BONUS 3",
        title: "Résumé des 30 Juzz du Coran 🎁",
        description:
          "Pour t'aider à mieux comprendre la parole d'Allah, à la méditer au quotidien et à la vivre pleinement.",
        value: "29€",
      },
    ],
    totalLabel: "Valeur totale",
  },
  priceAnchor: {
    eyebrow: "Fais le calcul",
    heading: "Tout ça, aujourd'hui, en un seul paiement",
    body: "L'ebook seul vaut déjà 27€. Avec les 3 bonus offerts (dont l'accès à vie à l'application), tu reçois un pack à plus de 190€ — pour une fraction du prix, et en nombre de places limité.",
  },
  offer: {
    eyebrow: "L'offre complète",
    cycleNote: "Paiement unique · Téléchargement immédiat",
    features: [
      "📖 L'ebook : 85% des mots du Coran",
      "🎁 Accès à vie à l'application (places limitées)",
      "🎁 Du'as coraniques — 240+ pages, Tafsir Ibn Kathir",
      "🎁 Résumé des 30 Juzz du Coran",
      "Accès et téléchargement immédiats",
    ],
    buttonLabel: "Tout recevoir maintenant",
    secure: "Paiement sécurisé via Stripe",
  },
  reviews: {
    eyebrow: "Avis TikTok vérifiés",
    heading: "Ils ont commencé avant toi",
    items: [],
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions fréquentes",
    items: [
      {
        q: "« À vie », ça veut dire quoi exactement ?",
        a: "Tu paies une seule fois et tu gardes l'accès Premium à l'application pour toujours. Aucun abonnement, aucun prélèvement récurrent, jamais.",
      },
      {
        q: "Comment j'accède à l'application après le paiement ?",
        a: "Juste après le paiement, tu crées ton compte avec l'email utilisé lors de l'achat. Ton accès à vie est activé automatiquement. Tu reçois aussi un email de confirmation.",
      },
      {
        q: "Les futures leçons et mises à jour sont incluses ?",
        a: "Oui. Toutes les nouvelles leçons, fonctionnalités et améliorations de l'application sont incluses, sans supplément.",
      },
      {
        q: "Le paiement est-il sécurisé ?",
        a: "Oui. Le paiement est traité par Stripe, le standard mondial du paiement en ligne. Nous ne voyons jamais ton numéro de carte.",
      },
      {
        q: "Sur quels appareils puis-je l'utiliser ?",
        a: "Sur tous tes appareils : téléphone, tablette et ordinateur. Tu te connectes simplement avec ton compte, ta progression te suit partout.",
      },
      {
        q: "Et si j'ai déjà un abonnement mensuel ?",
        a: "Pas de souci : écris-nous après ton achat et nous basculons ton compte en accès à vie et annulons ton abonnement.",
      },
    ],
  },
  finalCta: {
    heading: "Ton accès, pour toujours.",
    subtitle: "Un seul paiement. Tu n'y repenseras jamais.",
  },
};

export const LANDING_CONTENT_KEY = "landing_content";

/**
 * Deep-merges a stored partial content object over the defaults so missing
 * fields always fall back. Arrays are replaced wholesale when present.
 */
function merge(base: any, override: any): any {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }
  if (base && typeof base === "object") {
    const out: any = { ...base };
    if (override && typeof override === "object") {
      for (const k of Object.keys(base)) {
        if (k in override) out[k] = merge(base[k], override[k]);
      }
    }
    return out;
  }
  return override == null ? base : override;
}

/**
 * Reads the admin-editable landing content, deep-merged over the defaults.
 * Resilient: any missing row/table or parse error falls back to defaults so
 * the page never breaks.
 */
export const getLandingContent = cache(async (): Promise<LandingContent> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, LANDING_CONTENT_KEY),
    });
    if (!row?.value) return LANDING_DEFAULTS;
    const parsed = JSON.parse(row.value);
    return merge(LANDING_DEFAULTS, parsed) as LandingContent;
  } catch (e) {
    console.error("[landing] getLandingContent failed, using defaults:", e);
    return LANDING_DEFAULTS;
  }
});

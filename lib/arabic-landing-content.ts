import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

export type ArabicStep = { n: string; title: string; text: string };
export type ArabicFaqItem = { q: string; a: string };
export type ArabicTestimonial = { videoUrl: string; label: string };

export type ArabicLandingContent = {
  hero: {
    badge: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    videoUrl: string;
    videoLabel: string;
    ctaLabel: string;
  };
  trust: string[];
  testimonials: {
    heading: string;
    subheading: string;
    items: ArabicTestimonial[];
  };
  pricing: {
    heading: string;
    subheading: string;
    badge: string;
    cycleNote: string;
    /** Charged amount, in cents — also drives the displayed price. */
    priceCents: number;
    /** Struck-through "before" price, in cents. */
    compareAtCents: number;
    savingLabel: string;
    features: string[];
    buttonLabel: string;
    secure: string;
  };
  method: {
    eyebrow: string;
    heading: string;
    subheading: string;
    steps: ArabicStep[];
  };
  program: {
    heading: string;
    chapters: string[];
  };
  comparison: {
    heading: string;
    classicTitle: string;
    classic: string[];
    oursTitle: string;
    ours: string[];
  };
  faq: {
    heading: string;
    items: ArabicFaqItem[];
  };
  sticky: {
    label: string;
    ctaLabel: string;
  };
};

export const ARABIC_LANDING_DEFAULTS: ArabicLandingContent = {
  hero: {
    badge: "Méthode Master",
    titleLead: "Comment lire l'arabe en",
    titleHighlight: "moins de 7h",
    subtitle: "Sans devoirs, sans stylo et sans cahier…",
    videoUrl: "",
    videoLabel: "Vidéo de présentation (à venir)",
    ctaLabel: "Je veux lire l'arabe",
  },
  trust: ["Paiement unique", "Accès à vie", "Satisfait ou remboursé"],
  testimonials: {
    heading: "Tu n'y crois toujours pas ?",
    subheading: "Écoute ce que disent nos élèves",
    items: [
      { videoUrl: "", label: "Témoignage 1 (à venir)" },
      { videoUrl: "", label: "Témoignage 2 (à venir)" },
      { videoUrl: "", label: "Témoignage 3 (à venir)" },
    ],
  },
  pricing: {
    heading: "Rejoins Quranlab maintenant",
    subheading: "Accès à vie • Paiement unique • Satisfait ou remboursé",
    badge: "Accès complet",
    cycleNote: "Paiement unique — Accès à vie",
    priceCents: 2700,
    compareAtCents: 9700,
    savingLabel: "Économise 70€ !",
    features: [
      "21 cours en vidéo structurés et progressifs",
      "Accès complet au e-learning 24h/24",
      "Apprends à ton rythme, où tu veux",
      "Méthode éprouvée : lis le Coran en moins de 7h",
      "Compatible téléphone et ordinateur",
      "Mises à jour gratuites incluses",
      "Accès à vie — paiement unique",
    ],
    buttonLabel: "Je veux lire en arabe !",
    secure: "Paiement unique • Sécurisé • Accès à vie",
  },
  method: {
    eyebrow: "Méthode",
    heading: "Comment ça marche ?",
    subheading:
      "C'est simple : tu t'inscris et tu commences immédiatement.",
    steps: [
      {
        n: "01",
        title: "21 cours en vidéo",
        text: "Des leçons structurées et progressives pour apprendre l'arabe pas à pas.",
      },
      {
        n: "02",
        title: "Apprends à ton rythme",
        text: "Accès 24h/24, depuis ton téléphone ou ton ordinateur, où tu veux.",
      },
      {
        n: "03",
        title: "Résultats rapides",
        text: "Commence à lire le Coran en arabe en moins de 7h de formation.",
      },
      {
        n: "04",
        title: "Accès à vie",
        text: "Paiement unique, reviens autant de fois que tu veux, sans limite.",
      },
    ],
  },
  program: {
    heading: "Le programme — 21 cours",
    chapters: [
      "Différence entre l'enseignement classique et la méthode master",
      "La science perdue des arabes",
      "Faut-il apprendre l'alphabet entièrement ?",
      "La première famille",
      "La première lettre emphatique",
      "Premiers exercices : les trios",
      "La deuxième famille : les jumeaux (1/3)",
      "La deuxième famille : les jumeaux (2/3)",
      "Exercice 3 : les jumeaux",
      "Exercice 4 : les jumeaux",
      "La deuxième famille : les jumeaux (3/3)",
      "La troisième famille : les solos",
      "Exercice 5 : les solos, lettres",
      "Exercice 6 : les solos, chiffres",
      "Chapitre 2 : l'attachement des lettres",
      "Règle 1 : les 6 lettres qui ne s'attachent pas à gauche",
      "Règle 2 : la méthode LUC",
      "Exercice : méthode LUC",
      "Règle 3 : les 5 lettres qui ne changent pas",
      "Chapitre 3 : les voyelles courtes",
      "Chapitre 3 : les voyelles longues",
    ],
  },
  comparison: {
    heading: "Pourquoi les méthodes classiques ne fonctionnent pas ?",
    classicTitle: "Méthodes classiques",
    classic: [
      "Des années d'études nécessaires",
      "Devoirs, stylo, cahier… c'est l'école",
      "Pas de suivi personnalisé",
      "Méthode ennuyeuse et démotivante",
    ],
    oursTitle: "Méthode Quranlab",
    ours: [
      "Résultats en moins de 7h",
      "Sans devoirs, sans stylo, sans cahier",
      "100% en ligne, à ton rythme",
      "Méthode fun et engageante",
    ],
  },
  faq: {
    heading: "Questions fréquentes",
    items: [
      {
        q: "Je suis un vrai débutant, est-ce pour moi ?",
        a: "Oui, à 100%. La méthode part de zéro : tu n'as besoin d'aucune connaissance préalable. Tout est expliqué pas à pas.",
      },
      {
        q: "Combien de temps faut-il pour savoir lire ?",
        a: "La formation est conçue pour te faire lire l'arabe en moins de 7h au total — à ton rythme, en une fois ou sur plusieurs jours.",
      },
      {
        q: "Comment se déroule la formation ?",
        a: "21 cours en vidéo, accessibles 24h/24 depuis ton espace, sur téléphone ou ordinateur. Tu avances quand tu veux.",
      },
      {
        q: "Et si j'ai des horaires compliqués ?",
        a: "Aucun souci : l'accès est à vie et disponible à toute heure. Tu apprends 10 minutes par-ci par-là, sans contrainte.",
      },
      {
        q: "Est-ce un paiement unique ou un abonnement ?",
        a: "Un paiement unique, sans abonnement. Tu paies une fois et tu gardes l'accès à vie.",
      },
    ],
  },
  sticky: {
    label: "Offre limitée — fin dans",
    ctaLabel: "J'apprends à lire l'arabe",
  },
};

export const ARABIC_LANDING_KEY = "arabic_landing_content";

/** Deep-merge a stored partial over the defaults (arrays replaced wholesale). */
function merge(base: any, override: any): any {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
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
 * Reads the admin-editable content for the /lire-larabe landing, deep-merged
 * over the defaults. Resilient: any missing row/table or parse error falls
 * back to defaults so the page never breaks.
 */
export const getArabicLandingContent = cache(
  async (): Promise<ArabicLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, ARABIC_LANDING_KEY),
      });
      if (!row?.value) return ARABIC_LANDING_DEFAULTS;
      const parsed = JSON.parse(row.value);
      return merge(ARABIC_LANDING_DEFAULTS, parsed) as ArabicLandingContent;
    } catch (e) {
      console.error("[arabic-landing] getArabicLandingContent failed:", e);
      return ARABIC_LANDING_DEFAULTS;
    }
  },
);

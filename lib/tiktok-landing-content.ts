import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** One bubble of the ad-mirroring dialogue ("him" asks, "her" answers). */
export type StoryBubble = {
  /** Which side the bubble sits on: "left" (him) or "right" (her). */
  side: "left" | "right";
  text: string;
};

/**
 * Admin-editable copy for the TikTok story landing (/comprendre-le-coran).
 * The page mirrors the 9-image TikTok ad (couple dialogue → "500 mots = 85%"
 * → the book) so the message match with the ad stays perfect.
 */
export type TikTokLandingContent = {
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    cta: string;
    ctaSub: string;
    /** Optional hero illustration (e.g. the couple artwork from the ad). */
    image: string;
    /**
     * Several ad slides → rendered as a swipeable mini-carousel (mirrors a
     * TikTok carousel ad). Takes precedence over the single `image`.
     */
    images: string[];
    /** Optional ad video: a TikTok URL (embedded) or a direct .mp4 link. */
    videoUrl: string;
    /**
     * Optional preview image shown in place of the video before play (the
     * <video> poster). Lets the hero show an attractive still instead of a
     * black frame, and loads instantly without downloading the video.
     */
    videoPoster: string;
    /** Show the price (and strike-through) right above the hero CTA. */
    showPrice: boolean;
    socialProof: string;
    /** Promise-at-a-glance stats strip (e.g. 500 mots / 85% / 30 j). */
    stats: { value: string; label: string }[];
  };
  story: {
    heading: string;
    bubbles: StoryBubble[];
    /** Future-pacing line shown after the dialogue ("imagine dans 30 jours…"). */
    closing: string;
  };
  method: {
    heading: string;
    cards: { title: string; text: string }[];
  };
  book: {
    heading: string;
    text: string;
    /** Book/ebook mockup image. */
    image: string;
    bullets: string[];
    /** "Flip through some pages" — screenshots of real book pages. */
    excerptsHeading: string;
    excerpts: string[];
    bonusHeading: string;
    bonuses: string[];
  };
  offerCard: {
    eyebrow: string;
    priceSuffix: string;
    /** Each line may carry a value after a pipe: "Le livre (PDF) | 27 €". */
    features: string[];
    /** Value-anchoring line above the price, e.g. "Valeur réelle : 141 €". */
    valueTotal: string;
    cta: string;
    ctaSub: string;
    guarantee: string;
    /** Short, specific testimonials shown right above the offer card. */
    testimonials: { text: string; name: string }[];
  };
  /** Prominent risk-reversal box shown before the FAQ. */
  guaranteeBox: {
    title: string;
    text: string;
  };
  faq: {
    heading: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    cta: string;
  };
  /** Urgency + social-proof widgets (sticky countdown + purchase toasts). */
  fomo: {
    /** Sticky 24h countdown bar at the top of the page. */
    countdownEnabled: boolean;
    /** Text before the timer, e.g. "Offre de lancement — se termine dans". */
    countdownLabel: string;
    /** Random "X a acheté …" purchase notifications. */
    toastsEnabled: boolean;
    /** Product name shown in the notifications. */
    toastProduct: string;
    /** First names cycled through the notifications (random order). */
    toastNames: string[];
  };
};

export const TIKTOK_LANDING_KEY = "tiktok_landing_content";

export const TIKTOK_LANDING_DEFAULTS: TikTokLandingContent = {
  hero: {
    eyebrow: "Tu sens la beauté du Coran… mais tu comprends presque rien ?",
    title: "Avec seulement 500 mots, comprends",
    titleHighlight: "85% des mots du Coran",
    subtitle:
      "Le livre qui regroupe les 500 mots essentiels du Coran, leur traduction française selon le contexte, et des versets avec exemples. Téléchargement immédiat.",
    cta: "Je reçois mon livre + mes bonus",
    ctaSub: "Paiement unique · Téléchargement immédiat",
    image: "",
    images: [],
    videoUrl: "",
    videoPoster: "",
    showPrice: true,
    socialProof: "Plus de 1 000 lecteurs et apprenants",
    stats: [
      { value: "500", label: "mots essentiels" },
      { value: "85%", label: "des mots du Coran" },
      { value: "30 j", label: "satisfait ou remboursé" },
    ],
  },
  story: {
    heading: "Et toi, ça te parle ?",
    bubbles: [
      { side: "left", text: "Ça fait des années que je prie… mais je ne comprends pas un mot de ce que je récite." },
      { side: "right", text: "Tu n'es pas seul. Moi aussi je récitais sans savoir ce que je disais à Allah." },
      { side: "left", text: "Et pendant le Ramadan, l'imam enchaîne de longues sourates… et je décroche complètement." },
      {
        side: "right",
        text: "Jusqu'au jour où on m'a dit : tu n'as pas besoin de tout apprendre. Juste les mots qui reviennent le plus.",
      },
      { side: "left", text: "Les mots qui reviennent ?" },
      {
        side: "right",
        text: "Oui. 500 mots reviennent partout dans le Coran. Tu les maîtrises, et d'un coup tu comprends ce que tu écoutes et ce que tu récites.",
      },
      {
        side: "left",
        text: "Donc je pourrais enfin ressentir mes prières… au lieu de les subir.",
      },
      {
        side: "right",
        text: "Exactement. Et tout commence avec un seul livre. 🤍",
      },
    ],
    closing:
      "Imagine ta prochaine prière : tu reconnais les mots, tu comprends ce que tu dis à Allah, et chaque verset prend vie. C'est exactement ce que ce livre rend possible — dès aujourd'hui.",
  },
  method: {
    heading: "Pourquoi 500 mots suffisent",
    cards: [
      {
        title: "Les mêmes racines reviennent",
        text: "Le Coran réutilise sans cesse les mêmes racines. En maîtrisant les plus fréquentes, tout devient plus clair, sourate après sourate.",
      },
      {
        title: "La traduction selon le contexte",
        text: "Chaque mot est traduit en français selon ses contextes réels dans le Coran — pas une traduction mot à mot approximative.",
      },
      {
        title: "Des versets avec exemples",
        text: "Chaque mot est illustré par des versets concrets, pour le reconnaître immédiatement quand tu écoutes ou tu lis.",
      },
    ],
  },
  book: {
    heading: "Le livre des 500 mots essentiels",
    text: "Un ebook clair et direct : les 500 mots les plus fréquents du Coran, classés pour être retenus facilement, avec leur traduction contextuelle et des versets en exemples.",
    image: "",
    bullets: [
      "Les 500 mots qui couvrent 85% des mots du Coran",
      "Traduction française selon le contexte",
      "Versets avec exemples pour chaque notion",
      "Format PDF — lisible sur téléphone, tablette et ordinateur",
    ],
    excerptsHeading: "Feuillette quelques pages",
    excerpts: [],
    bonusHeading: "Et en bonus, pour t'entraîner chaque jour :",
    bonuses: [
      "Accès à VIE à l'application Quranlab (exercices, révisions, suivi)",
      "Les du'as coraniques expliquées (PDF)",
      "Mises à jour incluses, pour toujours",
    ],
  },
  offerCard: {
    eyebrow: "Offre de lancement",
    priceSuffix: "une seule fois",
    features: [
      "Le livre des 500 mots essentiels (PDF) | 27 €",
      "Accès à vie à l'application Quranlab | 97 €",
      "Les du'as coraniques expliquées (PDF) | 17 €",
      "Mises à jour à vie | offert",
    ],
    valueTotal: "Valeur réelle : 141 €",
    cta: "Je reçois mon livre + mes bonus",
    ctaSub: "Téléchargement immédiat après paiement",
    guarantee: "Garantie satisfait ou remboursé 30 jours · Paiement sécurisé Stripe",
    // Intentionally empty: fill with REAL customer quotes from the admin.
    testimonials: [],
  },
  guaranteeBox: {
    title: "Garantie 30 jours, zéro risque",
    text: "Tu télécharges le livre, tu testes la méthode tranquillement. Si tu n'es pas convaincu(e), un simple e-mail suffit : remboursement complet sous 30 jours, sans aucune question.",
  },
  faq: {
    heading: "Questions fréquentes",
    items: [
      {
        q: "Je suis débutant(e), c'est fait pour moi ?",
        a: "Oui. Le livre part de zéro : pas besoin de savoir lire l'arabe couramment. Chaque mot est accompagné de sa translittération et de sa traduction en français.",
      },
      {
        q: "Combien de temps pour voir des résultats ?",
        a: "Dès les premières sourates que tu écoutes, tu reconnaîtras des mots. Avec quelques minutes par jour, la compréhension s'installe en quelques semaines.",
      },
      {
        q: "Comment je reçois le livre ?",
        a: "Immédiatement après le paiement : téléchargement direct + un e-mail avec tes accès (livre, bonus et application).",
      },
      {
        q: "Je ne sais pas du tout lire l'arabe, ça marche quand même ?",
        a: "Oui. Chaque mot est écrit en arabe ET en phonétique (translittération), avec sa traduction française. Tu peux apprendre à l'oreille, puis reconnaître les mots à l'écoute du Coran.",
      },
      {
        q: "C'est un livre papier ou numérique ?",
        a: "Numérique (PDF) : tu le reçois immédiatement après le paiement et tu le gardes à vie, sur téléphone, tablette ou ordinateur. Rien à attendre, pas de frais de livraison.",
      },
      {
        q: "Et si ça ne me convient pas ?",
        a: "Tu as 30 jours pour demander un remboursement complet, sans justification.",
      },
    ],
  },
  finalCta: {
    title: "Viens, on le prend ensemble 🤍",
    subtitle: "Et cette fois, on écoutera et on comprendra.",
    cta: "Je reçois mon livre + mes bonus",
  },
  fomo: {
    countdownEnabled: true,
    countdownLabel: "Offre de lancement — se termine dans",
    toastsEnabled: true,
    toastProduct: "Guide Comprendre 85% du Coran",
    toastNames: [
      "Yassine", "Mohamed", "Amine", "Bilal", "Hamza", "Omar", "Idriss",
      "Ismaël", "Ibrahim", "Younes", "Mehdi", "Anas", "Rayan", "Adam", "Sami",
      "Karim", "Nabil", "Sofiane", "Walid", "Reda", "Fatima", "Aïcha",
      "Khadija", "Mariam", "Inès", "Sara", "Salma", "Nour", "Imane",
      "Yasmine", "Leïla", "Lina", "Maya", "Assia", "Sofia", "Amira", "Rania",
      "Hanae", "Manel", "Soumaya",
    ],
  },
};

/** Deep-merges a stored partial over the defaults (arrays replaced wholesale). */
function mergeContent(base: any, patch: any): any {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return patch === undefined ? base : patch;
  }
  if (!base || typeof base !== "object" || Array.isArray(base)) return patch;
  const out: any = { ...base };
  for (const key of Object.keys(patch)) {
    out[key] = mergeContent(base[key], patch[key]);
  }
  return out;
}

/**
 * Reads the admin-editable TikTok landing copy, falling back to defaults if
 * the row/table is missing. `cache()` dedupes within a request.
 */
export const getTikTokLandingContent = cache(
  async (): Promise<TikTokLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, TIKTOK_LANDING_KEY),
      });
      if (!row?.value) return TIKTOK_LANDING_DEFAULTS;
      return mergeContent(
        TIKTOK_LANDING_DEFAULTS,
        JSON.parse(row.value),
      ) as TikTokLandingContent;
    } catch (e) {
      console.error("[tiktok-landing] read failed, using defaults:", e);
      return TIKTOK_LANDING_DEFAULTS;
    }
  },
);

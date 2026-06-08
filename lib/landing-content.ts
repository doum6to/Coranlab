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
export type LandingPair = { title: string; text: string };
export type LandingStep = { label: string; title: string; text: string };
export type LandingStat = { k: string; v: string };
export type LetterBonus = { title: string; image: string; description: string };

export type ProductFeature = { image: string; title: string; text: string };

export type LandingProduct = {
  gallery: string[];
  showThumbnails: boolean;
  rating: string;
  title: string;
  subtitle: string;
  bullets: string[];
  guarantee: string;
  benefitsHeading: string;
  benefits: LandingPair[];
  insideHeading: string;
  insideItems: ProductFeature[];
  howHeading: string;
  steps: LandingPair[];
  compareHeading: string;
  compareUs: string;
  compareThem: string;
  compareRows: string[];
  founderHeading: string;
  founderText: string;
  founderImage: string;
};

export type LandingLetter = {
  greeting: string;
  intro: string;
  methodLine: string;
  image1: string;
  insightHeading: string;
  insightBody: string;
  image2: string;
  howHeading: string;
  howBody: string;
  bonusesHeading: string;
  bonusesImage: string;
  bonuses: LetterBonus[];
  closing: string;
  ctaLabel: string;
};

export type LandingStory = {
  hookHeading: string;
  hookBody: string;
  patternHeading: string;
  patternBody: string;
  whyHeading: string;
  discoveries: LandingPair[];
  methodEyebrow: string;
  methodHeading: string;
  methodBody: string;
  steps: LandingStep[];
  perksHeading: string;
  perks: string[];
  whyWorksHeading: string;
  whyWorksBody: string;
  scienceHeading: string;
  science: LandingStat[];
  scienceNote: string;
  priceHeading: string;
  priceBody: string;
  ctaLabel: string;
  ctaSub: string;
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
    /** Small reassurance line shown INSIDE the CTA buttons, under the label. */
    buttonSub: string;
    secure: string;
    stickyLabel: string;
  };
  reviews: {
    eyebrow: string;
    heading: string;
    /** Uploaded TikTok review screenshots shown as an auto-scrolling marquee. */
    screenshots: string[];
    items: LandingReview[];
  };
  faq: { eyebrow: string; heading: string; items: LandingFaq[] };
  finalCta: { heading: string; subtitle: string };
  story: LandingStory;
  letter: LandingLetter;
  product: LandingProduct;
  /** Section keys hidden on the page (empty = everything visible). */
  hidden: string[];
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
    buttonSub: "Paiement sécurisé · Garantie de 14 jours",
    secure: "Paiement sécurisé via Stripe",
    stickyLabel: "J'en profite",
  },
  reviews: {
    eyebrow: "Avis TikTok vérifiés",
    heading: "Ils ont commencé avant toi",
    screenshots: [],
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
  story: {
    hookHeading:
      "Réciter les paroles d'Allah pendant des années… sans en comprendre un seul mot.",
    hookBody:
      "Imagine la scène. Tu es debout en prière, tu récites Al-Fātiḥa pour la millième fois. L'arabe coule parfaitement de tes lèvres, ton tajwīd est impeccable.\n\nMais à l'intérieur… le vide. Tu n'as aucune idée de ce que tu viens de dire à ton Créateur.\n\nAutour de toi, certains ont les larmes aux yeux, touchés par les versets. Toi, tu continues les gestes, mécaniquement — comme dans une pièce où tout le monde parle une langue magnifique qui touche l'âme, pendant que tu restes là, perdu.\n\nEt pendant le Ramadan, au Tarāwīḥ, c'est pire : tous vivent le khushūʿ, tandis que toi tu attends la traduction pour comprendre ce qui les a émus jusqu'aux larmes.\n\nCette déconnexion crée un cercle de frustration que beaucoup de musulmans portent en silence pendant des années. Mais ce n'est pas ta faute.",
    patternHeading:
      "Un « schéma linguistique » que l'enseignement traditionnel a ignoré",
    patternBody:
      "En tant que chercheur en linguistique coranique, j'ai vu des musulmans brillants et sincères — médecins, ingénieurs, enseignants — avoir mémorisé des sourates entières sans comprendre un seul verset sans traduction.\n\nPartout, on se concentre sur le tajwīd et le ḥifẓ, mais on néglige la compréhension. Et quand on tente enfin d'apprendre l'arabe, on est noyé dans une grammaire conçue pour des savants, pas pour des croyants qui veulent simplement comprendre leurs prières.",
    whyHeading: "Pourquoi l'arabe classique échoue pour 95% des musulmans",
    discoveries: [
      {
        title: "On enseigne le mauvais arabe",
        text: "Les cours classiques s'attardent sur l'arabe moderne et la grammaire savante. Or l'arabe pour commander un café à Marrakech n'a rien à voir avec celui de tes prières. On surcharge l'élève de vocabulaire inutile au lieu d'aller à l'essentiel.",
      },
      {
        title: "La « grammaire d'abord » tue la motivation",
        text: "Tableaux, conjugaisons, déclinaisons… L'arabe paraît alors impossible. 87% des élèves interrogés ont abandonné parce que c'était « trop académique » et « déconnecté de leur objectif spirituel ».",
      },
      {
        title: "Le Coran utilise très peu de mots",
        text: "La révélation décisive : seulement ~300 mots reviennent sans cesse et forment 85% du texte coranique. Les cours qui veulent t'enseigner des milliers de mots compliquent inutilement les choses.",
      },
    ],
    methodEyebrow: "La méthode « Fréquence avant tout »",
    methodHeading: "Comprends 85% du Coran en 30 jours — 10 mots par jour",
    methodBody:
      "Au lieu de lutter des années contre la grammaire, tu te concentres sur les bons 300 mots. C'est tout l'objet de l'ebook interactif « Débloque 85% du vocabulaire coranique » : ni manuel de grammaire, ni cours traditionnel — un système ciblé sur les mots les plus fréquents et les plus puissants.",
    steps: [
      {
        label: "Étape 1",
        title: "Maîtrise les fondations",
        text: "Les 50 mots les plus utilisés — « Allah », « Ar-Raḥmān », « les croyants », « la guidée »… Ils apparaissent dans presque chaque verset que tu récites. C'est la base de toute compréhension.",
      },
      {
        label: "Étape 2",
        title: "Construis ta reconnaissance",
        text: "Ajoute les 150 mots suivants, l'ossature des messages du Coran. Tu commences à saisir des phrases entières, plus seulement des mots isolés.",
      },
      {
        label: "Étape 3",
        title: "Le déclic",
        text: "Les 300 mots maîtrisés, 85% de ce que tu entends en prière, chaque khuṭba du vendredi, chaque récitation du Ramadan deviennent soudain clairs et lumineux.",
      },
    ],
    perksHeading: "Ce qui change tout",
    perks: [
      "Aucune grammaire écrasante — tu apprends les mots en contexte, naturellement.",
      "Pertinence spirituelle immédiate — chaque mot revient dans tes prières.",
      "Mémorisation visuelle — chaque mot illustré par un verset que tu connais déjà.",
      "Mémorisation audio — chaque mot et verset lu pour ancrer la mémoire.",
      "Rythme flexible — pensé pour les actifs, étudiants et parents débordés.",
      "Méthode éprouvée — testée avec plus de 2 000 musulmans francophones.",
    ],
    whyWorksHeading: "Pourquoi ça marche là où le reste échoue",
    whyWorksBody:
      "Quand tu as appris ta langue maternelle, tu n'as pas commencé par la littérature classique : tu as appris « le », « et », « est »… puis tu as progressé. Le Coran fonctionne pareil — Allah répète certains mots parce qu'ils sont au cœur de Son message. En te concentrant sur ces répétitions, tu apprends d'abord ce qu'Il a voulu que tu retiennes le plus.",
    scienceHeading: "La science derrière la méthode",
    science: [
      { k: "30 mots", v: "38% du Coran" },
      { k: "100 mots", v: "56% du Coran" },
      { k: "300 mots", v: "85% du Coran" },
    ],
    scienceNote:
      "Ce n'est pas du bricolage : c'est la voie intelligente que l'éducation traditionnelle a oubliée.",
    priceHeading: "Une fraction du prix d'un cours d'arabe",
    priceBody:
      "Un cours complet d'arabe coûte 300€ à 500€ et dure 2 à 3 ans. Les cours particuliers, 30€ à 50€ de l'heure. « Débloque 85% du vocabulaire coranique » vise de meilleurs résultats, pour une fraction du temps et du coût.",
    ctaLabel: "Je veux découvrir ces 300 mots essentiels",
    ctaSub: "Et vivre enfin le Coran avec compréhension",
  },
  letter: {
    greeting: "As Salam Alaykum !",
    intro:
      "Je vais être honnête avec toi.\n\nPendant longtemps, j'ouvrais le Coran… Je récitais. Je connaissais les sourates. Mais je ne comprenais pas vraiment ce que je disais.\n\nEt à chaque fois, je me disais : « Un jour, j'apprendrai l'arabe correctement. » Ce jour mettait toujours du temps à venir.\n\nSi tu te reconnais là-dedans, alors lis bien ce qui suit.\n\nCe programme est né d'une frustration : celle de dépendre constamment d'une traduction, d'une note en bas de page, d'un cours trop compliqué… ou trop éloigné du Coran.\n\nJe ne voulais pas devenir linguiste. Je voulais comprendre le Livre que je récite tous les jours.",
    methodLine:
      "Et c'est possible avec la méthodologie de Médine, adaptée pour toi :",
    image1: "",
    insightHeading: "Ce que j'ai compris, avec le temps",
    insightBody:
      "On n'a pas besoin de tout l'arabe pour comprendre le Coran. On a besoin de l'essentiel.\n\nLes mêmes mots reviennent. Les mêmes structures aussi. Quand tu les reconnais, le sens apparaît. Naturellement.\n\nC'est exactement ce que cette méthode t'enseigne.",
    image2: "",
    howHeading: "Comment ça se passe, concrètement",
    howBody:
      "Tu avances doucement, sans pression. 15 à 30 minutes par jour. Un peu de vocabulaire. Un peu de grammaire — seulement ce qui sert vraiment.\n\nJour après jour, tu réalises quelque chose d'étrange :\n👉 tu comprends sans traduire\n👉 tu anticipes le sens\n👉 tu n'es plus perdu(e) dans les versets\n\nEt la prière… c'est là que tout change. Quand tu sais ce que tu dis, quand tu comprends ce que tu récites, la prière n'est plus un automatisme. Elle devient une conversation.\n\nEn 30 jours, tu ne deviendras pas arabophone. Mais tu feras quelque chose de bien plus précieux :\n✔️ Tu liras le Coran avec sérénité\n✔️ Tu comprendras l'essentiel du message\n✔️ Tu te sentiras enfin proche du sens, pas juste des mots\n\nCe programme est pour toi si tu veux comprendre (pas impressionner), avancer sans te noyer dans la théorie, et te rapprocher du Coran, simplement. Il n'est pas pour tout le monde — et c'est volontaire.",
    bonusesHeading: "Et en plus, 3 bonus offerts 🎁 (offre à durée limitée)",
    bonusesImage: "",
    bonuses: [
      {
        title: "Bonus 01 — Du'as coraniques 🎁",
        image: "",
        description:
          "Transforme ta vie avec les Du'as puissantes du Coran. Plus de 240 pages de sagesses divines, disponibles instantanément. Traduction + Tafsir clair selon Ibn Kathir pour une compréhension ancrée.",
      },
      {
        title: "Bonus 02 — Résumé des 30 Juzz du Coran 🎁",
        image: "",
        description:
          "Pour t'aider à mieux comprendre la parole d'Allah, à la méditer au quotidien et à la vivre pleinement.",
      },
      {
        title: "Bonus 03 — Application à vie 🎁",
        image: "",
        description:
          "Apprends et révise le vocabulaire par la répétition espacée, sur tous tes appareils, à vie. Places limitées.",
      },
    ],
    closing:
      "Et si tu hésites encore… dis-toi une chose : le Coran ne changera pas. Mais ta manière de le lire, elle, peut changer. Dès maintenant.",
    ctaLabel: "Rejoindre le programme",
  },
  product: {
    gallery: [],
    showThumbnails: true,
    rating: "4,9/5 · plus de 1 000 apprenants",
    title: "Comprendre 85% du Coran",
    subtitle:
      "L'ebook de référence + 3 bonus offerts (dont l'accès à vie à l'application). Téléchargement immédiat, paiement unique.",
    bullets: [
      "Les ~300 mots qui forment 85% du Coran",
      "Traduction + racines, classés par fréquence",
      "Accès à vie à l'application en bonus",
      "Téléchargement immédiat",
    ],
    guarantee: "Paiement unique · Accès immédiat · Sécurisé par Stripe",
    benefitsHeading: "Pourquoi ça marche",
    benefits: [
      {
        title: "L'essentiel d'abord",
        text: "Tu apprends les mots les plus fréquents — un maximum de compréhension pour un minimum d'effort.",
      },
      {
        title: "Sans grammaire écrasante",
        text: "Les mots dans leur contexte coranique, naturellement, comme on apprend une langue.",
      },
      {
        title: "5 minutes par jour",
        text: "Un rythme tenable, pensé pour les actifs, étudiants et parents débordés.",
      },
    ],
    insideHeading: "Ce que tu reçois",
    insideItems: [
      {
        image: "",
        title: "📖 L'ebook — 85% des mots du Coran",
        text: "Les mots les plus fréquents, classés, avec traduction et racines.",
      },
      {
        image: "",
        title: "🎁 Accès à vie à l'application",
        text: "Apprends et révise par la répétition espacée, à vie. Places limitées.",
      },
      {
        image: "",
        title: "🎁 Du'as coraniques",
        text: "240+ pages, traduction + Tafsir Ibn Kathir.",
      },
      {
        image: "",
        title: "🎁 Résumé des 30 Juzz",
        text: "Pour méditer et vivre la parole d'Allah au quotidien.",
      },
    ],
    howHeading: "Comment ça se passe",
    steps: [
      {
        title: "1. Reçois l'accès",
        text: "Paiement unique, puis téléchargement immédiat de l'ebook et des bonus.",
      },
      {
        title: "2. Apprends l'essentiel",
        text: "10 mots par jour, en contexte. L'application t'aide à réviser.",
      },
      {
        title: "3. Comprends le Coran",
        text: "En quelques semaines, le sens apparaît — en prière comme en lecture.",
      },
    ],
    compareHeading: "Pourquoi pas un cours classique ?",
    compareUs: "Cet ebook",
    compareThem: "Cours d'arabe classique",
    compareRows: [
      "Centré sur le vocabulaire du Coran",
      "Résultats en quelques semaines",
      "Sans grammaire interminable",
      "Accès à vie à l'application inclus",
      "Une fraction du prix",
    ],
    founderHeading: "Pourquoi j'ai créé ceci",
    founderText:
      "Comme beaucoup, je récitais sans comprendre. Je ne voulais pas devenir linguiste — juste comprendre le Livre que je lis chaque jour. Cette méthode est celle que j'aurais aimé avoir.",
    founderImage: "",
  },
  hidden: [],
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

import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/**
 * Admin-editable content for the /apprendre-coran onboarding funnel:
 * every screen's wording + image, plus the two subscription prices shown on the
 * final paywall (and charged by Stripe). Stored as one JSON row in app_setting.
 */

export type OnbCol = { title: string; good: boolean; items: string[] };
export type OnbReview = { name: string; text: string };

/** A single onboarding screen. Flat shape (optional fields per `type`) so the
 *  admin editor can render generically. */
export type OnbStep = {
  type:
    | "hero"
    | "message"
    | "comparison"
    | "checklist"
    | "single"
    | "multi"
    | "chart"
    | "reviews"
    | "loading"
    | "stat"
    | "ready";
  headline?: string;
  sub?: string;
  /** Image URL. Empty = a dashed placeholder is shown (import later). */
  image?: string;
  cta?: string;
  items?: string[]; // checklist
  options?: string[]; // single / multi
  left?: OnbCol; // comparison
  right?: OnbCol; // comparison
  big?: string; // stat headline number
  reviews?: OnbReview[];
};

/** One purchasable plan. `amountCents` is what Stripe charges; the displayed
 *  label is decoupled (e.g. annual charges 89,99€ but shows "1,73€ / semaine"). */
export type OnbPlan = {
  amountCents: number; // charged amount (EUR cents)
  interval: "week" | "year";
  title: string;
  priceLabel: string; // e.g. "8,99€" or "1,73€"
  per: string; // e.g. "par semaine"
  sub: string; // e.g. "Facturé 89,99€ par an" ("" = none)
  popular: boolean;
};

export type ApprendreCoranContent = {
  steps: OnbStep[];
  paywall: {
    title: string; // supports \n for a line break
    image: string;
    bullets: string[];
    weekly: OnbPlan;
    annual: OnbPlan;
    reassurance: string;
  };
};

export const APPRENDRE_CORAN_KEY = "apprendre_coran_content";

export const APPRENDRE_CORAN_DEFAULTS: ApprendreCoranContent = {
  steps: [
    { type: "hero", headline: "Comprends le Coran,\ncomme tu l'as toujours voulu.", sub: "5 minutes par jour. Mot à mot.", image: "", cta: "Commencer" },
    { type: "message", headline: "Pas d'arabe scolaire.\nPas de découragement.", sub: "Une méthode douce, pensée pour durer." },
    { type: "message", headline: "Dis adieu au « je lis sans rien comprendre »", image: "" },
    {
      type: "comparison",
      headline: "En faire plus n'est pas toujours mieux",
      left: { title: "Tout mémoriser d'un coup", good: false, items: ["Surcharge", "Découragement", "Vite oublié"] },
      right: { title: "Un peu chaque jour", good: true, items: ["Léger", "Motivant", "Ancré durablement"] },
    },
    { type: "message", headline: "La régularité bat l'intensité", sub: "Quelques mots par jour valent mieux qu'une heure une fois par mois." },
    { type: "message", headline: "La bonne nouvelle :\n5 minutes suffisent", sub: "Des leçons courtes, au bon moment, pour ne rien oublier.", image: "" },
    { type: "message", headline: "La clé, c'est la compréhension —\nmot à mot", sub: "Reconnais les mots les plus fréquents du Coran, un par un." },
    { type: "checklist", headline: "Avec Quranlab, des résultats concrets", items: ["Comprendre des mots dans ta prière", "Reconnaître le vocabulaire fréquent", "Progresser sans te décourager", "Garder l'habitude, jour après jour"] },
    { type: "multi", headline: "Quel est ton objectif ?", sub: "Choisis ce qui te parle (plusieurs possibles)", options: ["Comprendre ma prière 🤲", "Lire l'arabe", "Mémoriser du vocabulaire", "Me rapprocher d'Allah", "Comprendre le Coran en entier", "Aider mes enfants"] },
    { type: "single", headline: "Sois honnête — où en es-tu ?", options: ["Je débute totalement", "Je connais l'alphabet", "Je lis mais ne comprends pas", "Je comprends déjà quelques mots"] },
    { type: "single", headline: "Ton objectif quotidien", sub: "Combien de mots par jour ?", options: ["5 mots — tranquille", "10 mots — équilibré ⭐", "15 mots — motivé", "20 mots — intensif"] },
    { type: "multi", headline: "Qu'est-ce qui te freine ?", options: ["Le manque de temps", "Je ne sais pas par où commencer", "J'ai déjà essayé et abandonné", "L'arabe me paraît difficile", "Je me décourage vite"] },
    { type: "message", headline: "Tu es déjà sur le bon chemin", sub: "Le simple fait d'être ici montre ta sincérité. Allahumma barik.", image: "" },
    { type: "multi", headline: "Qu'est-ce qui te motive ?", options: ["Mieux vivre ma prière", "Me sentir plus proche d'Allah", "Progresser un peu chaque jour", "Comprendre ce que je récite", "Transmettre à ma famille"] },
    { type: "chart", headline: "Plus tu apprends, plus tu comprends", sub: "Ta compréhension grimpe, semaine après semaine." },
    { type: "reviews", headline: "Le choix des apprenants", reviews: [{ name: "Omar", text: "En 3 jours je reconnais plein de mots dans ma prière. Allahumma barik." }, { name: "Nayah", text: "La façon la plus simple d'enfin comprendre. Barak Allah fikoum." }, { name: "Yusuf", text: "5 minutes par jour, et ça reste. Incroyable." }] },
    { type: "message", headline: "Des rappels doux,\njamais culpabilisants", sub: "On t'accompagne pour garder l'habitude, à ton rythme.", image: "" },
    { type: "loading", headline: "On construit ton plan personnalisé…" },
    { type: "stat", headline: "Rejoint par des milliers de musulmans", big: "100 000+", sub: "apprenants qui comprennent enfin le Coran" },
    { type: "ready", headline: "Ton plan Quranlab est prêt", sub: "Construit à partir de tes réponses. Fait pour toi, in shâ Allah.", cta: "Voir mon offre" },
  ],
  paywall: {
    title: "Comprends le Coran,\nsans limite",
    image: "",
    bullets: ["Comprends chaque mot de ta prière", "Progresse un peu chaque jour, sans pression"],
    weekly: { amountCents: 899, interval: "week", title: "Accès hebdo", priceLabel: "8,99€", per: "par semaine", sub: "", popular: false },
    annual: { amountCents: 8999, interval: "year", title: "Accès annuel", priceLabel: "1,73€", per: "par semaine", sub: "Facturé 89,99€ par an", popular: true },
    reassurance: "Sans engagement, annulable à tout moment",
  },
};

const STEP_TYPES = new Set<OnbStep["type"]>([
  "hero", "message", "comparison", "checklist", "single", "multi", "chart", "reviews", "loading", "stat", "ready",
]);

const strArr = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string") : undefined;

function mergeCol(v: unknown, d: OnbCol): OnbCol {
  const o = (v ?? {}) as Partial<OnbCol>;
  return {
    title: typeof o.title === "string" ? o.title : d.title,
    good: o.good === true,
    items: strArr(o.items) ?? d.items,
  };
}

function mergePlan(v: unknown, d: OnbPlan): OnbPlan {
  const o = (v ?? {}) as Partial<OnbPlan>;
  return {
    amountCents:
      typeof o.amountCents === "number" && Number.isFinite(o.amountCents) && o.amountCents > 0
        ? Math.round(o.amountCents)
        : d.amountCents,
    interval: o.interval === "week" || o.interval === "year" ? o.interval : d.interval,
    title: typeof o.title === "string" ? o.title : d.title,
    priceLabel: typeof o.priceLabel === "string" ? o.priceLabel : d.priceLabel,
    per: typeof o.per === "string" ? o.per : d.per,
    sub: typeof o.sub === "string" ? o.sub : d.sub,
    popular: o.popular === true,
  };
}

function merge(stored: Partial<ApprendreCoranContent> | null): ApprendreCoranContent {
  const d = APPRENDRE_CORAN_DEFAULTS;
  if (!stored) return d;

  const steps: OnbStep[] = Array.isArray(stored.steps)
    ? stored.steps
        .filter((s): s is OnbStep => !!s && STEP_TYPES.has((s as OnbStep).type))
        .map((s) => ({
          type: s.type,
          headline: typeof s.headline === "string" ? s.headline : undefined,
          sub: typeof s.sub === "string" ? s.sub : undefined,
          image: typeof s.image === "string" ? s.image : undefined,
          cta: typeof s.cta === "string" ? s.cta : undefined,
          items: strArr(s.items),
          options: strArr(s.options),
          big: typeof s.big === "string" ? s.big : undefined,
          left: s.left ? mergeCol(s.left, d.steps[3].left!) : undefined,
          right: s.right ? mergeCol(s.right, d.steps[3].right!) : undefined,
          reviews: Array.isArray(s.reviews)
            ? s.reviews.map((r) => ({ name: String(r?.name ?? ""), text: String(r?.text ?? "") }))
            : undefined,
        }))
    : d.steps;

  const p = (stored.paywall ?? {}) as Partial<ApprendreCoranContent["paywall"]>;
  return {
    steps: steps.length ? steps : d.steps,
    paywall: {
      title: typeof p.title === "string" ? p.title : d.paywall.title,
      image: typeof p.image === "string" ? p.image : d.paywall.image,
      bullets: strArr(p.bullets) ?? d.paywall.bullets,
      weekly: mergePlan(p.weekly, d.paywall.weekly),
      annual: mergePlan(p.annual, d.paywall.annual),
      reassurance: typeof p.reassurance === "string" ? p.reassurance : d.paywall.reassurance,
    },
  };
}

/** Reads the /apprendre-coran content, falling back to defaults. Cached/request. */
export const getApprendreCoranContent = cache(
  async (): Promise<ApprendreCoranContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, APPRENDRE_CORAN_KEY),
      });
      if (!row?.value) return APPRENDRE_CORAN_DEFAULTS;
      return merge(JSON.parse(row.value));
    } catch (e) {
      console.error("[apprendre-coran] read failed, using defaults:", e);
      return APPRENDRE_CORAN_DEFAULTS;
    }
  },
);

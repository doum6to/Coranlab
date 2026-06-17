import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** A body block: either a paragraph of text or an image (Stan.store-style). */
export type CoranBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string };

export type CoranReview = { name: string; text: string };

/** Manual Orange Money / Mobile Money payment option (admin-editable). */
export type CoranOrangeMoney = {
  /** Show the "Payer avec Orange Money" option on /coran. */
  enabled: boolean;
  /** Merchant number the buyer sends money to (e.g. "+221 77 123 45 67"). */
  number: string;
  /** Amount to send, shown to the buyer (e.g. "5 000 FCFA"). */
  amountLabel: string;
  /** Free-text instructions / steps shown in the payment panel. */
  instructions: string;
};

/**
 * Admin-editable content for the Stan.store-style product page (/coran):
 * banners → title → price → free-form body (text/images) → reviews → checkout.
 */
export type CoranLandingContent = {
  /** Banner images shown at the very top (swipeable if several). */
  banners: string[];
  /** Page background colour (CSS hex). */
  bgColor: string;
  /** Main text colour (CSS hex). */
  textColor: string;
  title: string;
  subtitle: string;
  /** Self-contained price for this page (independent from the other offers). */
  price: {
    currency: "EUR" | "USD" | "GBP";
    amountCents: number;
    compareAtCents: number;
  };
  showPrice: boolean;
  /** Also show the price converted to FCFA (XOF) in the checkout box. */
  showFcfa: boolean;
  /** Manual FCFA price (whole FCFA). 0 = auto-convert from the EUR price. */
  fcfaAmount: number;
  /** "What you get" bullet list shown in the "Finalise ta commande" box. */
  deliverables: string[];
  /** Show the "what you get" list in the checkout box. */
  showDeliverables: boolean;
  /** Free-form body: any mix of text paragraphs and images, in order. */
  body: CoranBlock[];
  reviewsHeading: string;
  /** Uploaded review screenshots → auto-scrolling marquee (like landing V3). */
  reviewImages: string[];
  reviews: CoranReview[];
  /** Label on the main + sticky payment buttons. */
  ctaLabel: string;
  /** Show the floating bottom payment bar on scroll. */
  showStickyBar: boolean;
  /** Manual Orange Money / Mobile Money payment option. */
  orangeMoney: CoranOrangeMoney;
  /** Reassurance line under the checkout. */
  guarantee: string;
};

export const CORAN_LANDING_KEY = "coran_landing_content";

export const CORAN_LANDING_DEFAULTS: CoranLandingContent = {
  banners: [],
  bgColor: "#FAF8F3",
  textColor: "#171717",
  title: "Comprendre 85% du Coran",
  subtitle: "Le guide des 500 mots essentiels pour enfin comprendre ce que tu récites.",
  price: { currency: "EUR", amountCents: 999, compareAtCents: 4900 },
  showPrice: true,
  showFcfa: true,
  fcfaAmount: 0,
  deliverables: [
    "Accès Premium à vie à l'application",
    "Le guide PDF des 500 mots essentiels",
    "Accès immédiat envoyé par email",
  ],
  showDeliverables: true,
  body: [
    {
      type: "text",
      text: "500 mots reviennent en boucle dans le Coran. À eux seuls, ils représentent 85% du texte. Apprends-les, et tu comprendras enfin ce que tu lis et écoutes.",
    },
  ],
  reviewsHeading: "Ils l'ont adopté",
  reviewImages: [],
  reviews: [
    { name: "Omar", text: "Je voulais juste tester… mais en 3 jours je reconnais plein de mots dans ma prière. Allahumma barik." },
    { name: "Nayah", text: "La manière de le lire la plus simple. Barak Allah fikoum." },
  ],
  ctaLabel: "Je reçois mon guide",
  showStickyBar: true,
  orangeMoney: {
    enabled: false,
    number: "",
    amountLabel: "",
    instructions:
      "1. Envoie le montant ci-dessus à ce numéro Orange Money.\n2. Copie l'ID de la transaction (reçu par SMS).\n3. Renseigne ton email + l'ID ci-dessous. Tu recevras ton accès par email après validation.",
  },
  guarantee: "Paiement sécurisé · Téléchargement immédiat · Garantie 30 jours",
};

const SYMBOL: Record<CoranLandingContent["price"]["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/** Formats cents → "9,99 €" (FR style). */
export function formatCoranPrice(
  amountCents: number,
  currency: CoranLandingContent["price"]["currency"],
): string {
  const v = (amountCents / 100).toFixed(2).replace(".", ",");
  return `${v} ${SYMBOL[currency]}`;
}

/** Fixed CFA franc (XOF) peg: 1 EUR = 655.957 FCFA. */
export const EUR_TO_XOF = 655.957;

/** Formats a whole FCFA amount → "5 000 FCFA" (space-grouped thousands). */
export function formatFcfaAmount(amount: number): string {
  const xof = Math.max(0, Math.round(amount));
  const grouped = xof.toLocaleString("en-US").replace(/,/g, " ");
  return `${grouped} FCFA`;
}

/**
 * Converts a EUR price (in cents) to a "5 500 FCFA" label, rounded to the
 * nearest 5 FCFA. Returns null for non-EUR currencies (no fixed peg).
 */
export function formatFcfaFromEur(
  amountCents: number,
  currency: CoranLandingContent["price"]["currency"],
): string | null {
  if (currency !== "EUR") return null;
  const raw = (amountCents / 100) * EUR_TO_XOF;
  const xof = Math.round(raw / 5) * 5;
  return `${xof.toLocaleString("en-US").replace(/,/g, " ").replace(/ | /g, " ")} FCFA`;
}

function merge(stored: Partial<CoranLandingContent> | null): CoranLandingContent {
  const d = CORAN_LANDING_DEFAULTS;
  if (!stored) return d;
  return {
    banners: Array.isArray(stored.banners) ? stored.banners : d.banners,
    bgColor: typeof stored.bgColor === "string" ? stored.bgColor : d.bgColor,
    textColor: typeof stored.textColor === "string" ? stored.textColor : d.textColor,
    title: typeof stored.title === "string" ? stored.title : d.title,
    subtitle: typeof stored.subtitle === "string" ? stored.subtitle : d.subtitle,
    price: {
      currency: stored.price?.currency ?? d.price.currency,
      amountCents:
        typeof stored.price?.amountCents === "number"
          ? stored.price.amountCents
          : d.price.amountCents,
      compareAtCents:
        typeof stored.price?.compareAtCents === "number"
          ? stored.price.compareAtCents
          : d.price.compareAtCents,
    },
    showPrice: stored.showPrice !== false,
    showFcfa: stored.showFcfa !== false,
    fcfaAmount:
      typeof stored.fcfaAmount === "number" && Number.isFinite(stored.fcfaAmount)
        ? stored.fcfaAmount
        : d.fcfaAmount,
    deliverables: Array.isArray(stored.deliverables) ? stored.deliverables : d.deliverables,
    showDeliverables: stored.showDeliverables !== false,
    body: Array.isArray(stored.body) ? stored.body : d.body,
    reviewsHeading:
      typeof stored.reviewsHeading === "string" ? stored.reviewsHeading : d.reviewsHeading,
    reviewImages: Array.isArray(stored.reviewImages) ? stored.reviewImages : d.reviewImages,
    reviews: Array.isArray(stored.reviews) ? stored.reviews : d.reviews,
    ctaLabel: typeof stored.ctaLabel === "string" ? stored.ctaLabel : d.ctaLabel,
    showStickyBar: stored.showStickyBar !== false,
    orangeMoney: {
      enabled: stored.orangeMoney?.enabled === true,
      number:
        typeof stored.orangeMoney?.number === "string"
          ? stored.orangeMoney.number
          : d.orangeMoney.number,
      amountLabel:
        typeof stored.orangeMoney?.amountLabel === "string"
          ? stored.orangeMoney.amountLabel
          : d.orangeMoney.amountLabel,
      instructions:
        typeof stored.orangeMoney?.instructions === "string"
          ? stored.orangeMoney.instructions
          : d.orangeMoney.instructions,
    },
    guarantee: typeof stored.guarantee === "string" ? stored.guarantee : d.guarantee,
  };
}

/** Reads the /coran content, falling back to defaults. Cached per request. */
export const getCoranLandingContent = cache(
  async (): Promise<CoranLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, CORAN_LANDING_KEY),
      });
      if (!row?.value) return CORAN_LANDING_DEFAULTS;
      return merge(JSON.parse(row.value));
    } catch (e) {
      console.error("[coran-landing] read failed, using defaults:", e);
      return CORAN_LANDING_DEFAULTS;
    }
  },
);

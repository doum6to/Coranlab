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
    body: Array.isArray(stored.body) ? stored.body : d.body,
    reviewsHeading:
      typeof stored.reviewsHeading === "string" ? stored.reviewsHeading : d.reviewsHeading,
    reviewImages: Array.isArray(stored.reviewImages) ? stored.reviewImages : d.reviewImages,
    reviews: Array.isArray(stored.reviews) ? stored.reviews : d.reviews,
    ctaLabel: typeof stored.ctaLabel === "string" ? stored.ctaLabel : d.ctaLabel,
    showStickyBar: stored.showStickyBar !== false,
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

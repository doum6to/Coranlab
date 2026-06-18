import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import {
  type CoranLandingContent,
  CORAN_LANDING_DEFAULTS,
} from "@/lib/coran-landing-content";

/**
 * Admin-editable content for the /duas product page. Same shape as the /coran
 * page, plus a `driveLink`: this product is delivered ONLY by email with a
 * Google Drive link (no account, no premium).
 */
export type DuasLandingContent = CoranLandingContent & {
  /** The Google Drive link emailed to the buyer after purchase. */
  driveLink: string;
};

export const DUAS_LANDING_KEY = "duas_landing_content";

export const DUAS_LANDING_DEFAULTS: DuasLandingContent = {
  ...CORAN_LANDING_DEFAULTS,
  title: "Mon recueil de duas",
  subtitle: "Les invocations essentielles du quotidien, à recevoir par email.",
  deliverables: [
    "Le recueil complet en PDF",
    "Lien Google Drive envoyé par email",
    "Accès immédiat après paiement",
  ],
  ctaLabel: "Je reçois mon recueil",
  guarantee: "Paiement sécurisé · Lien envoyé par email",
  driveLink: "",
};

function merge(stored: Partial<DuasLandingContent> | null): DuasLandingContent {
  const d = DUAS_LANDING_DEFAULTS;
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
    driveLink: typeof stored.driveLink === "string" ? stored.driveLink : d.driveLink,
  };
}

/** Reads the /duas content, falling back to defaults. Cached per request. */
export const getDuasLandingContent = cache(
  async (): Promise<DuasLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, DUAS_LANDING_KEY),
      });
      if (!row?.value) return DUAS_LANDING_DEFAULTS;
      return merge(JSON.parse(row.value));
    } catch (e) {
      console.error("[duas-landing] read failed, using defaults:", e);
      return DUAS_LANDING_DEFAULTS;
    }
  },
);

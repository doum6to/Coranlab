import "server-only";
import { cache } from "react";
import { inArray } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import {
  CURRENCIES,
  isCurrency,
  formatMoney,
  type Currency,
} from "@/lib/currency";

// Re-export the (client-safe) currency primitives so existing server imports
// from "@/lib/offer" keep working.
export { CURRENCIES, isCurrency, formatMoney };
export type { Currency };

export type LandingVariant = "classic" | "letter" | "product";

/** Price + currency for a single language. */
export type LocalePrice = {
  currency: Currency;
  priceCents: number;
  compareAtCents: number;
};

export type OfferSettings = {
  /** Lifetime price charged at checkout, in cents (EUR fallback / FR). */
  priceCents: number;
  /** Struck-through "compare at" price shown next to the price, in cents. */
  compareAtCents: number;
  /** "X" in the X/Y scarcity counter. */
  spotsJoined: number;
  /** "Y" in the X/Y scarcity counter. */
  spotsTotal: number;
  /** Which landing layout is live at /offre-a-vie. */
  variant: LandingVariant;
  /** Downloadable PDF links shown in the buyer's account space. */
  pdfLinks: { label: string; url: string }[];
  /** Per-language price + currency for the landing offer (V3). */
  pricingByLocale: Record<Locale, LocalePrice>;
  /** Per-language price for the V4 A/B variant (defaults to V3 per locale). */
  pricingByLocaleV4: Record<Locale, LocalePrice>;
  /** Payment-method badges shown on the landing (subset of PAYMENT_BADGE_IDS). */
  paymentBadges: string[];
  /** Scarcity element under the CTA: the spots gauge or a 24h countdown. */
  scarcityMode: "spots" | "timer";
  /** Whether the red sticky offer bar (timer + price + CTA) is shown. */
  stickyBar: boolean;
};

export const OFFER_DEFAULTS: OfferSettings = {
  priceCents: 1497,
  compareAtCents: 9900,
  spotsJoined: 1902,
  spotsTotal: 2000,
  variant: "classic",
  pdfLinks: [],
  pricingByLocale: {
    fr: { currency: "EUR", priceCents: 1497, compareAtCents: 9900 },
    en: { currency: "GBP", priceCents: 1497, compareAtCents: 9900 },
    es: { currency: "EUR", priceCents: 1497, compareAtCents: 9900 },
  },
  pricingByLocaleV4: {
    fr: { currency: "EUR", priceCents: 1497, compareAtCents: 9900 },
    en: { currency: "GBP", priceCents: 1497, compareAtCents: 9900 },
    es: { currency: "EUR", priceCents: 1497, compareAtCents: 9900 },
  },
  paymentBadges: ["card", "applePay", "paypal", "klarna", "link"],
  scarcityMode: "spots",
  stickyBar: false,
};

/** All payment badges that can be shown on the landing (admin-toggleable). */
export const PAYMENT_BADGE_IDS = [
  "card",
  "applePay",
  "paypal",
  "klarna",
  "link",
] as const;
export type PaymentBadgeId = (typeof PAYMENT_BADGE_IDS)[number];

const KEYS = {
  price: "offer_price_cents",
  compare: "offer_compare_cents",
  joined: "offer_spots_joined",
  total: "offer_spots_total",
  variant: "landing_variant",
  pdf: "pdf_links",
  pricing: "offer_pricing_by_locale",
  pricingV4: "offer_pricing_by_locale_v4",
  badges: "offer_payment_badges",
  scarcity: "offer_scarcity_mode",
  sticky: "offer_sticky_bar",
} as const;

const toInt = (v: string | undefined, fallback: number) => {
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Reads the admin-editable offer settings from the DB, falling back to the
 * launch defaults if the row/table is missing or the query fails — so the
 * site (and checkout) never break, even before `db:push` has run.
 *
 * `cache()` dedupes the read within a single request.
 */
export const getOfferSettings = cache(async (): Promise<OfferSettings> => {
  try {
    const rows = await db
      .select()
      .from(appSetting)
      .where(
        inArray(appSetting.key, [
          KEYS.price,
          KEYS.compare,
          KEYS.joined,
          KEYS.total,
          KEYS.variant,
          KEYS.pdf,
          KEYS.pricing,
          KEYS.pricingV4,
          KEYS.badges,
          KEYS.scarcity,
          KEYS.sticky,
        ]),
      );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    let pdfLinks: { label: string; url: string }[] = [];
    try {
      const raw = map.get(KEYS.pdf);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) pdfLinks = parsed;
      }
    } catch {
      /* keep empty */
    }

    // Payment badges: stored as a JSON array of badge ids; only known ids kept.
    let paymentBadges: string[] = OFFER_DEFAULTS.paymentBadges;
    try {
      const raw = map.get(KEYS.badges);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          paymentBadges = parsed.filter(
            (b): b is string =>
              typeof b === "string" &&
              (PAYMENT_BADGE_IDS as readonly string[]).includes(b),
          );
        }
      }
    } catch {
      /* keep defaults */
    }

    const priceCents = toInt(map.get(KEYS.price), OFFER_DEFAULTS.priceCents);
    const compareAtCents = toInt(
      map.get(KEYS.compare),
      OFFER_DEFAULTS.compareAtCents,
    );

    // Per-locale pricing falls back to an EUR map reusing the global price, so
    // existing setups keep working.
    const fallback: LocalePrice = {
      currency: "EUR",
      priceCents,
      compareAtCents,
    };
    // Builds a per-locale pricing map from a stored JSON override, falling back
    // to `fb(loc)` for any missing field.
    const buildPricing = (
      key: string,
      fb: (loc: Locale) => LocalePrice,
    ): Record<Locale, LocalePrice> => {
      let parsedStore: Record<string, Partial<LocalePrice>> = {};
      try {
        const raw = map.get(key);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === "object") parsedStore = p;
        }
      } catch {
        /* keep fallback */
      }
      return Object.fromEntries(
        LOCALES.map((loc) => {
          const s = parsedStore[loc] ?? {};
          const f = fb(loc);
          return [
            loc,
            {
              currency: isCurrency(s.currency) ? s.currency : f.currency,
              priceCents:
                typeof s.priceCents === "number" && s.priceCents >= 0
                  ? s.priceCents
                  : f.priceCents,
              compareAtCents:
                typeof s.compareAtCents === "number" && s.compareAtCents >= 0
                  ? s.compareAtCents
                  : f.compareAtCents,
            } as LocalePrice,
          ];
        }),
      ) as Record<Locale, LocalePrice>;
    };

    const pricingByLocale = buildPricing(KEYS.pricing, () => fallback);
    // V4 falls back per-locale to V3's resolved price, so it stays identical
    // until the admin sets a different V4 price.
    const pricingByLocaleV4 = buildPricing(
      KEYS.pricingV4,
      (loc) => pricingByLocale[loc],
    );

    return {
      priceCents,
      compareAtCents,
      spotsJoined: toInt(map.get(KEYS.joined), OFFER_DEFAULTS.spotsJoined),
      spotsTotal: toInt(map.get(KEYS.total), OFFER_DEFAULTS.spotsTotal),
      variant: ((): LandingVariant => {
        const v = map.get(KEYS.variant);
        return v === "letter" || v === "product" ? v : "classic";
      })(),
      pdfLinks,
      pricingByLocale,
      pricingByLocaleV4,
      paymentBadges,
      scarcityMode: map.get(KEYS.scarcity) === "timer" ? "timer" : "spots",
      stickyBar: map.get(KEYS.sticky) === "true",
    };
  } catch (e) {
    console.error("[offer] getOfferSettings failed, using defaults:", e);
    return OFFER_DEFAULTS;
  }
});

export const OFFER_KEYS = KEYS;

/** The price + currency for a language + landing variant, with safe fallbacks. */
export function getLocalePrice(
  offer: OfferSettings,
  locale: Locale = DEFAULT_LOCALE,
  variant: "v3" | "v4" = "v3",
): LocalePrice {
  const map = variant === "v4" ? offer.pricingByLocaleV4 : offer.pricingByLocale;
  return (
    map?.[locale] ??
    offer.pricingByLocale?.[locale] ??
    offer.pricingByLocale?.[DEFAULT_LOCALE] ?? {
      currency: "EUR",
      priceCents: offer.priceCents,
      compareAtCents: offer.compareAtCents,
    }
  );
}

/** Formats cents as a French price label, dropping a trailing ,00. */
export function formatEuros(cents: number): string {
  const euros = cents / 100;
  const label = Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(2).replace(".", ",");
  return `${label}€`;
}

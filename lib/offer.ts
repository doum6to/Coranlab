import "server-only";
import { cache } from "react";
import { inArray } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

export type OfferSettings = {
  /** Lifetime price charged at checkout, in cents. */
  priceCents: number;
  /** Struck-through "compare at" price shown next to the price, in cents. */
  compareAtCents: number;
  /** "X" in the X/Y scarcity counter. */
  spotsJoined: number;
  /** "Y" in the X/Y scarcity counter. */
  spotsTotal: number;
};

export const OFFER_DEFAULTS: OfferSettings = {
  priceCents: 1497,
  compareAtCents: 9900,
  spotsJoined: 1902,
  spotsTotal: 2000,
};

const KEYS = {
  price: "offer_price_cents",
  compare: "offer_compare_cents",
  joined: "offer_spots_joined",
  total: "offer_spots_total",
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
        ]),
      );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      priceCents: toInt(map.get(KEYS.price), OFFER_DEFAULTS.priceCents),
      compareAtCents: toInt(
        map.get(KEYS.compare),
        OFFER_DEFAULTS.compareAtCents,
      ),
      spotsJoined: toInt(map.get(KEYS.joined), OFFER_DEFAULTS.spotsJoined),
      spotsTotal: toInt(map.get(KEYS.total), OFFER_DEFAULTS.spotsTotal),
    };
  } catch (e) {
    console.error("[offer] getOfferSettings failed, using defaults:", e);
    return OFFER_DEFAULTS;
  }
});

export const OFFER_KEYS = KEYS;

/** Formats cents as a French price label, dropping a trailing ,00. */
export function formatEuros(cents: number): string {
  const euros = cents / 100;
  const label = Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(2).replace(".", ",");
  return `${label}€`;
}

"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { OFFER_KEYS, isCurrency, PAYMENT_BADGE_IDS, type LocalePrice } from "@/lib/offer";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

/**
 * Persists the admin-editable offer settings. The lifetime checkout reads
 * the price live from these values, so a change here syncs to Stripe for
 * the next payment. Guarded by the admin session.
 */
export async function updateOfferSettings(input: {
  priceCents: number;
  compareAtCents: number;
  spotsJoined: number;
  spotsTotal: number;
  variant: "classic" | "letter" | "product" | "funnel";
  pdfLinks: { label: string; url: string }[];
  pricingByLocale?: Partial<Record<Locale, LocalePrice>>;
  pricingByLocaleV4?: Partial<Record<Locale, LocalePrice>>;
  funnelPrice?: LocalePrice;
  funnelPriceB?: LocalePrice;
  tiktokPrice?: LocalePrice;
  tiktokPriceB?: LocalePrice;
  paymentBadges?: string[];
  scarcityMode?: "spots" | "timer";
  stickyBar?: boolean;
}) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const priceCents = Math.round(input.priceCents);
  const compareAtCents = Math.round(input.compareAtCents);
  const spotsJoined = Math.round(input.spotsJoined);
  const spotsTotal = Math.round(input.spotsTotal);
  const variant =
    input.variant === "letter" ||
    input.variant === "product" ||
    input.variant === "funnel"
      ? input.variant
      : "classic";

  if (
    !Number.isFinite(priceCents) ||
    priceCents < 0 ||
    !Number.isFinite(compareAtCents) ||
    compareAtCents < 0 ||
    !Number.isFinite(spotsJoined) ||
    spotsJoined < 0 ||
    !Number.isFinite(spotsTotal) ||
    spotsTotal < 1
  ) {
    return { error: "Valeurs invalides." };
  }

  // Sanitize per-language pricing: keep only valid currencies and amounts.
  const cleanPricing: Record<string, LocalePrice> = {};
  for (const loc of LOCALES) {
    const p = input.pricingByLocale?.[loc];
    if (!p) continue;
    const pc = Math.round(p.priceCents);
    const cc = Math.round(p.compareAtCents);
    if (!isCurrency(p.currency)) continue;
    if (!Number.isFinite(pc) || pc < 0 || !Number.isFinite(cc) || cc < 0) {
      return { error: "Prix par langue invalide." };
    }
    cleanPricing[loc] = { currency: p.currency, priceCents: pc, compareAtCents: cc };
  }

  // Same sanitization for the V4 A/B variant pricing.
  const cleanPricingV4: Record<string, LocalePrice> = {};
  for (const loc of LOCALES) {
    const p = input.pricingByLocaleV4?.[loc];
    if (!p) continue;
    const pc = Math.round(p.priceCents);
    const cc = Math.round(p.compareAtCents);
    if (!isCurrency(p.currency)) continue;
    if (!Number.isFinite(pc) || pc < 0 || !Number.isFinite(cc) || cc < 0) {
      return { error: "Prix V4 par langue invalide." };
    }
    cleanPricingV4[loc] = { currency: p.currency, priceCents: pc, compareAtCents: cc };
  }

  // Funnel single prices (independent, charged by Stripe per funnel version).
  const sanitizeSingle = (p: LocalePrice | undefined): LocalePrice | null | "bad" => {
    if (!p) return null;
    const pc = Math.round(p.priceCents);
    const cc = Math.round(p.compareAtCents);
    if (
      !isCurrency(p.currency) ||
      !Number.isFinite(pc) ||
      pc < 0 ||
      !Number.isFinite(cc) ||
      cc < 0
    ) {
      return "bad";
    }
    return { currency: p.currency, priceCents: pc, compareAtCents: cc };
  };
  const cleanFunnelPrice = sanitizeSingle(input.funnelPrice);
  const cleanFunnelPriceB = sanitizeSingle(input.funnelPriceB);
  const cleanTiktokPrice = sanitizeSingle(input.tiktokPrice);
  const cleanTiktokPriceB = sanitizeSingle(input.tiktokPriceB);
  if (
    cleanFunnelPrice === "bad" ||
    cleanFunnelPriceB === "bad" ||
    cleanTiktokPrice === "bad" ||
    cleanTiktokPriceB === "bad"
  ) {
    return { error: "Prix du tunnel / TikTok invalide." };
  }

  const entries: Array<[string, string]> = [
    [OFFER_KEYS.price, String(priceCents)],
    [OFFER_KEYS.compare, String(compareAtCents)],
    [OFFER_KEYS.joined, String(spotsJoined)],
    [OFFER_KEYS.total, String(spotsTotal)],
    [OFFER_KEYS.variant, variant],
    [OFFER_KEYS.pricing, JSON.stringify(cleanPricing)],
    [OFFER_KEYS.pricingV4, JSON.stringify(cleanPricingV4)],
    [OFFER_KEYS.scarcity, input.scarcityMode === "timer" ? "timer" : "spots"],
    [OFFER_KEYS.sticky, input.stickyBar ? "true" : "false"],
    [
      OFFER_KEYS.badges,
      JSON.stringify(
        (input.paymentBadges || []).filter((b) =>
          (PAYMENT_BADGE_IDS as readonly string[]).includes(b),
        ),
      ),
    ],
    [
      OFFER_KEYS.pdf,
      JSON.stringify(
        (input.pdfLinks || [])
          .filter((l) => l && l.url)
          .map((l) => ({ label: String(l.label || "Document"), url: String(l.url) })),
      ),
    ],
  ];

  // Only persist the funnel prices when provided, so omitting never wipes them.
  if (cleanFunnelPrice) {
    entries.push([OFFER_KEYS.funnelPrice, JSON.stringify(cleanFunnelPrice)]);
  }
  if (cleanFunnelPriceB) {
    entries.push([OFFER_KEYS.funnelPriceB, JSON.stringify(cleanFunnelPriceB)]);
  }
  if (cleanTiktokPrice) {
    entries.push([OFFER_KEYS.tiktokPrice, JSON.stringify(cleanTiktokPrice)]);
  }
  if (cleanTiktokPriceB) {
    entries.push([OFFER_KEYS.tiktokPriceB, JSON.stringify(cleanTiktokPriceB)]);
  }

  try {
    for (const [key, value] of entries) {
      await db
        .insert(appSetting)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: appSetting.key,
          set: { value, updatedAt: new Date() },
        });
    }
  } catch (e: any) {
    console.error("[offer] updateOfferSettings failed:", e);
    return {
      error:
        "Échec de l'enregistrement. La table app_setting existe-t-elle ? (lancer `npm run db:push`)",
    };
  }

  // Refresh the landing pages (ISR) and the admin so the change shows at once.
  revalidatePath("/offre-a-vie");
  revalidatePath("/offre-a-vie-v4");
  revalidatePath("/comprendre-le-coran");
  revalidatePath("/comprendre-le-coran-b");
  revalidatePath("/en/offre-a-vie");
  revalidatePath("/es/offre-a-vie");
  revalidatePath("/admin/premium");

  return { ok: true };
}

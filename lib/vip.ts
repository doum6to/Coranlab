import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** Admin-editable settings for the VIP redemption link (/acces-vip). */
export type VipSettings = {
  /** Secret code carried in the link (?c=…). Acts as the gate. */
  code: string;
  /** Short note shown on the page (the "use the same email" warning). */
  intro: string;
  /** The SPECIAL Drive/PDF links revealed only after a successful redemption. */
  driveLinks: { label: string; url: string }[];
};

export const VIP_SETTINGS_KEY = "vip_settings";

export const VIP_DEFAULTS: VipSettings = {
  code: "CORAN85VIP",
  intro:
    "Tu as acheté le « Guide Comprendre 85% du Coran » sur une autre plateforme ? Crée ton accès ci-dessous. ⚠️ Utilise IMPÉRATIVEMENT le même e-mail que lors de ton achat, sinon ton accès pourra être révoqué.",
  driveLinks: [],
};

/**
 * Lifetime/premium rows granted through the VIP link use a synthetic Stripe
 * customer id prefixed "vip_" — that's how we recognise a VIP buyer later (to
 * show them their dedicated Drive links instead of the standard ones).
 */
export const vipCustomerId = (userId: string) => `vip_${userId}`;
export const isVipCustomer = (stripeCustomerId?: string | null) =>
  !!stripeCustomerId && stripeCustomerId.startsWith("vip_");

function merge(stored: Partial<VipSettings> | null): VipSettings {
  if (!stored) return VIP_DEFAULTS;
  return {
    code: typeof stored.code === "string" && stored.code.trim() ? stored.code : VIP_DEFAULTS.code,
    intro: typeof stored.intro === "string" && stored.intro.trim() ? stored.intro : VIP_DEFAULTS.intro,
    driveLinks: Array.isArray(stored.driveLinks) ? stored.driveLinks : VIP_DEFAULTS.driveLinks,
  };
}

/** Reads the VIP settings, falling back to defaults. Cached per request. */
export const getVipSettings = cache(async (): Promise<VipSettings> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, VIP_SETTINGS_KEY),
    });
    if (!row?.value) return VIP_DEFAULTS;
    return merge(JSON.parse(row.value));
  } catch (e) {
    console.error("[vip] read failed, using defaults:", e);
    return VIP_DEFAULTS;
  }
});

/** Strips the owner-only "/u/<n>/" account slot from a Google Drive link. */
export const cleanDriveUrl = (url: string) =>
  url.replace(/drive\.google\.com\/drive\/u\/\d+\//, "drive.google.com/drive/");

/**
 * The VIP Drive link to put in a buyer's email (first configured link, cleaned).
 * Returns null when no VIP Drive is set, so callers can fall back to the
 * standard Drive.
 */
export const getVipDriveUrl = cache(async (): Promise<string | null> => {
  const { driveLinks } = await getVipSettings();
  const first = driveLinks.find((l) => l.url?.trim());
  return first ? cleanDriveUrl(first.url) : null;
});

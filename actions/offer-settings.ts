"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { OFFER_KEYS } from "@/lib/offer";

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
  variant: "classic" | "letter" | "product";
  pdfLinks: { label: string; url: string }[];
}) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const priceCents = Math.round(input.priceCents);
  const compareAtCents = Math.round(input.compareAtCents);
  const spotsJoined = Math.round(input.spotsJoined);
  const spotsTotal = Math.round(input.spotsTotal);
  const variant =
    input.variant === "letter" || input.variant === "product"
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

  const entries: Array<[string, string]> = [
    [OFFER_KEYS.price, String(priceCents)],
    [OFFER_KEYS.compare, String(compareAtCents)],
    [OFFER_KEYS.joined, String(spotsJoined)],
    [OFFER_KEYS.total, String(spotsTotal)],
    [OFFER_KEYS.variant, variant],
    [
      OFFER_KEYS.pdf,
      JSON.stringify(
        (input.pdfLinks || [])
          .filter((l) => l && l.url)
          .map((l) => ({ label: String(l.label || "Document"), url: String(l.url) })),
      ),
    ],
  ];

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

  // Refresh the landing page (ISR) and the admin so the change shows at once.
  revalidatePath("/offre-a-vie");
  revalidatePath("/admin/premium");

  return { ok: true };
}

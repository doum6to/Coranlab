"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  PRIERE_VSL_KEY,
  mergePriereVslContent,
  type PriereVslContent,
} from "@/lib/priere-vsl-shared";

/**
 * Persists the /comprendre-sa-priere content (admin-guarded). We reuse the pure
 * `merge` to coerce/whitelist every field (drops unknown keys, fixes types),
 * then clamp the price to safe integers.
 */
export async function updatePriereVslContent(input: PriereVslContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = mergePriereVslContent(input);
  // Harden the price (the only field that hits Stripe).
  clean.price.amountCents = Math.max(0, Math.round(clean.price.amountCents || 0));
  clean.price.compareAtCents = Math.max(0, Math.round(clean.price.compareAtCents || 0));

  try {
    await db
      .insert(appSetting)
      .values({ key: PRIERE_VSL_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[priere-vsl] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/comprendre-sa-priere");
  revalidatePath("/admin/premium");
  return { ok: true };
}

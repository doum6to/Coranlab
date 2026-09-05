"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { EBOOK30_KEY, mergeEbook30Content, type Ebook30Content } from "@/lib/ebook30-shared";

/** Persists the /coran-30-jours content (admin-guarded). */
export async function updateEbook30Content(input: Ebook30Content) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = mergeEbook30Content(input);
  clean.price.amountCents = Math.max(0, Math.round(clean.price.amountCents || 0));
  clean.price.compareAtCents = Math.max(0, Math.round(clean.price.compareAtCents || 0));

  try {
    await db
      .insert(appSetting)
      .values({ key: EBOOK30_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[ebook30] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/coran-30-jours");
  revalidatePath("/admin/premium");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { COMMENCER_KEY, mergeCommencerContent, type CommencerContent } from "@/lib/commencer-shared";

/** Persists the /commencer content (admin-guarded). `merge` whitelists/coerces every field. */
export async function updateCommencerContent(input: CommencerContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const clean = mergeCommencerContent(input);
  try {
    await db.insert(appSetting)
      .values({ key: COMMENCER_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({ target: appSetting.key, set: { value: JSON.stringify(clean), updatedAt: new Date() } });
  } catch (e: any) {
    console.error("[commencer] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }
  revalidatePath("/commencer");
  revalidatePath("/admin/premium");
  return { ok: true };
}

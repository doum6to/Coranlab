"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { PACK_KEY, mergePackContent, type PackContent } from "@/lib/pack-shared";

/** Persists the /pack-coran content (admin-guarded). */
export async function updatePackContent(input: PackContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const clean = mergePackContent(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: PACK_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[pack] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }
  revalidatePath("/pack-coran");
  revalidatePath("/admin/premium");
  return { ok: true };
}

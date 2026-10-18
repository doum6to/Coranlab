"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { BOOKS_KEY, mergeBooksContent, type BooksContent } from "@/lib/books-shared";

/** Persists the Boutique catalogue (admin-guarded). */
export async function updateBooksContent(input: BooksContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const clean = mergeBooksContent(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: BOOKS_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({ target: appSetting.key, set: { value: JSON.stringify(clean), updatedAt: new Date() } });
  } catch (e: any) {
    console.error("[books] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }
  revalidatePath("/boutique");
  revalidatePath("/commencer/merci");
  revalidatePath("/admin/premium");
  return { ok: true };
}

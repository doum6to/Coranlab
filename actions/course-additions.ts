"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthed } from "@/lib/admin-auth";
import { addNextLists, additionsStatus, type AdditionsStatus } from "@/lib/course-additions";

export async function getCourseAdditionsStatus(): Promise<AdditionsStatus | { error: string }> {
  if (!isAdminAuthed()) return { error: "Unauthorized" };
  try {
    return await additionsStatus();
  } catch (e) {
    console.error("[course-additions] status failed:", e);
    return { error: "Lecture impossible." };
  }
}

/** One step of the import: adds some of the missing lists and says how many are left. */
export async function addCourseLists(): Promise<{ added: string[]; remaining: number; rangesFixed: boolean } | { error: string }> {
  if (!isAdminAuthed()) return { error: "Unauthorized" };
  try {
    const out = await addNextLists();
    revalidatePath("/learn");
    revalidatePath("/lecons");
    return out;
  } catch (e) {
    console.error("[course-additions] import failed:", e);
    return { error: "L'ajout a échoué. Rien n'a été créé à moitié : tu peux relancer." };
  }
}

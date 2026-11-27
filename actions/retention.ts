"use server";

import { isAdminAuthed } from "@/lib/admin-auth";
import { getRetentionReport, type RetentionReport } from "@/lib/retention";

/** The retention figures of the admin dashboard. */
export async function getRetention(): Promise<RetentionReport | { error: string }> {
  if (!isAdminAuthed()) return { error: "Unauthorized" };
  try {
    return await getRetentionReport();
  } catch (e) {
    console.error("[retention] report failed:", e);
    return { error: "Lecture impossible." };
  }
}

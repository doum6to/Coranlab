"use server";

import { sql, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";

/**
 * After a failed login, tells the UI how to help the user:
 *  - hasAccount: an auth account exists for this email → likely a wrong password
 *    → offer "reset password".
 *  - hasPaid (and no account): they bought (course_purchase exists) but never
 *    created their account → offer "create account".
 *
 * Returns booleans only. Used solely on a failed login attempt for the email the
 * user just typed.
 */
export async function diagnoseAccess(
  email: string,
): Promise<{ hasAccount: boolean; hasPaid: boolean }> {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { hasAccount: false, hasPaid: false };
  }

  let hasAccount = false;
  let hasPaid = false;

  try {
    const res: any = await db.execute(
      sql`select 1 from auth.users where lower(email) = ${normalized} limit 1`,
    );
    hasAccount = (res?.rowCount ?? res?.rows?.length ?? 0) > 0;
  } catch (e) {
    console.error("[diagnoseAccess] auth.users check failed:", e);
  }

  try {
    const p = await db.query.coursePurchase.findFirst({
      where: eq(coursePurchase.email, normalized),
    });
    hasPaid = !!p;
  } catch (e) {
    console.error("[diagnoseAccess] coursePurchase check failed:", e);
  }

  return { hasAccount, hasPaid };
}

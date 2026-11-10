"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { findUserIdByEmail } from "@/lib/find-user";
import { grantFromPurchase } from "@/lib/link-purchase";

export type PendingPurchase = { id: number; email: string; createdAt: string; subscription: boolean; emailSent: boolean };

/**
 * App purchases paid but not attached to any account yet (the buyer never
 * created an account, or created it with ANOTHER email). Newest first.
 */
export async function listPendingPurchases(): Promise<PendingPurchase[]> {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const rows = await db
    .select()
    .from(coursePurchase)
    .where(and(eq(coursePurchase.hasAppSubscription, true), isNull(coursePurchase.linkedUserId)))
    .orderBy(desc(coursePurchase.createdAt))
    .limit(300);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    createdAt: r.createdAt.toISOString(),
    subscription: !!r.stripeSubscriptionId,
    emailSent: !!r.emailSentAt,
  }));
}

/** Attaches a pending purchase to the account registered under `accountEmail`. */
export async function linkPurchaseToAccount(purchaseId: number, accountEmail: string) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  const purchase = await db.query.coursePurchase.findFirst({ where: eq(coursePurchase.id, purchaseId) });
  if (!purchase) return { error: "Achat introuvable." };
  if (purchase.linkedUserId) return { error: "Cet achat est déjà rattaché à un compte." };
  const userId = await findUserIdByEmail(accountEmail);
  if (!userId) return { error: `Aucun compte avec l'adresse ${accountEmail.trim()}.` };
  await grantFromPurchase(userId, purchase);
  revalidatePath("/admin/premium");
  return { ok: true as const };
}

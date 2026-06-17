"use server";

import crypto from "crypto";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { coranManualOrder, coursePurchase } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getCoranLandingContent } from "@/lib/coran-landing-content";
import { sendCoursePurchaseEmail } from "@/lib/email/send-course-email";
import { getVipDriveUrl } from "@/lib/vip";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC: a buyer who paid via Orange Money submits their email + the OM
 * transaction id. We record a pending order; an admin reviews it and, on
 * approval, grants access + emails the buyer. No payment is verified here —
 * this is the manual (Option A) flow.
 */
export async function submitOrangeMoneyOrder(input: {
  email: string;
  txId: string;
  phone?: string;
}) {
  const content = await getCoranLandingContent();
  if (!content.orangeMoney.enabled) {
    return { error: "Le paiement Orange Money n'est pas disponible." };
  }

  const email = (input.email || "").trim().toLowerCase();
  const txId = (input.txId || "").trim();
  const phone = (input.phone || "").trim().slice(0, 40) || null;

  if (!EMAIL_RE.test(email)) return { error: "Email invalide." };
  if (txId.length < 3) return { error: "ID de transaction invalide." };

  try {
    await db.insert(coranManualOrder).values({
      email,
      txId: txId.slice(0, 120),
      phone,
      amountLabel: content.orangeMoney.amountLabel || null,
      status: "pending",
    });
  } catch (e) {
    console.error("[coran-manual-order] insert failed:", e);
    return { error: "Échec de l'envoi. Réessaie." };
  }

  revalidatePath("/admin/premium");
  return { ok: true };
}

export type ManualOrderRow = {
  id: number;
  email: string;
  txId: string;
  phone: string | null;
  amountLabel: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
};

/** ADMIN: list manual Orange Money orders, newest first. */
export async function listManualOrders(): Promise<ManualOrderRow[]> {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  let rows: (typeof coranManualOrder.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(coranManualOrder)
      .orderBy(desc(coranManualOrder.createdAt))
      .limit(500);
  } catch (e) {
    // Table may not exist yet (run /api/admin/db-setup once after deploy).
    console.error("[coran-manual-order] list failed (table missing?):", e);
    return [];
  }
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    txId: r.txId,
    phone: r.phone,
    amountLabel: r.amountLabel,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
  }));
}

/**
 * ADMIN: approve an order → grant access (course_purchase row, like the Stripe
 * webhook does) and send the activation email. Idempotent on already-approved.
 */
export async function approveManualOrder(id: number) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const order = await db.query.coranManualOrder.findFirst({
    where: eq(coranManualOrder.id, id),
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.status === "approved") return { ok: true, already: true };

  const activationToken = crypto.randomUUID();
  const sessionId = `om_manual_${order.id}_${crypto.randomUUID()}`;
  // "vip_" prefix → the linked subscription is treated as VIP, so the buyer
  // sees the dedicated VIP Drive (same product as other-platform buyers).
  const vipMarker = `vip_om_${order.id}`;

  let purchaseId: number | null = null;
  try {
    const inserted = await db
      .insert(coursePurchase)
      .values({
        email: order.email.toLowerCase(),
        stripeSessionId: sessionId,
        stripeCustomerId: vipMarker,
        stripeSubscriptionId: null,
        hasAppSubscription: true,
        activationToken,
      })
      .returning({ id: coursePurchase.id });
    purchaseId = inserted[0]?.id ?? null;
  } catch (e) {
    console.error("[coran-manual-order] grant failed:", e);
    return { error: "Échec de l'attribution de l'accès." };
  }

  // Send the activation email pointing to the VIP Drive (falls back to the
  // standard Drive if none is configured). Never blocks approval if it fails.
  const vipDrive = await getVipDriveUrl();
  const sent = await sendCoursePurchaseEmail({
    email: order.email,
    hasApp: true,
    activationToken,
    driveUrl: vipDrive ?? undefined,
  });
  if (!sent.ok) {
    console.error(
      `[coran-manual-order] email FAILED for ${order.email} (order ${order.id}): ${sent.error}`,
    );
  }

  await db
    .update(coranManualOrder)
    .set({ status: "approved", coursePurchaseId: purchaseId, reviewedAt: new Date() })
    .where(eq(coranManualOrder.id, id));

  revalidatePath("/admin/premium");
  return { ok: true, emailSent: sent.ok };
}

/** ADMIN: reject an order (no access granted). */
export async function rejectManualOrder(id: number) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  await db
    .update(coranManualOrder)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(coranManualOrder.id, id));
  revalidatePath("/admin/premium");
  return { ok: true };
}

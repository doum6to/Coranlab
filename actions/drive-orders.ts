"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { driveProductOrder } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getDriveProductInfo } from "@/lib/drive-product";
import { sendDriveProductEmail } from "@/lib/email/send-drive-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC: a buyer who paid a drive product via Orange Money submits their email
 * + the OM transaction id. Recorded as pending; an admin validates it later and
 * the Drive link is emailed. No payment is verified here (manual flow).
 */
export async function submitDriveOrder(
  product: string,
  input: { email: string; txId: string; phone?: string },
) {
  const info = await getDriveProductInfo(product);
  if (!info || !info.omEnabled) {
    return { error: "Le paiement Orange Money n'est pas disponible." };
  }

  const email = (input.email || "").trim().toLowerCase();
  const txId = (input.txId || "").trim();
  const phone = (input.phone || "").trim().slice(0, 40) || null;

  if (!EMAIL_RE.test(email)) return { error: "Email invalide." };
  if (txId.length < 3) return { error: "ID de transaction invalide." };

  try {
    await db.insert(driveProductOrder).values({
      product,
      email,
      source: "om",
      txId: txId.slice(0, 120),
      phone,
      amountLabel: info.amountLabel || null,
      status: "pending",
    });
  } catch (e) {
    console.error("[drive-orders] insert failed:", e);
    return { error: "Échec de l'envoi. Réessaie." };
  }

  revalidatePath("/admin/premium");
  return { ok: true };
}

export type DriveOrderRow = {
  id: number;
  product: string;
  email: string;
  source: string;
  txId: string | null;
  phone: string | null;
  amountLabel: string | null;
  status: string;
  emailSentAt: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

/** ADMIN: list drive-product orders for a slug, newest first. */
export async function listDriveOrders(product: string): Promise<DriveOrderRow[]> {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  let rows: (typeof driveProductOrder.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(driveProductOrder)
      .where(eq(driveProductOrder.product, product))
      .orderBy(desc(driveProductOrder.createdAt))
      .limit(500);
  } catch (e) {
    console.error("[drive-orders] list failed (table missing?):", e);
    return [];
  }
  return rows.map((r) => ({
    id: r.id,
    product: r.product,
    email: r.email,
    source: r.source,
    txId: r.txId,
    phone: r.phone,
    amountLabel: r.amountLabel,
    status: r.status,
    emailSentAt: r.emailSentAt ? r.emailSentAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
  }));
}

/** ADMIN: approve an Orange Money order → email the Drive link. */
export async function approveDriveOrder(id: number) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const order = await db.query.driveProductOrder.findFirst({
    where: eq(driveProductOrder.id, id),
  });
  if (!order) return { error: "Commande introuvable." };
  if (order.status === "approved" || order.status === "paid") {
    return { ok: true, already: true };
  }

  const info = await getDriveProductInfo(order.product);
  if (!info?.driveLink) {
    return { error: "Aucun lien Drive configuré pour ce produit." };
  }

  const sent = await sendDriveProductEmail({
    email: order.email,
    productName: info.name,
    driveUrl: info.driveLink,
  });
  if (!sent.ok) {
    console.error(
      `[drive-orders] email FAILED for ${order.email} (order ${order.id}): ${sent.error}`,
    );
  }

  await db
    .update(driveProductOrder)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      emailSentAt: sent.ok ? new Date() : null,
    })
    .where(eq(driveProductOrder.id, id));

  revalidatePath("/admin/premium");
  return { ok: true, emailSent: sent.ok };
}

/** ADMIN: reject an Orange Money order (nothing sent). */
export async function rejectDriveOrder(id: number) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");
  await db
    .update(driveProductOrder)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(driveProductOrder.id, id));
  revalidatePath("/admin/premium");
  return { ok: true };
}

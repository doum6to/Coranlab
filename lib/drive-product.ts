import "server-only";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { driveProductOrder } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { sendDriveProductEmail } from "@/lib/email/send-drive-email";
import { getDuasLandingContent } from "@/lib/duas-landing-content";

export type DriveProductInfo = {
  name: string;
  driveLink: string;
  omEnabled: boolean;
  amountLabel: string;
};

/** Resolves a drive-product slug to its current name + Drive link (admin-set). */
export async function getDriveProductInfo(slug: string): Promise<DriveProductInfo | null> {
  if (slug === "duas") {
    const c = await getDuasLandingContent();
    return {
      name: c.title,
      driveLink: c.driveLink,
      omEnabled: c.orangeMoney.enabled,
      amountLabel: c.orangeMoney.amountLabel,
    };
  }
  return null;
}

/**
 * Fulfills a Stripe (card) purchase of a drive product: records the order once
 * (idempotent on the session id) and emails the Drive link exactly once. Safe
 * to call from both the webhook and the /merci reconcile page.
 */
export async function fulfillDriveCardOrder(
  sessionId: string,
): Promise<{ ok: boolean; email: string | null }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return { ok: false, email: null };

    const product = session.metadata?.product || "duas";
    const email =
      session.customer_details?.email || session.customer_email || null;
    if (!email) return { ok: false, email: null };

    const amountLabel =
      typeof session.amount_total === "number"
        ? `${(session.amount_total / 100).toFixed(2)} ${(session.currency || "eur").toUpperCase()}`
        : null;

    // Record the order once. Whoever creates the row also sends the email.
    const inserted = await db
      .insert(driveProductOrder)
      .values({
        product,
        email: email.toLowerCase(),
        source: "card",
        amountLabel,
        status: "paid",
        stripeSessionId: session.id,
      })
      .onConflictDoNothing({ target: driveProductOrder.stripeSessionId })
      .returning({ id: driveProductOrder.id });

    if (inserted.length === 0) return { ok: true, email }; // already fulfilled

    const info = await getDriveProductInfo(product);
    const sent = await sendDriveProductEmail({
      email,
      productName: info?.name || "ton produit",
      driveUrl: info?.driveLink || "",
    });
    if (sent.ok) {
      await db
        .update(driveProductOrder)
        .set({ emailSentAt: new Date() })
        .where(eq(driveProductOrder.stripeSessionId, session.id));
    } else {
      console.error(
        `[drive-product] email FAILED for ${email} (session ${session.id}): ${sent.error}`,
      );
    }
    return { ok: true, email };
  } catch (e) {
    console.error("[drive-product] fulfill failed:", e);
    return { ok: false, email: null };
  }
}

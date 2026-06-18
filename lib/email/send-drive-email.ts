import { getResend } from "./resend";
import { renderDriveProductEmailHtml } from "./templates/drive-product";

type Params = {
  email: string;
  productName: string;
  driveUrl: string;
};

/**
 * Sends the delivery email for a "drive-delivery" product (e.g. /duas): a
 * single Google Drive link, no account/premium. Returns `{ ok }` without
 * throwing so callers never cascade an email failure into a payment failure.
 */
export async function sendDriveProductEmail({
  email,
  productName,
  driveUrl,
}: Params): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from =
    process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  const replyTo = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    const error = "RESEND_API_KEY missing.";
    console.error("[Resend]", error);
    return { ok: false, error };
  }
  if (!driveUrl) {
    const error = "Drive link not configured for this product.";
    console.error("[drive-email]", error);
    return { ok: false, error };
  }

  try {
    const html = renderDriveProductEmailHtml({ productName, driveUrl });
    const result = await getResend().emails.send({
      from,
      to: email,
      replyTo,
      subject: `Ton accès « ${productName} » est prêt`,
      html,
    });
    if (result.error) {
      const errorSummary = `${result.error.name || "error"}: ${result.error.message}`;
      console.error("[Resend] drive email failed", errorSummary);
      return { ok: false, error: errorSummary };
    }
    const id = result.data?.id || "unknown";
    console.log(`[Resend] drive email sent to ${email} (id=${id})`);
    return { ok: true, id };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[Resend] drive email unexpected error", msg);
    return { ok: false, error: msg };
  }
}

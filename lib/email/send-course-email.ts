import { getResend } from "./resend";
import { CoursePurchaseEmail } from "./templates/course-purchase";
import { absoluteUrl } from "@/lib/utils";

type Params = {
  email: string;
  hasApp: boolean;
  activationToken: string;
};

/**
 * Sends the post-purchase course email via Resend.
 *
 * Returns `{ ok: true, id }` on success, or `{ ok: false, error }` on
 * failure WITHOUT throwing. Callers should use the return value to
 * decide whether to retry — we never want an email failure to cascade
 * into a webhook failure and trigger Stripe retries (the purchase is
 * already recorded in the DB at that point).
 */
export async function sendCoursePurchaseEmail({
  email,
  hasApp,
  activationToken,
}:
Params):
  Promise<{ ok: true; id: string } | { ok: false; error: string; details?: unknown }>
{
  const driveUrl =
    process.env.COURSE_DRIVE_URL ||
    "https://drive.google.com/drive/folders/18fn_fDFiavGd4_r4m0xA0i973aPUZe9u";

  const activationUrl = hasApp
    ? absoluteUrl(`/api/course/activate?token=${activationToken}`)
    : null;

  const from =
    process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>";
  // replyTo : when the user replies to the email, it lands wherever
  // RESEND_REPLY_TO points (defaults to the founder's Gmail).
  const replyTo = process.env.RESEND_REPLY_TO || "qalbanah@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    const error =
      "RESEND_API_KEY missing. Set it on Vercel (Project → Settings → Environment Variables).";
    console.error("[Resend]", error);
    return { ok: false, error };
  }

  try {
    const result = await getResend().emails.send({
      from,
      to: email,
      replyTo,
      subject: "Bienvenue ! Ton cours 85% des mots du Coran est prêt",
      react: CoursePurchaseEmail({ driveUrl, hasApp, activationUrl }),
    });

    if (result.error) {
      // Resend v6 returns { data, error } — error has { name, message, ... }
      const errorSummary = `${result.error.name || "error"}: ${result.error.message}`;
      console.error(
        "[Resend] send failed",
        JSON.stringify(
          {
            email,
            from,
            errorName: result.error.name,
            errorMessage: result.error.message,
          },
          null,
          2
        )
      );
      return { ok: false, error: errorSummary, details: result.error };
    }

    const id = result.data?.id || "unknown";
    console.log(`[Resend] course email sent to ${email} (id=${id})`);
    return { ok: true, id };
  } catch (e: any) {
    // Network errors, unexpected exceptions
    const msg = e?.message || String(e);
    console.error(
      "[Resend] unexpected error",
      JSON.stringify({ email, from, error: msg }, null, 2)
    );
    return { ok: false, error: msg, details: e };
  }
}

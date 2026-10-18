import { getResend } from "./resend";
import { buildEmail, buttonHtml, fineHtml, pHtml } from "./templates/_shell";
import { absoluteUrl } from "@/lib/utils";

/**
 * "Your ebook is ready" email after a one-time book purchase (Boutique or
 * /commencer upsell). The book is read inside the app: the buyer logs in (or
 * creates an account with the same email) and opens it from the Boutique.
 * Never throws.
 */
export async function sendBookPurchaseEmail({ email, title }: { email: string; title: string }) {
  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "RESEND_API_KEY missing." };
  const body = [
    pHtml("Assalamu alaikum,", { bold: true }),
    pHtml(`Merci pour ta confiance — ton livre <strong>${title}</strong> est prêt.`),
    pHtml("Tu le retrouves dans la Boutique de l'application, onglet « Ma bibliothèque », pour le lire à vie."),
    buttonHtml({ href: absoluteUrl("/boutique"), label: "Ouvrir ma bibliothèque", variant: "coral" }),
    fineHtml("Connecte-toi (ou crée ton compte) avec cette même adresse e-mail pour que le livre soit rattaché automatiquement."),
  ].join("\n");
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>",
      replyTo: process.env.RESEND_REPLY_TO || "qalbanah@gmail.com",
      to: email,
      subject: `Ton livre « ${title} » est prêt`,
      html: buildEmail({ preview: `${title} t'attend dans ta bibliothèque.`, heading: "Ton livre est prêt", bodyHtml: body }),
    });
    if (result.error) return { ok: false as const, error: result.error.message };
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || String(e) };
  }
}

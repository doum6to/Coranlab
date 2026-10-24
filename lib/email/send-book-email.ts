import { getResend } from "./resend";
import { buildEmail, buttonHtml, fineHtml, pHtml } from "./templates/_shell";
import { absoluteUrl } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  fr: { subject: (t: string) => `Ton livre « ${t} » est prêt`, preview: (t: string) => `${t} t'attend dans ta bibliothèque.`, heading: "Ton livre est prêt", hello: "Assalamu alaikum,", body: (t: string) => `Merci pour ta confiance — ton livre <strong>${t}</strong> est prêt.`, where: "Tu le retrouves dans la Boutique de l'application, onglet « Ma bibliothèque », pour le lire à vie.", button: "Ouvrir ma bibliothèque", fine: "Connecte-toi (ou crée ton compte) avec cette même adresse e-mail pour que le livre soit rattaché automatiquement." },
  en: { subject: (t: string) => `Your book “${t}” is ready`, preview: (t: string) => `${t} is waiting in your library.`, heading: "Your book is ready", hello: "Assalamu alaikum,", body: (t: string) => `Thank you for your trust — your book <strong>${t}</strong> is ready.`, where: "You'll find it in the app's Shop, under “My library”, to read for life.", button: "Open my library", fine: "Log in (or create your account) with this same email address so the book is linked automatically." },
  es: { subject: (t: string) => `Tu libro «${t}» está listo`, preview: (t: string) => `${t} te espera en tu biblioteca.`, heading: "Tu libro está listo", hello: "Assalamu alaikum,", body: (t: string) => `Gracias por tu confianza — tu libro <strong>${t}</strong> está listo.`, where: "Lo encontrarás en la Tienda de la app, pestaña «Mi biblioteca», para leerlo de por vida.", button: "Abrir mi biblioteca", fine: "Inicia sesión (o crea tu cuenta) con esta misma dirección para que el libro se vincule automáticamente." },
} as const;

/**
 * "Your ebook is ready" email after a one-time book purchase (Boutique or
 * /commencer upsell). The book is read inside the app: the buyer logs in (or
 * creates an account with the same email) and opens it from the Boutique.
 * Never throws.
 */
export async function sendBookPurchaseEmail({ email, title, locale = "fr" }: { email: string; title: string; locale?: Locale }) {
  const c = COPY[locale];
  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "RESEND_API_KEY missing." };
  const body = [
    pHtml(c.hello, { bold: true }),
    pHtml(c.body(title)),
    pHtml(c.where),
    buttonHtml({ href: absoluteUrl("/boutique"), label: c.button, variant: "coral" }),
    fineHtml(c.fine),
  ].join("\n");
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Quranlab <contact@quranlab.app>",
      replyTo: process.env.RESEND_REPLY_TO || "qalbanah@gmail.com",
      to: email,
      subject: c.subject(title),
      html: buildEmail({ preview: c.preview(title), heading: c.heading, bodyHtml: body, locale }),
    });
    if (result.error) return { ok: false as const, error: result.error.message };
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || String(e) };
  }
}

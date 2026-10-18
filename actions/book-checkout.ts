"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { currentUser } from "@/lib/supabase/server";
import { getBooksContent } from "@/lib/books-content";
import { bookPurchaseType, isBookSlug } from "@/lib/books-shared";

type Origin =
  | { from: "boutique" }
  /** Post-purchase upsell on /commencer/merci: email taken from the original session. */
  | { from: "commencer"; originalSessionId: string };

/**
 * One-time Stripe Checkout for a single ebook. The webhook records a
 * course_purchase row with product_type "book_<slug>" on the buyer's email;
 * the Boutique then unlocks the reader for the account with that email.
 */
export async function createBookCheckout(slug: string, origin: Origin) {
  try {
    if (!isBookSlug(slug)) return { error: "Livre inconnu." };
    const { books } = await getBooksContent();
    const book = books.find((b) => b.slug === slug)!;

    let email: string | undefined;
    let customer: string | undefined;
    if (origin.from === "boutique") {
      const user = await currentUser();
      email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    } else if (origin.originalSessionId) {
      try {
        const orig = await stripe.checkout.sessions.retrieve(origin.originalSessionId);
        email = orig.customer_details?.email || orig.customer_email || undefined;
        customer = typeof orig.customer === "string" ? orig.customer : undefined;
      } catch (e) {
        console.error("[BookCheckout] original session lookup failed:", e);
      }
    }

    const success =
      origin.from === "boutique"
        ? absoluteUrl(`/boutique?bought=${slug}`)
        : absoluteUrl(`/commencer/merci?session_id=${encodeURIComponent(origin.originalSessionId)}&upsell=done&item=${slug}`);
    const cancel =
      origin.from === "boutique"
        ? absoluteUrl("/boutique")
        : absoluteUrl(`/commencer/merci?session_id=${encodeURIComponent(origin.originalSessionId)}&upsell=skip&item=${slug}`);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      ...(customer ? { customer } : email ? { customer_email: email } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: { name: `${book.title} — ebook`, description: "Paiement unique. Lecture dans l'app Quranlab, à vie." },
          unit_amount: Math.max(50, book.amountCents),
        },
      }],
      metadata: { productType: "book", bookSlug: slug, bookType: bookPurchaseType(slug), offer: origin.from === "commencer" ? "commencer_upsell" : "boutique" },
      success_url: success,
      cancel_url: cancel,
    });
    return { url: session.url };
  } catch (error: any) {
    console.error("[BookCheckout] Error:", error);
    return { error: error?.message || "Erreur inconnue" };
  }
}

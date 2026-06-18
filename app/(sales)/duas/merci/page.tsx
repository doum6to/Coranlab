import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { fulfillDriveCardOrder } from "@/lib/drive-product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci — Quranlab",
  description: "Ton paiement est confirmé. Ton lien arrive par email.",
  robots: { index: false, follow: false },
};

/**
 * Reconciles the card purchase straight from the Checkout Session (so the email
 * goes out even if the Stripe webhook is delayed). Idempotent: a no-op if the
 * order was already fulfilled.
 */
export default async function MerciDuas({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const { email } = sessionId
    ? await fulfillDriveCardOrder(sessionId)
    : { email: null };

  return (
    <div className="min-h-[70vh] w-full bg-[#FAF8F3] text-neutral-900 flex items-center justify-center">
      <section className="max-w-[560px] mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-white">
          <Mail className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-neutral-950">
          Merci pour ton achat&nbsp;!
        </h1>
        <p className="text-base text-neutral-600 max-w-[440px] leading-relaxed">
          {email
            ? `Ton lien d'accès vient d'être envoyé à ${email}. Pense à vérifier tes spams si tu ne le vois pas tout de suite.`
            : "Ton lien d'accès t'a été envoyé par email. Pense à vérifier tes spams si tu ne le vois pas tout de suite."}
        </p>
      </section>
    </div>
  );
}

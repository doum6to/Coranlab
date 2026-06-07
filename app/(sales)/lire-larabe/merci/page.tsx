import crypto from "crypto";
import type { Metadata } from "next";
import { Mail, PlayCircle } from "lucide-react";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { TrackArabicPurchase } from "./track-arabic-purchase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci — Lire l'arabe en 7h",
  description: "Ton accès à la formation est confirmé.",
  robots: { index: false, follow: false },
};

/**
 * Records the standalone course purchase straight from the Checkout Session so
 * the buyer's email is captured before any (async) webhook — independent of it.
 * `hasAppSubscription` stays false: this purchase is the arabic course only,
 * not the app premium. Idempotent: a no-op if the row already exists.
 */
async function ensurePurchaseRow(
  sessionId: string,
): Promise<{ email: string | null; amount: number | null }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return { email: null, amount: null };

    const email =
      session.customer_details?.email || session.customer_email || null;
    const amount =
      typeof session.amount_total === "number"
        ? session.amount_total / 100
        : null;
    if (!email) return { email: null, amount };

    await db
      .insert(coursePurchase)
      .values({
        email: email.toLowerCase(),
        stripeSessionId: session.id,
        stripeCustomerId: (session.customer as string) || null,
        stripeSubscriptionId: null,
        hasAppSubscription: false,
        productType: "arabic_course",
        activationToken: crypto.randomUUID(),
      })
      .onConflictDoNothing({ target: coursePurchase.stripeSessionId });

    return { email, amount };
  } catch (e) {
    console.error("[lire-larabe/merci] reconcile failed:", e);
    return { email: null, amount: null };
  }
}

export default async function MerciArabe({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const { email, amount } = sessionId
    ? await ensurePurchaseRow(sessionId)
    : { email: null, amount: null };

  const signupUrl = email
    ? `/auth/signup?email=${encodeURIComponent(email)}&locked=1`
    : "/auth/signup";

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex items-center justify-center">
      <TrackArabicPurchase
        sessionId={sessionId}
        value={amount ?? undefined}
        email={email}
      />

      <section className="max-w-[640px] mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e0b34a]/40 bg-[#e0b34a]/10 text-[#e0b34a]">
          <PlayCircle className="h-9 w-9" strokeWidth={1.5} />
        </span>

        <p className="text-[11px] tracking-[0.2em] uppercase text-[#e0b34a]">
          Paiement confirmé · Accès à vie
        </p>

        <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05] max-w-[540px]">
          Bienvenue dans la formation !
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 max-w-[480px] leading-relaxed">
          Dernière étape : crée ton compte
          {email ? (
            <>
              {" "}
              avec l&apos;adresse{" "}
              <span className="font-semibold text-white">{email}</span>
            </>
          ) : null}{" "}
          pour accéder à tes 21 cours en vidéo.
        </p>

        <a
          href={signupUrl}
          className="inline-flex w-full max-w-[320px] items-center justify-center rounded-2xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-neutral-900 shadow-lg transition hover:brightness-105 active:translate-y-1 active:border-b-0"
        >
          Créer mon compte
        </a>

        <p className="max-w-[440px] rounded-2xl border border-[#e0b34a]/30 bg-[#e0b34a]/10 px-4 py-3 text-sm font-medium text-[#f0d089]">
          ⚠️ Important : crée ton compte avec le{" "}
          <span className="font-bold">même email que lors de l&apos;achat</span>
          {email ? (
            <>
              {" "}
              (<span className="font-bold">{email}</span>)
            </>
          ) : null}
          . Tu retrouveras ensuite tes vidéos dans l&apos;onglet{" "}
          <span className="font-bold">« Ma formation »</span>.
        </p>

        <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-6 w-full max-w-[480px]">
          <div className="flex items-start gap-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0b34a] text-neutral-900">
              <Mail className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Un email de confirmation arrive aussi
              </p>
              <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                Pense à vérifier tes spams si tu ne le vois pas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

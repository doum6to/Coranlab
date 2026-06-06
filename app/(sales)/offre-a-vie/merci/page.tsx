import crypto from "crypto";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { LandingMascot } from "@/components/landing-mascot";
import { PremiumCta } from "../../85motscoran/premium-cta";
import { TrackLifetimePurchase } from "./track-lifetime-purchase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci — Quranlab",
  description: "Ton accès à vie est confirmé. Crée ton compte pour l'activer.",
  robots: { index: false, follow: false },
};

/**
 * Reconciles the lifetime purchase straight from the Checkout Session so the
 * course_purchase row exists before the buyer signs up — independent of the
 * (async) Stripe webhook. Idempotent: a no-op if the row is already there.
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
        hasAppSubscription: true,
        activationToken: crypto.randomUUID(),
      })
      .onConflictDoNothing({ target: coursePurchase.stripeSessionId });

    return { email, amount };
  } catch (e) {
    console.error("[offre-a-vie/merci] reconcile failed:", e);
    return { email: null, amount: null };
  }
}

export default async function MerciAVie({
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
    <div className="min-h-[70vh] w-full bg-[#FAF8F3] text-neutral-900 flex items-center justify-center">
      <TrackLifetimePurchase
        sessionId={sessionId}
        value={amount ?? undefined}
        email={email}
      />

      <section className="max-w-[680px] mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
        <LandingMascot
          src="/animations/completed_lvl.riv"
          className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px]"
        />

        <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
          Paiement confirmé · Accès à vie
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] text-neutral-950 max-w-[540px]">
          Bienvenue à vie.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-[480px] leading-relaxed">
          Dernière étape : crée ton compte
          {email ? (
            <>
              {" "}
              avec l&apos;adresse{" "}
              <span className="font-semibold text-neutral-900">{email}</span>
            </>
          ) : null}{" "}
          pour activer ton accès Premium à vie.
        </p>

        <PremiumCta
          as="link"
          href={signupUrl}
          variant="dark"
          className="w-full max-w-[320px]"
        >
          Créer mon compte
        </PremiumCta>

        <p className="max-w-[440px] rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-800">
          ⚠️ Important : crée ton compte avec le{" "}
          <span className="font-bold">même email que lors de l&apos;achat</span>
          {email ? (
            <>
              {" "}
              (<span className="font-bold">{email}</span>)
            </>
          ) : null}
          , sinon ton accès Premium ne sera pas activé.
        </p>

        <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-6 w-full max-w-[480px]">
          <div className="flex items-start gap-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Mail className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-serif text-neutral-900">
                Un email de confirmation arrive aussi
              </p>
              <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                Il contient le lien d&apos;activation et tes documents PDF en
                bonus. Pense à vérifier tes spams si tu ne le vois pas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

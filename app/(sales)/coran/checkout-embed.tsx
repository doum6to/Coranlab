"use client";

import { useCallback, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

import { createCoranEmbeddedCheckout } from "@/actions/coran-checkout";

// Loaded once, outside the component, so it isn't recreated on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

/** A server action that creates an embedded checkout session. */
type CreateCheckout = () => Promise<
  { clientSecret: string | null } | { error: string }
>;

/**
 * On-page Stripe Embedded Checkout (no redirect). Collects name + email + card
 * (and Apple/Google Pay / Link), then returns to /offre-a-vie/merci on success.
 * `createSession` lets a variant page (e.g. /comprendre-sa-priere) plug in its
 * own checkout action; defaults to the standard /coran one.
 */
export function CoranCheckoutEmbed({
  createSession = createCoranEmbeddedCheckout,
  anchorId = "checkout",
}: {
  createSession?: CreateCheckout;
  anchorId?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const tracked = useRef(false);
  const fetchClientSecret = useCallback(async () => {
    let res: Awaited<ReturnType<CreateCheckout>>;
    try { res = await createSession(); } catch (error) { setFailed(true); throw error; }
    if ("error" in res || !res.clientSecret) {
      setFailed(true);
      throw new Error(("error" in res && res.error) || "Paiement indisponible.");
    }
    if (!tracked.current && window.location.pathname === "/coran") {
      tracked.current = true;
      track("lp_checkout_start", "coran_conversion_v2");
    }
    return res.clientSecret;
  }, [createSession]);

  return (
    <div id={anchorId} className="scroll-mt-4">
      {failed ? <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-neutral-900">
        <p>Le paiement n’a pas pu être chargé. Réessaie dans un instant.</p>
        <button type="button" onClick={() => { setFailed(false); setAttempt(n => n + 1); }} className="mt-3 min-h-11 rounded-lg border border-neutral-400 px-4 font-semibold">Réessayer</button>
      </div> : <EmbeddedCheckoutProvider key={attempt} stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>}
    </div>
  );
}

"use client";

import { useCallback } from "react";
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
}: {
  createSession?: CreateCheckout;
}) {
  const fetchClientSecret = useCallback(async () => {
    const res = await createSession();
    if ("error" in res || !res.clientSecret) {
      throw new Error(("error" in res && res.error) || "Paiement indisponible.");
    }
    return res.clientSecret;
  }, [createSession]);

  return (
    <div id="checkout" className="scroll-mt-4">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

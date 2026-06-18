"use client";

import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

import { createDuasEmbeddedCheckout } from "@/actions/duas-checkout";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

/** On-page Stripe Embedded Checkout for /duas (returns to /duas/merci). */
export function DuasCheckoutEmbed() {
  const fetchClientSecret = useCallback(async () => {
    const res = await createDuasEmbeddedCheckout();
    if ("error" in res || !res.clientSecret) {
      throw new Error(("error" in res && res.error) || "Paiement indisponible.");
    }
    return res.clientSecret;
  }, []);

  return (
    <div id="checkout" className="scroll-mt-4">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Lock, X } from "lucide-react";

import { createCommencerEmbeddedCheckout } from "@/actions/commencer-checkout";
import type { PaywallCurrency } from "@/lib/geo-currency";

import { P, type CmLocale, type CmUi } from "./ui";

// Loaded once, outside the component, so it isn't recreated on every render.
// A browser that blocks Stripe's script resolves to null here instead of throwing: the sheet then
// offers the hosted page.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").catch(() => null);

/**
 * Payment without leaving the paywall: a sheet that slides up over the page and
 * holds Stripe's on-page checkout (Apple Pay, Google Pay, Link, Klarna, card —
 * whatever the Stripe account offers). The hosted Stripe page stays one tap
 * away (`onHosted`) in case the on-page form cannot load on a given browser.
 */
export function PaySheet({ open, onClose, onHosted, hostedBusy, email, locale, currency, title, summary, ui }: {
  open: boolean; onClose: () => void; onHosted: () => void; hostedBusy: boolean;
  email?: string; locale: CmLocale; currency: PaywallCurrency; title: string; summary: string; ui: CmUi;
}) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const fetchClientSecret = useCallback(async () => {
    let res: Awaited<ReturnType<typeof createCommencerEmbeddedCheckout>>;
    try { res = await createCommencerEmbeddedCheckout(email || undefined, locale, currency); } catch (error) { setFailed(true); throw error; }
    if ("error" in res || !res.clientSecret) {
      setFailed(true);
      throw new Error(("error" in res && res.error) || ui.error);
    }
    return res.clientSecret;
  }, [email, locale, currency, ui.error]);

  // Stripe's script could not load (blocked, offline): say so instead of showing an empty sheet.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    void stripePromise.then((stripe) => { if (alive && !stripe) setFailed(true); });
    return () => { alive = false; };
  }, [open, attempt]);

  // Escape closes; focus moves into the sheet when it opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => { window.removeEventListener("keydown", onKey); window.clearTimeout(t); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button type="button" aria-label={ui.pay.close} tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(20,18,45,.5)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} />
          <motion.div className="relative mx-auto flex w-full max-w-md flex-col bg-white" style={{ maxHeight: "92dvh", borderRadius: "24px 24px 0 0", boxShadow: "0 -12px 40px -12px rgba(20,18,45,.35)" }}
            initial={reduce ? { opacity: 0 } : { y: "100%" }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: "100%" }} transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 38 }}>
            <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-[1.1875rem] font-bold leading-tight" style={{ color: P.text, letterSpacing: "-0.01em" }}>{title}</h2>
                <p className="mt-1 text-[0.875rem] leading-snug" style={{ color: P.soft }}>{summary}</p>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={ui.pay.close} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-50" style={{ color: P.soft }}>
                <X size={22} strokeWidth={2.25} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {failed ? (
                <div role="alert" className="mx-3 my-4 rounded-2xl px-4 py-4" style={{ background: "#FEF3F3" }}>
                  <p className="text-[0.9375rem] leading-normal" style={{ color: P.text }}>{ui.pay.loadFailed}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={onHosted} disabled={hostedBusy} className="min-h-[2.75rem] rounded-xl px-4 text-[0.9375rem] font-semibold text-white active:opacity-80 disabled:opacity-60" style={{ background: P.purple }}>{hostedBusy ? ui.redirect : ui.pay.hostedCta}</button>
                    <button type="button" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }} className="min-h-[2.75rem] rounded-xl px-4 text-[0.9375rem] font-semibold active:opacity-60" style={{ boxShadow: "inset 0 0 0 1.5px #D4D4D4", color: P.text }}>{ui.pay.retry}</button>
                  </div>
                </div>
              ) : (
                <div className="relative min-h-[24rem]">
                  {/* Shown until Stripe's form paints over it */}
                  <div className="absolute inset-x-0 top-24 flex justify-center" aria-hidden>
                    <span className="h-8 w-8 animate-spin rounded-full border-[3px]" style={{ borderColor: "#E3E2FF", borderTopColor: P.purple }} />
                  </div>
                  <div className="relative">
                    <EmbeddedCheckoutProvider key={attempt} stripe={stripePromise} options={{ fetchClientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[0.75rem]" style={{ color: P.muted }}><Lock size={12} strokeWidth={2.25} aria-hidden />{ui.pay.secured}</p>
              <button type="button" onClick={onHosted} disabled={hostedBusy} className="mt-1 min-h-[2.5rem] px-3 text-[0.8125rem] font-semibold underline underline-offset-2 active:opacity-60 disabled:opacity-50" style={{ color: P.soft }}>
                {hostedBusy ? ui.redirect : ui.pay.hosted}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

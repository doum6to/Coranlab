"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { createCommencerCheckout } from "@/actions/commencer-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import type { CommencerContent } from "@/lib/commencer-shared";
import { centsFromLabel, formatPaywallPrice, type PaywallCurrency } from "@/lib/geo-currency";

import { CM_UI, Check, Icon, P, PrimaryButton, Shell, fill, rich, type CmLocale } from "./ui";

/**
 * Lifetime paywall: ONE offer, one price, one button. Sells the value stack
 * built during the onboarding, anchors the price against the compare label,
 * then removes every risk (one-time payment, guarantee).
 */
export function Paywall({ paywall, email, whenLabel, locale = "fr", currency = "EUR" }: { paywall: CommencerContent["paywall"]; email?: string; whenLabel: string; locale?: CmLocale; currency?: PaywallCurrency }) {
  const ui = CM_UI[locale];
  // Same number in the visitor's currency (detected from their country).
  const priceLabel = formatPaywallPrice(paywall.amountCents, currency, locale);
  const compareLabel = paywall.compareLabel ? formatPaywallPrice(centsFromLabel(paywall.compareLabel, 4900), currency, locale) : "";
  // Admin copy may embed the euro price ("— 9,99 €" / "49 €"): swap it for the local one.
  const swap = (s: string) => s.replace(paywall.priceLabel, priceLabel).replace(paywall.compareLabel || "\u0000", compareLabel);
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checkout = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    ttqTrack("InitiateCheckout", { content_category: "commencer", content_id: "commencer_lifetime", currency, value: paywall.amountCents / 100 });
    try {
      const res = await createCommencerCheckout(email || undefined, locale, currency);
      if ("url" in res && res.url) {
        window.location.href = res.url;
        return;
      }
      setErr(("error" in res && res.error) || ui.error);
    } catch {
      setErr(ui.error);
    }
    setBusy(false);
  };

  const wave = (i: number) => (reduce ? { duration: 0 } : { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const });
  const hasCompare = Boolean(compareLabel);

  return (
    <Shell
      footer={
        <>
          {err && <p className="text-center text-[13px]" style={{ color: P.danger }} role="alert">{err}</p>}
          <PrimaryButton onClick={checkout} busy={busy}>{busy ? ui.redirect : swap(paywall.cta)}</PrimaryButton>
          <p className="text-center text-[12px] leading-snug" style={{ color: P.muted }}>{swap(paywall.finePrint)}</p>
          <p className="flex items-center justify-center gap-2 text-[11px]" style={{ color: P.muted }}>
            <a href="/conditions" className="underline underline-offset-2">{ui.terms}</a>
            <span aria-hidden>·</span>
            <a href="/confidentialite" className="underline underline-offset-2">{ui.privacy}</a>
          </p>
        </>
      }
    >
      <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(0)}>
        {paywall.badge && (
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.14em]" style={{ background: P.purpleSoft, color: P.purple }}>
            {paywall.badge}
          </span>
        )}
        <h1 className="mt-3 font-heading text-[28px] font-bold leading-tight sm:text-[32px]">{rich(paywall.title)}</h1>
        <p className="mt-2 text-[15px] font-medium" style={{ color: P.soft }}>{paywall.subtitle}</p>
      </motion.div>

      {/* Price block */}
      <motion.div
        className="mt-6 overflow-hidden text-center"
        style={{ borderRadius: 20, border: `2px solid ${P.purple}`, background: "#fff", boxShadow: `0 4px 0 0 ${P.purpleLine}` }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(1)}
      >
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-end justify-center gap-3">
            {hasCompare && (
              <span className="mb-1.5 text-[20px] font-semibold line-through decoration-2" style={{ color: P.muted, textDecorationColor: P.danger }}>
                {compareLabel}
              </span>
            )}
            <span className="font-heading text-[52px] font-extrabold leading-none" style={{ color: P.purple }}>{priceLabel}</span>
          </div>
          <p className="mt-1.5 text-[14px] font-semibold" style={{ color: P.text }}>{paywall.priceNote}</p>
        </div>
        {paywall.urgency && (
          <p className="px-4 py-2.5 text-[12.5px] font-semibold leading-snug" style={{ background: P.purple, color: "#fff" }}>
            {swap(paywall.urgency)}
          </p>
        )}
      </motion.div>

      {/* Value stack */}
      <motion.ul className="mt-6 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(2)}>
        {paywall.perks.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: P.purpleSoft, color: P.purple }} aria-hidden>
              <Icon name={item.icon} size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[15.5px] font-semibold leading-tight" style={{ color: P.text }}>{item.title}</p>
              {item.text && <p className="mt-0.5 text-[13.5px] leading-snug" style={{ color: P.muted }}>{fill(item.text, { when: whenLabel })}</p>}
            </div>
          </li>
        ))}
      </motion.ul>

      {/* Guarantee */}
      {paywall.guaranteeTitle && (
        <motion.div className="mt-6 flex gap-3 rounded-2xl p-4" style={{ background: P.surface }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={wave(3)}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#fff", color: P.purple }} aria-hidden>
            <Icon name="shield" size={18} />
          </span>
          <div>
            <p className="text-[14.5px] font-bold" style={{ color: P.text }}>{paywall.guaranteeTitle}</p>
            <p className="mt-0.5 text-[13px] leading-snug" style={{ color: P.muted }}>{paywall.guaranteeText}</p>
          </div>
        </motion.div>
      )}

      <motion.p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] font-semibold" style={{ color: P.text }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={wave(4)}>
        <Check size={14} color={P.purple} />
        {paywall.reassurance}
      </motion.p>

      {busy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,.45)" }} aria-hidden>
          <div className="flex h-20 w-20 items-center justify-center rounded-[20px]" style={{ background: P.purple }}>
            <span className="h-8 w-8 animate-spin rounded-full border-[3px]" style={{ borderColor: "rgba(239,233,222,.3)", borderTopColor: "#fff" }} />
          </div>
        </div>
      )}
    </Shell>
  );
}

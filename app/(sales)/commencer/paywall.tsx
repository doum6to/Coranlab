"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { createCommencerCheckout } from "@/actions/commencer-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import type { CommencerContent } from "@/lib/commencer-shared";
import { centsFromLabel, formatPaywallPrice, type PaywallCurrency } from "@/lib/geo-currency";

import { CM_UI, Check, Icon, P, PrimaryButton, Shell, Star, fill, rich, type CmLocale } from "./ui";

const GREEN = "#16A34A";
const GREEN_SOFT = "#ECFDF3";

/**
 * Lifetime paywall. Built around ONE message the price alone fails to carry:
 * "you pay once, never again". The price card shows what the learner pays
 * over time (today = price, next month = 0, in a year = 0), and a side-by-side
 * "same price, but every month elsewhere" comparison makes the value obvious.
 * Then the value stack, social proof and guarantee; the sticky footer repeats
 * "one-time · no subscription" right under the button.
 */
export function Paywall({ paywall, email, whenLabel, locale = "fr", currency = "EUR" }: { paywall: CommencerContent["paywall"]; email?: string; whenLabel: string; locale?: CmLocale; currency?: PaywallCurrency }) {
  const ui = CM_UI[locale];
  // Same number in the visitor's currency (detected from their country).
  const priceLabel = formatPaywallPrice(paywall.amountCents, currency, locale);
  const zeroLabel = formatPaywallPrice(0, currency, locale);
  const yearLabel = formatPaywallPrice(paywall.amountCents * 12, currency, locale);
  const compareLabel = paywall.compareLabel ? formatPaywallPrice(centsFromLabel(paywall.compareLabel, 4900), currency, locale) : "";
  // Admin copy may embed the euro price ("— 9,99 €" / "49 €"): swap it for the local one, then fill placeholders.
  const t = (s: string) =>
    fill(s.replace(paywall.priceLabel, priceLabel).replace(paywall.compareLabel || "\u0000", compareLabel), { price: priceLabel, year: yearLabel, when: whenLabel });

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

  const wave = (i: number) => (reduce ? { duration: 0 } : { delay: 0.08 + i * 0.07, duration: 0.4, ease: "easeOut" as const });
  const appear = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: wave(i) });
  const timeline = [
    { label: paywall.timelineToday, value: priceLabel, now: true },
    { label: paywall.timelineMonth, value: zeroLabel, now: false },
    { label: paywall.timelineYear, value: zeroLabel, now: false },
  ];

  return (
    <Shell
      footer={
        <>
          {err && <p className="text-center text-[13px]" style={{ color: P.danger }} role="alert">{err}</p>}
          <PrimaryButton onClick={checkout} busy={busy}>{busy ? ui.redirect : t(paywall.cta)}</PrimaryButton>
          {paywall.footerPoints.length > 0 && (
            <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] font-semibold" style={{ color: P.text }}>
              {paywall.footerPoints.map((pt) => (
                <span key={pt} className="inline-flex items-center gap-1 whitespace-nowrap"><Check size={12} color={GREEN} />{pt}</span>
              ))}
            </p>
          )}
          <p className="flex items-center justify-center gap-2 text-[11px]" style={{ color: P.muted }}>
            <a href="/conditions" className="underline underline-offset-2">{ui.terms}</a>
            <span aria-hidden>·</span>
            <a href="/confidentialite" className="underline underline-offset-2">{ui.privacy}</a>
          </p>
        </>
      }
    >
      {/* Header */}
      <motion.div className="text-center" {...appear(0)}>
        {paywall.badge && (
          <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.14em]" style={{ background: P.purpleSoft, color: P.purple }}>
            {paywall.badge}
          </span>
        )}
        <h1 className="mt-3 font-heading text-[27px] font-bold leading-[1.15] sm:text-[32px]">{rich(t(paywall.title))}</h1>
        <p className="mt-2 text-[15px] font-semibold" style={{ color: P.text }}>{t(paywall.subtitle)}</p>
      </motion.div>

      {/* Price card: product, one-time chip, price, "what you pay over time" */}
      <motion.section
        className="mt-5 overflow-hidden"
        style={{ borderRadius: 22, border: `2px solid ${P.purple}`, background: "#fff", boxShadow: `0 4px 0 0 ${P.purpleLine}, 0 18px 40px -24px rgba(105,103,251,.55)` }}
        {...appear(1)}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4">
          <span className="min-w-0 truncate text-[13px] font-bold" style={{ color: P.text }}>{paywall.productName}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide" style={{ background: GREEN_SOFT, color: GREEN }}>
            <Check size={11} color={GREEN} /> {paywall.oneTimeChip}
          </span>
        </div>

        <div className="px-4 pb-3 pt-2 text-center">
          <div className="flex items-end justify-center gap-3">
            {compareLabel && (
              <span className="mb-2 text-[19px] font-semibold line-through decoration-2" style={{ color: P.muted, textDecorationColor: P.danger }}>{compareLabel}</span>
            )}
            <span className="font-heading text-[54px] font-extrabold leading-none tracking-tight" style={{ color: P.purple }}>{priceLabel}</span>
          </div>
          <p className="mt-1 text-[13px] font-bold uppercase tracking-[.12em]" style={{ color: P.purple }}>{paywall.priceNote}</p>
          <p className="mx-auto mt-2 max-w-[300px] text-[14px] font-semibold leading-snug" style={{ color: P.text }}>{t(paywall.payOnceLine)}</p>
        </div>

        {/* Over time: today = price, then 0 forever */}
        <div className="grid grid-cols-3 border-t" style={{ borderColor: P.border, background: "#FAFAFF" }}>
          {timeline.map((s, i) => (
            <div key={s.label} className="px-2 py-3 text-center" style={{ borderLeft: i ? `1px solid ${P.border}` : undefined }}>
              <p className="text-[11px] font-semibold leading-tight" style={{ color: P.muted }}>{s.label}</p>
              <p className="mt-1 font-heading text-[18px] font-extrabold leading-none" style={{ color: s.now ? P.purple : GREEN }}>{s.value}</p>
            </div>
          ))}
        </div>

        {paywall.urgency && (
          <p className="px-4 py-2.5 text-center text-[12.5px] font-semibold leading-snug" style={{ background: P.purple, color: "#fff" }}>{t(paywall.urgency)}</p>
        )}
      </motion.section>

      {/* Same price, but once vs every month */}
      {paywall.compareTitle && (
        <motion.section className="mt-6" {...appear(2)}>
          <h2 className="text-[13px] font-bold uppercase tracking-[.12em]" style={{ color: P.muted }}>{paywall.compareTitle}</h2>
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: P.surface }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] font-bold" style={{ background: "#fff", color: P.danger }} aria-hidden>✕</span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold" style={{ color: P.muted }}>{paywall.compareThemLabel}</p>
                <p className="text-[14.5px] font-bold" style={{ color: P.soft }}>{t(paywall.compareThemValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: GREEN_SOFT, border: `1.5px solid #BBF7D0` }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: GREEN }} aria-hidden><Check size={14} color="#fff" /></span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold" style={{ color: GREEN }}>{paywall.compareUsLabel}</p>
                <p className="text-[15px] font-extrabold" style={{ color: P.text }}>{t(paywall.compareUsValue)}</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Value stack */}
      <motion.section className="mt-6" {...appear(3)}>
        {paywall.perksTitle && <h2 className="text-[13px] font-bold uppercase tracking-[.12em]" style={{ color: P.muted }}>{paywall.perksTitle}</h2>}
        <ul className="mt-3 space-y-3">
          {paywall.perks.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: P.purpleSoft, color: P.purple }} aria-hidden>
                <Icon name={item.icon} size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-tight" style={{ color: P.text }}>{item.title}</p>
                {item.text && <p className="mt-0.5 text-[13px] leading-snug" style={{ color: P.muted }}>{t(item.text)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Social proof */}
      {paywall.reviewText && (
        <motion.figure className="mt-6 rounded-2xl p-4" style={{ border: `1.5px solid ${P.border}` }} {...appear(4)}>
          <div className="flex items-center gap-2">
            <span className="flex" style={{ color: "#F5B301" }} aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} />)}</span>
            <span className="text-[13px] font-bold" style={{ color: P.text }}>{paywall.ratingValue}</span>
            <span className="text-[12.5px]" style={{ color: P.muted }}>· {paywall.ratingLabel}</span>
          </div>
          <blockquote className="mt-2 text-[14.5px] leading-snug" style={{ color: P.text }}>« {paywall.reviewText} »</blockquote>
          <figcaption className="mt-1 text-[12.5px] font-semibold" style={{ color: P.muted }}>— {paywall.reviewName}</figcaption>
        </motion.figure>
      )}

      {/* Guarantee */}
      {paywall.guaranteeTitle && (
        <motion.div className="mt-4 flex gap-3 rounded-2xl p-4" style={{ background: P.surface }} {...appear(5)}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#fff", color: P.purple }} aria-hidden>
            <Icon name="shield" size={18} />
          </span>
          <div>
            <p className="text-[14.5px] font-bold" style={{ color: P.text }}>{paywall.guaranteeTitle}</p>
            <p className="mt-0.5 text-[13px] leading-snug" style={{ color: P.muted }}>{paywall.guaranteeText}</p>
          </div>
        </motion.div>
      )}

      {/* Fine print + payment methods (in the page, not the footer, to keep the button area light) */}
      <div className="mt-5 space-y-1.5 pb-2 text-center">
        <p className="text-[12px] leading-snug" style={{ color: P.muted }}>{t(paywall.finePrint)}</p>
        {paywall.paymentMethods && <p className="text-[11.5px]" style={{ color: P.muted }}>{paywall.paymentMethods}</p>}
      </div>

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

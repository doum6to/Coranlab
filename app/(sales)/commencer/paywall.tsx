"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { createCommencerCheckout } from "@/actions/commencer-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { track } from "@/lib/analytics/track";
import type { CommencerContent } from "@/lib/commencer-shared";
import { centsFromLabel, formatPaywallPrice, type PaywallCurrency } from "@/lib/geo-currency";

import { StreakFlame } from "./fx";
import { PaySheet } from "./pay-sheet";
import { CM_UI, Check, Icon, KOJI_CROP, P, PrimaryButton, RiveAnim, Shell, Star, fill, type CmLocale } from "./ui";

const GREEN = "#16A34A";
const GRADIENT = "linear-gradient(120deg, #8E8CFF 0%, #F5A9C8 55%, #F5C88A 100%)";

/** `**words**` in the title become the premium gradient; the rest stays ink. */
function gradientTitle(text: string) {
  return text.replace(/ ?([?!:;»])/g, " $1").split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((tok, i) =>
    tok.startsWith("**")
      ? <span key={i} style={{ backgroundImage: "linear-gradient(100deg, #6967FB 0%, #B77BE8 50%, #F08A6C 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>{tok.slice(2, -2)}</span>
      : <span key={i}>{tok}</span>,
  );
}

/**
 * Lifetime paywall. Built around ONE message the price alone fails to carry:
 * "you pay once, never again". The price card shows what the learner pays
 * over time (today = price, next month = 0, in a year = 0), and a side-by-side
 * "same price, but every month elsewhere" comparison makes the value obvious.
 * Then the value stack, social proof and guarantee; the sticky footer repeats
 * "one-time · no subscription" right under the button.
 */
export function Paywall({ paywall, email, whenLabel, locale = "fr", currency = "EUR", earned }: { paywall: CommencerContent["paywall"]; email?: string; whenLabel: string; locale?: CmLocale; currency?: PaywallCurrency; earned?: { xp: number; words: number } | null }) {
  const ui = CM_UI[locale];
  // Same number in the visitor's currency (detected from their country).
  // Prices use non-breaking spaces so "14,99 €" never splits across two lines.
  const nb = (x: string) => x.replace(/\s/g, String.fromCharCode(160));
  const priceLabel = nb(formatPaywallPrice(paywall.amountCents, currency, locale));
  const zeroLabel = nb(formatPaywallPrice(0, currency, locale));
  const yearLabel = nb(formatPaywallPrice(paywall.amountCents * 12, currency, locale));
  const compareLabel = paywall.compareLabel ? nb(formatPaywallPrice(centsFromLabel(paywall.compareLabel, 4900), currency, locale)) : "";
  // Admin copy may embed the euro price ("— 9,99 €" / "49 €"): swap it for the local one, then fill placeholders.
  const t = (s: string) =>
    fill(s.replace(paywall.priceLabel, priceLabel).replace(paywall.compareLabel || "\u0000", compareLabel), { price: priceLabel, year: yearLabel, when: whenLabel });

  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [sheet, setSheet] = useState(false);

  // The button opens the on-page payment sheet (no page change).
  const openSheet = () => {
    setErr(null);
    track("cm_checkout_start", currency);
    ttqTrack("InitiateCheckout", { content_category: "commencer", content_id: "commencer_lifetime", currency, value: paywall.amountCents / 100 });
    setSheet(true);
  };

  // Fallback offered inside the sheet: Stripe's hosted page (redirect).
  const hostedCheckout = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
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
    setSheet(false);
  };

  const wave = (i: number) => (reduce ? { duration: 0 } : { delay: 0.08 + i * 0.07, duration: 0.4, ease: "easeOut" as const });
  const appear = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: wave(i) });
  const timeline = [
    { label: paywall.timelineToday },
    { label: paywall.timelineMonth },
    { label: paywall.timelineYear },
  ];

  return (
    <Shell
      footer={
        <>
          {err && <p className="text-center text-[0.8125rem]" style={{ color: P.danger }} role="alert">{err}</p>}
          <PrimaryButton onClick={openSheet}>{t(paywall.cta)}</PrimaryButton>
          {paywall.footerPoints.length > 0 && (
            <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.75rem] font-semibold" style={{ color: P.text }}>
              {paywall.footerPoints.map((pt) => (
                <span key={pt} className="inline-flex items-center gap-1 whitespace-nowrap"><Check size={12} color={GREEN} />{pt}</span>
              ))}
            </p>
          )}
          <p className="flex items-center justify-center gap-2 text-[0.6875rem]" style={{ color: P.muted }}>
            <a href="/conditions" className="underline underline-offset-2">{ui.terms}</a>
            <span aria-hidden>·</span>
            <a href="/confidentialite" className="underline underline-offset-2">{ui.privacy}</a>
          </p>
        </>
      }
    >
      {/* Soft premium backdrop behind the top of the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]" style={{ background: "radial-gradient(70% 60% at 15% 0%, rgba(184,169,245,.38) 0%, rgba(184,169,245,0) 70%), radial-gradient(60% 55% at 95% 5%, rgba(245,169,200,.30) 0%, rgba(245,169,200,0) 70%), radial-gradient(50% 45% at 60% 30%, rgba(245,200,138,.22) 0%, rgba(245,200,138,0) 70%)" }} aria-hidden />

      {/* Header */}
      <motion.div className="relative text-center" {...appear(0)}>
        <h1 className="mx-auto max-w-[21rem] font-serif text-[2rem] font-semibold leading-[1.12]" style={{ color: P.text, letterSpacing: "-0.02em", textWrap: "balance" as never }}>{gradientTitle(t(paywall.title))}</h1>
        <p className="mx-auto mt-3 max-w-[20rem] text-[1rem] leading-normal" style={{ color: P.soft, textWrap: "balance" as never }}>{t(paywall.subtitle)}</p>
      </motion.div>

      {/* Price card: gradient edge, badge on the rim, Koji peeking over it */}
      <motion.section className="relative mt-12" {...appear(1)}>
        <div className="pointer-events-none absolute -top-[50px] right-6 h-[76px] w-[76px]" aria-hidden><RiveAnim src="/animations/loading.riv" crop={KOJI_CROP} /></div>
        <div className="relative" style={{ borderRadius: 24, padding: 2, background: GRADIENT, boxShadow: "0 18px 40px -22px rgba(105,103,251,.45), 0 2px 6px -2px rgba(26,26,26,.06)" }}>
          <span className="absolute -top-3 left-5 whitespace-nowrap rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase text-white" style={{ background: P.purple, letterSpacing: "0.05em" }}>{paywall.oneTimeChip}</span>
          <div className="bg-white px-5 pb-5 pt-6" style={{ borderRadius: 22 }}>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="font-heading text-[1.375rem] font-extrabold leading-tight" style={{ color: P.text, letterSpacing: "-0.01em" }}>{paywall.productName}</p>
                <p className="mt-1 text-[0.875rem] first-letter:uppercase" style={{ color: P.soft }}>{paywall.priceNote}</p>
              </div>
              <div className="shrink-0 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {compareLabel && <p className="text-[0.875rem] line-through" style={{ color: P.muted }}>{compareLabel}</p>}
                <p className="font-heading text-[1.875rem] font-extrabold leading-none" style={{ color: P.text, letterSpacing: "-0.02em" }}>{priceLabel}</p>
              </div>
            </div>
          </div>
        </div>
        {paywall.urgency && <p className="mt-3 px-2 text-center text-[0.8125rem] leading-snug" style={{ color: P.muted, textWrap: "balance" as never }}>{t(paywall.urgency)}</p>}
      </motion.section>

      {/* What the learner just earned in the first lesson: theirs to keep once unlocked */}
      {earned && earned.words > 0 && (
        <motion.div className="mt-5 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5" style={{ background: "#FFF6EA" }} {...appear(2)}>
          <StreakFlame className="h-9 w-9 shrink-0" />
          <p className="text-[0.875rem] font-medium leading-snug" style={{ color: "#8A4B12" }}>{fill(ui.recap, { xp: earned.xp, words: earned.words })}</p>
        </motion.div>
      )}

      {/* How it works: you pay today, then never again */}
      <motion.section className="mt-10" {...appear(2)}>
        <h2 className="font-heading text-[1.25rem] font-bold" style={{ color: P.text, letterSpacing: "-0.01em" }}>{ui.pay.how}</h2>
        <ol className="relative mt-5">
          <span className="absolute bottom-6 left-[17px] top-6 w-[2px] rounded-full" style={{ background: "linear-gradient(180deg, #6967FB 0%, #F5A9C8 55%, #F5C88A 100%)" }} aria-hidden />
          {timeline.map((s, k) => (
            <li key={s.label} className={`relative flex gap-4 ${k ? "mt-6" : ""}`}>
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: k === 0 ? P.purple : "#fff", color: k === 0 ? "#fff" : P.purple, boxShadow: k === 0 ? "none" : "inset 0 0 0 2px #DCDBFF" }} aria-hidden>
                <Icon name={k === 0 ? "unlock" : k === 1 ? "calendar" : "shield"} size={17} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[1rem] font-bold leading-snug" style={{ color: P.text }}>{s.label}</p>
                <p className="mt-0.5 text-[0.9375rem] leading-normal" style={{ color: P.soft }}>{fill(k === 0 ? ui.pay.today : k === 1 ? ui.pay.month : ui.pay.year, { price: priceLabel, zero: zeroLabel })}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-2xl px-4 py-3 text-[0.875rem] leading-normal" style={{ background: P.surface, color: P.soft, textWrap: "pretty" as never }}>{fill(ui.pay.versus, { price: priceLabel, year: yearLabel })}</p>
      </motion.section>

      {/* Value stack */}
      <motion.section className="mt-10" {...appear(3)}>
        {paywall.perksTitle && <h2 className="font-heading text-[1.25rem] font-bold" style={{ color: P.text, letterSpacing: "-0.01em" }}>{paywall.perksTitle}</h2>}
        <ul className="mt-5 space-y-5">
          {paywall.perks.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex w-9 shrink-0 justify-center pt-0.5" style={{ color: P.purple }} aria-hidden><Icon name={item.icon} size={24} strokeWidth={1.75} duo /></span>
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-snug" style={{ color: P.text }}>{item.title}</p>
                {item.text && <p className="mt-0.5 text-[0.9375rem] leading-normal" style={{ color: P.soft, textWrap: "pretty" as never }}>{t(item.text)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Social proof */}
      {paywall.reviewText && (
        <motion.figure className="mt-10 rounded-3xl px-5 py-5" style={{ background: "#F7F7FF" }} {...appear(4)}>
          <div className="flex items-center gap-2">
            <span className="flex" style={{ color: "#F5B301" }} aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} />)}</span>
            <span className="text-[0.875rem] font-bold" style={{ color: P.text }}>{paywall.ratingValue}</span>
            <span className="text-[0.8125rem]" style={{ color: P.muted }}>{paywall.ratingLabel}</span>
          </div>
          <blockquote className="mt-3 font-serif text-[1.1875rem] leading-[1.4]" style={{ color: P.text, textWrap: "pretty" as never }}>« {paywall.reviewText} »</blockquote>
          <figcaption className="mt-2 text-[0.875rem] font-semibold" style={{ color: P.soft }}>{paywall.reviewName}</figcaption>
        </motion.figure>
      )}

      {/* Guarantee */}
      {paywall.guaranteeTitle && (
        <motion.div className="mt-8 flex gap-4" {...appear(5)}>
          <span className="flex w-9 shrink-0 justify-center pt-0.5" style={{ color: GREEN }} aria-hidden><Icon name="shield" size={24} strokeWidth={1.75} duo /></span>
          <div>
            <p className="text-[1rem] font-semibold leading-snug" style={{ color: P.text }}>{paywall.guaranteeTitle}</p>
            <p className="mt-0.5 text-[0.9375rem] leading-normal" style={{ color: P.soft, textWrap: "pretty" as never }}>{paywall.guaranteeText}</p>
          </div>
        </motion.div>
      )}

      {/* Fine print + payment methods (in the page, not the footer, to keep the button area light) */}
      <div className="mt-5 space-y-1.5 pb-2 text-center">
        <p className="text-[0.75rem] leading-snug" style={{ color: P.muted }}>{t(paywall.finePrint)}</p>
        {paywall.paymentMethods && <p className="text-[0.7188rem]" style={{ color: P.muted }}>{paywall.paymentMethods}</p>}
      </div>

      <PaySheet open={sheet} onClose={() => setSheet(false)} onHosted={hostedCheckout} hostedBusy={busy} email={email} locale={locale} currency={currency} ui={ui}
        title={ui.pay.sheetTitle} summary={fill(ui.pay.sheetSummary, { product: paywall.productName, price: priceLabel })} />
    </Shell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { createCommencerCheckout } from "@/actions/commencer-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import type { CmPlan, CommencerContent } from "@/lib/commencer-shared";

import { Check, Icon, P, PrimaryButton, Shell, addDays, fill, fmtLong, rich, useToday } from "./ui";

type PlanId = "weekly" | "annual";

export function Paywall({ paywall, email }: { paywall: CommencerContent["paywall"]; email?: string }) {
  const reduce = useReducedMotion();
  const today = useToday();
  const billingDate = useMemo(() => (today ? fmtLong(addDays(today, 7)) : "…"), [today]);

  const plans = useMemo<{ id: PlanId; cfg: CmPlan }[]>(() => {
    const list: { id: PlanId; cfg: CmPlan }[] = [
      { id: "annual", cfg: paywall.annual },
      { id: "weekly", cfg: paywall.weekly },
    ];
    // Popular plan first.
    return list.sort((a, b) => Number(b.cfg.popular) - Number(a.cfg.popular));
  }, [paywall]);

  const [selected, setSelected] = useState<PlanId>(paywall.weekly.popular && !paywall.annual.popular ? "weekly" : "annual");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checkout = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const cfg = selected === "annual" ? paywall.annual : paywall.weekly;
    ttqTrack("InitiateCheckout", { content_category: "commencer", content_id: selected, currency: "EUR", value: cfg.amountCents / 100 });
    try {
      const res = await createCommencerCheckout(selected, email || undefined);
      if ("url" in res && res.url) {
        window.location.href = res.url;
        return;
      }
      setErr(("error" in res && res.error) || "Une erreur est survenue.");
    } catch {
      setErr("Une erreur est survenue.");
    }
    setBusy(false);
  };

  const finePrint = selected === "annual" ? paywall.finePrintAnnual : paywall.finePrintWeekly;
  const wave = (i: number) => (reduce ? { duration: 0 } : { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const });

  return (
    <Shell
      footer={
        <>
          {err && <p className="text-center text-[13px]" style={{ color: P.danger }} role="alert">{err}</p>}
          <PrimaryButton onClick={checkout} busy={busy}>{busy ? "Redirection…" : paywall.cta}</PrimaryButton>
          <p className="text-center text-[12px] leading-snug" style={{ color: P.muted }}>{finePrint}</p>
          <p className="flex items-center justify-center gap-2 text-[11px]" style={{ color: P.muted }}>
            <a href="/conditions" className="underline underline-offset-2">Conditions</a>
            <span aria-hidden>·</span>
            <a href="/confidentialite" className="underline underline-offset-2">Confidentialité</a>
          </p>
        </>
      }
    >
      <motion.div className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(0)}>
        <h1 className="font-heading text-[28px] font-bold leading-tight sm:text-[32px]">{rich(paywall.title)}</h1>
        <p className="mt-2 text-[15px] font-medium" style={{ color: P.soft }}>{paywall.subtitle}</p>
      </motion.div>

      {/* Timeline */}
      <motion.ol className="mt-7 space-y-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(1)}>
        {paywall.timeline.map((item, i) => {
          const first = i === 0;
          const last = i === paywall.timeline.length - 1;
          return (
            <li key={item.title} className="relative flex gap-4">
              <div className="flex shrink-0 flex-col items-center">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[18px]"
                  style={{
                    background: first ? P.purple : "transparent",
                    border: first ? "none" : "1.5px solid #6967FB",
                    color: first ? "#fff" : P.purple,
                  }}
                  aria-hidden
                >
                  <Icon name={item.icon} size={20} />
                </span>
                {!last && <span className="w-[3px] flex-1 rounded-full" style={{ minHeight: 22, background: first ? "linear-gradient(to bottom, #6967FB, #E6E5FF)" : "linear-gradient(to bottom, #E6E5FF, #E8E8E8)" }} aria-hidden />}
              </div>
              <div className={last ? "pb-1" : "pb-5"}>
                <p className="text-[16px] font-semibold leading-tight" style={{ color: P.text }}>{item.title}</p>
                <p className="mt-1 text-[14px] leading-snug" style={{ color: P.muted }}>{fill(item.text, { date: billingDate })}</p>
              </div>
            </li>
          );
        })}
      </motion.ol>

      {/* Plans */}
      <motion.div className="mt-7 space-y-3" role="radiogroup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={wave(2)}>
        {plans.map(({ id, cfg }) => {
          const active = selected === id;
          const hasTag = Boolean(cfg.tag);
          return (
            <motion.button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(id)}
              whileTap={reduce ? undefined : { scale: 0.975 }}
              className="relative block w-full overflow-hidden text-left"
              style={{
                borderRadius: 16,
                border: `2px solid ${active ? P.purple : P.border}`,
                background: "#fff",
                transition: "border-color .15s",
              }}
            >
              {hasTag && (
                <span
                  className="block px-4 py-1.5 text-[11px] font-bold uppercase tracking-[.14em]"
                  style={{ background: active ? P.purple : P.surface, color: active ? "#fff" : P.muted, transition: "background-color .15s, color .15s" }}
                >
                  {cfg.tag}
                </span>
              )}
              <span className="flex items-center justify-between gap-3 px-4 py-3.5 pr-12">
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold" style={{ color: P.text }}>{cfg.title}</span>
                  {cfg.sub && <span className="mt-0.5 block text-[13px]" style={{ color: P.muted }}>{cfg.sub}</span>}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-heading text-[22px] font-extrabold leading-none">{cfg.priceLabel}</span>
                  <span className="mt-1 block text-[12px]" style={{ color: P.muted }}>{cfg.per}</span>
                </span>
              </span>
              {/* Check badge — kept INSIDE the card bounds */}
              <span
                className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  top: hasTag ? 40 : 12,
                  background: active ? P.purple : "transparent",
                  border: active ? "none" : "1.5px solid #E8E8E8",
                  color: "#fff",
                  transition: "background-color .15s",
                }}
                aria-hidden
              >
                {active && <Check size={12} />}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.p className="mt-5 flex items-center justify-center gap-2 text-[14px] font-semibold" style={{ color: P.text }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={wave(3)}>
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

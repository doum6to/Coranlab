"use client";

import { useRouter } from "next/navigation";
import { Star, Check, X } from "lucide-react";

import { usePremiumModal } from "@/store/use-premium-modal";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

const GRADIENT =
  "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)";


/**
 * Contextual paywall shown the moment a free user hits locked content.
 * Sells the value, then sends to the (platform-aware) pricing screen where the
 * 7-day free trial is the highlighted CTA.
 */
export const PremiumLockModal = () => {
  const { isOpen, reason, close } = usePremiumModal();
  const router = useRouter();
  const t = useT();
  const perks = [
    t.lockModal.perkAllLessons,
    t.lockModal.perk500Words,
    t.lockModal.perkUnlimited,
    t.lockModal.perkAllCourses,
  ];

  if (!isOpen) return null;

  const goPricing = () => {
    close();
    router.push("/premium/pricing");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        aria-label={t.ui.close}
        onClick={close}
        className="absolute inset-0 bg-black/60 animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 pb-7 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-3xl">
        <button
          onClick={close}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label={t.ui.close}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
            style={{ background: GRADIENT }}
          >
            Premium
          </span>
          <h2 className="mt-3 font-heading text-xl font-extrabold text-brilliant-text">
            {t.lockModal.title}
          </h2>
          <p className="mt-1 text-sm text-brilliant-muted">
            {reason ? tpl(t.lockModal.reasonLocked, { reason }) : t.lockModal.freeDone}
          </p>
        </div>

        {/* Perks */}
        <ul className="mt-5 space-y-2">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-brilliant-text">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#BEF264]">
                <Check className="h-3 w-3 text-[#0F172A]" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <div className="mt-5 rounded-2xl bg-neutral-50 p-3">
          <div className="flex items-center gap-1 text-[#f6c343]">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
            ))}
            <span className="ml-1 text-[11px] font-semibold text-brilliant-muted">
              {t.lockModal.adopted}
            </span>
          </div>
          <p className="mt-1.5 text-xs italic leading-relaxed text-brilliant-text">
            « {t.lockModal.reviewText} » — {t.lockModal.reviewName}
          </p>
        </div>

        {/* CTAs */}
        <button
          onClick={goPricing}
          className="mt-5 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#0F172A", boxShadow: "0 4px 0 0 rgba(0,0,0,0.25)" }}
        >
          {t.lockModal.tryFree}
        </button>
        <button
          onClick={close}
          className="mt-2 w-full rounded-2xl py-2.5 text-sm font-semibold text-brilliant-muted hover:bg-neutral-50"
        >
          {t.ui.later}
        </button>
      </div>
    </div>
  );
};

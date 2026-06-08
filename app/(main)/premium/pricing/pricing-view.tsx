"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createStripeUrl } from "@/actions/user-subscription";
import type { PremiumPlan } from "@/lib/premium";
import { RiveMascot } from "@/components/rive-mascot";
import { useT } from "@/lib/i18n/use-t";

const GRADIENT =
  "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)";

const LIFETIME_GRADIENT =
  "linear-gradient(135deg, #FFD96B 0%, #F7A73F 50%, #DE6B00 100%)";

type PlanCardProps = {
  plan: PremiumPlan;
  title: string;
  price: string;
  priceSuffix: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
  popular?: boolean;
};

const PlanCard = ({
  title,
  price,
  priceSuffix,
  subtitle,
  selected,
  onClick,
  popular,
  popularLabel,
}: PlanCardProps & { popularLabel: string }) => (
  <div className="relative">
    {popular && (
      <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 z-10">
        <div
          className="rounded-full text-[8px] sm:text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap text-white"
          style={{ background: GRADIENT, padding: "3px 10px" }}
        >
          {popularLabel}
        </div>
      </div>
    )}
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="relative w-full rounded-2xl p-[3px] text-left transition-transform duration-100 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
      style={{ background: selected ? GRADIENT : "#E5E7EB" }}
    >
      <div className="rounded-[14px] bg-white p-2.5 sm:p-4 h-full">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs sm:text-sm font-bold text-brilliant-text">
            {title}
          </div>
          <div
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selected ? "border-brilliant-text" : "border-gray-300"
            }`}
          >
            {selected && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brilliant-text" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-0.5 flex-wrap">
          <span className="text-base sm:text-xl font-extrabold text-brilliant-text">
            {price}
          </span>
          <span className="text-[9px] sm:text-[11px] text-brilliant-muted">
            {priceSuffix}
          </span>
        </div>
        <div className="mt-0.5 text-[9px] sm:text-[11px] text-brilliant-muted leading-tight">
          {subtitle}
        </div>
      </div>
    </button>
  </div>
);

export const PricingView = () => {
  const t = useT();
  const [selected, setSelected] = useState<PremiumPlan>("six_months");
  const [pending, startTransition] = useTransition();

  const onSubscribe = () => {
    startTransition(() => {
      createStripeUrl(selected)
        .then((response) => {
          if ("error" in response) {
            toast.error(response.error);
          } else if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch((err) => {
          toast.error(err?.message || t.pricing.genericError);
        });
    });
  };

  const fineprint: Record<PremiumPlan, string> = {
    three_months: t.pricing.finePrint3m,
    six_months: t.pricing.finePrint6m,
    annual: t.pricing.finePrintYear,
    lifetime: t.pricing.finePrintLifetime,
    monthly_trial: t.pricing.finePrintTrial,
  };

  const ctaLabel = selected === "lifetime" ? t.pricing.buyLifetime : t.pricing.becomePremium;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex flex-col"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #F3D5FF 0%, transparent 40%), radial-gradient(circle at 90% 0%, #FFF0C4 0%, transparent 45%), radial-gradient(circle at 50% 100%, #FFE2E2 0%, transparent 50%), #FFF9F0",
      }}
    >
      {/* Close */}
      <Link
        href="/premium"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition z-10"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-brilliant-text" />
      </Link>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center justify-center">
        {/* Mascot animation */}
        <div className="flex justify-center mb-1 sm:mb-2 shrink-0">
          <div className="h-24 w-24 sm:h-36 sm:w-36">
            <RiveMascot
              src="/animations/eyes_down.riv"
              animationName="eyes down"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-lg leading-tight sm:text-2xl font-extrabold text-brilliant-text font-heading mb-1 px-2 shrink-0">
          {t.pricing.heading}
        </h1>
        <p className="text-center text-brilliant-muted text-[11px] sm:text-sm mb-3 sm:mb-6 px-2 shrink-0">
          {t.pricing.subheading}
        </p>

        {/* 3 subscription plans */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl w-full mx-auto">
          <PlanCard
            plan="three_months"
            title={t.pricing.plan3m}
            price="14,97€"
            priceSuffix={t.pricing.perMonth}
            subtitle={t.pricing.renewedEvery3m}
            selected={selected === "three_months"}
            onClick={() => setSelected("three_months")}
            popularLabel={t.pricing.popular}
          />
          <PlanCard
            plan="six_months"
            title={t.pricing.plan6m}
            price="11,99€"
            priceSuffix={t.pricing.perMonthStar}
            subtitle={t.pricing.save20}
            selected={selected === "six_months"}
            onClick={() => setSelected("six_months")}
            popular
            popularLabel={t.pricing.popular}
          />
          <PlanCard
            plan="annual"
            title={t.pricing.planAnnual}
            price="9,99€"
            priceSuffix={t.pricing.perMonthStar}
            subtitle={t.pricing.save33}
            selected={selected === "annual"}
            onClick={() => setSelected("annual")}
            popularLabel={t.pricing.popular}
          />
        </div>

        {/* Lifetime card — full width, distinct styling */}
        <div className="relative max-w-xl w-full mx-auto mt-4 sm:mt-5">
          <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 z-10">
            <div
              className="rounded-full text-[8px] sm:text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap text-white"
              style={{ background: LIFETIME_GRADIENT, padding: "3px 10px" }}
            >
              {t.pricing.uniqueOffer}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelected("lifetime")}
            aria-pressed={selected === "lifetime"}
            className="relative w-full rounded-2xl p-[3px] text-left transition-transform duration-100 hover:scale-[1.005] active:scale-[0.99] cursor-pointer"
            style={{
              background:
                selected === "lifetime" ? LIFETIME_GRADIENT : "#E5E7EB",
            }}
          >
            <div className="rounded-[14px] bg-white p-3 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === "lifetime"
                      ? "border-brilliant-text"
                      : "border-gray-300"
                  }`}
                >
                  {selected === "lifetime" && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brilliant-text" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-bold text-brilliant-text">
                    {t.pricing.lifetime}
                  </div>
                  <div className="text-[10px] sm:text-xs text-brilliant-muted leading-tight">
                    {t.pricing.lifetimeLabel}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-lg sm:text-2xl font-extrabold bg-clip-text text-transparent"
                  style={{ backgroundImage: LIFETIME_GRADIENT }}
                >
                  299,99€
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Fine print */}
        <p className="text-center text-[10px] sm:text-xs text-brilliant-muted max-w-xl mx-auto mt-3 sm:mt-5 px-2 sm:px-4 shrink-0">
          {fineprint[selected]}
        </p>

        {/* Subscribe button */}
        <div className="flex justify-center shrink-0 mt-3 sm:mt-6">
          <button
            onClick={onSubscribe}
            disabled={pending}
            className="rounded-full px-8 sm:px-12 py-3 sm:py-3.5 text-white text-sm sm:text-base font-bold transition-transform duration-100 hover:opacity-90 hover:scale-[1.02] active:translate-y-[3px] active:!shadow-none disabled:opacity-60"
            style={{
              background: "#0F172A",
              boxShadow: "0 4px 0 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            {pending ? t.pricing.loading : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

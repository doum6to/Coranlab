"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createStripeUrl } from "@/actions/user-subscription";
import type { PremiumPlan } from "@/lib/premium";
import { RiveMascot } from "@/components/rive-mascot";
import { useT } from "@/lib/i18n/use-t";
import { isNativeIOS } from "@/lib/platform";
import { createClient } from "@/lib/supabase/client";
import {
  initIAP,
  getIapPrices,
  purchasePlan,
  restorePurchases,
  PLAN_TO_RC_PACKAGE,
} from "@/lib/iap/revenuecat";

// Legal pages required by Apple on a subscription paywall — both exist
// (app/(legal)/confidentialite + /conditions) and carry the éditeur details.
const PRIVACY_URL = "/confidentialite";
const TERMS_URL = "/conditions";

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
  const router = useRouter();
  const [selected, setSelected] = useState<PremiumPlan>("six_months");
  const [pending, startTransition] = useTransition();
  const [isIOS] = useState(() => isNativeIOS());
  // Real App Store prices keyed by RC package id (empty until IAP is set up).
  const [iosPrices, setIosPrices] = useState<Record<string, string>>({});

  // On iOS: bind RevenueCat to the signed-in user and load store prices.
  useEffect(() => {
    if (!isIOS) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        await initIAP(data.user?.id);
        setIosPrices(await getIapPrices());
      } catch (e) {
        console.error("[IAP] init failed:", e);
      }
    })();
  }, [isIOS]);

  // Show the real StoreKit price on iOS (Apple requires it to match), with the
  // hardcoded web price as a fallback before offerings load.
  const priceFor = (plan: PremiumPlan, webPrice: string, webSuffix: string) => {
    const store = isIOS ? iosPrices[PLAN_TO_RC_PACKAGE[plan]] : undefined;
    return store
      ? { price: store, priceSuffix: "" }
      : { price: webPrice, priceSuffix: webSuffix };
  };

  const onSubscribe = (plan: PremiumPlan = selected) => {
    // Every multi-month subscription bought here starts with a 7-day free trial
    // ("essai sur le plan choisi"). Lifetime is a one-time payment → no trial.
    const withTrial = plan !== "lifetime";

    // --- iOS: Apple In-App Purchase (Stripe is forbidden in-app) ---
    // The free trial is delivered by the App Store "introductory offer"
    // configured on the product, so there's nothing to pass here.
    if (isIOS) {
      startTransition(async () => {
        const res = await purchasePlan(plan);
        if (res.success) {
          router.refresh();
          router.push("/learn");
        } else if (res.error && res.error !== "cancelled") {
          toast.error(res.error);
        }
      });
      return;
    }

    // --- Web: Stripe checkout (trial applied to the chosen plan) ---
    startTransition(() => {
      createStripeUrl(plan, withTrial)
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

  const onRestore = () => {
    startTransition(async () => {
      const res = await restorePurchases();
      if (res.success) {
        toast.success("Achats restaurés ✓");
        router.refresh();
        router.push("/learn");
      } else if (res.error) {
        toast.error(res.error);
      } else {
        toast.error("Aucun achat à restaurer.");
      }
    });
  };

  const fineprint: Record<PremiumPlan, string> = {
    three_months: t.pricing.finePrint3m,
    six_months: t.pricing.finePrint6m,
    annual: t.pricing.finePrintYear,
    lifetime: t.pricing.finePrintLifetime,
    monthly_trial: t.pricing.finePrintTrial,
  };

  const isTrialPlan = selected !== "lifetime";
  const ctaLabel = selected === "lifetime"
    ? t.pricing.buyLifetime
    : "Commencer — 7 jours gratuits";

  // What the user is billed once the 7-day trial ends (matches the amounts in
  // actions/user-subscription.ts). No monthly tariff — only the 4 plans.
  const trialThenLabel: Partial<Record<PremiumPlan, string>> = {
    three_months: "Gratuit 7 jours, puis 44,91€ tous les 3 mois",
    six_months: "Gratuit 7 jours, puis 71,94€ tous les 6 mois",
    annual: "Gratuit 7 jours, puis 119,88€ par an",
  };

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
            {...priceFor("three_months", "14,97€", t.pricing.perMonth)}
            subtitle={t.pricing.renewedEvery3m}
            selected={selected === "three_months"}
            onClick={() => setSelected("three_months")}
            popularLabel={t.pricing.popular}
          />
          <PlanCard
            plan="six_months"
            title={t.pricing.plan6m}
            {...priceFor("six_months", "11,99€", t.pricing.perMonthStar)}
            subtitle={t.pricing.save20}
            selected={selected === "six_months"}
            onClick={() => setSelected("six_months")}
            popular
            popularLabel={t.pricing.popular}
          />
          <PlanCard
            plan="annual"
            title={t.pricing.planAnnual}
            {...priceFor("annual", "9,99€", t.pricing.perMonthStar)}
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
                  {priceFor("lifetime", "299,99€", "").price}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Fine print */}
        <p className="text-center text-[10px] sm:text-xs text-brilliant-muted max-w-xl mx-auto mt-3 sm:mt-5 px-2 sm:px-4 shrink-0">
          {fineprint[selected]}
        </p>

        {/* Social proof */}
        <div className="mx-auto mt-4 sm:mt-5 max-w-xl w-full shrink-0 rounded-2xl bg-white/70 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[#f6c343]">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
              </svg>
            ))}
            <span className="ml-1.5 text-[11px] sm:text-xs font-semibold text-brilliant-muted">
              Adopté par des milliers de musulmans
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm italic text-brilliant-text">
            « En 3 jours je reconnais plein de mots dans ma prière. Allahumma barik. »
            <span className="not-italic font-semibold text-brilliant-muted"> — Omar</span>
          </p>
        </div>

        {/* Subscribe button */}
        <div className="flex justify-center shrink-0 mt-3 sm:mt-6">
          <button
            onClick={() => onSubscribe()}
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

        {/* Trial reassurance — accurate post-trial billing for the chosen plan */}
        {isTrialPlan && (
          <p className="text-center text-[10px] sm:text-xs text-brilliant-muted mt-2 shrink-0">
            {trialThenLabel[selected]} · annulable à tout moment
          </p>
        )}

        {/* iOS only: "Restore purchases" + legal links (required by Apple) */}
        {isIOS && (
          <div className="flex flex-col items-center gap-2 mt-4 shrink-0">
            <button
              onClick={onRestore}
              disabled={pending}
              className="text-xs sm:text-sm font-semibold text-brilliant-text underline underline-offset-2 disabled:opacity-60"
            >
              Restaurer mes achats
            </button>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-brilliant-muted">
              <Link href={TERMS_URL} className="underline underline-offset-2">
                Conditions d&apos;utilisation
              </Link>
              <span>·</span>
              <Link href={PRIVACY_URL} className="underline underline-offset-2">
                Confidentialité
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

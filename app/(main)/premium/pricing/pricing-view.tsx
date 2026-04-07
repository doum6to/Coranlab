"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createStripeUrl } from "@/actions/user-subscription";
import type { PremiumPlan } from "@/lib/premium";
import { RiveMascot } from "@/components/rive-mascot";

export const PricingView = () => {
  const [selected, setSelected] = useState<PremiumPlan>("annual");
  const [pending, startTransition] = useTransition();

  const onSubscribe = () => {
    startTransition(() => {
      createStripeUrl(selected)
        .then((response) => {
          if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => toast.error("Une erreur est survenue"));
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex flex-col"
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

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col items-center justify-center">
        {/* Mascot animation */}
        <div className="flex justify-center mb-1 sm:mb-3 shrink-0">
          <div className="h-32 w-32 sm:h-44 sm:w-44">
            <RiveMascot
              src="/animations/eyes_down.riv"
              animationName="eyes down"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-lg leading-tight sm:text-2xl font-extrabold text-brilliant-text font-heading mb-1 sm:mb-1.5 px-2 shrink-0">
          Débloque toute l&apos;expérience Quranlab
        </h1>
        <p className="text-center text-brilliant-muted text-xs sm:text-sm mb-3 sm:mb-6 px-2 shrink-0">
          Accès complet à tous les cours — et bien plus.
        </p>

        {/* Plans — 2 columns on mobile too so the page fits without scroll */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg w-full mx-auto">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelected("monthly")}
            aria-pressed={selected === "monthly"}
            className="relative w-full rounded-2xl p-[3px] text-left transition-transform duration-100 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            style={{
              background:
                selected === "monthly"
                  ? "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)"
                  : "#E5E7EB",
            }}
          >
            <div className="rounded-[14px] bg-white p-3 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <div className="text-sm sm:text-base font-bold text-brilliant-text">
                  Mensuel
                </div>
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === "monthly"
                      ? "border-brilliant-text"
                      : "border-gray-300"
                  }`}
                >
                  {selected === "monthly" && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brilliant-text" />
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
                <span className="text-lg sm:text-2xl font-extrabold text-brilliant-text">
                  14,97€
                </span>
                <span className="text-[10px] sm:text-xs text-brilliant-muted">
                  / mois
                </span>
              </div>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-brilliant-muted">
                Renouvelé chaque mois
              </div>
            </div>
          </button>

          {/* Annual — most popular */}
          <div className="relative">
            {/* "Le plus populaire" label */}
            <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 z-10">
              <div
                className="rounded-full text-[8px] sm:text-xs font-extrabold tracking-wider sm:tracking-widest uppercase whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(90deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
                  padding: "3px 10px",
                  color: "white",
                }}
              >
                Populaire
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelected("annual")}
              aria-pressed={selected === "annual"}
              className="relative w-full rounded-2xl p-[3px] text-left transition-transform duration-100 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              style={{
                background:
                  selected === "annual"
                    ? "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)"
                    : "#E5E7EB",
              }}
            >
              <div className="rounded-[14px] bg-white p-3 sm:p-5">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <div className="text-sm sm:text-base font-bold text-brilliant-text">
                    Annuel
                  </div>
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === "annual"
                        ? "border-brilliant-text"
                        : "border-gray-300"
                    }`}
                  >
                    {selected === "annual" && (
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brilliant-text" />
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
                  <span className="text-lg sm:text-2xl font-extrabold text-brilliant-text">
                    9,99€
                  </span>
                  <span className="text-[10px] sm:text-xs text-brilliant-muted">
                    / mois*
                  </span>
                </div>
                <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-brilliant-muted">
                  Économise 33%
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-[10px] sm:text-xs text-brilliant-muted max-w-xl mx-auto mt-2 sm:mt-4 px-2 sm:px-4 shrink-0">
          {selected === "annual"
            ? "*Facturé 119,88€/an. Résiliable à tout moment."
            : "Facturé 14,97€/mois. Résiliable à tout moment."}
        </p>

        {/* Subscribe button */}
        <div className="flex justify-center shrink-0 mt-4 sm:mt-8">
          <button
            onClick={onSubscribe}
            disabled={pending}
            className="rounded-full px-8 sm:px-12 py-3 sm:py-3.5 text-white text-sm sm:text-base font-bold transition-transform duration-100 hover:opacity-90 hover:scale-[1.02] active:translate-y-[3px] active:!shadow-none disabled:opacity-60"
            style={{
              background: "#0F172A",
              boxShadow: "0 4px 0 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            {pending ? "Chargement..." : "S'abonner maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
};

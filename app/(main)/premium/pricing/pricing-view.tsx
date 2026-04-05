"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createStripeUrl } from "@/actions/user-subscription";
import type { PremiumPlan } from "@/lib/premium";

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
      className="h-[100dvh] w-full relative overflow-hidden flex flex-col"
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

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-16 pb-6 sm:pb-12 flex flex-col">
        {/* Logo mark */}
        <div className="flex justify-center mb-3 sm:mb-6 shrink-0">
          <div
            className="w-14 h-14 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
              boxShadow: "0 12px 40px -8px rgba(135, 77, 229, 0.4)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="sm:w-14 sm:h-14"
            >
              <path
                d="M9 2L3 9l9 13 9-13-6-7H9z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.15)"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-lg leading-tight sm:text-5xl font-extrabold text-brilliant-text font-heading mb-1.5 sm:mb-3 px-2 shrink-0">
          Débloque toute l&apos;expérience Quranlab
        </h1>
        <p className="text-center text-brilliant-muted text-xs sm:text-lg mb-4 sm:mb-14 px-2 shrink-0">
          Accès complet à tous les cours — et bien plus.
        </p>

        {/* Plans — 2 columns on mobile too so the page fits without scroll */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl w-full mx-auto pt-3 sm:pt-4">
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
            <div className="rounded-[14px] bg-white p-3 sm:p-6">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="text-sm sm:text-xl font-bold text-brilliant-text">
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
                <span className="text-lg sm:text-3xl font-extrabold text-brilliant-text">
                  14,97€
                </span>
                <span className="text-[10px] sm:text-sm text-brilliant-muted">
                  / mois
                </span>
              </div>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-brilliant-muted">
                Sans engagement
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
              <div className="rounded-[14px] bg-white p-3 sm:p-6">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="text-sm sm:text-xl font-bold text-brilliant-text">
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
                  <span className="text-lg sm:text-3xl font-extrabold text-brilliant-text">
                    9,99€
                  </span>
                  <span className="text-[10px] sm:text-sm text-brilliant-muted">
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
        <p className="text-center text-[10px] sm:text-xs text-brilliant-muted max-w-xl mx-auto mt-3 sm:mt-6 px-2 sm:px-4 shrink-0">
          *Facturé 119,88€/an. Résiliable à tout moment.
        </p>

        {/* Spacer pushes the button to the bottom on desktop while keeping it
            visible on mobile */}
        <div className="flex-1 min-h-[12px]" />

        {/* Subscribe button */}
        <div className="flex justify-center shrink-0">
          <button
            onClick={onSubscribe}
            disabled={pending}
            className="rounded-full px-8 sm:px-16 py-3 sm:py-4 text-white text-sm sm:text-lg font-bold transition-transform duration-100 hover:opacity-90 hover:scale-[1.02] active:translate-y-[3px] active:!shadow-none disabled:opacity-60"
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

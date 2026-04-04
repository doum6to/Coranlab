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
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #F3D5FF 0%, transparent 40%), radial-gradient(circle at 90% 0%, #FFF0C4 0%, transparent 45%), radial-gradient(circle at 50% 100%, #FFE2E2 0%, transparent 50%), #FFF9F0",
      }}
    >
      {/* Close */}
      <Link
        href="/premium"
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition z-10"
      >
        <X className="w-6 h-6 text-brilliant-text" />
      </Link>

      <div className="max-w-4xl mx-auto px-6 pt-12 sm:pt-16 pb-12">
        {/* Logo mark */}
        <div className="flex justify-center mb-6">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
              boxShadow: "0 12px 40px -8px rgba(135, 77, 229, 0.4)",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
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
        <h1 className="text-center text-3xl sm:text-5xl font-extrabold text-brilliant-text leading-tight font-heading mb-3">
          Débloque toute l&apos;expérience Quranlab
        </h1>
        <p className="text-center text-brilliant-muted text-base sm:text-lg mb-10 sm:mb-14">
          Premium te donne un accès complet à tous les cours — et bien plus.
        </p>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelected("monthly")}
            className={`relative rounded-2xl bg-white p-6 text-left transition ${
              selected === "monthly"
                ? "ring-2 ring-brilliant-text"
                : "border border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-lg sm:text-xl font-bold text-brilliant-text mb-2">
              Mensuel
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-brilliant-text">
                14,97€
              </span>
              <span className="text-sm text-brilliant-muted">/ mois</span>
            </div>
          </button>

          {/* Annual — most popular */}
          <div className="relative">
            {/* "Le plus populaire" label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div
                className="px-4 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-widest text-brilliant-text uppercase whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(90deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
                  padding: "4px 16px",
                  color: "white",
                }}
              >
                Le plus populaire
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelected("annual")}
              className="relative w-full rounded-2xl p-[3px] text-left transition hover:scale-[1.01]"
              style={{
                background:
                  selected === "annual"
                    ? "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)"
                    : "#E5E7EB",
              }}
            >
              <div className="rounded-[14px] bg-white p-6">
                <div className="text-lg sm:text-xl font-bold text-brilliant-text mb-2">
                  Annuel
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-brilliant-text">
                    9,99€
                  </span>
                  <span className="text-sm text-brilliant-muted">/ mois*</span>
                </div>
                <div className="mt-1 text-xs text-brilliant-muted">
                  Économise 33%
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-brilliant-muted max-w-xl mx-auto mt-6 px-4">
          *Facturé en un seul paiement annuel de 119,88€. Renouvellement
          annuel, résiliable à tout moment depuis tes paramètres.
        </p>

        {/* Subscribe button */}
        <div className="flex justify-center mt-10 sm:mt-14">
          <button
            onClick={onSubscribe}
            disabled={pending}
            className="rounded-full px-12 sm:px-16 py-4 text-white text-base sm:text-lg font-bold transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
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

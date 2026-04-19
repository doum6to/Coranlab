"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { createCourseCheckoutUrl } from "@/actions/course-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";

const trialFeatures = [
  "Toutes les leçons, tous les exercices",
  "Répétition espacée adaptative",
  "Progression, classement, streaks",
  "Les documents PDF offerts en bonus",
  "Résiliable en un clic, à tout moment",
];

const pdfFeatures = [
  "Documents PDF téléchargeables",
  "Les mots les plus fréquents, classés",
  "Traductions et racines arabes",
  "Paiement unique, accès à vie",
];

export function PricingCards() {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTrialClick() {
    ttqTrack("InitiateCheckout", {
      value: 14.97,
      currency: "EUR",
      content_id: "monthly_trial",
      content_name: "Quranlab Premium — Essai 7j",
      content_category: "subscription",
    });
  }

  async function handlePdfCheckout() {
    setError(null);
    setPdfLoading(true);

    ttqTrack("InitiateCheckout", {
      value: 9.99,
      currency: "EUR",
      content_id: "course_only",
      content_name: "Pack PDFs 85% des mots du Coran",
      content_category: "course",
    });

    try {
      const result = await createCourseCheckoutUrl(false);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setError(result.error || "Erreur lors de la création du paiement.");
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] max-w-[900px] mx-auto">
      {/* ── Primary : Application ───────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-neutral-950 text-white p-8 sm:p-10 flex flex-col overflow-hidden">
        {/* Ornamental gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6967fb] opacity-30 blur-3xl"
        />

        <div className="relative">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/50">
            Application
          </p>
          <h3 className="mt-2 font-serif text-2xl sm:text-3xl">
            Quranlab Premium
          </h3>

          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-serif text-5xl sm:text-6xl tracking-tight">
              0€
            </span>
            <span className="text-sm text-white/60">7 premiers jours</span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            Puis 14,97€/mois · Résiliable en un clic
          </p>
        </div>

        <ul className="relative mt-10 space-y-3 flex-1">
          {trialFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-white/90"
            >
              <Check
                className="h-4 w-4 shrink-0 mt-0.5 text-[#a6a5ff]"
                strokeWidth={2.5}
              />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href="/auth/signup?trial=true"
          onClick={handleTrialClick}
          className="relative group mt-10 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 tracking-wide transition hover:bg-[#6967fb] hover:text-white"
        >
          Commencer mon essai
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <p className="relative mt-3 text-[11px] text-white/40 text-center">
          CB demandée · aucun prélèvement pendant 7 jours
        </p>
      </div>

      {/* ── Secondary : PDFs ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-300 bg-white p-8 sm:p-10 flex flex-col">
        <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
          Documents
        </p>
        <h3 className="mt-2 font-serif text-2xl sm:text-3xl text-neutral-950">
          Pack PDFs
        </h3>

        <div className="mt-8 flex items-baseline gap-2">
          <span className="font-serif text-5xl sm:text-6xl tracking-tight text-neutral-950">
            9,99€
          </span>
          <span className="text-sm text-neutral-500">une fois</span>
        </div>
        <p className="mt-2 text-xs text-neutral-500">Accès à vie</p>

        <ul className="mt-10 space-y-3 flex-1">
          {pdfFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-neutral-700"
            >
              <Check
                className="h-4 w-4 shrink-0 mt-0.5 text-neutral-500"
                strokeWidth={2.5}
              />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handlePdfCheckout}
          disabled={pdfLoading}
          className="mt-10 w-full inline-flex items-center justify-center gap-2 rounded-full border border-neutral-900 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 tracking-wide transition hover:bg-neutral-900 hover:text-white disabled:opacity-60"
        >
          {pdfLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {pdfLoading ? "Redirection..." : "Acheter le pack"}
        </button>
      </div>

      {error && (
        <p className="lg:col-span-2 text-center text-sm text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

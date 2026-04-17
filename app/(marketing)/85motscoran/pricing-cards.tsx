"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

import { createCourseCheckoutUrl } from "@/actions/course-checkout";

type LoadingState = "course" | "combo" | null;

const courseFeatures = [
  "Documents PDF avec les mots les plus fréquents",
  "Traductions et racines arabes",
  "Organisés par fréquence d'apparition",
  "Accès immédiat par email",
  "Accessible à vie, téléchargeable",
];

const comboFeatures = [
  "Tout le pack de documents PDF",
  "Accès Premium à l'application Quranlab",
  "Leçons interactives et exercices",
  "Répétition espacée scientifique",
  "Classements, streaks et gamification",
  "Résiliable à tout moment",
];

export function PricingCards() {
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(withApp: boolean) {
    setError(null);
    setLoading(withApp ? "combo" : "course");
    try {
      const result = await createCourseCheckoutUrl(withApp);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setError(result.error || "Erreur lors de la création du paiement.");
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 max-w-[900px] mx-auto">
      {/* ── Carte 1 : Cours seul ─────────────────────────────────────────── */}
      <div className="rounded-3xl border-2 border-b-4 border-brilliant-border bg-white p-6 sm:p-8 flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-heading font-bold text-brilliant-text">
            Le Pack
          </h3>
        </div>
        <p className="mt-1 text-sm text-brilliant-muted">
          Pour apprendre à ton rythme avec les documents.
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-heading font-bold text-brilliant-text">
            9,99€
          </span>
          <span className="text-sm text-brilliant-muted">paiement unique</span>
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          {courseFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-brilliant-text">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => handleCheckout(false)}
          disabled={loading !== null}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brilliant-border bg-white px-6 py-3.5 text-sm font-bold text-brilliant-text uppercase tracking-wide transition hover:bg-brilliant-surface active:border-b-2 active:translate-y-[2px] disabled:opacity-60"
        >
          {loading === "course" && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading === "course" ? "Redirection..." : "Acheter le pack"}
        </button>
      </div>

      {/* ── Carte 2 : Combo Pack + App (highlighted) ──────────────────────── */}
      <div className="relative rounded-3xl border-2 border-b-4 border-[#6967fb] bg-white p-6 sm:p-8 flex flex-col shadow-[0_8px_30px_-10px_rgba(105,103,251,0.3)]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#6967fb] px-4 py-1 text-xs font-bold text-white uppercase tracking-wide">
          <Sparkles className="h-3 w-3" />
          Offre complète
        </div>

        <div className="flex items-center gap-2">
          <h3 className="text-xl font-heading font-bold text-brilliant-text">
            Le Pack + Application
          </h3>
        </div>
        <p className="mt-1 text-sm text-brilliant-muted">
          Les documents + l&apos;app pour pratiquer tous les jours.
        </p>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-heading font-bold text-[#6967fb]">
              24,96€
            </span>
            <span className="text-sm text-brilliant-muted">le premier mois</span>
          </div>
          <p className="mt-1 text-xs text-brilliant-muted">
            Puis 14,97€/mois. Résiliable à tout moment.
          </p>
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          {comboFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-brilliant-text">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6967fb]/15">
                <Check className="h-3 w-3 text-[#6967fb]" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => handleCheckout(true)}
          disabled={loading !== null}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.01] active:scale-[0.99] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading === "combo" && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading === "combo" ? "Redirection..." : "Commencer l'offre complète"}
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

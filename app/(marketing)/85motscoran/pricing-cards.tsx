"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, Sparkles, FileText } from "lucide-react";

import { createCourseCheckoutUrl } from "@/actions/course-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";

const trialFeatures = [
  "Toutes les leçons de l'application",
  "Répétition espacée scientifique",
  "Classements, streaks, gamification",
  "Les documents PDF offerts en bonus",
  "Résiliable en 1 clic, à tout moment",
];

const pdfFeatures = [
  "Documents PDF (les mots les plus fréquents)",
  "Traductions et racines arabes",
  "Accessible à vie, téléchargeable",
  "Pas d'abonnement, paiement unique",
];

export function PricingCards() {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTrialClick() {
    // Cheap top-of-funnel signal for TikTok optimisation
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
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] max-w-[900px] mx-auto">
      {/* ── Trial card (primary) ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl border-2 border-b-4 border-[#6967fb] bg-white p-6 sm:p-8 flex flex-col shadow-[0_8px_30px_-10px_rgba(105,103,251,0.3)]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#6967fb] px-4 py-1 text-xs font-bold text-white uppercase tracking-wide">
          <Sparkles className="h-3 w-3" />
          Recommandé
        </div>

        <h3 className="text-xl font-heading font-bold text-brilliant-text">
          L&apos;application Quranlab
        </h3>
        <p className="mt-1 text-sm text-brilliant-muted">
          Essaie gratuitement, paie si tu accroches.
        </p>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-heading font-bold text-[#6967fb]">
              0€
            </span>
            <span className="text-sm text-brilliant-muted">
              pendant 7 jours
            </span>
          </div>
          <p className="mt-1 text-xs text-brilliant-muted">
            Puis 14,97€/mois. Résiliable en 1 clic.
          </p>
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          {trialFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-brilliant-text"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6967fb]/15">
                <Check className="h-3 w-3 text-[#6967fb]" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href="/auth/signup?trial=true"
          onClick={handleTrialClick}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6967fb] px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.01] active:scale-[0.99] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[3px]"
        >
          Commencer mes 7 jours gratuits
        </Link>

        <p className="mt-2 text-[11px] text-brilliant-muted text-center">
          CB demandée à l&apos;inscription · aucun prélèvement pendant 7 jours
        </p>
      </div>

      {/* ── PDF downsell card (secondary) ───────────────────────────────── */}
      <div className="rounded-3xl border-2 border-b-4 border-brilliant-border bg-white p-6 sm:p-8 flex flex-col">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brilliant-muted" />
          <h3 className="text-xl font-heading font-bold text-brilliant-text">
            Juste les PDFs
          </h3>
        </div>
        <p className="mt-1 text-sm text-brilliant-muted">
          Pour apprendre à ton rythme sans app.
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-heading font-bold text-brilliant-text">
            9,99€
          </span>
          <span className="text-sm text-brilliant-muted">paiement unique</span>
        </div>

        <ul className="mt-6 space-y-3 flex-1">
          {pdfFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-brilliant-text"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handlePdfCheckout}
          disabled={pdfLoading}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-brilliant-border bg-white px-6 py-3 text-sm font-bold text-brilliant-text uppercase tracking-wide transition hover:bg-brilliant-surface active:border-b-2 active:translate-y-[2px] disabled:opacity-60"
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

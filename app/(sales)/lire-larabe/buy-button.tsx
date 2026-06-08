"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createArabicCourseCheckoutUrl } from "@/actions/arabic-course-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";

export function BuyButton({
  className,
  label = "Je veux lire l'arabe",
  subLabel,
  priceEuros = 27,
}: {
  className?: string;
  label?: string;
  subLabel?: string;
  priceEuros?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    ttqTrack("InitiateCheckout", {
      value: priceEuros,
      currency: "EUR",
      content_id: "arabic_course",
      content_name: "Lire l'arabe en 7h",
      content_category: "course",
    });
    try {
      const r = await createArabicCourseCheckoutUrl();
      if (r.url) {
        window.location.href = r.url;
        return;
      }
      setError(r.error || "Erreur lors de la création du paiement.");
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-8 py-3.5 text-neutral-900 shadow-lg transition-all hover:brightness-[1.04] active:translate-y-1 active:border-b-0 disabled:opacity-70"
      >
        <span className="inline-flex items-center gap-2 text-base font-extrabold uppercase tracking-wide">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Redirection…" : label}
        </span>
        {!loading && subLabel && (
          <span className="text-[11px] font-semibold normal-case tracking-normal text-neutral-900/70">
            {subLabel}
          </span>
        )}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
    </div>
  );
}

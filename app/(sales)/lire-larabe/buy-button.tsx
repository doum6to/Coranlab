"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createArabicCourseCheckoutUrl } from "@/actions/arabic-course-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";

export function BuyButton({
  className,
  label = "Je veux lire l'arabe",
  priceEuros = 27,
}: {
  className?: string;
  label?: string;
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-neutral-900 shadow-lg transition-all hover:brightness-[1.04] active:translate-y-1 active:border-b-0 disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Redirection…" : label}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-400">{error}</p>}
    </div>
  );
}

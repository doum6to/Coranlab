"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createAppLifetimeCheckoutUrl } from "@/actions/app-lifetime-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";

/**
 * Duolingo-style chunky 3D pressable CTA that starts the 47€ lifetime
 * Checkout. Uses the display font + the brand violet, with a bottom-border
 * "press" effect on tap.
 */
export function BuyButton({
  className,
  label = "Obtenir l'accès à vie",
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);

    ttqTrack("InitiateCheckout", {
      value: 47,
      currency: "EUR",
      content_id: "app_lifetime",
      content_name: "Quranlab — Accès à vie",
      content_category: "app",
    });

    try {
      const result = await createAppLifetimeCheckoutUrl();
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setError(result.error || "Erreur lors de la création du paiement.");
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-4 font-display text-base font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0 disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Redirection…" : label}
      </button>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}

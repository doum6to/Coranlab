"use client";

import { useState } from "react";

import { createAppLifetimeCheckoutUrl } from "@/actions/app-lifetime-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { PremiumCta } from "../85motscoran/premium-cta";

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
      <PremiumCta
        as="button"
        onClick={onClick}
        loading={loading}
        arrow={!loading}
        variant="dark"
        className="w-full"
      >
        {loading ? "Redirection…" : label}
      </PremiumCta>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}

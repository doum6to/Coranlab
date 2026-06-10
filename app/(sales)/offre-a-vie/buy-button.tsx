"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createAppLifetimeCheckoutUrl } from "@/actions/app-lifetime-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { track } from "@/lib/analytics/track";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { LANDING_UI } from "@/lib/i18n/landing-ui";

/**
 * Duolingo-style chunky 3D pressable CTA that starts the 47€ lifetime
 * Checkout. Uses the display font + the brand violet, with a bottom-border
 * "press" effect on tap.
 */
export function BuyButton({
  className,
  label = "Obtenir l'accès à vie",
  subLabel,
  priceValue = 14.97,
  locale = DEFAULT_LOCALE,
  variant = "v3",
}: {
  className?: string;
  label?: string;
  subLabel?: string;
  /** Price in € used for the TikTok conversion value. */
  priceValue?: number;
  locale?: Locale;
  /** Landing A/B variant — selects the right price at checkout. */
  variant?: "v3" | "v4";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ui = LANDING_UI[locale];

  async function onClick() {
    setError(null);
    setLoading(true);

    track("lp_cta_click");
    ttqTrack("InitiateCheckout", {
      value: priceValue,
      currency: "EUR",
      content_id: "app_lifetime",
      content_name: "Quranlab — Accès à vie",
      content_category: "app",
    });

    try {
      // If the funnel captured an email/first name earlier, carry them through
      // so the Checkout email is prefilled and signup is pre-filled afterwards.
      let lead: { email?: string; firstName?: string } | undefined;
      try {
        const raw = sessionStorage.getItem("funnel_lead_v1");
        if (raw) {
          const v = JSON.parse(raw) as { email?: string; firstName?: string };
          if (v?.email) lead = { email: v.email, firstName: v.firstName };
        }
      } catch {
        /* ignore */
      }
      const result = await createAppLifetimeCheckoutUrl(locale, variant, lead);
      if (result.url) {
        track("lp_checkout_start");
        window.location.href = result.url;
        return;
      }
      setError(result.error || ui.checkoutError);
    } catch (e: any) {
      setError(e?.message || ui.unknownError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-3.5 font-display text-white shadow-sm transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0 disabled:opacity-70"
      >
        <span className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-wide">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? ui.redirecting : label}
        </span>
        {!loading && subLabel && (
          <span className="text-[11px] font-medium normal-case tracking-normal text-white/80">
            {subLabel}
          </span>
        )}
      </button>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
}

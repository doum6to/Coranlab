import type { Metadata } from "next";

import { getOfferSettings, getLocalePrice, formatMoney } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { getTikTokLandingContent } from "@/lib/tiktok-landing-content";
import { StoryLanding } from "./story-landing";

// ISR — refreshed on demand when the admin saves, and at most every 60s.
export const revalidate = 60;

// Dedicated story landing for the TikTok couple-dialogue ad. Always live
// (independent of the /offre-a-vie variant switch). noindex: ad traffic only,
// avoids competing with /offre-a-vie in search.
export const metadata: Metadata = {
  title: "Comprends 85% des mots du Coran avec 500 mots — Quranlab",
  description:
    "Le livre des 500 mots essentiels du Coran : traduction française selon le contexte et versets avec exemples. Téléchargement immédiat.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.quranlab.app/comprendre-le-coran" },
};

export default async function ComprendreLeCoranPage() {
  const [offer, content, v3Content] = await Promise.all([
    getOfferSettings(),
    getTikTokLandingContent(),
    // Reviews are reused from the V3 landing content (same admin uploads).
    getLandingContent("fr"),
  ]);

  const fp = getLocalePrice(offer, "fr", "tiktok");

  return (
    <StoryLanding
      content={content}
      reviews={v3Content.reviews}
      offer={offer}
      priceLabel={formatMoney(fp.priceCents, fp.currency)}
      compareLabel={
        fp.compareAtCents > fp.priceCents
          ? formatMoney(fp.compareAtCents, fp.currency)
          : null
      }
      priceValue={fp.priceCents / 100}
    />
  );
}

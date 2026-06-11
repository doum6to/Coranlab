import type { Metadata } from "next";

import { getOfferSettings, getLocalePrice, formatMoney } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { getTikTokLandingContent } from "@/lib/tiktok-landing-content";
import { StoryLanding } from "../comprendre-le-coran/story-landing";

// ISR — refreshed on demand when the admin saves, and at most every 60s.
export const revalidate = 60;

// Price A/B twin of /comprendre-le-coran: identical page + copy, but its own
// independent price (tiktokPriceB) so you can test e.g. 9,99 € vs 14,99 €.
// noindex (ad traffic only).
export const metadata: Metadata = {
  title: "Comprends 85% des mots du Coran avec 500 mots — Quranlab",
  description:
    "Le livre des 500 mots essentiels du Coran : traduction française selon le contexte et versets avec exemples. Téléchargement immédiat.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.quranlab.app/comprendre-le-coran-b" },
};

export default async function ComprendreLeCoranBPage() {
  const [offer, content, v3Content] = await Promise.all([
    getOfferSettings(),
    getTikTokLandingContent(),
    getLandingContent("fr"),
  ]);

  const fp = getLocalePrice(offer, "fr", "tiktokB");

  return (
    <StoryLanding
      content={content}
      reviews={v3Content.reviews}
      offer={offer}
      checkoutVariant="tiktokB"
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

import type { Metadata } from "next";

import { getOfferSettings, getLocalePrice, formatMoney } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { getFunnelContent } from "@/lib/funnel-content";
import { ProductLanding } from "../offre-a-vie/product-landing";
import { FunnelLanding } from "../offre-a-vie/funnel-landing";

export const revalidate = 60;

// A/B variant of the offer (V4) — its own admin-editable content. When the
// "Tunnel" variant is live, this slot serves funnel VERSION B, so funnel A
// (/offre-a-vie) and funnel B (/offre-a-vie-v4) can be A/B-tested in parallel.
export const metadata: Metadata = {
  title: "Quranlab — Comprendre 85% du Coran",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.quranlab.app/offre-a-vie-v4" },
};

export default async function OffreAVieV4Page() {
  const offer = await getOfferSettings();

  // Funnel live → this URL hosts funnel version B (independent copy + price).
  if (offer.variant === "funnel") {
    const fp = getLocalePrice(offer, "fr", "funnelB");
    const funnelContent = await getFunnelContent("b");
    return (
      <FunnelLanding
        content={funnelContent}
        checkoutVariant="funnelB"
        priceValue={fp.priceCents / 100}
        priceLabel={formatMoney(fp.priceCents, fp.currency)}
        compareLabel={
          fp.compareAtCents > fp.priceCents
            ? formatMoney(fp.compareAtCents, fp.currency)
            : null
        }
        paymentBadges={offer.paymentBadges}
      />
    );
  }

  const content = await getLandingContent("fr", "v4");
  return <ProductLanding content={content} offer={offer} locale="fr" variant="v4" />;
}

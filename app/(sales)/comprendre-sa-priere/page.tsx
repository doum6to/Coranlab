import { getCoranPriereLandingContent } from "@/lib/coran-priere-landing-content";
import { getLeadMagnetContent } from "@/lib/lead-magnet-content";
import { createCoranPriereEmbeddedCheckout } from "@/actions/coran-priere-checkout";
import { CoranLanding } from "../coran/coran-landing";
import { LeadCapture } from "../coran/lead-capture";

export const revalidate = 60;

export const metadata = {
  title: "Comprends ta prière — Quranlab",
  description:
    "Tu pries sans comprendre ? Apprends les 500 mots qui composent 85% du Coran et ressens enfin ta prière.",
};

export default async function ComprendreSaPrierePage() {
  const [content, leadMagnet] = await Promise.all([
    getCoranPriereLandingContent(),
    getLeadMagnetContent(),
  ]);

  return (
    <CoranLanding
      content={content}
      createCheckout={createCoranPriereEmbeddedCheckout}
      topSlot={
        <LeadCapture
          heading={leadMagnet.captureHeading}
          subtext={leadMagnet.captureSubtext}
          button={leadMagnet.captureButton}
          source="comprendre-sa-priere"
        />
      }
    />
  );
}

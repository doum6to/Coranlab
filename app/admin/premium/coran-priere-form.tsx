"use client";

import { updateCoranPriereLandingContent } from "@/actions/coran-priere-landing-content";
import type { CoranLandingContent } from "@/lib/coran-landing-content";
import { CoranLandingForm } from "./coran-landing-form";

/** Admin editor for /comprendre-sa-priere — reuses the /coran form. */
export function CoranPriereForm({ initial }: { initial: CoranLandingContent }) {
  return (
    <CoranLandingForm
      initial={initial}
      saveAction={updateCoranPriereLandingContent}
      previewUrl="/comprendre-sa-priere"
    />
  );
}

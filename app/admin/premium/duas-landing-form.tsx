"use client";

import { updateDuasLandingContent } from "@/actions/duas-landing-content";
import type { DuasLandingContent } from "@/lib/duas-landing-content";
import { CoranLandingForm } from "./coran-landing-form";

/** Admin editor for /duas — reuses the /coran form, with the Drive link field. */
export function DuasLandingForm({ initial }: { initial: DuasLandingContent }) {
  return (
    <CoranLandingForm
      initial={initial}
      saveAction={updateDuasLandingContent}
      previewUrl="/duas"
      showDriveLink
    />
  );
}

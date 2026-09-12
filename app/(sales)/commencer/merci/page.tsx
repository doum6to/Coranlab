import type { Metadata } from "next";

import { ShinyButton } from "@/components/ui/shiny-button";
import { getCommencerContent } from "@/lib/commencer-content";

import { SourceQuestion } from "./source-question";
import { TrackTrialStart } from "./track-purchase";

export const metadata: Metadata = { title: "Essai commencé — Quranlab", robots: { index: false, follow: false } };

/** `**mot**` → purple emphasis. */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") ? <span key={i} className="text-[#6967fb]">{t.slice(2, -2)}</span> : <span key={i}>{t}</span>,
  );
}

export default async function CommencerMerci() {
  const { merci } = await getCommencerContent();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-white px-6 py-10 text-center text-[#1A1A1A]">
      <TrackTrialStart />
      <div className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white" style={{ background: "#22C55E" }}>✓</div>
      <h1 className="mt-6 max-w-lg font-heading text-3xl font-bold leading-tight sm:text-4xl">{rich(merci.title)}</h1>
      <p className="mt-4 max-w-md text-base text-[#555]">{rich(merci.text)}</p>
      <a href="/auth/signup" className="mt-8 w-full max-w-xs">
        <ShinyButton className="text-base">{merci.cta}</ShinyButton>
      </a>
      <SourceQuestion headline={merci.sourceHeadline} options={merci.sourceOptions} />
      <p className="mt-8 max-w-md text-xs text-[#999]">Rien reçu d&apos;ici quelques minutes ? Écris-nous à contact@quranlab.app.</p>
    </div>
  );
}

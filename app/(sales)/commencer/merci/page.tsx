import type { Metadata } from "next";

import { getCommencerContent } from "@/lib/commencer-content";
import { DA_FONT_CSS } from "@/lib/da-tokens";
import { TrackTrialStart } from "./track-purchase";

export const metadata: Metadata = { title: "Essai commencé — Quranlab", robots: { index: false, follow: false } };

/** Renders `**mot**` as a pink highlight block. */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") ? <span key={i} className="da-hl da-hl-pink">{t.slice(2, -2)}</span> : <span key={i}>{t}</span>,
  );
}

export default async function CommencerMerci() {
  const { merci } = await getCommencerContent();
  return (
    <div className="da da-paper fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center">
      <style dangerouslySetInnerHTML={{ __html: DA_FONT_CSS }} />
      <TrackTrialStart />
      <div className="da-dot flex h-24 w-24 items-center justify-center text-5xl">✓</div>
      <h1 className="da-h mt-6 max-w-lg text-3xl sm:text-4xl">{rich(merci.title)}</h1>
      <p className="mt-4 max-w-md text-base" style={{ color: "var(--espresso-soft)" }}>{rich(merci.text)}</p>
      <a href="/auth/signup" className="da-btn da-btn-espresso mt-8 px-8 py-4 text-base">{merci.cta}</a>
      <p className="mt-6 max-w-md text-xs" style={{ color: "var(--muted)" }}>Rien reçu d&apos;ici quelques minutes ? Écris-nous à contact@quranlab.app.</p>
    </div>
  );
}

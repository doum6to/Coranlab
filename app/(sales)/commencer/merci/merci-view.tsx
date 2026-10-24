import { ShinyButton } from "@/components/ui/shiny-button";
import { getCommencerContent } from "@/lib/commencer-content";
import { SourceQuestion } from "./source-question";
import { TrackPurchase } from "./track-purchase";
import { UpsellFlow } from "./upsell-flow";
import { getBooksContent } from "@/lib/books-content";
import { COMMENCER_EN } from "@/lib/commencer-en";
import { CM_UI, type CmLocale } from "@/lib/commencer-ui";

/** `**mot**` → purple emphasis. */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") ? <span key={i} className="text-[#6967fb]">{t.slice(2, -2)}</span> : <span key={i}>{t}</span>,
  );
}


export type MerciParams = { session_id?: string; upsell?: string; item?: string };

/** Shared by /commencer/merci (FR, admin content + upsells) and /start/merci (EN, no upsell). */
export async function CommencerMerciView({ searchParams, locale }: { searchParams?: MerciParams; locale: CmLocale }) {
  const ui = CM_UI[locale];
  const [{ merci, upsell }, { books }] = await Promise.all([locale === "en" ? Promise.resolve(COMMENCER_EN) : getCommencerContent(), getBooksContent()]);
  const sessionId = searchParams?.session_id ?? "";
  const up = searchParams?.upsell;
  const result = up === "done" || up === "skip" ? { state: up as "done" | "skip", item: searchParams?.item || "arabic" } : null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-white px-6 py-10 sm:justify-center text-center text-[#1A1A1A]">
      <TrackPurchase />
      <div className="flex h-24 w-24 items-center justify-center rounded-full text-5xl text-white" style={{ background: "#22C55E" }}>✓</div>
      <h1 className="mt-6 max-w-lg font-heading text-3xl font-bold leading-tight sm:text-4xl">{rich(merci.title)}</h1>
      <p className="mt-4 max-w-md text-base text-[#555]">{rich(merci.text)}</p>
      {locale === "fr" && <UpsellFlow upsell={upsell} books={books} sessionId={sessionId} result={result} />}
      <a href="/auth/signup" className="mt-8 w-full max-w-xs">
        <ShinyButton className="text-base">{merci.cta}</ShinyButton>
      </a>
      <SourceQuestion headline={merci.sourceHeadline} options={merci.sourceOptions} thanks={ui.thanks} />
      <p className="mt-8 max-w-md text-xs text-[#999]">{ui.nothing}</p>
    </div>
  );
}

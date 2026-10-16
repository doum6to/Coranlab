"use client";

import { useState } from "react";
import { Check, BookOpen } from "lucide-react";

import { createArabicUpsellCheckout } from "@/actions/commencer-upsell";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { track } from "@/lib/analytics/track";
import type { CmUpsell } from "@/lib/commencer-shared";

const PURPLE = "#6967FB";

function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") ? <span key={i} style={{ color: PURPLE }}>{t.slice(2, -2)}</span> : <span key={i}>{t}</span>,
  );
}

/**
 * One-time post-purchase offer. `state`:
 *  - "offer": show the card with accept / decline
 *  - "done":  the upsell was bought → confirmation
 *  - "skip":  declined (or checkout cancelled) → render nothing
 */
export function UpsellCard({ upsell, sessionId, state }: { upsell: CmUpsell; sessionId: string; state: "offer" | "done" | "skip" }) {
  const [declined, setDeclined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div className="mt-6 w-full max-w-md rounded-2xl border-2 p-5 text-left" style={{ borderColor: "#22C55E", background: "#F0FDF4" }}>
        <p className="flex items-center gap-2 text-[15px] font-bold text-[#166534]"><Check className="h-4 w-4" /> {upsell.doneTitle}</p>
        <p className="mt-1 text-[13.5px] text-[#166534]/80">{upsell.doneText}</p>
      </div>
    );
  }
  if (state === "skip" || declined || !upsell.enabled) return null;

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    track("commencer_upsell_accept");
    ttqTrack("InitiateCheckout", { content_category: "course", content_id: "arabic_course_upsell", currency: "EUR", value: upsell.amountCents / 100 });
    try {
      const res = await createArabicUpsellCheckout(sessionId);
      if ("url" in res && res.url) { window.location.href = res.url; return; }
      setErr(("error" in res && res.error) || "Une erreur est survenue.");
    } catch { setErr("Une erreur est survenue."); }
    setBusy(false);
  };
  const decline = () => { track("commencer_upsell_decline"); setDeclined(true); };

  return (
    <div className="mt-8 w-full max-w-md overflow-hidden rounded-3xl border-2 bg-white text-left shadow-[0_12px_40px_-20px_rgba(105,103,251,.5)]" style={{ borderColor: PURPLE }}>
      <div className="px-5 py-2 text-center text-[11px] font-extrabold uppercase tracking-[.14em] text-white" style={{ background: PURPLE }}>{upsell.badge}</div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EFEFFF", color: PURPLE }}><BookOpen className="h-5 w-5" /></span>
          <h2 className="font-heading text-[21px] font-bold leading-tight text-[#1A1A1A]">{rich(upsell.title)}</h2>
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#555]">{upsell.text}</p>
        <ul className="mt-4 space-y-2">
          {upsell.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[14px] text-[#1A1A1A]"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} strokeWidth={3} />{b}</li>
          ))}
        </ul>
        <div className="mt-5 flex items-end justify-center gap-3">
          {upsell.compareLabel && <span className="mb-1 text-[18px] font-semibold text-[#999] line-through decoration-[#E11D48] decoration-2">{upsell.compareLabel}</span>}
          <span className="font-heading text-[44px] font-extrabold leading-none" style={{ color: PURPLE }}>{upsell.priceLabel}</span>
        </div>
        {err && <p className="mt-3 text-center text-[13px] text-[#E11D48]" role="alert">{err}</p>}
        <button type="button" onClick={accept} disabled={busy}
          className="mt-4 w-full rounded-2xl py-4 text-[15px] font-bold text-white transition hover:opacity-90 active:translate-y-[2px] disabled:opacity-60"
          style={{ background: PURPLE, boxShadow: "0 4px 0 0 #4a48d4" }}>
          {busy ? "Redirection…" : upsell.cta}
        </button>
        <button type="button" onClick={decline} className="mt-2 w-full py-2 text-[13px] font-semibold text-[#999] hover:text-[#555]">{upsell.decline}</button>
        <p className="mt-2 text-center text-[11.5px] text-[#999]">{upsell.note}</p>
      </div>
    </div>
  );
}

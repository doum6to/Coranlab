"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, BookOpen, GraduationCap } from "lucide-react";

import { createArabicUpsellCheckout } from "@/actions/commencer-upsell";
import { createBookCheckout } from "@/actions/book-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { track } from "@/lib/analytics/track";
import type { CmUpsell } from "@/lib/commencer-shared";
import type { Book } from "@/lib/books-shared";

const PURPLE = "#6967FB";
/** Onboarding answers persisted by /commencer (localStorage). */
export const CM_ANSWERS_KEY = "cm_answers";
const SEEN_KEY = "cm_upsell_seen";

function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") ? <span key={i} style={{ color: PURPLE }}>{t.slice(2, -2)}</span> : <span key={i}>{t}</span>,
  );
}

type Item =
  | { kind: "arabic"; id: "arabic" }
  | { kind: "book"; id: string; book: Book };

/**
 * Post-purchase upsell sequence on /commencer/merci, one offer at a time:
 *  1. "Lire l'arabe en 7h" — ONLY for people who answered that they can't
 *     read Arabic yet (alphabet = "no") in the questionnaire;
 *  2. the ebooks sold separately (not included with Premium).
 * Accepting opens a Stripe checkout; coming back with ?upsell=done|skip&item=…
 * moves to the next offer. Declined/bought items are remembered per session.
 */
export function UpsellFlow({
  upsell, books, sessionId, result,
}: {
  upsell: CmUpsell;
  books: Book[];
  sessionId: string;
  result: { state: "done" | "skip"; item: string } | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]> | null>(null);
  const [seen, setSeen] = useState<Record<string, "done" | "skip">>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let a: Record<string, string[]> = {};
    let s: Record<string, "done" | "skip"> = {};
    try { a = JSON.parse(localStorage.getItem(CM_ANSWERS_KEY) || "{}"); } catch { /* none */ }
    try { s = JSON.parse(sessionStorage.getItem(SEEN_KEY) || "{}"); } catch { /* none */ }
    if (result) {
      s = { ...s, [result.item]: result.state };
      try { sessionStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch { /* ignore */ }
    }
    setAnswers(a);
    setSeen(s);
    setReady(true);
  }, [result]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    const alphabet = answers?.alphabet?.[0];
    // Reading course: only when the learner said they can't read Arabic yet.
    if (upsell.enabled && alphabet === "no") list.push({ kind: "arabic", id: "arabic" });
    for (const b of books) if (!b.includedWithPremium) list.push({ kind: "book", id: b.slug, book: b });
    return list;
  }, [answers, books, upsell.enabled]);

  const mark = (id: string, state: "done" | "skip") => {
    const next = { ...seen, [id]: state };
    setSeen(next);
    try { sessionStorage.setItem(SEEN_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  if (!ready) return null;

  const bought = items.filter((i) => seen[i.id] === "done");
  const current = items.find((i) => !seen[i.id]);

  return (
    <div className="mt-6 flex w-full max-w-md shrink-0 flex-col items-center gap-3">
      {bought.map((i) => (
        <div key={i.id} className="w-full shrink-0 rounded-2xl border-2 p-4 text-left" style={{ borderColor: "#22C55E", background: "#F0FDF4" }}>
          <p className="flex items-center gap-2 text-[14.5px] font-bold text-[#166534]">
            <Check className="h-4 w-4" /> {i.kind === "arabic" ? upsell.doneTitle : `« ${i.book.title} » ${upsell.bookDoneSuffix}`}
          </p>
          <p className="mt-1 text-[13px] text-[#166534]/80">{i.kind === "arabic" ? upsell.doneText : upsell.bookDoneText}</p>
        </div>
      ))}
      {current && (
        current.kind === "arabic"
          ? <ArabicOffer upsell={upsell} sessionId={sessionId} onDecline={() => mark("arabic", "skip")} />
          : <BookOffer key={current.id} upsell={upsell} book={current.book} sessionId={sessionId} onDecline={() => mark(current.id, "skip")} />
      )}
    </div>
  );
}

function useCheckout(trackId: string, value: number, go: () => Promise<{ url?: string | null; error?: string }>) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const accept = async () => {
    if (busy) return;
    setBusy(true); setErr(null);
    track(`upsell_accept_${trackId}`);
    ttqTrack("InitiateCheckout", { content_category: "upsell", content_id: trackId, currency: "EUR", value });
    try {
      const res = await go();
      if (res.url) { window.location.href = res.url; return; }
      setErr(res.error || "Une erreur est survenue.");
    } catch { setErr("Une erreur est survenue."); }
    setBusy(false);
  };
  return { busy, err, accept };
}

function Card({ badge, children }: { badge: string; children: React.ReactNode }) {
  return (
    <div className="w-full shrink-0 overflow-hidden rounded-3xl border-2 bg-white text-left shadow-[0_12px_40px_-20px_rgba(105,103,251,.5)]" style={{ borderColor: PURPLE }}>
      <div className="px-5 py-2 text-center text-[11px] font-extrabold uppercase tracking-[.14em] text-white" style={{ background: PURPLE }}>{badge}</div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Price({ price, compare }: { price: string; compare: string }) {
  return (
    <div className="mt-5 flex items-end justify-center gap-3">
      {compare && <span className="mb-1 text-[18px] font-semibold text-[#999] line-through decoration-[#E11D48] decoration-2">{compare}</span>}
      <span className="font-heading text-[44px] font-extrabold leading-none" style={{ color: PURPLE }}>{price}</span>
    </div>
  );
}

function Buttons({ cta, decline, busy, err, onAccept, onDecline, note }: { cta: string; decline: string; busy: boolean; err: string | null; onAccept: () => void; onDecline: () => void; note: string }) {
  return (
    <>
      {err && <p className="mt-3 text-center text-[13px] text-[#E11D48]" role="alert">{err}</p>}
      <button type="button" onClick={onAccept} disabled={busy}
        className="mt-4 w-full rounded-2xl py-4 text-[15px] font-bold text-white transition hover:opacity-90 active:translate-y-[2px] disabled:opacity-60"
        style={{ background: PURPLE, boxShadow: "0 4px 0 0 #4a48d4" }}>
        {busy ? "Redirection…" : cta}
      </button>
      <button type="button" onClick={onDecline} className="mt-2 w-full py-2 text-[13px] font-semibold text-[#999] hover:text-[#555]">{decline}</button>
      {note && <p className="mt-2 text-center text-[11.5px] text-[#999]">{note}</p>}
    </>
  );
}

function ArabicOffer({ upsell, sessionId, onDecline }: { upsell: CmUpsell; sessionId: string; onDecline: () => void }) {
  const { busy, err, accept } = useCheckout("arabic_course", upsell.amountCents / 100, () => createArabicUpsellCheckout(sessionId));
  return (
    <Card badge={upsell.badge}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EFEFFF", color: PURPLE }}><GraduationCap className="h-5 w-5" /></span>
        <h2 className="font-heading text-[21px] font-bold leading-tight text-[#1A1A1A]">{rich(upsell.title)}</h2>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-[#555]">{upsell.text}</p>
      <ul className="mt-4 space-y-2">
        {upsell.bullets.map((b, i) => <li key={i} className="flex gap-2 text-[14px] text-[#1A1A1A]"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} strokeWidth={3} />{b}</li>)}
      </ul>
      <Price price={upsell.priceLabel} compare={upsell.compareLabel} />
      <Buttons cta={upsell.cta} decline={upsell.decline} busy={busy} err={err} onAccept={accept} onDecline={() => { track("upsell_decline_arabic_course"); onDecline(); }} note={upsell.note} />
    </Card>
  );
}

function BookOffer({ upsell, book, sessionId, onDecline }: { upsell: CmUpsell; book: Book; sessionId: string; onDecline: () => void }) {
  const { busy, err, accept } = useCheckout(`book_${book.slug}`, book.amountCents / 100, () => createBookCheckout(book.slug, { from: "commencer", originalSessionId: sessionId }));
  const fill = (s: string) => s.replace("{title}", book.title).replace("{price}", book.priceLabel);
  return (
    <Card badge={upsell.bookBadge}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EFEFFF", color: PURPLE }}><BookOpen className="h-5 w-5" /></span>
        <h2 className="font-heading text-[21px] font-bold leading-tight text-[#1A1A1A]">{rich(fill(upsell.bookTitle))}</h2>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-[#555]">{book.description}</p>
      <ul className="mt-4 space-y-2">
        {book.bullets.map((b, i) => <li key={i} className="flex gap-2 text-[14px] text-[#1A1A1A]"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} strokeWidth={3} />{b}</li>)}
      </ul>
      <Price price={book.priceLabel} compare={book.compareLabel} />
      <Buttons cta={fill(upsell.bookCta)} decline={upsell.bookDecline} busy={busy} err={err} onAccept={accept} onDecline={() => { track(`upsell_decline_book_${book.slug}`); onDecline(); }} note={upsell.bookNote} />
    </Card>
  );
}

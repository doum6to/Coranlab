"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { ReviewOverview, ReviewWord } from "@/lib/review";
import { SpeakButton } from "@/components/word-audio";
import { ShinyButton } from "@/components/ui/shiny-button";
import { transliterate } from "@/lib/translit";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

type Props = { overview: ReviewOverview; /** Words a session takes, and the fewest it needs. */ sessionSize: number; sessionMin: number; /** Days until the next words come back, when nothing is due. */ nextInDays: number | null };

/** Letters only, without accents or Arabic vowel marks: what a search compares. */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ًͯ-ٰٟۖ-ۭـ]/g, "").toLowerCase();

const CARD = { borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 14px 34px -18px rgba(74,72,212,.35)" } as const;

/**
 * The review tab. One thing to do at the top (today's session, when words are due), then the
 * learner's own dictionary: every word met so far, how well it holds, and its voice.
 */
export function ReviewView({ overview, sessionSize, sessionMin, nextInDays }: Props) {
  const t = useT();
  const { words, practised, due, known } = overview;
  const canReview = practised >= sessionMin;
  const size = Math.min(sessionSize, practised);
  const learning = words.filter((w) => w.strength === 1 || w.strength === 2).length;
  const fresh = words.length - known - learning;

  const [query, setQuery] = useState("");
  const index = useMemo(() => words.map((w) => fold(`${w.meaning} ${transliterate(w.arabic)} ${w.arabic}`)), [words]);
  const groups = useMemo(() => {
    const q = fold(query.trim());
    const out: { listId: number; title: string; words: ReviewWord[] }[] = [];
    words.forEach((w, i) => {
      if (q && !index[i].includes(q)) return;
      const last = out[out.length - 1];
      if (last && last.listId === w.listId) last.words.push(w);
      else out.push({ listId: w.listId, title: w.listTitle, words: [w] });
    });
    return out;
  }, [words, index, query]);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8 pt-2">
      <h1 className="font-heading text-[1.375rem] font-extrabold text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{t.review.title}</h1>

      {/* Today's session */}
      <section className="mt-4 bg-white p-5" style={CARD}>
        {!canReview ? (
          <>
            <h2 className="font-heading text-[1.25rem] font-extrabold leading-tight text-brilliant-text" style={{ textWrap: "balance" as never }}>{t.review.emptyTitle}</h2>
            <p className="mt-1.5 text-[0.9375rem] leading-normal text-[#555]">{t.review.emptyBody}</p>
            <Link href="/learn" className="mt-5 block" prefetch>
              <ShinyButton as="span" variant="green" className="text-base"><span className="block py-1">{t.review.emptyCta}</span></ShinyButton>
            </Link>
          </>
        ) : due > 0 ? (
          <>
            <p className="text-[0.8125rem] font-medium text-brilliant-muted">{t.review.dueLabel}</p>
            <h2 className="mt-0.5 font-heading text-[2rem] font-extrabold leading-none text-brilliant-text" style={{ letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{due === 1 ? t.review.dueWord : tpl(t.review.dueWords, { n: due })}</h2>
            <p className="mt-2 text-[0.9375rem] leading-normal text-[#555]">{tpl(t.review.sessionHint, { n: size, min: Math.max(1, Math.round(size * 0.3)) })}</p>
            <Link href="/lesson/revision" className="mt-5 block" prefetch={false}>
              <ShinyButton as="span" variant="green" className="text-base"><span className="block py-1">{t.review.start}</span></ShinyButton>
            </Link>
          </>
        ) : (
          <>
            <p className="text-[0.8125rem] font-medium text-brilliant-muted">{t.review.upToDateLabel}</p>
            <h2 className="mt-0.5 font-heading text-[1.5rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>{t.review.upToDate}</h2>
            {nextInDays !== null && <p className="mt-1.5 text-[0.9375rem] leading-normal text-[#555]">{nextInDays <= 1 ? t.review.nextTomorrow : tpl(t.review.nextInDays, { n: nextInDays })}</p>}
            <Link href="/lesson/revision" className="mt-5 block" prefetch={false}>
              <ShinyButton as="span" variant="outline-green" className="text-base"><span className="block py-1">{t.review.anyway}</span></ShinyButton>
            </Link>
          </>
        )}
      </section>

      {/* The learner's words */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading text-[1.125rem] font-extrabold text-brilliant-text">{t.review.myWords}</h2>
          {words.length > 0 && <span className="text-[0.9375rem] font-semibold text-brilliant-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{words.length}</span>}
        </div>

        {words.length === 0 ? (
          <p className="mt-3 text-[0.9375rem] leading-normal text-[#555]">{t.review.noWords}</p>
        ) : (
          <>
            {/* How the whole set holds, in one bar */}
            <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
              {known > 0 && <span className="bg-[#6967FB]" style={{ flexGrow: known }} />}
              {learning > 0 && <span className="bg-[#B9B8F5]" style={{ flexGrow: learning }} />}
              {fresh > 0 && <span className="bg-[#E6E6EE]" style={{ flexGrow: fresh }} />}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] font-medium text-[#555]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {known > 0 && <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6967FB]" aria-hidden />{tpl(t.review.legendKnown, { n: known })}</li>}
              {learning > 0 && <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#B9B8F5]" aria-hidden />{tpl(t.review.legendLearning, { n: learning })}</li>}
              {fresh > 0 && <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D5D5E0]" aria-hidden />{tpl(t.review.legendNew, { n: fresh })}</li>}
            </ul>

            {words.length > 8 && (
              <label className="relative mt-5 block">
                <span className="sr-only">{t.review.search}</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A8A93]" strokeWidth={2.2} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.review.search}
                  enterKeyHint="search"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-12 w-full rounded-2xl bg-[#F5F5F8] pl-11 pr-4 text-base text-brilliant-text outline-none placeholder:text-[#8A8A93] focus-visible:ring-2 focus-visible:ring-[#6967FB] [&::-webkit-search-cancel-button]:appearance-none"
                />
              </label>
            )}

            {groups.length === 0 ? (
              <p className="mt-6 text-center text-[0.9375rem] text-[#555]">{t.review.noMatch}</p>
            ) : (
              groups.map((g) => (
                <div key={g.listId} className="mt-7">
                  <h3 className="text-[0.8125rem] font-semibold text-brilliant-muted">{g.title}</h3>
                  <ul className="mt-1">
                    {g.words.map((w) => <WordRow key={w.arabic} word={w} />)}
                  </ul>
                </div>
              ))
            )}
          </>
        )}
      </section>
    </div>
  );
}

function WordRow({ word }: { word: ReviewWord }) {
  const t = useT();
  const label = [t.review.strengthNew, t.review.strengthLearning, t.review.strengthHolding, t.review.strengthKnown][word.strength];
  return (
    <li className="flex min-h-[60px] items-center gap-3 py-1.5">
      {/* Fixed slot: a word without a recording keeps the row aligned */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center"><SpeakButton arabic={word.arabic} size="sm" /></span>
      <span className="flex w-[6.75rem] shrink-0 flex-col items-start">
        <bdi className="font-arabic text-[1.5rem] leading-[1.45] text-brilliant-text" dir="rtl" lang="ar">{word.arabic}</bdi>
        <span className="-mt-0.5 text-[0.8125rem] font-medium italic leading-tight text-[#6B6B76]" lang="ar-Latn">{transliterate(word.arabic)}</span>
      </span>
      <span className="min-w-0 flex-1 text-[0.9375rem] font-semibold leading-snug text-brilliant-text" style={{ overflowWrap: "break-word" }}>{word.meaning}</span>
      {/* Three rising bars: how well the word holds */}
      <span className="flex shrink-0 items-end gap-[3px]" role="img" aria-label={label} title={label}>
        {[1, 2, 3].map((n) => (
          <span key={n} className="w-[4px] rounded-full" style={{ height: 4 + n * 4, background: word.strength >= n ? "#6967FB" : "#E3E3EC" }} />
        ))}
      </span>
    </li>
  );
}

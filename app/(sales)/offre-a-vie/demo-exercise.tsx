"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";

import { Sparkle, Star } from "./doodles";

type Word = { id: string; ar: string; tr: string; fr: string };

const WORDS: Word[] = [
  { id: "allah", ar: "اللّٰه", tr: "Allāh", fr: "Dieu" },
  { id: "rabb", ar: "رَبّ", tr: "Rabb", fr: "Seigneur" },
  { id: "yawm", ar: "يَوْم", tr: "Yawm", fr: "Jour" },
  { id: "kitab", ar: "كِتاب", tr: "Kitāb", fr: "Livre" },
  { id: "rahma", ar: "رَحْمَة", tr: "Raḥma", fr: "Miséricorde" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DemoExercise() {
  const [step, setStep] = useState<"learn" | "match" | "done">("learn");

  // Stable shuffles for the matching step.
  const arabicCol = useMemo(() => shuffle(WORDS), []);
  const frCol = useMemo(() => shuffle(WORDS), []);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);

  const reset = () => {
    setSelected(null);
    setMatched(new Set());
    setWrongId(null);
    setStep("learn");
  };

  const onPickFr = (id: string) => {
    if (matched.has(id)) return;
    if (!selected) return;
    if (id === selected) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelected(null);
      if (next.size === WORDS.length) {
        setTimeout(() => setStep("done"), 450);
      }
    } else {
      setWrongId(id);
      setTimeout(() => setWrongId(null), 500);
      setSelected(null);
    }
  };

  return (
    <section className="bg-white border-t border-neutral-200/70">
      <div className="max-w-[920px] mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
            Essaie maintenant
          </p>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-neutral-950">
            Apprends ton premier mot, tout de suite
          </h2>
          <p className="mt-4 text-base text-neutral-600 max-w-[460px] mx-auto">
            Pas besoin de compte. Découvre les mots, puis relie-les à leur
            traduction — comme dans l&apos;application.
          </p>
        </div>

        <div className="relative flex min-h-[440px] flex-col justify-center rounded-[28px] border-2 border-neutral-900/10 bg-[#FAF8F3] p-5 sm:min-h-[460px] sm:p-8 overflow-hidden">
          <Sparkle className="absolute right-6 top-5 h-6 w-6 text-[#6967fb] hidden sm:block" />
          <Star className="absolute left-5 bottom-5 h-5 w-5 text-neutral-900/20 hidden sm:block" />

          {/* ── STEP 1: DISCOVER ─────────────────────────────────────── */}
          {step === "learn" && (
            <div className="relative">
              <p className="mb-5 text-center text-sm font-semibold text-neutral-500">
                Étape 1 — Découvre les mots
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {WORDS.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 text-center"
                  >
                    <p
                      dir="rtl"
                      className="font-arabic text-2xl sm:text-3xl text-neutral-950"
                    >
                      {w.ar}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">{w.tr}</p>
                    <p className="mt-2 font-display font-semibold text-neutral-800">
                      {w.fr}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center">
                <button
                  onClick={() => setStep("match")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-3.5 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
                >
                  Relier les mots
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: MATCH ────────────────────────────────────────── */}
          {step === "match" && (
            <div className="relative">
              <p className="mb-5 text-center text-sm font-semibold text-neutral-500">
                Étape 2 — Relie chaque mot à sa traduction ({matched.size}/
                {WORDS.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {/* Arabic column */}
                <div className="space-y-3">
                  {arabicCol.map((w) => {
                    const isMatched = matched.has(w.id);
                    const isSel = selected === w.id;
                    return (
                      <button
                        key={w.id}
                        disabled={isMatched}
                        onClick={() => !isMatched && setSelected(w.id)}
                        className={`flex w-full items-center justify-center rounded-2xl border-2 px-4 py-3 font-arabic text-2xl transition ${
                          isMatched
                            ? "border-[#58cc6a] bg-[#58cc6a]/10 text-[#58cc6a]"
                            : isSel
                              ? "border-[#6967fb] bg-[#6967fb]/10 text-neutral-950"
                              : "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300"
                        }`}
                      >
                        <span dir="rtl">{w.ar}</span>
                        {isMatched && (
                          <Check className="ml-2 h-4 w-4" strokeWidth={3} />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* French column */}
                <div className="space-y-3">
                  {frCol.map((w) => {
                    const isMatched = matched.has(w.id);
                    const isWrong = wrongId === w.id;
                    return (
                      <button
                        key={w.id}
                        disabled={isMatched}
                        onClick={() => onPickFr(w.id)}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-display text-base font-semibold transition ${
                          isMatched
                            ? "border-[#58cc6a] bg-[#58cc6a]/10 text-[#58cc6a]"
                            : isWrong
                              ? "border-rose-400 bg-rose-50 text-rose-500"
                              : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        {w.fr}
                        {isMatched && <Check className="h-4 w-4" strokeWidth={3} />}
                        {isWrong && <X className="h-4 w-4" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-5 text-center text-xs text-neutral-400">
                Touche un mot arabe, puis sa traduction.
              </p>
            </div>
          )}

          {/* ── STEP 3: DONE ─────────────────────────────────────────── */}
          {step === "done" && (
            <div className="relative flex flex-col items-center py-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#58cc6a] text-white">
                <Sparkles className="h-8 w-8" strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display font-bold text-2xl sm:text-3xl text-neutral-950">
                Bravo ! 🎉
              </h3>
              <p className="mt-3 max-w-[420px] text-base text-neutral-600">
                Tu viens d&apos;apprendre {WORDS.length} mots du Coran en moins
                d&apos;une minute. Il en reste des centaines à débloquer dans
                l&apos;application.
              </p>
              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
                <a
                  href="#offre"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-3.5 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0"
                >
                  Débloquer toutes les leçons
                </a>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Recommencer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

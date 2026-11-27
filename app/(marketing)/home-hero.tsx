"use client";

import Link from "next/link";
import { useState } from "react";

import { Bubble, KOJI_CROP, RiveAnim } from "@/app/(sales)/commencer/ui";
import { Choice, WordPrompt } from "@/app/lesson/exercises/choice";
import { fx } from "@/components/fx";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AFTER_ANSWER_MS, playWord } from "@/components/word-audio";
import { findInFatiha } from "@/lib/fatiha";
import { HOME_DEMO } from "@/lib/home-demo";

/** Where a new visitor goes: the guided start (first lesson, then the offer). */
const START = "/commencer";

/**
 * Home page of the site. Koji asks a question, the visitor answers it on a real exercise, and
 * the two ways in (new here, already a learner) sit under the headline. No stock picture: the
 * page shows the product itself.
 */
export function HomeHero() {
  return (
    <section className="mx-auto grid w-full max-w-[1040px] gap-10 lg:mb-auto px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-16 lg:py-14">
      <div className="mx-auto flex w-full max-w-[30rem] flex-col lg:mx-0 lg:pt-6">
        <div className="flex items-center gap-3">
          <div className="h-[88px] w-[88px] shrink-0 sm:h-[104px] sm:w-[104px]">
            <RiveAnim src="/animations/okok_clear.riv" animation="breath loop" crop={KOJI_CROP} />
          </div>
          <Bubble className="min-w-0">
            <p className="font-heading text-[1.0625rem] font-bold leading-snug text-brilliant-text">
              Tu récites ces mots.<br />Tu les comprends&nbsp;?
            </p>
          </Bubble>
        </div>

        <h1 className="mt-7 font-heading text-[2.375rem] font-extrabold leading-[1.06] text-brilliant-text sm:text-[3rem] lg:text-[3.5rem]" style={{ letterSpacing: "-0.025em", textWrap: "balance" as never }}>
          Comprends <span className="text-[#6967FB]">enfin</span> ce que tu récites.
        </h1>
        <p className="mt-4 max-w-[27rem] text-[1.0625rem] leading-relaxed text-[#555]" style={{ textWrap: "pretty" as never }}>
          Apprends les mots qui composent 85&nbsp;% du Coran, quelques minutes par jour, avec des leçons courtes et des exercices.
        </p>

        <div className="mt-7 flex w-full flex-col gap-3 sm:max-w-[22rem]">
          <Link href={START} prefetch>
            <ShinyButton as="span" variant="green" className="text-base">
              <span className="block py-1">Je suis nouveau</span>
            </ShinyButton>
          </Link>
          <Link
            href="/auth/login"
            className="flex h-[52px] select-none items-center justify-center rounded-2xl border-2 border-[#E0E0E0] bg-white text-base font-bold text-brilliant-text shadow-[0_4px_0_0_#D4D4D4] transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none"
          >
            Se connecter
          </Link>
        </div>
      </div>

      <TryCard />
    </section>
  );
}

/** One real exercise on a word of Al-Fatiha: answered in a tap, then shown in its verse. */
function TryCard() {
  const [picked, setPicked] = useState<string | null>(null);
  const judged = picked !== null;
  const right = picked === HOME_DEMO.answer;
  const found = findInFatiha(HOME_DEMO.arabic);

  const pick = (choice: string) => {
    if (judged) return;
    setPicked(choice);
    if (choice === HOME_DEMO.answer) fx.correct();
    else fx.wrong();
    // The word is read out once the answer is given, after its sound.
    window.setTimeout(() => { void playWord(HOME_DEMO.arabic); }, AFTER_ANSWER_MS);
  };

  return (
    <div className="mx-auto w-full max-w-[26rem] bg-white p-5 sm:p-6" style={{ borderRadius: 28, boxShadow: "0 0 0 1px #EDEDF3, 0 18px 40px -20px rgba(74,72,212,.4)" }}>
      <p className="text-[0.8125rem] font-semibold uppercase text-[#6967FB]" style={{ letterSpacing: "0.05em" }}>Essaie</p>
      <h2 className="mt-1 font-heading text-[1.375rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em" }}>Que veut dire ce mot&nbsp;?</h2>

      <WordPrompt arabic={HOME_DEMO.arabic} revealAids={judged} size="lg" className="mx-auto mt-5 !max-w-none" />

      <div className="mt-4 flex flex-col gap-2.5" role="group" aria-label="Réponses">
        {HOME_DEMO.choices.map((choice) => (
          <Choice key={choice} selected={picked === choice} status={judged ? (right ? "correct" : "wrong") : "none"} correct={choice === HOME_DEMO.answer} onClick={() => pick(choice)}>
            {choice}
          </Choice>
        ))}
      </div>

      {judged && (
        <div className="duration-300 animate-in fade-in slide-in-from-bottom-2" aria-live="polite">
          <div className="mt-5 flex items-center gap-3">
            <div className="h-14 w-14 shrink-0">
              <RiveAnim src="/animations/okok_clear.riv" animation={right ? "yup" : "breath loop"} crop={KOJI_CROP} />
            </div>
            <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-brilliant-text">
              <span className="font-bold">{right ? "Exact." : "C'est « Guide-nous »."}</span> Tu le dis à chaque prière&nbsp;:
            </p>
          </div>
          {found && (
            <div className="mt-3 rounded-2xl bg-[#F7F7FB] px-4 py-3.5 text-center">
              <p className="font-arabic text-[1.5rem] leading-[1.9] text-brilliant-text" dir="rtl" lang="ar">
                {found.words.map((w, i) => (
                  <span key={i} className={i === found.index ? "text-[#6967FB]" : undefined}>{w}{" "}</span>
                ))}
              </p>
              <p className="mt-1 text-[0.9375rem] leading-snug text-[#555]">{found.verse.fr}</p>
              <p className="mt-1.5 text-xs text-brilliant-muted">Al-Fatiha, verset {found.verse.n}</p>
            </div>
          )}
          <Link href={START} className="mt-4 block" prefetch>
            <ShinyButton as="span" variant="green" className="text-base">
              <span className="block py-1">Continuer ma première leçon</span>
            </ShinyButton>
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Check, Loader2, Lock, ShieldCheck } from "lucide-react";

import { OnboardingMascot } from "@/components/onboarding/onboarding-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { createAppLifetimeCheckoutUrl } from "@/actions/app-lifetime-checkout";
import { captureFunnelLead } from "@/actions/funnel-lead";
import type { FunnelContent } from "@/lib/funnel-content";
import { PaymentBadges } from "./payment-badges";

/**
 * "Funnel" landing variant for /offre-a-vie — a try-before-you-buy flow:
 *   1. Capture   — first name + email ("teste Quranlab gratuitement")
 *   2. Intro     — Koji welcomes the visitor by name
 *   3. Question  — one personalization question (kept short for conversion)
 *   4. Exercise  — one easy QCM: the visitor learns their first word (the win)
 *   5. Offer     — present the lifetime app + bonuses, then Stripe Checkout
 * After payment the existing /offre-a-vie/merci → /auth/signup → premium flow
 * takes over (the email + first name are carried through to pre-fill signup).
 *
 * All copy comes from the admin-editable FunnelContent; the price/labels are
 * resolved server-side (the independent "funnel" price) and passed in.
 */

const STEPS = ["capture", "intro", "question", "exercise", "offer"] as const;
type StepKey = (typeof STEPS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = "funnel_lead_v1";

/** Replaces {name}; when the name is empty, also drops the leading space. */
function fillName(str: string, name: string): string {
  return name
    ? str.replace(/\{name\}/g, name)
    : str.replace(/\s*\{name\}/g, "");
}

type FunnelProps = {
  content: FunnelContent;
  /** Which funnel version's price to charge at checkout. */
  checkoutVariant: "funnel" | "funnelB";
  /** Price in major units (e.g. 14.97) for the TikTok conversion value. */
  priceValue: number;
  /** Formatted current price, e.g. "14,97 €". */
  priceLabel: string;
  /** Formatted struck-through compare-at price, or null when not higher. */
  compareLabel: string | null;
  /** Payment-method badges to show under the CTA. */
  paymentBadges: string[];
  /**
   * Full product sales page (server-rendered) shown as the paywall body, below
   * the funnel offer title — V3 for funnel A, V4 for funnel B. When provided it
   * replaces the simple offer card.
   */
  offerSlot?: React.ReactNode;
};

type ExOption = { id: string; label: string; correct: boolean };

function shuffledOptions(correct: string, distractors: string[]): ExOption[] {
  const opts: ExOption[] = [
    { id: "correct", label: correct, correct: true },
    ...distractors.map((d, i) => ({ id: `d${i}`, label: d, correct: false })),
  ];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

export function FunnelLanding({
  content,
  checkoutVariant,
  priceValue,
  priceLabel,
  compareLabel,
  paymentBadges,
  offerSlot,
}: FunnelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step: StepKey = STEPS[stepIndex];

  // Capture
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Mascot / question
  const [okokReplayKey, setOkokReplayKey] = useState(0);
  const [focusAnswer, setFocusAnswer] = useState<number | null>(null);

  // Exercise — the enabled items form a short mini-lesson the visitor plays
  // through, one word at a time. Options are shuffled once per item.
  const items = useMemo(
    () =>
      content.exercise.items.filter(
        (i) => i.enabled && i.arabicWord.trim() && i.correct.trim(),
      ),
    [content.exercise.items],
  );
  const itemsOptions = useMemo(
    () => items.map((it) => shuffledOptions(it.correct, it.distractors)),
    [items],
  );
  const [exIndex, setExIndex] = useState(0);
  const [exPicked, setExPicked] = useState<string | null>(null);
  const [allSolved, setAllSolved] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  const currentOptions = itemsOptions[exIndex] ?? [];
  const currentSolved =
    exPicked != null &&
    currentOptions.find((o) => o.id === exPicked)?.correct === true;

  // Offer / checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fire the funnel view once, and restore any prior capture from this tab.
  useEffect(() => {
    track("funnel_view");
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw) as { firstName?: string; email?: string };
        if (v.firstName) setFirstName(v.firstName);
        if (v.email) setEmail(v.email);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }, []);
  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // ----- Step 1: capture -----
  const submitCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      setEmailError("Entre une adresse e-mail valide.");
      return;
    }
    setEmailError(null);
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ firstName: firstName.trim(), email: cleanEmail }),
      );
    } catch {
      /* ignore */
    }
    track("funnel_lead");
    void captureFunnelLead({
      email: cleanEmail,
      firstName: firstName.trim(),
      locale: "fr",
      stage: "lead",
    });
    goNext();
  };

  // ----- Step 3: question -----
  const pickFocus = (idx: number) => {
    setFocusAnswer(idx);
    setOkokReplayKey((k) => k + 1);
  };

  // ----- Step 4: exercise (mini-lesson) -----
  const pickAnswer = (id: string) => {
    if (currentSolved || allSolved) return; // can't re-answer a solved item
    setExPicked(id);
    const correct = currentOptions.find((o) => o.id === id)?.correct === true;
    try {
      const a = new Audio(correct ? "/correct.wav" : "/incorrect.wav");
      a.volume = correct ? 0.6 : 0.5;
      void a.play();
    } catch {
      /* ignore */
    }
    if (!correct) return; // wrong: keep the step open so they can retry
    setOkokReplayKey((k) => k + 1);
    const isLast = exIndex >= items.length - 1;
    if (isLast) {
      setAllSolved(true);
      track("funnel_exercise_done");
    } else {
      // Brief beat on the correct answer, then advance to the next word.
      advanceTimer.current = setTimeout(() => {
        setExIndex((i) => i + 1);
        setExPicked(null);
      }, 700);
    }
  };

  // Record progress as the visitor advances into exercise / offer.
  useEffect(() => {
    if (step === "exercise") {
      void captureFunnelLead({ email, firstName, locale: "fr", stage: "exercise" });
    }
    if (step === "offer") {
      track("funnel_offer_view");
      void captureFunnelLead({ email, firstName, locale: "fr", stage: "offer" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ----- Step 5: checkout -----
  const startCheckout = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    track("funnel_checkout_start");
    void captureFunnelLead({ email, firstName, locale: "fr", stage: "checkout" });
    ttqTrack("InitiateCheckout", {
      value: priceValue,
      currency: "EUR",
      content_id: "app_lifetime",
      content_name: "Quranlab — Accès à vie",
      content_category: "app",
    });
    try {
      const res = await createAppLifetimeCheckoutUrl("fr", checkoutVariant, {
        email,
        firstName,
      });
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setCheckoutError(res.error || "Le paiement n'a pas pu démarrer. Réessaie.");
    } catch (e: any) {
      setCheckoutError(e?.message || "Erreur inconnue.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const name = firstName.trim();

  return (
    <main className="relative flex min-h-[100dvh] flex-col bg-white text-neutral-900">
      {/* Header: back + progress */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={goBack}
          className={cn(
            "-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-opacity",
            stepIndex === 0 && "pointer-events-none opacity-0",
          )}
          aria-label="Retour"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#6967fb] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {step === "capture" && (
        <CaptureStep
          c={content.capture}
          firstName={firstName}
          email={email}
          emailError={emailError}
          onFirstName={setFirstName}
          onEmail={(v) => {
            setEmail(v);
            if (emailError) setEmailError(null);
          }}
          onSubmit={submitCapture}
        />
      )}

      {step === "intro" && (
        <IntroStep c={content.intro} name={name} onContinue={goNext} />
      )}

      {step === "question" && (
        <QuestionStep
          c={content.question}
          answer={focusAnswer}
          replayKey={okokReplayKey}
          onPick={pickFocus}
          onContinue={goNext}
        />
      )}

      {step === "exercise" && (
        <ExerciseStep
          c={content.exercise}
          name={name}
          arabicWord={items[exIndex]?.arabicWord ?? ""}
          options={currentOptions}
          picked={exPicked}
          stepLabel={items.length > 1 ? `Mot ${Math.min(exIndex + 1, items.length)}/${items.length}` : null}
          allSolved={allSolved || items.length === 0}
          replayKey={okokReplayKey}
          onPick={pickAnswer}
          onContinue={goNext}
        />
      )}

      {step === "offer" && (
        <OfferStep
          c={content.offer}
          name={name}
          priceLabel={priceLabel}
          compareLabel={compareLabel}
          paymentBadges={paymentBadges}
          loading={checkoutLoading}
          error={checkoutError}
          onBuy={startCheckout}
          offerSlot={offerSlot}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                       */
/* -------------------------------------------------------------------------- */

function CaptureStep({
  c,
  firstName,
  email,
  emailError,
  onFirstName,
  onEmail,
  onSubmit,
}: {
  c: FunnelContent["capture"];
  firstName: string;
  email: string;
  emailError: string | null;
  onFirstName: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center px-6 pb-8 pt-2">
      <div className="mx-auto h-44 w-44 sm:h-52 sm:w-52">
        <OnboardingMascot phase="intro" />
      </div>
      <h1 className="mt-2 max-w-[22rem] text-center font-display text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
        {c.title}
      </h1>
      <p className="mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
        {c.subtitle}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-7 flex w-full max-w-sm flex-1 flex-col"
      >
        <label className="text-sm font-semibold text-neutral-700" htmlFor="fn">
          {c.firstNameLabel}
        </label>
        <input
          id="fn"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => onFirstName(e.target.value)}
          placeholder={c.firstNamePlaceholder}
          required
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none focus:border-[#6967fb] focus:ring-2 focus:ring-[#6967fb]/30"
        />

        <label
          className="mt-4 text-sm font-semibold text-neutral-700"
          htmlFor="em"
        >
          {c.emailLabel}
        </label>
        <input
          id="em"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder={c.emailPlaceholder}
          required
          className={cn(
            "mt-1 w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2",
            emailError
              ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200"
              : "border-neutral-300 focus:border-[#6967fb] focus:ring-[#6967fb]/30",
          )}
        />
        {emailError && (
          <p className="mt-1.5 text-xs font-medium text-rose-500">
            {emailError}
          </p>
        )}

        <div className="mt-auto pt-8">
          <ShinyButton type="submit" variant="dark">
            {c.cta}
          </ShinyButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <Lock className="h-3 w-3" strokeWidth={1.5} />
            {c.reassurance}
          </p>
        </div>
      </form>
    </section>
  );
}

function IntroStep({
  c,
  name,
  onContinue,
}: {
  c: FunnelContent["intro"];
  name: string;
  onContinue: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center px-6 pb-8 pt-6">
      <div className="mx-auto h-52 w-52 sm:h-60 sm:w-60">
        <OnboardingMascot phase="intro" />
      </div>
      <h1 className="mt-4 max-w-[24rem] whitespace-pre-line text-center font-display text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
        {fillName(c.greeting, name)}
      </h1>
      <p className="mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
        {c.subtitle}
      </p>
      <div className="mt-auto w-full max-w-sm pt-8">
        <ShinyButton variant="dark" onClick={onContinue}>
          {c.cta}
        </ShinyButton>
      </div>
    </section>
  );
}

function QuestionStep({
  c,
  answer,
  replayKey,
  onPick,
  onContinue,
}: {
  c: FunnelContent["question"];
  answer: number | null;
  replayKey: number;
  onPick: (idx: number) => void;
  onContinue: () => void;
}) {
  const selected = answer != null ? c.options[answer] : undefined;
  return (
    <section className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <OnboardingMascot phase="question" replayKey={replayKey} />
        </div>
        <h1 className="font-heading text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
          {selected ? selected.response : c.title}
        </h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {c.options.map((o, idx) => {
          const isSel = answer === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPick(idx)}
              className={cn(
                "rounded-2xl border-2 px-5 py-3.5 text-left text-sm font-semibold transition",
                isSel
                  ? "border-[#6967fb] bg-[#f0f0ff] text-[#4a48c4]"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-[#6967fb]/40",
              )}
              style={{ boxShadow: isSel ? "none" : "0 3px 0 0 #ededed" }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto w-full max-w-sm self-center pt-8">
        <ShinyButton
          variant={answer != null ? "dark" : "gray"}
          onClick={onContinue}
          disabled={answer == null}
        >
          Continuer
        </ShinyButton>
      </div>
    </section>
  );
}

function ExerciseStep({
  c,
  name,
  arabicWord,
  options,
  picked,
  stepLabel,
  allSolved,
  replayKey,
  onPick,
  onContinue,
}: {
  c: FunnelContent["exercise"];
  name: string;
  arabicWord: string;
  options: ExOption[];
  picked: string | null;
  stepLabel: string | null;
  allSolved: boolean;
  replayKey: number;
  onPick: (id: string) => void;
  onContinue: () => void;
}) {
  // Is the current word answered correctly (locks the buttons + shows reveal)?
  const currentSolved =
    picked != null && options.find((o) => o.id === picked)?.correct === true;
  const locked = currentSolved || allSolved;

  return (
    <section className="flex flex-1 flex-col items-center px-6 pb-8 pt-4">
      <div className="flex items-center gap-2">
        <div className="h-20 w-20 sm:h-24 sm:w-24">
          <OnboardingMascot phase="question" replayKey={replayKey} />
        </div>
        <p className="font-heading text-base font-bold text-neutral-900 sm:text-lg">
          {allSolved ? fillName(c.successText, name) : c.prompt}
        </p>
      </div>

      {!allSolved && (
        <>
          {stepLabel && (
            <span className="mt-3 rounded-full bg-[#6967fb]/10 px-3 py-1 text-xs font-bold text-[#6967fb]">
              {stepLabel}
            </span>
          )}

          {/* Arabic word card */}
          <div
            className="mt-4 flex w-full max-w-[300px] items-center justify-center rounded-2xl border-2 border-[#E0E0E0] bg-white p-6"
            style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
          >
            <span
              className="font-arabic text-4xl text-neutral-900 sm:text-5xl"
              dir="rtl"
            >
              {arabicWord}
            </span>
          </div>

          {/* Options */}
          <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-2.5">
            {options.map((o) => {
              const isPicked = picked === o.id;
              const revealCorrect = currentSolved && o.correct;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onPick(o.id)}
                  disabled={locked}
                  className={cn(
                    "h-14 rounded-2xl border-2 px-4 text-base font-semibold transition",
                    isPicked && o.correct &&
                      "border-brilliant-green bg-brilliant-success text-brilliant-green",
                    isPicked && !o.correct &&
                      "border-rose-400 bg-rose-50 text-rose-600",
                    !isPicked && revealCorrect &&
                      "border-brilliant-green bg-brilliant-success text-brilliant-green",
                    !isPicked && !revealCorrect &&
                      "border-[#E0E0E0] bg-white text-neutral-800 hover:border-[#6967fb]/40",
                    currentSolved && !o.correct && !isPicked && "opacity-40",
                  )}
                  style={{
                    boxShadow:
                      isPicked || revealCorrect ? "none" : "0 4px 0 0 #D4D4D4",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {picked && !currentSolved && (
            <p className="mt-4 text-sm font-medium text-rose-500">{c.retryText}</p>
          )}
        </>
      )}

      <div className="mt-auto w-full max-w-sm pt-8">
        <ShinyButton
          variant={allSolved ? "green" : "gray"}
          onClick={onContinue}
          disabled={!allSolved}
        >
          {c.cta}
        </ShinyButton>
      </div>
    </section>
  );
}

function OfferStep({
  c,
  name,
  priceLabel,
  compareLabel,
  paymentBadges,
  loading,
  error,
  onBuy,
  offerSlot,
}: {
  c: FunnelContent["offer"];
  name: string;
  priceLabel: string;
  compareLabel: string | null;
  paymentBadges: string[];
  loading: boolean;
  error: string | null;
  onBuy: () => void;
  offerSlot?: React.ReactNode;
}) {
  return (
    <section className="flex flex-1 flex-col">
      {/* Header: Koji congratulates + the paywall title */}
      <div className="flex flex-col items-center px-5 pb-2 pt-4 text-center">
        <div className="h-24 w-24 sm:h-28 sm:w-28">
          <OnboardingMascot phase="question" replayKey={1} />
        </div>
        <p className="text-sm font-semibold text-[#6967fb]">
          {fillName(c.kicker, name)}
        </p>
        <h1 className="mt-2 max-w-[26rem] font-display text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
          {c.title}
        </h1>
        <p className="mt-2 max-w-[24rem] text-sm leading-relaxed text-neutral-600">
          {c.subtitle}
        </p>
      </div>

      {/* Paywall body: the full product sales page (V3 for A, V4 for B). */}
      {offerSlot ? (
        <div className="mt-4 w-full">{offerSlot}</div>
      ) : (
        /* Fallback simple offer card (only if no product page was provided) */
        <div className="flex flex-col items-center px-5 pb-10">
          <div className="mt-4 w-full max-w-md rounded-3xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-6">
            <div className="flex items-baseline justify-center gap-2">
              {compareLabel && (
                <span className="font-display text-2xl text-neutral-400 line-through">
                  {compareLabel}
                </span>
              )}
              <span className="font-display text-5xl font-bold tracking-tight text-neutral-950">
                {priceLabel}
              </span>
              <span className="text-sm text-neutral-500">{c.priceSuffix}</span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {c.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#58cc6a]" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onBuy}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-[#4a48c4] bg-[#6967fb] px-8 py-4 font-display text-base font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:brightness-[1.05] active:translate-y-1 active:border-b-0 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Redirection…" : c.cta}
            </button>

            {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              {c.guarantee}
            </p>
            <PaymentBadges badges={paymentBadges} className="mt-3" />
          </div>
        </div>
      )}
    </section>
  );
}

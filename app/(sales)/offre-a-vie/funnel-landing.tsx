"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Check, Loader2, Lock, ShieldCheck } from "lucide-react";

import { OnboardingMascot } from "@/components/onboarding/onboarding-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { createAppLifetimeCheckoutUrl } from "@/actions/app-lifetime-checkout";
import { captureFunnelLead } from "@/actions/funnel-lead";
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
 * No auth, no DB on the client: the lead is recorded via a server action and
 * the price/labels are resolved server-side and passed in as plain props.
 */

const STEPS = ["capture", "intro", "question", "exercise", "offer"] as const;
type StepKey = (typeof STEPS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = "funnel_lead_v1";

type FunnelProps = {
  /** Price in major units (e.g. 14.97) for the TikTok conversion value. */
  priceValue: number;
  /** Formatted current price, e.g. "14,97 €". */
  priceLabel: string;
  /** Formatted struck-through compare-at price, or null when not higher. */
  compareLabel: string | null;
  /** Payment-method badges to show under the CTA. */
  paymentBadges: string[];
};

/** The single easy exercise — a 3-option QCM. The first option is correct. */
const EXERCISE = {
  arabicWord: "رَبّ",
  prompt: "Que signifie ce mot ?",
  options: [
    { id: "seigneur", label: "Seigneur", correct: true },
    { id: "puissant", label: "Le Tout-Puissant", correct: false },
    { id: "misericordieux", label: "Le Miséricordieux", correct: false },
  ],
};

const QUESTION = {
  title: "Pourquoi veux-tu apprendre les mots du Coran ?",
  options: [
    { id: "prayer", label: "Comprendre le sens pendant la prière", response: "Magnifique, chaque mot prendra vie !" },
    { id: "read", label: "Lire le Coran sans traduction", response: "Bravo, un objectif puissant !" },
    { id: "faith", label: "Approfondir ma foi", response: "Superbe intention, on avance ensemble." },
    { id: "vocab", label: "Enrichir mon vocabulaire arabe", response: "Excellent, on construit mot à mot !" },
  ],
};

export function FunnelLanding({
  priceValue,
  priceLabel,
  compareLabel,
  paymentBadges,
}: FunnelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step: StepKey = STEPS[stepIndex];

  // Capture
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Mascot / question
  const [okokReplayKey, setOkokReplayKey] = useState(0);
  const [focusAnswer, setFocusAnswer] = useState<string | null>(null);

  // Exercise
  const [picked, setPicked] = useState<string | null>(null);
  const exerciseSolved = picked
    ? EXERCISE.options.find((o) => o.id === picked)?.correct === true
    : false;

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
  const pickFocus = (id: string) => {
    setFocusAnswer(id);
    setOkokReplayKey((k) => k + 1);
  };

  // ----- Step 4: exercise -----
  const pickAnswer = (id: string) => {
    if (exerciseSolved) return; // locked once solved
    setPicked(id);
    const correct = EXERCISE.options.find((o) => o.id === id)?.correct === true;
    if (correct) {
      setOkokReplayKey((k) => k + 1);
      track("funnel_exercise_done");
      try {
        const a = new Audio("/correct.wav");
        a.volume = 0.6;
        void a.play();
      } catch {
        /* ignore */
      }
    } else {
      try {
        const a = new Audio("/incorrect.wav");
        a.volume = 0.5;
        void a.play();
      } catch {
        /* ignore */
      }
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
      const res = await createAppLifetimeCheckoutUrl("fr", "v3", {
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
  const firstNameNbsp = firstName.trim();

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
        <IntroStep firstName={firstNameNbsp} onContinue={goNext} />
      )}

      {step === "question" && (
        <QuestionStep
          answer={focusAnswer}
          replayKey={okokReplayKey}
          onPick={pickFocus}
          onContinue={goNext}
        />
      )}

      {step === "exercise" && (
        <ExerciseStep
          firstName={firstNameNbsp}
          picked={picked}
          solved={exerciseSolved}
          replayKey={okokReplayKey}
          onPick={pickAnswer}
          onContinue={goNext}
        />
      )}

      {step === "offer" && (
        <OfferStep
          firstName={firstNameNbsp}
          priceLabel={priceLabel}
          compareLabel={compareLabel}
          paymentBadges={paymentBadges}
          loading={checkoutLoading}
          error={checkoutError}
          onBuy={startCheckout}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                       */
/* -------------------------------------------------------------------------- */

function CaptureStep({
  firstName,
  email,
  emailError,
  onFirstName,
  onEmail,
  onSubmit,
}: {
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
        Teste Quranlab gratuitement
      </h1>
      <p className="mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
        Apprends ton premier mot du Coran en 30 secondes. Sans carte bancaire,
        sans engagement.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-7 flex w-full max-w-sm flex-1 flex-col"
      >
        <label className="text-sm font-semibold text-neutral-700" htmlFor="fn">
          Ton prénom
        </label>
        <input
          id="fn"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => onFirstName(e.target.value)}
          placeholder="Yusuf"
          required
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none focus:border-[#6967fb] focus:ring-2 focus:ring-[#6967fb]/30"
        />

        <label
          className="mt-4 text-sm font-semibold text-neutral-700"
          htmlFor="em"
        >
          Ton e-mail
        </label>
        <input
          id="em"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          placeholder="toi@exemple.com"
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
            Commencer gratuitement
          </ShinyButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <Lock className="h-3 w-3" strokeWidth={1.5} />
            Aucune carte demandée · Tu peux arrêter quand tu veux
          </p>
        </div>
      </form>
    </section>
  );
}

function IntroStep({
  firstName,
  onContinue,
}: {
  firstName: string;
  onContinue: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center px-6 pb-8 pt-6">
      <div className="mx-auto h-52 w-52 sm:h-60 sm:w-60">
        <OnboardingMascot phase="intro" />
      </div>
      <h1 className="mt-4 max-w-[24rem] text-center font-display text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
        {firstName
          ? `Salam alaykoum ${firstName} !`
          : "Salam alaykoum !"}
        <br />
        Je suis Koji.
      </h1>
      <p className="mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
        Je vais te faire apprendre ton tout premier mot du Coran, tout de suite.
        Prêt(e) ?
      </p>
      <div className="mt-auto w-full max-w-sm pt-8">
        <ShinyButton variant="dark" onClick={onContinue}>
          C&apos;est parti
        </ShinyButton>
      </div>
    </section>
  );
}

function QuestionStep({
  answer,
  replayKey,
  onPick,
  onContinue,
}: {
  answer: string | null;
  replayKey: number;
  onPick: (id: string) => void;
  onContinue: () => void;
}) {
  const selected = QUESTION.options.find((o) => o.id === answer);
  return (
    <section className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <OnboardingMascot phase="question" replayKey={replayKey} />
        </div>
        <h1 className="font-heading text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
          {selected ? selected.response : QUESTION.title}
        </h1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {QUESTION.options.map((o) => {
          const isSel = answer === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
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
          variant={answer ? "dark" : "gray"}
          onClick={onContinue}
          disabled={!answer}
        >
          Continuer
        </ShinyButton>
      </div>
    </section>
  );
}

function ExerciseStep({
  firstName,
  picked,
  solved,
  replayKey,
  onPick,
  onContinue,
}: {
  firstName: string;
  picked: string | null;
  solved: boolean;
  replayKey: number;
  onPick: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center px-6 pb-8 pt-4">
      <div className="flex items-center gap-2">
        <div className="h-20 w-20 sm:h-24 sm:w-24">
          <OnboardingMascot phase="question" replayKey={replayKey} />
        </div>
        <p className="font-heading text-base font-bold text-neutral-900 sm:text-lg">
          {solved
            ? `Bravo${firstName ? " " + firstName : ""} ! Premier mot appris 🎉`
            : EXERCISE.prompt}
        </p>
      </div>

      {/* Arabic word card */}
      <div
        className="mt-6 flex w-full max-w-[300px] items-center justify-center rounded-2xl border-2 border-[#E0E0E0] bg-white p-6"
        style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
      >
        <span
          className="font-arabic text-4xl text-neutral-900 sm:text-5xl"
          dir="rtl"
        >
          {EXERCISE.arabicWord}
        </span>
      </div>

      {/* Options */}
      <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-2.5">
        {EXERCISE.options.map((o) => {
          const isPicked = picked === o.id;
          const revealCorrect = solved && o.correct;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onPick(o.id)}
              disabled={solved}
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
                solved && !o.correct && !isPicked && "opacity-40",
              )}
              style={{
                boxShadow:
                  isPicked || (solved && o.correct) ? "none" : "0 4px 0 0 #D4D4D4",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {picked && !solved && (
        <p className="mt-4 text-sm font-medium text-rose-500">
          Presque ! Réessaie 👇
        </p>
      )}

      <div className="mt-auto w-full max-w-sm pt-8">
        <ShinyButton
          variant={solved ? "green" : "gray"}
          onClick={onContinue}
          disabled={!solved}
        >
          Continuer
        </ShinyButton>
      </div>
    </section>
  );
}

const OFFER_FEATURES = [
  "Accès à vie à toute l'application (tous les mots, tous les exercices)",
  "L'ebook « 85% des mots du Coran » en PDF",
  "3 bonus offerts pour accélérer ta progression",
  "Paiement unique — aucun abonnement",
];

function OfferStep({
  firstName,
  priceLabel,
  compareLabel,
  paymentBadges,
  loading,
  error,
  onBuy,
}: {
  firstName: string;
  priceLabel: string;
  compareLabel: string | null;
  paymentBadges: string[];
  loading: boolean;
  error: string | null;
  onBuy: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center px-5 pb-10 pt-4">
      <div className="h-24 w-24 sm:h-28 sm:w-28">
        <OnboardingMascot phase="question" replayKey={1} />
      </div>
      <p className="text-center text-sm font-semibold text-[#6967fb]">
        {firstName ? `Bravo ${firstName}, tu apprends vite !` : "Bravo, tu apprends vite !"}
      </p>
      <h1 className="mt-2 max-w-[26rem] text-center font-display text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
        Débloque toute l&apos;application Quranlab à vie
      </h1>
      <p className="mt-2 max-w-[24rem] text-center text-sm leading-relaxed text-neutral-600">
        Tu viens d&apos;apprendre 1 mot. L&apos;application t&apos;en fait
        apprendre des centaines, avec une méthode qui rend tout évident.
      </p>

      {/* Offer card */}
      <div className="mt-6 w-full max-w-md rounded-3xl border-2 border-neutral-900/10 bg-[#FAF8F3] p-6">
        <div className="flex items-baseline justify-center gap-2">
          {compareLabel && (
            <span className="font-display text-2xl text-neutral-400 line-through">
              {compareLabel}
            </span>
          )}
          <span className="font-display text-5xl font-bold tracking-tight text-neutral-950">
            {priceLabel}
          </span>
          <span className="text-sm text-neutral-500">une fois</span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {OFFER_FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-neutral-700"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#58cc6a]"
                strokeWidth={3}
              />
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
          {loading ? "Redirection…" : "Obtenir l'accès à vie"}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-rose-500">{error}</p>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
          Paiement sécurisé · Garantie satisfait ou remboursé 30 jours
        </p>
        <PaymentBadges badges={paymentBadges} className="mt-3" />
      </div>
    </section>
  );
}

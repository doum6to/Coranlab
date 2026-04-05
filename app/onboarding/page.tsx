"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { OnboardingMascot } from "@/components/onboarding/onboarding-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";

type IntroStep = {
  kind: "intro";
  title: string;
};

type QuestionStep = {
  kind: "question";
  id: string;
  title: string;
  /** Title shown once an option has been selected. */
  afterTitle: string;
  options: { id: string; label: string }[];
};

type Step = IntroStep | QuestionStep;

const STEPS: Step[] = [
  {
    kind: "intro",
    title: "Salam, je suis Koji !",
  },
  {
    kind: "intro",
    title: "Créons un parcours d'apprentissage rien que pour toi.",
  },
  {
    kind: "question",
    id: "focus",
    title: "Sur quoi veux-tu te concentrer ?",
    afterTitle: "Excellent choix, on s'y met !",
    options: [
      { id: "vocab", label: "Apprendre le vocabulaire du Coran" },
      { id: "memorize", label: "Mémoriser des sourates" },
      { id: "arabic", label: "Comprendre l'arabe" },
      { id: "basics", label: "Revoir les bases" },
      { id: "other", label: "Autre chose" },
    ],
  },
  {
    kind: "question",
    id: "time",
    title: "Combien de temps par jour ?",
    afterTitle: "Objectif noté, on va y arriver !",
    options: [
      { id: "5", label: "5 minutes par jour" },
      { id: "10", label: "10 minutes par jour" },
      { id: "15", label: "15 minutes par jour" },
      { id: "20", label: "20 minutes ou plus par jour" },
    ],
  },
  {
    kind: "intro",
    title: "Tout est prêt ! Créons ton compte.",
  },
];

const STORAGE_ANSWERS_KEY = "onboarding_answers";

const OnboardingPage = () => {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  /** Flips to true 1.36s after the mascot animation actually starts
   *  playing (not when React mounts — the .riv file may still be
   *  loading). Used to swap the greeting from "Salam, je suis Koji !"
   *  to "Créons ensemble ton parcours !" in sync with the beat. */
  const [greetingBeat, setGreetingBeat] = useState(false);
  const greetingBeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const step = STEPS[stepIndex];
  const isIntro = step.kind === "intro";
  const isLastStep = stepIndex === STEPS.length - 1;

  const currentAnswer = !isIntro ? answers[step.id] : undefined;

  const canContinue = isIntro || !!currentAnswer;

  // Reset the greeting title whenever the user leaves step 0. The
  // timer itself is armed by the mascot's onPlayStart callback so
  // it stays in sync with the real animation start.
  useEffect(() => {
    if (stepIndex !== 0) {
      setGreetingBeat(false);
      if (greetingBeatTimerRef.current) {
        clearTimeout(greetingBeatTimerRef.current);
        greetingBeatTimerRef.current = null;
      }
    }
  }, [stepIndex]);

  // Clean up any pending timer on unmount.
  useEffect(() => {
    return () => {
      if (greetingBeatTimerRef.current) {
        clearTimeout(greetingBeatTimerRef.current);
      }
    };
  }, []);

  const handleMascotPlayStart = useCallback(() => {
    // Only arm the beat timer during the first intro step, and only
    // the first time the animation starts (ignore re-triggers from
    // HMR or subsequent Rive Advance events).
    if (stepIndex !== 0) return;
    if (greetingBeatTimerRef.current) return;
    greetingBeatTimerRef.current = setTimeout(() => {
      setGreetingBeat(true);
      greetingBeatTimerRef.current = null;
    }, 1500);
  }, [stepIndex]);

  const title = useMemo(() => {
    if (isIntro) {
      if (stepIndex === 0 && greetingBeat) {
        return "Créons ensemble un parcours d'apprentissage personnalisé.";
      }
      return step.title;
    }
    return currentAnswer ? step.afterTitle : step.title;
  }, [step, isIntro, currentAnswer, stepIndex, greetingBeat]);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (isLastStep) {
      try {
        sessionStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(answers));
      } catch {
        /* ignore */
      }
      router.push("/auth/signup");
      return;
    }

    setStepIndex((i) => i + 1);
  };

  const handleSelectOption = (optionId: string) => {
    if (isIntro) return;
    setAnswers((prev) => ({ ...prev, [step.id]: optionId }));
  };

  return (
    <main className="relative flex h-[100dvh] flex-col bg-white">
      {/* Header: back button + progress bar */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            "-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-brilliant-muted transition-opacity",
            stepIndex === 0 && "pointer-events-none opacity-0"
          )}
          aria-label="Retour"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#6967fb] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main content zone — mascot + title (absolute layout so the
          mascot component stays mounted across step transitions and
          its Rive instance is preserved). */}
      <section className="relative flex-1">
        {/* Mascot — position & size animate based on step kind */}
        <div
          className={cn(
            "absolute transition-all duration-500 ease-out",
            isIntro
              ? "left-1/2 top-[34%] h-32 w-32 -translate-x-1/2 sm:h-36 sm:w-36"
              : "left-6 top-4 h-14 w-14 sm:h-16 sm:w-16"
          )}
        >
          <OnboardingMascot onPlayStart={handleMascotPlayStart} />
        </div>

        {/* Title — position & size animate with the mascot */}
        <h1
          className={cn(
            "absolute font-heading font-bold text-brilliant-text transition-all duration-500 ease-out",
            isIntro
              ? "left-0 right-0 top-[calc(34%+9rem)] px-6 text-center text-lg leading-snug sm:top-[calc(34%+10rem)] sm:text-xl"
              : "left-24 right-6 top-6 text-lg leading-snug sm:left-28 sm:text-xl"
          )}
        >
          {title}
        </h1>

        {/* Options (only for question steps) */}
        {!isIntro && (
          <div className="absolute inset-x-0 top-32 space-y-3 px-6 sm:top-36">
            {step.options.map((option) => {
              const selected = currentAnswer === option.id;
              const hasSelection = !!currentAnswer;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "w-full rounded-full px-5 py-3 text-left text-sm font-bold transition-all duration-200",
                    "active:scale-[0.98]",
                    selected &&
                      "bg-gradient-to-r from-[#f0f0ff] to-[#d9bbff] text-brilliant-text shadow-[0_2px_0_0_#c8c7f0]",
                    !selected &&
                      hasSelection &&
                      "bg-gray-100 text-brilliant-muted",
                    !selected &&
                      !hasSelection &&
                      "bg-gray-100 text-brilliant-text hover:bg-gray-200"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer: continue button */}
      <footer className="px-6 pb-6 pt-2">
        <div className="mx-auto w-full max-w-sm">
          <ShinyButton
            variant={canContinue ? "dark" : "gray"}
            onClick={handleContinue}
            disabled={!canContinue}
          >
            {isLastStep ? "Créer mon compte" : "Continuer"}
          </ShinyButton>
        </div>
      </footer>
    </main>
  );
};

export default OnboardingPage;

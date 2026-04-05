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

type QuestionOption = {
  id: string;
  label: string;
  /** Personal response shown when this specific option is selected, so
   *  the user feels spoken to directly. */
  response: string;
};

type QuestionStep = {
  kind: "question";
  id: string;
  title: string;
  options: QuestionOption[];
};

type Step = IntroStep | QuestionStep;

const STEPS: Step[] = [
  {
    kind: "intro",
    title: "Salam, je suis Koji !",
  },
  {
    kind: "question",
    id: "focus",
    title: "Sur quoi veux-tu te concentrer ?",
    options: [
      {
        id: "vocab",
        label: "Apprendre le vocabulaire du Coran",
        response: "Excellent choix, on s'y met !",
      },
      {
        id: "memorize",
        label: "Mémoriser des sourates",
        response: "Superbe objectif, allons-y !",
      },
      {
        id: "arabic",
        label: "Comprendre l'arabe",
        response: "Bravo, pas à pas ensemble.",
      },
      {
        id: "basics",
        label: "Revoir les bases",
        response: "Très bien, on repart en douceur.",
      },
      {
        id: "other",
        label: "Autre chose",
        response: "Pas de souci, on s'adapte.",
      },
    ],
  },
  {
    kind: "question",
    id: "time",
    title: "Combien de temps par jour ?",
    options: [
      {
        id: "5",
        label: "5 minutes par jour",
        response: "Parfait, on avance chaque jour.",
      },
      {
        id: "10",
        label: "10 minutes par jour",
        response: "Top, le rythme idéal !",
      },
      {
        id: "15",
        label: "15 minutes par jour",
        response: "Bravo, tu vas vite progresser.",
      },
      {
        id: "20",
        label: "20 minutes ou plus par jour",
        response: "Impressionnant, tu iras loin !",
      },
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
  /** Monotonically-increasing counter bumped each time the user picks
   *  an option on a question step. Drives the okok.riv replay. */
  const [okokReplayKey, setOkokReplayKey] = useState(0);

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

  const title = useMemo<React.ReactNode>(() => {
    if (isIntro) {
      if (stepIndex === 0 && greetingBeat) {
        return (
          <>
            Créons ensemble
            <br />
            un parcours d&apos;apprentissage
            <br />
            personnalisé !
          </>
        );
      }
      return step.title;
    }
    if (currentAnswer) {
      const selected = step.options.find((o) => o.id === currentAnswer);
      if (selected) return selected.response;
    }
    return step.title;
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
    setOkokReplayKey((k) => k + 1);
  };

  // Show the okok celebration animation whenever the user has picked
  // an answer on the current question step; fall back to hi_ok (the
  // breathing idle) the rest of the time.
  const mascotVariant: "hi_ok" | "okok" =
    !isIntro && currentAnswer ? "okok" : "hi_ok";

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
              ? "left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 sm:h-64 sm:w-64"
              : "left-4 top-2 h-36 w-36 sm:h-40 sm:w-40"
          )}
        >
          <OnboardingMascot
            variant={mascotVariant}
            replayKey={okokReplayKey}
            onPlayStart={handleMascotPlayStart}
          />
        </div>

        {/* Title — position & size animate with the mascot. On intro
            steps the title is constrained to a narrow max-width so the
            longer "Créons ensemble…" copy wraps over ≥2 lines. On
            question steps the title is vertically centered against the
            mascot (same top + matching height so items-center works). */}
        <h1
          className={cn(
            "absolute font-heading font-bold text-brilliant-text transition-all duration-500 ease-out",
            isIntro
              ? "left-1/2 top-[calc(18%+15rem)] max-w-[18rem] -translate-x-1/2 px-4 text-center text-xl leading-snug sm:top-[calc(18%+17rem)] sm:max-w-[22rem] sm:text-2xl"
              : "left-40 right-4 top-2 flex h-36 items-center text-base leading-snug sm:left-44 sm:h-40 sm:text-lg"
          )}
        >
          {title}
        </h1>

        {/* Options (only for question steps). Each button sizes to its
            label (inline-flex + centred column), no click-scale, and
            the selected one gets the Brilliant shiny sweep overlay. */}
        {!isIntro && (
          <div className="absolute inset-x-0 bottom-0 top-44 flex flex-col items-center justify-center gap-3 px-6 sm:top-48">
            {step.options.map((option) => {
              const selected = currentAnswer === option.id;
              const hasSelection = !!currentAnswer;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "relative overflow-hidden rounded-full px-6 py-3 text-sm font-bold transition-colors duration-200",
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
                  <span className="relative z-10">{option.label}</span>
                  {selected && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-[1] animate-shiny-sweep"
                    >
                      <svg
                        viewBox="0 0 150 56"
                        className="h-full w-full"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id={`opt-g1-${option.id}`}
                            x1="100.5"
                            y1="-58.63"
                            x2="100.5"
                            y2="91.37"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop
                              offset="0.27"
                              stopColor="white"
                              stopOpacity="0.55"
                            />
                            <stop
                              offset="0.71"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          <linearGradient
                            id={`opt-g2-${option.id}`}
                            x1="140.83"
                            y1="-28.13"
                            x2="140.83"
                            y2="121.87"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop
                              offset="0.08"
                              stopColor="white"
                              stopOpacity="0.45"
                            />
                            <stop
                              offset="0.57"
                              stopColor="white"
                              stopOpacity="0"
                            />
                          </linearGradient>
                          <clipPath id={`opt-clip-${option.id}`}>
                            <rect width="150" height="56" fill="white" />
                          </clipPath>
                        </defs>
                        <g clipPath={`url(#opt-clip-${option.id})`}>
                          <rect
                            opacity="0.5"
                            x="75"
                            y="-58.63"
                            width="51"
                            height="150"
                            transform="rotate(30 75 -58.63)"
                            fill={`url(#opt-g1-${option.id})`}
                          />
                          <rect
                            opacity="0.5"
                            x="127.83"
                            y="-28.13"
                            width="26"
                            height="150"
                            transform="rotate(30 127.83 -28.13)"
                            fill={`url(#opt-g2-${option.id})`}
                          />
                        </g>
                      </svg>
                    </span>
                  )}
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

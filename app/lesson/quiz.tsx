"use client";

import { toast } from "sonner";

import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import { useAudio, useWindowSize } from "react-use";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { completeLessonChallenges } from "@/actions/challenge-progress";

import { ShinyButton } from "@/components/ui/shiny-button";
import { Header } from "./header";
import { Footer } from "./footer";
import { ResultCard } from "./result-card";

import {
  Flashcard,
  QCM,
  VraiFaux,
  Matching,
  Anagram,
  QCMInverse,
  DragDrop,
  FlashRecall,
  ConfidenceBet,
  Opposite,
  SpotTheError,
} from "./exercises";

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
  listId?: number;
  levelOrder?: number;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  listId,
  levelOrder,
}: Props) => {

  const router = useRouter();
  const { width, height } = useWindowSize();

  // Prefetch the return destination as soon as the quiz mounts so the
  // transition after "Continuer" feels instant.
  useEffect(() => {
    const target = listId ? `/learn/list/${listId}` : "/learn";
    router.prefetch(target);
  }, [router, listId]);

  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challengesList] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challengesList.findIndex((c) => !c.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });
  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  // Track every attempt: each correct or wrong click counts.
  // scorePercentage = totalCorrect / totalAttempts × 100
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Track completed challenge IDs locally — only saved if level is passed
  const completedIdsRef = useRef<number[]>([]);
  const [saving, setSaving] = useState(false);

  const isFinished = activeIndex >= challengesList.length;
  const challenge = challengesList[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const scorePercentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
  const passed = scorePercentage >= 90;

  // Save progress IMMEDIATELY when the level is finished AND passed.
  // This ensures progress is saved even if the user closes the tab
  // before clicking "Continuer".
  const savedRef = useRef(false);
  useEffect(() => {
    if (isFinished && passed && !savedRef.current && completedIdsRef.current.length > 0) {
      savedRef.current = true;
      setSaving(true);
      completeLessonChallenges(completedIdsRef.current)
        .catch(() => console.error("Failed to save progress"))
        .finally(() => setSaving(false));
    }
    if (isFinished) {
      try {
        const audio = new Audio(passed ? "/finish.mp3" : "/incorrect.wav");
        audio.play().catch(() => {});
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  // Handle correct answer for self-managing exercises (instant, no server call)
  const handleSelfComplete = () => {
    completedIdsRef.current.push(challenge.id);
    correctControls.play();
    setPercentage((prev) => prev + 100 / challengesList.length);
    setTotalCorrect((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
    onNext();
    setStatus("none");
    setSelectedOption(undefined);
  };

  const handleSelfWrong = () => {
    incorrectControls.play();
    setTotalAttempts((prev) => prev + 1);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      // Move to the next exercise (don't retry)
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);
    if (!correctOption) return;

    if (correctOption.id === selectedOption) {
      completedIdsRef.current.push(challenge.id);
      correctControls.play();
      setStatus("correct");
      setPercentage((prev) => prev + 100 / challengesList.length);
      setTotalCorrect((prev) => prev + 1);
      setTotalAttempts((prev) => prev + 1);
    } else {
      incorrectControls.play();
      setStatus("wrong");
      setTotalAttempts((prev) => prev + 1);
    }
  };

  const handleFinishContinue = () => {
    const target = listId ? `/learn/list/${listId}` : "/learn";
    router.push(target);
  };

  const handlePracticeAgain = () => {
    window.location.href = `/lesson/${lessonId}`;
  };

  // Finished screen
  if (isFinished) {
    return (
      <FinishedScreen
        passed={passed}
        scorePercentage={scorePercentage}
        totalXP={challengesList.length * 10}
        levelOrder={levelOrder}
        lessonId={lessonId}
        saving={saving}
        onContinue={passed ? handleFinishContinue : handlePracticeAgain}
      />
    );
  }

  const isSelfManaged = ["FLASHCARD", "MATCHING", "ANAGRAM", "SPOT_THE_ERROR"].includes(challenge.type);

  const renderExercise = () => {
    const k = challenge.id;
    switch (challenge.type) {
      case "FLASHCARD":
        return <Flashcard key={k} options={options} onComplete={handleSelfComplete} disabled={pending} />;
      case "QCM":
        return <QCM key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "VRAI_FAUX":
        return <VraiFaux key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "MATCHING":
        return <Matching key={k} options={options} onComplete={handleSelfComplete} disabled={pending} />;
      case "ANAGRAM":
        return <Anagram key={k} challenge={challenge} options={options} onCorrect={handleSelfComplete} onWrong={handleSelfWrong} disabled={pending} />;
      case "QCM_INVERSE":
        return <QCMInverse key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "DRAG_DROP":
        return <DragDrop key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "FLASH_RECALL":
        return <FlashRecall key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "CONFIDENCE_BET":
        return <ConfidenceBet key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "OPPOSITE":
        return <Opposite key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "SPOT_THE_ERROR":
        return <SpotTheError key={k} challenge={challenge} options={options} onCorrect={handleSelfComplete} onWrong={handleSelfWrong} disabled={pending} />;
      default:
        return null;
    }
  };

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={0}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-2 sm:py-6">
          <div className="lg:min-h-[350px] w-full max-w-lg px-4 sm:px-6 lg:px-0 flex flex-col gap-y-3 sm:gap-y-6 lg:gap-y-8">
            <h1 className="text-sm sm:text-lg lg:text-2xl text-center font-bold text-brilliant-text">
              {challenge.question}
            </h1>
            <div>
              {renderExercise()}
            </div>
          </div>
        </div>
      </div>
      {!isSelfManaged && (
        <Footer
          disabled={pending || !selectedOption}
          status={status}
          onCheck={onContinue}
          correctAnswer={
            status === "wrong"
              ? options.find((o) => o.correct)?.frenchText
                || options.find((o) => o.correct)?.arabicText
                || options.find((o) => o.correct)?.text
              : undefined
          }
        />
      )}
    </>
  );
};

/* ─────────────────────── Animated counter hook ─────────────────────── */

function useCountUp(target: number, duration = 1200, delay = 800) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      let raf: number;

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };

      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return { value, done };
}

/* ─────────── Star-burst particles around the XP number ─────────── */

const STAR_POSITIONS = [
  { x: -48, y: -28, size: 14, delay: 0 },
  { x: 52, y: -22, size: 12, delay: 0.08 },
  { x: -36, y: 30, size: 10, delay: 0.15 },
  { x: 44, y: 34, size: 13, delay: 0.05 },
  { x: -20, y: -44, size: 9, delay: 0.12 },
  { x: 24, y: -40, size: 11, delay: 0.18 },
  { x: -52, y: 6, size: 8, delay: 0.1 },
  { x: 56, y: 8, size: 10, delay: 0.03 },
  { x: 0, y: 42, size: 9, delay: 0.2 },
  { x: -10, y: -52, size: 7, delay: 0.14 },
  { x: 34, y: 44, size: 8, delay: 0.22 },
  { x: -44, y: -40, size: 7, delay: 0.06 },
];

function StarBurst({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {STAR_POSITIONS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-star-burst"
          style={
            {
              "--star-translate": `translate(${s.x}px, ${s.y}px)`,
              animationDelay: `${0.8 + s.delay}s`,
              width: s.size,
              height: s.size,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6L12 2z"
              fill="#4ADE80"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ──────── Ambient floating twinkle stars (loop) ──────── */

const TWINKLE_POSITIONS = [
  { x: -60, y: -16, size: 8, delay: 0 },
  { x: 62, y: -10, size: 7, delay: 0.4 },
  { x: -40, y: 28, size: 6, delay: 0.8 },
  { x: 50, y: 24, size: 7, delay: 1.2 },
  { x: -16, y: -38, size: 5, delay: 0.3 },
  { x: 20, y: 36, size: 6, delay: 0.7 },
  { x: -56, y: 36, size: 5, delay: 1.0 },
  { x: 58, y: -30, size: 6, delay: 0.5 },
];

function TwinkleStars() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {TWINKLE_POSITIONS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-star-twinkle"
          style={{
            left: `calc(50% + ${s.x}px)`,
            top: `calc(50% + ${s.y}px)`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6L12 2z"
              fill="#4ADE80"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ─────────────────── Rive completion animation ──────────────────── */

function CompletionRive() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { RiveComponent } = useRive({
    src: "/animations/completed_lvl.riv",
    stateMachines: "State Machine 2",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  if (!mounted) return <div className="h-[270px] sm:h-[390px]" />;

  return (
    <div className="relative mx-auto h-[270px] w-[360px] sm:h-[390px] sm:w-[510px]">
      <RiveComponent className="h-full w-full" aria-label="Animation de complétion" />
    </div>
  );
}

/* ─────────────────── Rive failed animation ──────────────────── */

function FailedRive() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { RiveComponent } = useRive({
    src: "/animations/bad.riv",
    stateMachines: "State Machine bad",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  if (!mounted) return <div className="h-[270px] sm:h-[390px]" />;

  return (
    <div className="relative mx-auto h-[270px] w-[360px] sm:h-[390px] sm:w-[510px]">
      <RiveComponent className="h-full w-full" aria-label="Animation d'échec" />
    </div>
  );
}

/* ─────────────────── Full finished screen ──────────────────── */

type FinishedScreenProps = {
  passed: boolean;
  scorePercentage: number;
  totalXP: number;
  levelOrder?: number;
  lessonId: number;
  saving: boolean;
  onContinue: () => void;
};

function FinishedScreen({
  passed,
  scorePercentage,
  totalXP,
  levelOrder,
  lessonId,
  saving,
  onContinue,
}: FinishedScreenProps) {
  const { width, height } = useWindowSize();
  const { value: animatedXP, done: xpDone } = useCountUp(totalXP, 1200, 800);
  const { value: animatedScore, done: scoreDone } = useCountUp(scorePercentage, 1200, 1000);
  const [burstFired, setBurstFired] = useState(false);
  const [scoreBurstFired, setScoreBurstFired] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBurstFired(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setScoreBurstFired(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-4 sm:px-6">
      {passed && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
      )}

      {/* Rive animation */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0s" }}>
        {passed ? <CompletionRive /> : <FailedRive />}
      </div>

      {/* Title */}
      <h1
        className="animate-fade-in-up mt-2 text-center text-xl font-bold text-brilliant-text sm:mt-4 sm:text-3xl lg:text-4xl"
        style={{ animationDelay: "0.3s" }}
      >
        {passed ? (
          <>
            {levelOrder ? `Niveau ${levelOrder}` : "Leçon"}
            <br />
            terminée !
          </>
        ) : (
          <>
            Pas encore...
            <br />
            Tu as obtenu {scorePercentage}%.
          </>
        )}
      </h1>

      {/* Stats row: XP + Score side by side */}
      <div
        className="animate-fade-in-up mt-4 flex items-start justify-center gap-8 sm:mt-8 sm:gap-14"
        style={{ animationDelay: "0.6s" }}
      >
        {/* XP counter with star explosion */}
        <div className="relative">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Total XP
          </p>
          <div className="relative mt-1 flex items-center justify-center">
            <StarBurst visible={burstFired} />
            <TwinkleStars />
            <span
              className="animate-xp-pop text-4xl font-extrabold sm:text-6xl lg:text-7xl transition-colors duration-500"
              style={{
                animationDelay: "0.8s",
                color: xpDone ? "#1A1A1A" : "#6967FB",
              }}
            >
              {animatedXP}
            </span>
          </div>
        </div>

        {/* Score percentage with its own star burst */}
        <div className="relative">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Score
          </p>
          <div className="relative mt-1 flex items-center justify-center">
            <StarBurst visible={scoreBurstFired} />
            <TwinkleStars />
            <span
              className="animate-xp-pop text-4xl font-extrabold sm:text-6xl lg:text-7xl transition-colors duration-500"
              style={{
                animationDelay: "1s",
                color: scoreDone ? "#1A1A1A" : "#6967FB",
              }}
            >
              {animatedScore}<span className="text-lg sm:text-2xl lg:text-3xl">%</span>
            </span>
          </div>
        </div>
      </div>

      {!passed && (
        <p className="animate-fade-in-up mt-3 text-center text-sm text-gray-500"
          style={{ animationDelay: "0.7s" }}
        >
          Il faut atteindre 90% de bonnes réponses
          <br />
          pour valider ce niveau.
        </p>
      )}

      {saving && (
        <p className="mt-3 text-sm text-gray-400 animate-pulse">
          Sauvegarde en cours...
        </p>
      )}

      {/* Inline buttons instead of fixed footer */}
      <div
        className="animate-fade-in-up mt-6 flex w-full max-w-md gap-3 sm:mt-10"
        style={{ animationDelay: "0.9s" }}
      >
        <ShinyButton
          variant="outline-green"
          onClick={() => window.location.href = `/lesson/${lessonId}`}
        >
          Pratiquer à nouveau
        </ShinyButton>
        <ShinyButton
          variant="green"
          onClick={onContinue}
        >
          Continuer
        </ShinyButton>
      </div>
    </div>
  );
}

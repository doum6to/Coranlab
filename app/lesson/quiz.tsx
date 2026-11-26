"use client";

import { toast } from "sonner";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef, type ReactNode } from "react";
import { useAudio, useWindowSize } from "react-use";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { usePremiumModal } from "@/store/use-premium-modal";
import { completeLessonChallenges, type LessonResult } from "@/actions/challenge-progress";

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
import type { ExerciseAction } from "./exercises/choice";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";
import { listenMode } from "@/lib/word-audio";
import { useUnlockWordAudio, useWordSoundOn } from "@/components/word-audio";
import { ConfettiBurst, CountUp, StreakFlame } from "@/components/fx";

const TEST_MODE_LIMIT = 5;
/** Same values as the server: full XP for a first time, a small reward for revising. */
const XP_NEW = 10;
const XP_REVISION = 2;

/** Short vibration on Android (iOS has none on the web). */
const buzz = (pattern: number | number[]) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch { /* ignore */ }
};

/** The learner's calendar day, so the streak follows their own midnight. */
const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Renders a string with `\n` as line breaks. */
const multiline = (s: string) =>
  s.split("\n").flatMap((line, i) =>
    i === 0 ? [line] : [<br key={i} />, line],
  );

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
  testMode?: boolean;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  listId,
  levelOrder,
  testMode = false,
}: Props) => {

  const router = useRouter();
  const { width, height } = useWindowSize();

  // Prefetch the return destination as soon as the quiz mounts so the
  // transition after "Continuer" feels instant.
  useEffect(() => {
    if (testMode) {
      router.prefetch("/premium");
      return;
    }
    const target = listId ? `/learn/list/${listId}` : "/learn";
    router.prefetch(target);
  }, [router, listId, testMode]);

  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();
  const tq = useT();
  useUnlockWordAudio();
  const soundOn = useWordSoundOn();
  // VRAI/FAUX option values are stored untranslated (the exercise matches on
  // them), so the footer label is localized here.
  const localizeAnswer = (v: string | undefined) =>
    v === "VRAI" ? tq.lesson.answerTrue : v === "FAUX" ? tq.lesson.answerFalse : v;

  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    if (testMode) return 0;
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challengesList] = useState(() => {
    if (testMode) {
      return initialLessonChallenges
        .slice(0, TEST_MODE_LIMIT)
        .map((c) => ({ ...c, completed: false }));
    }
    return initialLessonChallenges;
  });
  const [activeIndex, setActiveIndex] = useState(() => {
    if (testMode) return 0;
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
  // What the server really credited (XP, streak) once the level is saved.
  const [result, setResult] = useState<LessonResult | null>(null);
  // Live rewards of the session: XP collected so far and right answers in a row.
  const [sessionXp, setSessionXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [selfAction, setSelfAction] = useState<ExerciseAction | null>(null);

  const isFinished = activeIndex >= challengesList.length;
  const challenge = challengesList[activeIndex];
  // Exercises that judge themselves and only tell the footer what its button does.
  const isSelfManaged = !!challenge && ["FLASHCARD", "MATCHING", "ANAGRAM"].includes(challenge.type);
  const options = challenge?.challengeOptions ?? [];

  const scorePercentage = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
  const passed = scorePercentage >= 90;

  // Save progress IMMEDIATELY when the level is finished AND passed.
  // This ensures progress is saved even if the user closes the tab
  // before clicking "Continuer". Skipped in test mode (pure demo).
  const savedRef = useRef(false);
  useEffect(() => {
    if (
      !testMode &&
      isFinished &&
      passed &&
      !savedRef.current &&
      completedIdsRef.current.length > 0
    ) {
      savedRef.current = true;
      setSaving(true);
      completeLessonChallenges(completedIdsRef.current, localDay())
        .then((r) => { if (r) setResult(r); })
        .catch(() => console.error("Failed to save progress"))
        .finally(() => setSaving(false));
    }
    if (isFinished) {
      try {
        // In test mode, always play the celebration sound.
        const shouldCelebrate = testMode || passed;
        const audio = new Audio(shouldCelebrate ? "/finish.mp3" : "/incorrect.wav");
        audio.play().catch(() => {});
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  // An exercise already done on a previous visit is revision: it is worth less.
  const gainOf = (c: (typeof challengesList)[number] | undefined) => (c?.completed ? XP_REVISION : XP_NEW);
  const rewardRight = () => {
    setSessionXp((x) => x + gainOf(challenge));
    setCombo((n) => n + 1);
    buzz([10, 40, 18]);
  };
  const noteWrong = () => {
    setCombo(0);
    buzz(45);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const step = 100 / challengesList.length;

  const judgeRight = () => {
    completedIdsRef.current.push(challenge.id);
    correctControls.play();
    rewardRight();
    setStatus("correct");
    setPercentage((prev) => prev + step);
    setTotalCorrect((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
  };

  const judgeWrong = () => {
    incorrectControls.play();
    noteWrong();
    setStatus("wrong");
    setTotalAttempts((prev) => prev + 1);
  };

  // The footer button. Every exercise goes through it: check, then move on.
  const onContinue = () => {
    if (status !== "none") {
      // No retry: the bar follows the learner's place in the lesson, right answer or not.
      if (status === "wrong") setPercentage((prev) => prev + step);
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      setSelfAction(null);
      return;
    }

    // Pairs, cards and letters say themselves what the button does.
    if (isSelfManaged) {
      if (selfAction && !selfAction.disabled) selfAction.run();
      return;
    }

    // Judge the option actually selected (robust if several are acceptable).
    const picked = options.find((option) => option.id === selectedOption);
    if (!picked) return;
    // "Spot the error" lists pairs and asks for the false one.
    const right = challenge.type === "SPOT_THE_ERROR" ? !picked.correct : picked.correct;
    if (right) judgeRight();
    else judgeWrong();
  };

  const handleFinishContinue = () => {
    if (testMode) {
      router.push("/premium");
      return;
    }
    const target = listId ? `/learn/list/${listId}` : "/learn";
    router.push(target);
  };

  const handlePracticeAgain = () => {
    if (testMode) {
      // No retry in demo mode — go straight to premium.
      router.push("/premium");
      return;
    }
    window.location.href = `/lesson/${lessonId}`;
  };

  // Streak screen: shown after the finished screen when this lesson extended the streak today
  if (isFinished && showStreak && result) {
    return <StreakScreen streak={result.streak} onContinue={handleFinishContinue} />;
  }

  // Finished screen
  if (isFinished) {
    // XP shown = what was really credited: nothing while the level is not passed, the server's
    // figure once saved (the session's own count stands in until it answers, and in the demo).
    const earnedXP = !testMode && !passed ? 0 : result ? result.xp : sessionXp;
    return (
      <FinishedScreen
        passed={passed}
        scorePercentage={scorePercentage}
        totalXP={earnedXP}
        levelOrder={levelOrder}
        lessonId={lessonId}
        saving={saving}
        testMode={testMode}
        isPro={!!userSubscription?.isActive}
        onContinue={testMode ? handleFinishContinue : !passed ? handlePracticeAgain : result?.streakExtended ? () => setShowStreak(true) : handleFinishContinue}
      />
    );
  }


  // Listening variant of a multiple-choice challenge (only with a clip, and
  // only while the learner keeps the sound on).
  const listen = soundOn ? listenMode(challenge) : null;

  // What the red sheet shows after a wrong answer.
  const wrongAnswer = (): ReactNode => {
    const arabic = (text: string | null | undefined) => <bdi className="font-arabic text-[1.25rem] leading-none" lang="ar">{text}</bdi>;
    if (challenge.type === "ANAGRAM") return arabic(challenge.arabicWord);
    if (challenge.type === "SPOT_THE_ERROR") {
      const faulty = options.find((o) => !o.correct);
      return faulty ? <>{arabic(faulty.arabicText)} = {faulty.frenchText}</> : undefined;
    }
    const good = options.find((o) => o.correct);
    if (!good) return undefined;
    return good.frenchText ? localizeAnswer(good.frenchText) : good.arabicText ? arabic(good.arabicText) : localizeAnswer(good.text);
  };

  const renderExercise = () => {
    const k = challenge.id;
    switch (challenge.type) {
      case "FLASHCARD":
        return <Flashcard key={k} options={options} onComplete={judgeRight} onAction={setSelfAction} disabled={pending || status !== "none"} />;
      case "QCM":
        return <QCM key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} listen={listen === "meaning"} />;
      case "VRAI_FAUX":
        return <VraiFaux key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "MATCHING":
        return <Matching key={k} options={options} onComplete={judgeRight} onAction={setSelfAction} disabled={pending || status !== "none"} />;
      case "ANAGRAM":
        return <Anagram key={k} challenge={challenge} options={options} status={status} onCorrect={judgeRight} onWrong={judgeWrong} onAction={setSelfAction} disabled={pending} />;
      case "QCM_INVERSE":
        return <QCMInverse key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} listen={listen === "written"} />;
      case "DRAG_DROP":
        return <DragDrop key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "FLASH_RECALL":
        return <FlashRecall key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "CONFIDENCE_BET":
        return <ConfidenceBet key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "OPPOSITE":
        return <Opposite key={k} challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "SPOT_THE_ERROR":
        return <SpotTheError key={k} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
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
        xp={sessionXp}
        combo={combo}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-2 sm:py-6">
          <div className="lg:min-h-[350px] w-full max-w-lg px-4 sm:px-6 lg:px-0 flex flex-col gap-y-5 sm:gap-y-6 lg:gap-y-8">
            <h1 className="text-center text-[1.125rem] font-bold leading-snug text-brilliant-text sm:text-xl lg:text-2xl" style={{ textWrap: "balance" as never }}>
              {listen === "meaning" ? tq.audio.qMeaning : listen === "written" ? tq.audio.qWritten : challenge.question}
            </h1>
            <div>
              {renderExercise()}
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || (isSelfManaged ? !selfAction || selfAction.disabled : !selectedOption)}
        status={status}
        onCheck={onContinue}
        gain={gainOf(challenge)}
        nextOnly={isSelfManaged && selfAction?.label === "next"}
        correctAnswer={status === "wrong" ? wrongAnswer() : undefined}
        answerLabel={challenge.type === "SPOT_THE_ERROR" ? tq.lesson.wrongPairLabel : undefined}
      />
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
  const t = useT();
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
      <RiveComponent className="h-full w-full" aria-label={t.lesson.completionAnim} />
    </div>
  );
}

/* ─────────────────── Rive failed animation ──────────────────── */

function FailedRive() {
  const t = useT();
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
      <RiveComponent className="h-full w-full" aria-label={t.lesson.failAnim} />
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
  testMode?: boolean;
  isPro?: boolean;
  onContinue: () => void;
};

function FinishedScreen({
  passed,
  scorePercentage,
  totalXP,
  levelOrder,
  lessonId,
  saving,
  testMode = false,
  isPro = false,
  onContinue,
}: FinishedScreenProps) {
  const t = useT();
  // In test mode we always celebrate — no failed screen for the demo.
  const celebrate = testMode || passed;
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
      {celebrate && width > 0 && height > 0 && (
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
        {celebrate ? <CompletionRive /> : <FailedRive />}
      </div>

      {/* Title */}
      <h1
        className="animate-fade-in-up mt-2 text-center text-xl font-bold text-brilliant-text sm:mt-4 sm:text-3xl lg:text-4xl"
        style={{ animationDelay: "0.3s" }}
      >
        {testMode
          ? multiline(t.lesson.finishedDemoTitle)
          : passed
            ? multiline(
                levelOrder
                  ? tpl(t.lesson.finishedLevelTitle, { n: levelOrder })
                  : t.lesson.finishedLessonTitle,
              )
            : multiline(tpl(t.lesson.notPassedTitle, { score: scorePercentage }))}
      </h1>

      {/* Stats row: XP + Score side by side */}
      <div
        className="animate-fade-in-up mt-4 flex items-start justify-center gap-8 sm:mt-8 sm:gap-14"
        style={{ animationDelay: "0.6s" }}
      >
        {/* XP counter with star explosion */}
        <div className="relative">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t.lesson.totalXp}
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
            {t.lesson.score}
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

      {!testMode && !passed && (
        <p className="animate-fade-in-up mt-3 text-center text-sm text-gray-500"
          style={{ animationDelay: "0.7s" }}
        >
          {multiline(t.lesson.needScore)}
        </p>
      )}

      {saving && (
        <p className="mt-3 text-sm text-gray-400 animate-pulse">
          {t.lesson.saving}
        </p>
      )}

      {/* Inline buttons instead of fixed footer */}
      <div
        className="animate-fade-in-up mt-6 flex w-full max-w-md gap-3 sm:mt-10"
        style={{ animationDelay: "0.9s" }}
      >
        {testMode ? (
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01] active:translate-y-[2px] active:!shadow-none animate-premium-gradient"
            style={{
              background:
                "linear-gradient(90deg, #050C38 0%, #6700A3 25%, #E02F75 50%, #FF5A57 75%, #050C38 100%)",
              backgroundSize: "400% 100%",
              boxShadow: "0 4px 0 0 rgba(5, 12, 56, 0.4)",
            }}
          >
            {t.lesson.unlockAll}
          </button>
        ) : (
          <>
            <ShinyButton
              variant="outline-green"
              onClick={() => window.location.href = `/lesson/${lessonId}`}
            >
              {t.lesson.practiceAgain}
            </ShinyButton>
            <ShinyButton
              variant="green"
              onClick={onContinue}
            >
              {t.lesson.continue}
            </ShinyButton>
          </>
        )}
      </div>

      {/* Victory nudge: ride the win to push Premium (free users only). */}
      {!testMode && celebrate && !isPro && (
        <button
          onClick={() => usePremiumModal.getState().open()}
          className="animate-fade-in-up mt-4 text-sm font-semibold text-[#6967FB] hover:underline"
          style={{ animationDelay: "1.1s" }}
        >
          {t.exercises.victoryNudge}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────── Streak screen ──────────────────────── */

/** After a passed level that extended the streak today: the flame, the count, the week. */
export function StreakScreen({ streak, onContinue }: { streak: number; onContinue: () => void }) {
  const t = useT();
  const [confetti, setConfetti] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setConfetti(1), 250);
    return () => window.clearTimeout(id);
  }, []);
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday first
  const lang = typeof document !== "undefined" ? document.documentElement.lang || "fr" : "fr";
  const dayLetter = (k: number) => new Intl.DateTimeFormat(lang, { weekday: "narrow" }).format(new Date(2024, 0, 1 + k)); // 1 Jan 2024 is a Monday
  // Days of this week covered by the current streak, today included.
  const lit = (k: number) => k <= todayIdx && k > todayIdx - streak;
  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <ConfettiBurst fireKey={confetti} pieces={30} originY="30%" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%]" style={{ background: "radial-gradient(60% 55% at 50% 40%, #FFF0DB 0%, rgba(255,240,219,0) 100%)" }} aria-hidden />
      <StreakFlame className="relative h-48 w-48" />
      <p className="relative -mt-2 font-heading text-[4rem] font-extrabold leading-none text-[#F0641E]" style={{ letterSpacing: "-0.03em" }}>
        <CountUp value={streak} duration={700} />
      </p>
      <p className="relative mt-1 text-[0.9375rem] font-semibold text-[#C2570C]">{streak > 1 ? t.reward.streakDays : t.reward.streakDay}</p>
      <div className="relative mt-6 flex justify-center gap-2" aria-hidden>
        {Array.from({ length: 7 }, (_, k) => (
          <span key={k} className="flex w-9 flex-col items-center gap-1.5">
            <span className={`text-xs font-semibold uppercase ${k === todayIdx ? "text-[#C2570C]" : "text-brilliant-muted"}`}>{dayLetter(k)}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={lit(k) ? { background: "#FF8A1F", boxShadow: "0 2px 0 0 #E0680A" } : { background: "#F3F3F3" }}>
              {lit(k) && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              )}
            </span>
          </span>
        ))}
      </div>
      <h1 className="relative mt-8 text-[1.625rem] font-bold leading-tight text-brilliant-text">{streak > 1 ? t.reward.streakKept : t.reward.streakStart}</h1>
      <p className="relative mt-2 max-w-xs text-base text-[#555]">{t.reward.streakHint}</p>
      <div className="relative mt-8 w-full max-w-md">
        <ShinyButton variant="green" onClick={onContinue}>{t.lesson.continue}</ShinyButton>
      </div>
    </div>
  );
}

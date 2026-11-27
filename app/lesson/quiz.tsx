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
import { finishLesson, saveLessonProgress, type LessonResult, type NextStep } from "@/actions/challenge-progress";
import { saveReviewAnswers } from "@/actions/review";

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
import { preloadWords, stopWord, useUnlockWordAudio, useWordSoundOn } from "@/components/word-audio";
import { TomorrowReminder, type ReminderPreview } from "@/components/reminders";
import { ConfettiBurst, CountUp, StreakFlame } from "@/components/fx";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatCoverage } from "@/lib/quran-coverage";
import { markJustFinished } from "@/lib/just-finished";

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
  /** A review session: words already learned, drawn from several lessons (see lib/review.ts). */
  review?: boolean;
  /** Double XP runs until this moment (ms since epoch), when a bonus is under way. */
  boostUntil?: number | null;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
  levelOrder,
  testMode = false,
  review = false,
  boostUntil = null,
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
    router.prefetch(review ? "/lecons" : "/learn");
  }, [router, testMode, review]);

  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();
  const tq = useT();
  useUnlockWordAudio();
  const soundOn = useWordSoundOn();
  // The voices of the lesson are downloaded as it opens, in the order they will be heard.
  useEffect(() => {
    preloadWords(initialLessonChallenges.flatMap((c) => [c.arabicWord, ...c.challengeOptions.map((o) => o.arabicText)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  // The order of play: the exercises still to do (all of them when the level is replayed as
  // revision), then, appended as they happen, the ones answered wrong: they come back at the
  // end until they are right, so a lesson always ends on a success.
  const [queue, setQueue] = useState<number[]>(() => {
    const all = challengesList.map((_, i) => i);
    if (testMode) return all;
    const todo = all.filter((i) => !challengesList[i].completed);
    return todo.length > 0 ? todo : all;
  });
  const [firstPass] = useState(queue.length);
  const [pos, setPos] = useState(0);
  // Exercises answered wrong at least once in this session.
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  // Exercises answered right are saved as the lesson goes (see `saveSoon`).
  const unsavedRef = useRef<number[]>([]);
  // In a review, how each word was answered at the first try: it decides when it comes back.
  const reviewRef = useRef<{ id: number; right: boolean }[]>([]);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const [saving, setSaving] = useState(false);
  // What the server really credited (XP, streak) once the level is saved.
  const [result, setResult] = useState<LessonResult | null>(null);
  // Live rewards of the session: XP collected so far and right answers in a row.
  const [sessionXp, setSessionXp] = useState(0);
  const [combo, setCombo] = useState(0);
  // End of the session, one screen after the other: the result, the streak, then the bonus.
  const [endStep, setEndStep] = useState<"result" | "streak" | "boost">("result");
  // Double XP: already running when the lesson opened, or started by this lesson.
  const [boostEnd, setBoostEnd] = useState<number | null>(boostUntil);
  const boosted = () => !testMode && boostEnd !== null && Date.now() < boostEnd;
  const [selfAction, setSelfAction] = useState<ExerciseAction | null>(null);

  const isFinished = pos >= queue.length;
  const challenge = challengesList[queue[pos]];
  // Back for a second try after a wrong answer.
  const isRetry = !isFinished && pos >= firstPass;
  // Exercises that judge themselves and only tell the footer what its button does.
  const isSelfManaged = !!challenge && ["FLASHCARD", "MATCHING", "ANAGRAM"].includes(challenge.type);
  const options = challenge?.challengeOptions ?? [];

  // Accuracy: the share of exercises answered right at the first try.
  const scorePercentage = firstPass > 0 ? Math.round(((firstPass - missed.size) / firstPass) * 100) : 100;

  // Sends what is not saved yet, one request at a time. A failed request leaves its exercises
  // in the list: they leave with the next one.
  const saveSoon = () => {
    saveChain.current = saveChain.current.then(async () => {
      const ids = unsavedRef.current.splice(0);
      if (ids.length) {
        try {
          await saveLessonProgress(ids);
        } catch {
          unsavedRef.current.unshift(...ids);
        }
      }
      const answers = reviewRef.current.splice(0);
      if (answers.length) {
        try {
          await saveReviewAnswers(answers, localDay());
        } catch {
          reviewRef.current.unshift(...answers);
        }
      }
    });
    return saveChain.current;
  };

  // Once every exercise is right: last save, then the day counts for the streak.
  // Skipped in test mode (pure demo).
  const closedRef = useRef(false);
  useEffect(() => {
    if (!isFinished) return;
    if (!testMode && !closedRef.current) {
      closedRef.current = true;
      setSaving(true);
      saveSoon()
        .then(() => (unsavedRef.current.length || reviewRef.current.length ? saveSoon() : undefined))
        .then(() => finishLesson(localDay()))
        .then((r) => { if (r) { setResult({ xp: 0, ...r }); if (r.boostUntil) setBoostEnd(r.boostUntil); } })
        .catch(() => console.error("Failed to save progress"))
        .finally(() => setSaving(false));
    }
    try {
      const audio = new Audio("/finish.mp3");
      audio.play().catch(() => {});
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const onNext = () => {
    setPos((current) => current + 1);
  };

  // An exercise already done on a previous visit is revision: it is worth less.
  const gainOf = (c: (typeof challengesList)[number] | undefined) => (c?.completed ? XP_REVISION : XP_NEW) * (boosted() ? 2 : 1);
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
    if (!testMode) {
      unsavedRef.current.push(challenge.id);
      // Right at the first try only: a word found on its second chance was still missed.
      if (review && pos < firstPass) reviewRef.current.push({ id: challenge.id, right: true });
      void saveSoon();
    }
    correctControls.play();
    rewardRight();
    setStatus("correct");
    setPercentage((prev) => prev + step);
  };

  const judgeWrong = () => {
    setMissed((m) => new Set(m).add(queue[pos]));
    if (review && !testMode && pos < firstPass) {
      reviewRef.current.push({ id: challenge.id, right: false });
      void saveSoon();
    }
    incorrectControls.play();
    noteWrong();
    setStatus("wrong");
  };

  // The footer button. Every exercise goes through it: check, then move on.
  const onContinue = () => {
    if (status !== "none") {
      // Moving on: the word of this exercise stops there.
      stopWord();
      // A wrong answer comes back at the end of the lesson; the bar only moves on right ones.
      if (status === "wrong") setQueue((q) => [...q, q[pos]]);
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
    // A level finished for the first time: the home page plays the progress it made.
    if (!review && initialPercentage < 100) markJustFinished({ lessonId, firstToday: !!result?.streakExtended });
    // Back to the home page: it shows the next step and today's goal. A review returns to its tab.
    router.push(review ? "/lecons" : "/learn");
  };

  // The next level of the path, offered at the end so a second lesson is one tap away.
  const next = !testMode ? result?.next : undefined;
  const goNext = () => { if (next) router.push(`/lesson/${next.lessonId}`); };

  // Bonus screen: double XP has just started, and there is a lesson to spend it on.
  if (isFinished && endStep === "boost" && next && boostEnd) {
    return <BoostScreen until={boostEnd} onNext={goNext} onHome={handleFinishContinue} />;
  }

  // Streak screen: shown after the finished screen when this lesson extended the streak today
  if (isFinished && endStep === "streak" && result) {
    return <StreakScreen streak={result.streak} next={next} reviewTomorrow={result.reviewTomorrow} askReminder onContinue={next && boosted() ? () => setEndStep("boost") : handleFinishContinue} />;
  }

  const firstToday = !testMode && !!result?.streakExtended;

  // Finished screen
  if (isFinished) {
    return (
      <FinishedScreen
        passed
        scorePercentage={scorePercentage}
        totalXP={sessionXp}
        levelOrder={levelOrder}
        lessonId={lessonId}
        saving={saving}
        testMode={testMode}
        isPro={!!userSubscription?.isActive}
        coverage={review ? undefined : result?.coverage}
        review={review ? { words: firstPass, missed: missed.size } : undefined}
        onContinue={firstToday ? () => setEndStep("streak") : handleFinishContinue}
        onNext={!firstToday && next ? goNext : undefined}
        boostUntil={!firstToday && next && boosted() ? boostEnd : null}
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
    // One key per turn: an exercise that comes back starts afresh.
    const k = pos;
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
        demo={testMode}
        exitTo={review ? "/lecons" : undefined}
        boost={boosted()}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-2 sm:py-6">
          <div className="lg:min-h-[350px] w-full max-w-lg px-4 sm:px-6 lg:px-0 flex flex-col gap-y-5 sm:gap-y-6 lg:gap-y-8">
            {isRetry && (
              <p className="mx-auto -mb-2 rounded-full bg-[#F0F0FF] px-3 py-1 text-[0.8125rem] font-semibold text-[#5452E0] animate-in fade-in" key={pos}>{tq.reward.secondChance}</p>
            )}
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
  /** Share of the Qur'an's words understood after this lesson (estimate). */
  coverage?: number;
  /** A review session: how many words it covered and how many were missed at the first try. */
  review?: { words: number; missed: number };
  onContinue: () => void;
  /** Opens the next level: when given, it becomes the main button and going home the second. */
  onNext?: () => void;
  /** Double XP still running (ms since epoch), shown above the buttons. */
  boostUntil?: number | null;
};

export function FinishedScreen({
  passed,
  scorePercentage,
  totalXP,
  levelOrder,
  lessonId,
  saving,
  testMode = false,
  isPro = false,
  coverage,
  review,
  onContinue,
  onNext,
  boostUntil,
}: FinishedScreenProps) {
  const t = useT();
  const locale = useLocale();
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
          : review
            ? t.review.doneTitle
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

      {/* What the lesson moved: the share of the Qur'an now understood */}
      {!saving && coverage !== undefined && coverage > 0 && (
        <p className="mt-4 max-w-[19rem] text-center text-[0.9375rem] font-medium leading-snug text-[#555] duration-500 animate-in fade-in" style={{ textWrap: "balance" as never }}>
          {tpl(t.home.coverageNow, { pct: formatCoverage(coverage, locale) })}
        </p>
      )}

      {/* After a review: when its words come back */}
      {!saving && review && (
        <p className="mt-4 max-w-[19rem] text-center text-[0.9375rem] font-medium leading-snug text-[#555] duration-500 animate-in fade-in" style={{ textWrap: "balance" as never }}>
          {review.missed === 0 ? t.review.doneAllRight : tpl(review.missed === 1 ? t.review.doneMissedOne : t.review.doneMissed, { n: review.missed })}
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
        ) : saving ? (
          // The buttons come once the lesson is saved: what they offer depends on it, and nothing must move under the thumb.
          <span className="block h-[58px] w-full" aria-hidden />
        ) : onNext ? (
          <div className="flex w-full flex-col items-center">
            {boostUntil && <BoostLeft until={boostUntil} />}
            <ShinyButton variant="green" onClick={onNext} className="text-base">
              <span className="block py-1">{t.reward.nextLesson}</span>
            </ShinyButton>
            <button type="button" onClick={onContinue} className="mt-2 min-h-[48px] w-full select-none rounded-2xl text-[0.9375rem] font-semibold text-[#6B6B76] transition-colors active:bg-[#F3F3F7]">{t.reward.backHome}</button>
          </div>
        ) : (
          <ShinyButton variant="green" onClick={onContinue} className="text-base">
            <span className="block py-1">{t.lesson.continue}</span>
          </ShinyButton>
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
/** Time left as m:ss, refreshed every second; null once it is over. */
function useTimeLeft(until: number): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const s = Math.max(0, Math.ceil((until - now) / 1000));
  return s > 0 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : null;
}

/** "XP ×2 for 9:41 more", above the button that spends it. */
function BoostLeft({ until }: { until: number }) {
  const t = useT();
  const left = useTimeLeft(until);
  if (!left) return null;
  return <p className="mb-2.5 rounded-full bg-[#F0F0FF] px-3 py-1 text-[0.8125rem] font-bold text-[#5452E0]" style={{ fontVariantNumeric: "tabular-nums" }}>{tpl(t.reward.boostLeft, { time: left })}</p>;
}

/** After the first lesson of the day: double XP has started, and the next level is one tap away. */
export function BoostScreen({ until, onNext, onHome }: { until: number; onNext: () => void; onHome: () => void }) {
  const t = useT();
  const left = useTimeLeft(until);
  const [minutes] = useState(() => Math.max(1, Math.round((until - Date.now()) / 60_000)));
  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%]" style={{ background: "radial-gradient(60% 55% at 50% 40%, #EEEEFF 0%, rgba(238,238,255,0) 100%)" }} aria-hidden />
      <p className="animate-xp-pop relative font-heading text-[5rem] font-extrabold leading-none text-[#6967FB]" style={{ letterSpacing: "-0.04em" }} aria-hidden>×2</p>
      <h1 className="relative mt-5 max-w-[18rem] text-[1.625rem] font-bold leading-tight text-brilliant-text" style={{ textWrap: "balance" as never }}>{minutes === 1 ? t.reward.boostTitleOne : tpl(t.reward.boostTitle, { n: minutes })}</h1>
      <p className="relative mt-2 max-w-xs text-base leading-normal text-[#555]" style={{ textWrap: "pretty" as never }}>{t.reward.boostBody}</p>
      <p className="relative mt-5 h-8 font-heading text-[1.5rem] font-extrabold text-brilliant-text" style={{ fontVariantNumeric: "tabular-nums" }} aria-live="off">{left ?? "0:00"}</p>
      <div className="relative mt-6 w-full max-w-md">
        <ShinyButton variant="green" onClick={onNext} className="text-base"><span className="block py-1">{t.reward.nextLesson}</span></ShinyButton>
        <button type="button" onClick={onHome} className="mt-2 min-h-[48px] w-full select-none rounded-2xl text-[0.9375rem] font-semibold text-[#6B6B76] transition-colors active:bg-[#F3F3F7]">{t.reward.backHome}</button>
      </div>
    </div>
  );
}

export function StreakScreen({ streak, onContinue, next, reviewTomorrow, askReminder = false, reminderPreview }: { streak: number; onContinue: () => void; /** What waits tomorrow: the next level and the words due for review. */ next?: NextStep; reviewTomorrow?: number; /** Offer a reminder for tomorrow (signed-in learners only). */ askReminder?: boolean; /** Fixed reminder state, to look at the screen without an account. */ reminderPreview?: ReminderPreview }) {
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
    // Scrolls when the screen is too short for everything (small phones), instead of cutting the flame or the button.
    <div className="relative h-[100dvh] overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: "contain" }}>
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-6 text-center">
      <ConfettiBurst fireKey={confetti} pieces={30} originY="30%" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%]" style={{ background: "radial-gradient(60% 55% at 50% 40%, #FFF0DB 0%, rgba(255,240,219,0) 100%)" }} aria-hidden />
      <StreakFlame className="relative h-32 w-32 [@media(min-height:700px)]:h-48 [@media(min-height:700px)]:w-48" />
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
      {/* Tomorrow's appointment: what waits, and a reminder offered while the win is fresh */}
      {(next || (reviewTomorrow ?? 0) > 0 || askReminder) && (
        <div className="relative mt-6 w-full max-w-md">
          {(next || (reviewTomorrow ?? 0) > 0) && (
            <div className="px-4 py-3.5 text-left" style={{ borderRadius: 20, background: "#FFF7EC" }}>
              <p className="text-[0.8125rem] font-semibold text-[#C2570C]">{t.reward.tomorrow}</p>
              {next && <p className="mt-0.5 text-[0.9375rem] font-bold leading-snug text-brilliant-text">{tpl(t.reward.tomorrowNext, { n: next.level, list: next.listTitle })}</p>}
              {(reviewTomorrow ?? 0) > 0 && <p className="mt-0.5 text-[0.9375rem] font-medium leading-snug text-[#555]" style={{ fontVariantNumeric: "tabular-nums" }}>{reviewTomorrow === 1 ? t.reward.tomorrowReviewOne : tpl(t.reward.tomorrowReview, { n: reviewTomorrow! })}</p>}
            </div>
          )}
          {askReminder && <TomorrowReminder preview={reminderPreview} />}
        </div>
      )}
      {/* Stays in reach on a short screen, where the rest scrolls behind it */}
      <div className="sticky bottom-0 z-10 mt-3 w-full max-w-md bg-white pb-1 pt-3">
        <ShinyButton variant="green" onClick={onContinue}>{t.lesson.continue}</ShinyButton>
      </div>
    </div>
    </div>
  );
}

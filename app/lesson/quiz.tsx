"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useAudio, useWindowSize } from "react-use";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { completeLessonChallenges } from "@/actions/challenge-progress";
import { useExitModal } from "@/store/use-exit-modal";

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

  const { width, height } = useWindowSize();

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

  // Track correct answers on first attempt
  const [correctFirstAttempt, setCorrectFirstAttempt] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);

  // Track completed challenge IDs locally
  const completedIdsRef = useRef<number[]>([]);
  const savedIdsRef = useRef<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const { setPendingSaveIds } = useExitModal();

  const isFinished = activeIndex >= challengesList.length;
  const challenge = challengesList[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const scorePercentage = totalAnswered > 0 ? Math.round((correctFirstAttempt / totalAnswered) * 100) : 100;
  const passed = scorePercentage >= 90;

  // Save a single challenge in background (fire-and-forget)
  const saveInBackground = useCallback((challengeId: number) => {
    if (savedIdsRef.current.has(challengeId)) return;
    savedIdsRef.current.add(challengeId);
    // Fire and forget — don't await, don't block UI
    completeLessonChallenges([challengeId]).catch(() => {
      savedIdsRef.current.delete(challengeId);
    });
  }, []);

  // Keep exit modal informed of unsaved IDs
  useEffect(() => {
    setPendingSaveIds(completedIdsRef.current);
  });

  // Save remaining progress when lesson finishes
  const saveProgress = useCallback(async () => {
    const unsaved = completedIdsRef.current.filter((id) => !savedIdsRef.current.has(id));
    if (unsaved.length === 0) return;
    setSaving(true);
    try {
      await completeLessonChallenges(unsaved);
      unsaved.forEach((id) => savedIdsRef.current.add(id));
    } catch {
      console.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (isFinished) {
      saveProgress();
      try {
        const audio = new Audio(passed ? "/finish.mp3" : "/incorrect.wav");
        audio.play().catch(() => {});
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setHadMistakeOnCurrent(false);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  // Handle correct answer for self-managing exercises (instant, save in background)
  const handleSelfComplete = () => {
    completedIdsRef.current.push(challenge.id);
    saveInBackground(challenge.id);
    correctControls.play();
    setPercentage((prev) => prev + 100 / challengesList.length);
    if (!hadMistakeOnCurrent) {
      setCorrectFirstAttempt((prev) => prev + 1);
    }
    setTotalAnswered((prev) => prev + 1);
    onNext();
    setStatus("none");
    setSelectedOption(undefined);
  };

  const handleSelfWrong = () => {
    incorrectControls.play();
    setHadMistakeOnCurrent(true);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
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
      saveInBackground(challenge.id);
      correctControls.play();
      setStatus("correct");
      setPercentage((prev) => prev + 100 / challengesList.length);
      if (!hadMistakeOnCurrent) {
        setCorrectFirstAttempt((prev) => prev + 1);
      }
      setTotalAnswered((prev) => prev + 1);
    } else {
      incorrectControls.play();
      setStatus("wrong");
      setHadMistakeOnCurrent(true);
    }
  };

  const handleFinishContinue = () => {
    const target = listId ? `/learn/list/${listId}` : "/learn";
    window.location.href = target;
  };

  const handlePracticeAgain = () => {
    window.location.href = `/lesson/${lessonId}`;
  };

  // Finished screen
  if (isFinished) {
    return (
      <div className="flex flex-col min-h-screen">
        {passed && width > 0 && height > 0 && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            tweenDuration={10000}
          />
        )}
        <div className="flex-1 flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center px-4 sm:px-6 py-8">
          <Image
            src={passed ? "/finish.svg" : "/mascot_bad.svg"}
            alt={passed ? "Terminé" : "Échoué"}
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src={passed ? "/finish.svg" : "/mascot_bad.svg"}
            alt={passed ? "Terminé" : "Échoué"}
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-brilliant-text">
            {passed ? (
              <>Bravo ! <br /> {levelOrder ? `Niveau ${levelOrder} terminé !` : "Tu as terminé la leçon."}</>
            ) : (
              <>Dommage ! <br /> Tu as obtenu {scorePercentage}%. Il faut 90% pour valider.</>
            )}
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challengesList.length * 10} />
            <ResultCard variant="score" value={scorePercentage} />
          </div>
          {saving && (
            <p className="text-sm text-gray-400 animate-pulse">Sauvegarde en cours...</p>
          )}
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={passed ? handleFinishContinue : handlePracticeAgain}
        />
      </div>
    );
  }

  const isSelfManaged = ["FLASHCARD", "MATCHING", "ANAGRAM"].includes(challenge.type);

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
        />
      )}
    </>
  );
};

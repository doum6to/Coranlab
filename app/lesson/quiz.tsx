"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useAudio, useWindowSize } from "react-use";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";

import { upsertChallengeProgress } from "@/actions/challenge-progress";

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

  // Track correct answers on first attempt (no mistakes on that question)
  const [correctFirstAttempt, setCorrectFirstAttempt] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);

  const isFinished = activeIndex >= challengesList.length;
  const challenge = challengesList[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  // Calculate score percentage
  const scorePercentage = totalAnswered > 0 ? Math.round((correctFirstAttempt / totalAnswered) * 100) : 100;
  const passed = scorePercentage >= 90;

  useEffect(() => {
    if (isFinished) {
      try {
        const audio = new Audio(passed ? "/finish.mp3" : "/incorrect.wav");
        audio.play().catch(() => {});
      } catch {}
    }
  }, [isFinished, passed]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setHadMistakeOnCurrent(false);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  // Handle correct answer for self-managing exercises
  const handleSelfComplete = () => {
    startTransition(() => {
      upsertChallengeProgress(challenge.id)
        .then(() => {
          correctControls.play();
          setPercentage((prev) => prev + 100 / challengesList.length);
          if (!hadMistakeOnCurrent) {
            setCorrectFirstAttempt((prev) => prev + 1);
          }
          setTotalAnswered((prev) => prev + 1);
          onNext();
          setStatus("none");
          setSelectedOption(undefined);
        })
        .catch(() => toast.error("Une erreur est survenue. Veuillez réessayer."));
    });
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
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then(() => {
            correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challengesList.length);
            if (!hadMistakeOnCurrent) {
              setCorrectFirstAttempt((prev) => prev + 1);
            }
            setTotalAnswered((prev) => prev + 1);
          })
          .catch(() => toast.error("Une erreur est survenue. Veuillez réessayer."));
      });
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
    switch (challenge.type) {
      case "FLASHCARD":
        return <Flashcard options={options} onComplete={handleSelfComplete} disabled={pending} />;
      case "QCM":
        return <QCM challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "VRAI_FAUX":
        return <VraiFaux challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "MATCHING":
        return <Matching options={options} onComplete={handleSelfComplete} disabled={pending} />;
      case "ANAGRAM":
        return <Anagram challenge={challenge} options={options} onCorrect={handleSelfComplete} onWrong={handleSelfWrong} disabled={pending} />;
      case "QCM_INVERSE":
        return <QCMInverse challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
      case "DRAG_DROP":
        return <DragDrop challenge={challenge} options={options} onSelect={onSelect} selectedOption={selectedOption} status={status} disabled={pending} />;
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
        <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
          <div className="lg:min-h-[350px] w-full max-w-lg px-4 sm:px-6 lg:px-0 flex flex-col gap-y-6 sm:gap-y-8">
            <h1 className="text-base sm:text-lg lg:text-2xl text-center font-bold text-brilliant-text">
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

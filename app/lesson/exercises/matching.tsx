"use client";

import { useEffect } from "react";

import { challengeOptions } from "@/db/schema";
import { useT } from "@/lib/i18n/use-t";
import { MatchBoard, type ExerciseAction } from "./choice";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onComplete: () => void;
  /** Tells the lesson what its footer button does for this exercise. */
  onAction: (action: ExerciseAction) => void;
  disabled?: boolean;
};

export const Matching = ({ options, onComplete, onAction, disabled }: Props) => {
  const t = useT();
  const pairs = options.filter((o) => o.arabicText && o.frenchText);

  // Nothing to confirm here: the footer waits until every pair is found.
  useEffect(() => {
    onAction({ label: "next", disabled: true, run: () => {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center">
      <MatchBoard pairs={pairs} onDone={onComplete} disabled={disabled} label={`${t.exercises.arabicColumn} / ${t.exercises.translationColumn}`} />
    </div>
  );
};

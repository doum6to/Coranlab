import type { ReactNode } from "react";
import { useKey } from "react-use";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useT } from "@/lib/i18n/use-t";
import { KOJI_CROP, RiveAnim } from "@/app/(sales)/commencer/ui";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  correctAnswer?: ReactNode;
  /** Replaces "Answer:" in front of `correctAnswer` (an exercise whose answer is not a word). */
  answerLabel?: string;
  /** XP this answer is worth (shown on a right answer). */
  gain?: number;
  /** The button moves on without anything to check (cards to read, pairs to finish). */
  nextOnly?: boolean;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  correctAnswer,
  answerLabel,
  gain,
  nextOnly,
}: Props) => {
  const t = useT();
  useKey("Enter", onCheck, {}, [onCheck]);
  const answered = status === "correct" || status === "wrong";
  const ok = status === "correct";

  return (
    <footer
      className={cn(
        "relative shrink-0 transition-colors duration-200",
        !answered && "border-t border-[#E0E0E0] bg-white",
        ok && "bg-[#E9F9EC]",
        status === "wrong" && "bg-[#FDEEEE]",
        answered && "rounded-t-3xl",
      )}
    >
      {/* Koji pops over the edge of the sheet on a right answer */}
      {ok && (
        <div className="pointer-events-none absolute -top-[46px] right-6 h-[68px] w-[68px] animate-fade-in-up" aria-hidden>
          <RiveAnim src="/animations/okok_clear.riv" animation="yup" crop={KOJI_CROP} />
        </div>
      )}
      <div className={cn("relative mx-auto w-full max-w-lg px-4 pb-[max(18px,env(safe-area-inset-bottom))] sm:px-6", answered ? "pt-4" : "pt-3")}>
        {answered && (
          <div aria-live="polite">
            <div className="flex items-baseline justify-between gap-3">
              <p className={cn("font-heading text-[1.1875rem] font-extrabold", ok ? "text-[#15803D]" : "text-[#B42323]")} style={{ letterSpacing: "-0.01em" }}>
                {ok ? t.reward.right : t.reward.almost}
              </p>
              {ok && gain !== undefined && (
                <p className="flex items-center gap-1 text-sm font-bold text-[#15803D]">
                  <Sparkles className="h-[15px] w-[15px]" strokeWidth={2.4} fill="currentColor" fillOpacity={0.14} aria-hidden />+{gain} {t.reward.xp}
                </p>
              )}
            </div>
            {!ok && correctAnswer && (
              <p className="mt-0.5 text-[0.9375rem] leading-snug text-brilliant-text">
                <span className="text-[#555]">{answerLabel ?? t.reward.answerWas}</span> <span className="font-semibold">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}
        <div className={cn("flex items-center gap-3", answered && "mt-3.5")}>
          {status === "completed" && (
            <div className="flex-1">
              <ShinyButton variant="outline-green" onClick={() => window.location.href = `/lesson/${lessonId}`}>
                {t.lesson.practiceAgain}
              </ShinyButton>
            </div>
          )}
          {ok ? (
            <button
              type="button"
              onClick={onCheck}
              className="h-[54px] w-full select-none rounded-2xl bg-[#22B455] text-base font-bold text-white shadow-[0_4px_0_0_#16873E] transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:!shadow-none"
            >
              {t.lesson.next}
            </button>
          ) : (
            <div className="flex-1">
              <ShinyButton variant={status === "wrong" ? "dark" : "green"} disabled={disabled} onClick={onCheck} className="text-base">
                <span className="block py-1">
                  {status === "none" && (nextOnly ? t.lesson.continue : t.lesson.check)}
                  {status === "wrong" && t.lesson.next}
                  {status === "completed" && t.lesson.continue}
                </span>
              </ShinyButton>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

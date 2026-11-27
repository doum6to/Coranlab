"use client";

import Link from "next/link";
import { LevelNode } from "@/components/level-node";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-t";

type Props = {
  lessonId: number;
  levelOrder: number;
  levelName: string;
  levelDescription: string;
  completed: boolean;
  locked: boolean;
  active: boolean;
  percentage: number;
  isLast: boolean;
};

export const LevelCard = ({
  lessonId,
  levelOrder,
  levelName,
  levelDescription,
  completed,
  locked,
  active,
  percentage,
  isLast,
}: Props) => {
  const t = useT();
  const href = `/lesson/${lessonId}`;
  const state = completed ? "completed" : active ? "active" : "locked";

  const content = (
    <div className="flex items-center justify-center gap-3 sm:gap-5 w-full group">
      <div className="flex flex-col items-center shrink-0" style={{ overflow: "visible" }}>
        <LevelNode state={state} isLast={isLast} />
      </div>

      <div className="w-[11.5rem] min-w-0">
        <p className={cn(
          "text-[1.0625rem] font-bold leading-tight",
          completed && "text-brilliant-text",
          active && "text-brilliant-text",
          locked && "text-[#8A8A93]"
        )}>
          {levelName}
        </p>
        <p className={cn(
          "mt-0.5 text-[0.8125rem] font-medium leading-snug tabular-nums",
          completed && "text-brilliant-muted",
          active && "text-brilliant-muted",
          locked && "text-[#A9A9B8]"
        )}>
          {levelDescription}
        </p>

        {active && percentage > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#EDEDF3]">
              <div
                className="h-full bg-brilliant-green rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[0.8125rem] font-semibold tabular-nums text-[#5452E0]">{percentage}&nbsp;%</span>
          </div>
        )}
        {completed && (
          <p className="mt-1 text-[0.8125rem] font-semibold text-[#5452E0]">{t.common.levelCompleted}</p>
        )}
      </div>
    </div>
  );

  if (locked) {
    return <div className="w-full cursor-not-allowed py-2 sm:py-3">{content}</div>;
  }

  return (
    <Link href={href} className="block w-full select-none rounded-3xl py-2 transition-colors active:bg-[#F7F7FF] sm:py-3">
      {content}
    </Link>
  );
};

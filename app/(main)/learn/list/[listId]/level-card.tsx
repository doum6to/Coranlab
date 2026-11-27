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

      <div className="min-w-0 max-w-[14rem]">
        <p className={cn(
          "text-base sm:text-lg font-bold leading-tight",
          completed && "text-brilliant-text",
          active && "text-brilliant-text",
          locked && "text-brilliant-muted"
        )}>
          {levelName}
        </p>
        <p className={cn(
          "text-xs sm:text-sm mt-0.5 leading-snug",
          completed && "text-brilliant-muted",
          active && "text-brilliant-muted",
          locked && "text-brilliant-muted/60"
        )}>
          {levelDescription}
        </p>

        {active && percentage > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-20 h-[5px] bg-brilliant-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brilliant-green rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-brilliant-green">{percentage}%</span>
          </div>
        )}
        {completed && (
          <p className="text-xs font-semibold text-brilliant-green mt-1">{t.common.levelCompleted}</p>
        )}
      </div>
    </div>
  );

  if (locked) {
    return <div className="w-full cursor-not-allowed py-2 sm:py-3">{content}</div>;
  }

  return (
    <Link href={href} className="w-full hover:opacity-90 transition py-2 sm:py-3 block">
      {content}
    </Link>
  );
};

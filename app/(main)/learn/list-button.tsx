"use client";

import Link from "next/link";
import { Check, Crown, BookOpen } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import "react-circular-progressbar/dist/styles.css";

type Props = {
  listId: number;
  listTitle: string;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  completed?: boolean;
  completedLevels: number;
  totalLevels: number;
};

export const ListButton = ({
  listId,
  listTitle,
  index,
  totalCount,
  locked,
  current,
  completed,
  completedLevels,
  totalLevels,
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isLast = index === totalCount;

  const Icon = completed ? Check : isLast ? Crown : BookOpen;
  const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  const href = `/learn/list/${listId}`;

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !completed ? 60 : 24,
        }}
      >
        {current ? (
          <div className="h-[102px] w-[102px] relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-2 border-2 border-brilliant-green font-bold uppercase text-brilliant-green bg-white rounded-xl animate-bounce tracking-wide z-10 text-xs whitespace-nowrap shadow-sm">
              {completedLevels > 0 ? `${completedLevels}/${totalLevels}` : "Commencer"}
              <div
                className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-brilliant-green transform -translate-x-1/2"
              />
            </div>
            <CircularProgressbarWithChildren
              value={Number.isNaN(percentage) ? 0 : percentage}
              styles={{
                path: {
                  stroke: "#6967fb",
                },
                trail: {
                  stroke: "#E8E8E8",
                },
              }}
            >
              <Button
                size="rounded"
                variant={locked ? "locked" : "secondary"}
                className="h-[70px] w-[70px] border-b-8"
              >
                <Icon
                  className={cn(
                    "h-10 w-10",
                    locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-white text-white",
                    completed && "fill-none stroke-[4]"
                  )}
                />
              </Button>
            </CircularProgressbarWithChildren>
          </div>
        ) : (
          <Button
            size="rounded"
            variant={locked ? "locked" : "secondary"}
            className="h-[70px] w-[70px] border-b-8"
          >
            <Icon
              className={cn(
                "h-10 w-10",
                locked
                ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                : "fill-white text-white",
                completed && "fill-none stroke-[4]"
              )}
            />
          </Button>
        )}
        {/* List title label */}
        <p className={cn(
          "text-[11px] sm:text-xs text-center mt-2 font-semibold max-w-[110px] leading-tight",
          locked ? "text-brilliant-muted" : "text-brilliant-text",
          completed && "text-brilliant-green"
        )}>
          {listTitle}
        </p>
      </div>
    </Link>
  );
};

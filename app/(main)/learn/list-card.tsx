"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Lock } from "lucide-react";
import { getListImage } from "@/lib/list-images";

type Props = {
  listId: number;
  listTitle: string;
  locked?: boolean;
  current?: boolean;
  completed?: boolean;
  completedLevels: number;
  totalLevels: number;
  /** "dashboard" shows level + progress, "lecons" shows only title + illustration + button */
  context?: "dashboard" | "lecons";
  /** True if this list is locked behind Premium */
  isPremiumLocked?: boolean;
  /** Active lesson ID to go directly to the exercise */
  activeLessonId?: number;
};

export const ListCard = ({
  listId,
  listTitle,
  locked,
  current,
  completed,
  completedLevels,
  totalLevels,
  context = "dashboard",
  isPremiumLocked,
  activeLessonId,
}: Props) => {
  const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  const isLecons = context === "lecons";
  const href = isPremiumLocked
    ? "/premium"
    : isLecons
      ? `/lecons/list/${listId}`
      : `/learn/list/${listId}`;

  const buttonLabel = isPremiumLocked
    ? "Premium"
    : isLecons
      ? (locked ? "Verrouillé" : "Réviser")
      : (locked ? "Verrouillé" : completed ? "Réviser" : completedLevels > 0 ? "Continuer" : "Commencer");

  const cardContent = (
    <div
      className={cn(
        "w-[220px] sm:w-[240px] rounded-2xl border-2 border-[#E0E0E0] p-4 sm:p-5 flex flex-col transition-all h-full bg-white",
        locked && !isPremiumLocked && "opacity-60",
        isPremiumLocked && "opacity-75",
      )}
      style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
    >
      {/* Premium lock badge */}
      {isPremiumLocked && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Lock className="w-3.5 h-3.5 text-brilliant-text" />
          <span className="text-xs font-bold text-brilliant-text">Premium</span>
        </div>
      )}

      {/* Title — centered top */}
      <h3 className={cn(
        "text-sm font-bold leading-tight text-center mb-2",
        locked || isPremiumLocked ? "text-brilliant-muted" : "text-brilliant-text"
      )}>
        {listTitle}
      </h3>

      {/* Level status + progress bar — only on dashboard, not premium-locked */}
      {!isLecons && !isPremiumLocked && (
        <div className="text-center mb-3">
          {!locked && (
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wide mb-2",
              "text-brilliant-green"
            )}>
              {completed ? "Complétée ✓" : `Niveau ${completedLevels + 1}`}
            </p>
          )}
          {!locked && (
            <div className="w-full h-[5px] bg-brilliant-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brilliant-green rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Illustration */}
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 flex items-center justify-center relative">
        <Image
          src={getListImage(listTitle)}
          alt={listTitle}
          width={480}
          height={480}
          quality={80}
          sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
          className={cn(
            "w-full h-full object-cover mix-blend-darken",
            (locked || isPremiumLocked) && "grayscale opacity-50"
          )}
        />
        {(locked || isPremiumLocked) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
            <Lock className="w-10 h-10 text-gray-500" />
          </div>
        )}
      </div>

      {/* CTA Button — shiny style */}
      <ShinyButton
        variant={isPremiumLocked ? "dark" : locked ? "gray" : completed ? "outline-green" : "green"}
        disabled={locked && !isPremiumLocked}
      >
        {buttonLabel}
      </ShinyButton>
    </div>
  );

  return (
    <Link
      href={href}
      aria-disabled={locked && !isPremiumLocked}
      style={{ pointerEvents: locked && !isPremiumLocked ? "none" : "auto" }}
      className="block shrink-0"
    >
      {cardContent}
    </Link>
  );
};

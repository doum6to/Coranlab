"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Lock } from "lucide-react";
import { spendKey } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
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
  /** True if this list is locked because the unit requires a key */
  keyLocked?: boolean;
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
  keyLocked,
  activeLessonId,
}: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { open: openKeysModal } = useHeartsModal();
  const percentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  const isLecons = context === "lecons";
  const href = isLecons ? `/lecons/list/${listId}` : `/learn/list/${listId}`;

  const buttonLabel = keyLocked
    ? "Déverrouiller"
    : isLecons
      ? (locked ? "Verrouillé" : "Réviser")
      : (locked ? "Verrouillé" : completed ? "Réviser" : completedLevels > 0 ? "Continuer" : "Commencer");

  const handleKeyUnlock = () => {
    if (pending) return;
    startTransition(async () => {
      const result = await spendKey(listId);
      if (result?.error === "no_keys") {
        openKeysModal();
      } else if (result?.success) {
        router.push(href);
        router.refresh();
      }
    });
  };

  const cardContent = (
    <div
      className={cn(
        "w-[220px] sm:w-[240px] rounded-2xl border-2 border-[#E0E0E0] p-4 sm:p-5 flex flex-col transition-all h-full bg-white",
        locked && !keyLocked && "opacity-60",
        keyLocked && "opacity-75",
      )}
      style={{ boxShadow: "0 4px 0 0 #D4D4D4" }}
    >
      {/* Key lock badge */}
      {keyLocked && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Image src="/key.svg" alt="Clé" width={16} height={16} className="brightness-0" />
          <span className="text-xs font-bold text-brilliant-text">Clé requise</span>
        </div>
      )}

      {/* Title — centered top */}
      <h3 className={cn(
        "text-sm font-bold leading-tight text-center mb-2",
        locked ? "text-brilliant-muted" : "text-brilliant-text"
      )}>
        {listTitle}
      </h3>

      {/* Level status + progress bar — only on dashboard, not key-locked */}
      {!isLecons && !keyLocked && (
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
            locked && "grayscale opacity-50"
          )}
        />
        {(locked || keyLocked) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
            <Lock className="w-10 h-10 text-gray-500" />
          </div>
        )}
      </div>

      {/* CTA Button — shiny style */}
      <ShinyButton
        variant={keyLocked ? "dark" : locked ? "gray" : completed ? "outline-green" : "green"}
        disabled={locked && !keyLocked}
      >
        {pending ? "..." : buttonLabel}
      </ShinyButton>
    </div>
  );

  // Key-locked cards are clickable (to spend a key)
  if (keyLocked) {
    return (
      <div
        onClick={handleKeyUnlock}
        className="block shrink-0 cursor-pointer"
      >
        {cardContent}
      </div>
    );
  }

  // Normal locked cards are not clickable
  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
      className="block shrink-0"
    >
      {cardContent}
    </Link>
  );
};

"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { UserButton } from "./user-button";
import {
  HomeIcon,
  CoursIcon,
  LeaderboardIcon,
  QuestsIcon,
} from "./sidebar-icons";

type Props = {
  className?: string;
  streak?: number;
  keys?: number;
  isPro?: boolean;
  hasActiveSubscription?: boolean;
};

export const Sidebar = ({ className, streak, keys, isPro, hasActiveSubscription }: Props) => {
  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r border-brilliant-border flex-col bg-white",
      className,
    )}>
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-2">
          <h1 className="text-2xl font-extrabold text-brilliant-text tracking-wide font-heading">
            Quranlab
          </h1>
        </div>
      </Link>

      {/* Streak & Keys */}
      {streak !== undefined && (
        <div className="flex items-center justify-around px-2 py-3 mb-2 rounded-xl bg-gray-50">
          <div className="flex items-center gap-x-1.5 text-brilliant-orange">
            <Image src="/points.svg" height={22} width={22} alt="Streak" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <Link href="/shop" className="flex items-center gap-x-1.5 text-yellow-500 hover:opacity-80 transition">
            <Image src="/key.svg" height={20} width={20} alt="Clés" />
            <span className="text-sm font-bold">
              {hasActiveSubscription ? "∞" : (keys ?? 0)}
            </span>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem
          label="Apprendre"
          href="/learn"
          icon={HomeIcon}
        />
        <SidebarItem
          label="Leçons"
          href="/lecons"
          icon={CoursIcon}
        />
        <SidebarItem
          label="Classement"
          href="/leaderboard"
          icon={LeaderboardIcon}
        />
      </div>

      {/* Passer en Premium */}
      {!isPro && (
        <div className="px-2 pb-2">
          <div
            className="rounded-2xl p-4 flex flex-col items-center text-center"
            style={{
              background: "linear-gradient(135deg, rgba(69,109,255,0.06), rgba(135,77,229,0.06), rgba(227,80,227,0.06), rgba(247,195,37,0.06))",
              border: "1px solid rgba(135,77,229,0.12)",
            }}
          >
            <Image src="/unlimited.svg" alt="Premium" height={56} width={56} className="mb-3" />
            <p className="text-xs text-brilliant-muted leading-snug mb-3">
              <span className="font-bold text-brilliant-text">Débloque toutes les leçons avec Premium</span> pour être plus rapide et intelligent.
            </p>
            <Link
              href="/shop"
              className="w-full rounded-xl py-2.5 text-xs font-bold text-white text-center block transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] animate-premium-gradient"
              style={{
                background: "linear-gradient(90deg, #050C38 0%, #6700A3 25%, #E02F75 50%, #FF5A57 75%, #050C38 100%)",
                backgroundSize: "400% 100%",
                boxShadow: "0 3px 0 0 rgba(5, 12, 56, 0.4)",
              }}
            >
              Découvrir Premium
            </Link>
          </div>
        </div>
      )}

      <div className="p-4">
        <UserButton />
      </div>
    </div>
  );
};

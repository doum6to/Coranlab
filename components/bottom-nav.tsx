"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

import { useT } from "@/lib/i18n/use-t";
import { CoursIcon, HomeIcon, LeaderboardIcon } from "./sidebar-icons";

/**
 * Tab bar of the mobile app shell: a floating pill with the four places of the app, always
 * one tap away (they used to sit in a drawer behind a menu button). Hidden on large screens,
 * where the sidebar plays that role.
 */
export function BottomNav() {
  const t = useT();
  const pathname = usePathname() || "";
  const tabs = [
    { href: "/learn", label: t.home.navHome, icon: <HomeIcon className="h-[22px] w-[22px]" /> },
    { href: "/lecons", label: t.home.navReview, icon: <CoursIcon className="h-[22px] w-[22px]" /> },
    { href: "/leaderboard", label: t.home.navRanking, icon: <LeaderboardIcon className="h-[22px] w-[22px]" /> },
    { href: "/profil", label: t.home.navProfile, icon: <User className="h-[22px] w-[22px]" strokeWidth={2.4} /> },
  ];
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 lg:hidden" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }} aria-label="Navigation">
      <ul className="pointer-events-auto flex items-stretch gap-1 rounded-full bg-white p-1.5" style={{ boxShadow: "0 0 0 1px #ECECF2, 0 12px 30px -12px rgba(20,18,45,.28)" }}>
        {tabs.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined}
                className="flex h-[52px] w-[76px] select-none flex-col items-center justify-center gap-1 rounded-full transition-[transform,background-color] duration-150 active:scale-95"
                style={{ color: active ? "#6967FB" : "#8A8A93", background: active ? "#F0F0FF" : "transparent" }}>
                {icon}
                <span className={`text-[0.6875rem] leading-none ${active ? "font-bold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

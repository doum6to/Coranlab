"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/lib/i18n/use-t";
import { CoursIcon, HomeIcon, LeaderboardIcon, SettingsIcon, ShopIcon } from "./sidebar-icons";

/**
 * Tab bar of the mobile app shell: the five places of the app, always one tap away
 * (they used to sit in a drawer behind a menu button). Hidden on large screens, where
 * the sidebar plays that role.
 */
export function BottomNav() {
  const t = useT();
  const pathname = usePathname() || "";
  const tabs = [
    { href: "/learn", label: t.home.navHome, Icon: HomeIcon },
    { href: "/lecons", label: t.home.navReview, Icon: CoursIcon },
    { href: "/leaderboard", label: t.home.navRanking, Icon: LeaderboardIcon },
    { href: "/boutique", label: t.home.navShop, Icon: ShopIcon },
    { href: "/settings", label: t.home.navProfile, Icon: SettingsIcon },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-brilliant-border bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Navigation">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className="flex h-[58px] select-none flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-95" style={{ color: active ? "#6967FB" : "#9A9A9A" }}>
                <Icon className="h-[22px] w-[22px]" />
                <span className={`text-[0.6875rem] leading-none ${active ? "font-bold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import Link from "next/link";
import { Flame } from "lucide-react";

import { MobilePremiumButton } from "./mobile-premium-button";

type Props = {
  streak?: number;
  isPro?: boolean;
};

/**
 * Top bar of the mobile app shell: the name of the app and the learner's streak. Moving around
 * the app is the job of the tab bar at the bottom.
 */
export const MobileHeader = ({ streak, isPro }: Props) => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center justify-between bg-white px-4 lg:hidden">
      <Link href="/learn" className="font-heading text-[1.1875rem] font-bold text-brilliant-text" style={{ letterSpacing: "-0.02em" }}>
        Quranlab
      </Link>

      {streak !== undefined && (
        <div className="flex items-center gap-x-2.5">
          {!isPro && <MobilePremiumButton />}
          <Link
            href="/profil"
            className="flex h-9 select-none items-center gap-1.5 rounded-full pl-3.5 pr-2.5 transition-transform duration-100 active:scale-95"
            style={{ boxShadow: "inset 0 0 0 1.5px #ECECF2" }}
          >
            <span className="text-[0.9375rem] font-bold text-brilliant-text" style={{ fontVariantNumeric: "tabular-nums" }}>{streak}</span>
            <Flame className="h-[18px] w-[18px]" style={{ color: streak > 0 ? "#FF7A1A" : "#B9B9C3" }} strokeWidth={2.4} fill="currentColor" fillOpacity={0.18} aria-hidden />
          </Link>
        </div>
      )}
    </nav>
  );
};

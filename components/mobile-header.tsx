import Image from "next/image";
import { MobileSidebar } from "./mobile-sidebar";
import { MobilePremiumButton } from "./mobile-premium-button";

type Props = {
  streak?: number;
  isPro?: boolean;
};

export const MobileHeader = ({ streak, isPro }: Props) => {
  return (
    <nav className="lg:hidden px-4 h-[50px] flex items-center justify-between bg-white border-b border-brilliant-border fixed top-0 w-full z-50">
      <MobileSidebar />

      {/* Right side */}
      {streak !== undefined && (
        <div className="flex items-center gap-x-3">
          {!isPro && <MobilePremiumButton />}
          <div className="flex items-center gap-x-1 text-brilliant-orange">
            <Image src="/points.svg" height={18} width={18} alt="Streak" />
            <span className="text-xs font-bold">{streak}</span>
          </div>
        </div>
      )}
    </nav>
  );
};

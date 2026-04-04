import Image from "next/image";
import Link from "next/link";
import { MobileSidebar } from "./mobile-sidebar";

type Props = {
  streak?: number;
  keys?: number;
  isPro?: boolean;
};

export const MobileHeader = ({ streak, keys, isPro }: Props) => {
  return (
    <nav className="lg:hidden px-4 h-[50px] flex items-center justify-between bg-white border-b border-brilliant-border fixed top-0 w-full z-50">
      <MobileSidebar />

      {/* Streak & Keys — right side */}
      {streak !== undefined && (
        <div className="flex items-center gap-x-3">
          <div className="flex items-center gap-x-1 text-brilliant-orange">
            <Image src="/points.svg" height={18} width={18} alt="Streak" />
            <span className="text-xs font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-x-1 text-yellow-500">
            <Image src="/key.svg" height={16} width={16} alt="Clés" />
            <span className="text-xs font-bold">
              {isPro ? "∞" : (keys ?? 0)}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

import { Flame, Sparkles, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { WordSoundToggle } from "@/components/word-audio";
import { TranslitToggle } from "@/components/translit";
import { hasAnyWordAudio } from "@/lib/word-audio";
import { CountUp } from "@/components/fx";
import { useT } from "@/lib/i18n/use-t";
import { tpl } from "@/lib/i18n/locales";

type Props = {
  hearts: number;
  percentage: number;
  hasActiveSubscription: boolean;
  /** XP collected in this session (shown live). */
  xp?: number;
  /** Right answers in a row. */
  combo?: number;
};

export const Header = ({
  percentage,
  xp,
  combo = 0,
}: Props) => {
  const { open } = useExitModal();
  const t = useT();

  return (
    <header className="lg:pt-[50px] pt-[12px] pb-[8px] shrink-0 px-4 sm:px-10 max-w-[1140px] mx-auto w-full">
      <div className="flex gap-x-3 sm:gap-x-5 items-center justify-between">
        <X
          onClick={open}
          className="text-brilliant-muted hover:opacity-75 transition cursor-pointer shrink-0"
        />
        <Progress value={percentage} />
        {xp !== undefined && (
          <span className="flex shrink-0 items-center gap-1 text-[0.9375rem] font-bold text-brilliant-text" aria-label={`${xp} ${t.reward.xp}`}>
            <Sparkles className="h-[17px] w-[17px] text-[#6967FB]" strokeWidth={2.4} fill="currentColor" fillOpacity={0.14} aria-hidden />
            <CountUp value={xp} duration={450} />
          </span>
        )}
        <div className="-ml-1 flex shrink-0 items-center">
          <TranslitToggle />
          {hasAnyWordAudio && <WordSoundToggle />}
        </div>
      </div>
      {/* Combo: appears from three right answers in a row */}
      <div className="flex h-6 items-center justify-center">
        {combo >= 3 && (
          <span key={combo} className="animate-xp-pop inline-flex items-center gap-1 rounded-full bg-[#FFF1E0] px-2.5 py-0.5 text-xs font-bold text-[#E8590C]">
            <Flame className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
            {tpl(t.reward.combo, { n: combo })}
          </span>
        )}
      </div>
    </header>
  );
};

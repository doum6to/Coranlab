import Image from "next/image";
import {
  CalendarCheck,
  Clock,
  Divide,
  FlaskConical,
  Flame,
  Heart,
  Infinity as InfinityIcon,
  Plus,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { Sparkle, Star } from "./doodles";

/**
 * Per-section illustrative scene — a tilted phone mockup + one of the app's
 * characters + themed floating "chips", in the landing's art direction.
 * Each variant is themed to the section it illustrates (instead of a random
 * character on a blob).
 */

type Chip = { Icon: React.ComponentType<{ className?: string }>; color: string };

type SceneConfig = {
  character: string;
  /** Phone body + accents color. */
  frame: string;
  /** Soft background blob color. */
  blob: string;
  /** Color of the highlighted "progress" bar inside the phone. */
  bar: string;
  chips: [Chip, Chip, Chip];
};

const SCENES: Record<string, SceneConfig> = {
  lifetime: {
    character: "/mascot.svg",
    frame: "#6967fb",
    blob: "#6967fb",
    bar: "#6967fb",
    chips: [
      { Icon: InfinityIcon, color: "#6967fb" },
      { Icon: Sparkles, color: "#f6c343" },
      { Icon: Heart, color: "#ff7eb0" },
    ],
  },
  science: {
    character: "/robot.svg",
    frame: "#46c4f2",
    blob: "#46c4f2",
    bar: "#46c4f2",
    chips: [
      { Icon: FlaskConical, color: "#46c4f2" },
      { Icon: Divide, color: "#6967fb" },
      { Icon: Plus, color: "#f6923a" },
    ],
  },
  motivation: {
    character: "/girl.svg",
    frame: "#f6923a",
    blob: "#f6923a",
    bar: "#58cc6a",
    chips: [
      { Icon: Flame, color: "#f6923a" },
      { Icon: Trophy, color: "#f6c343" },
      { Icon: Zap, color: "#6967fb" },
    ],
  },
  pace: {
    character: "/boy.svg",
    frame: "#58cc6a",
    blob: "#58cc6a",
    bar: "#58cc6a",
    chips: [
      { Icon: Clock, color: "#46c4f2" },
      { Icon: CalendarCheck, color: "#58cc6a" },
      { Icon: Sparkles, color: "#f6c343" },
    ],
  },
};

function ChipBadge({
  Icon,
  color,
  className,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`absolute flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_10px_20px_-8px_rgba(0,0,0,0.45)] ${className}`}
      style={{ backgroundColor: color }}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function Scene({ variant }: { variant: keyof typeof SCENES }) {
  const s = SCENES[variant];

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[360px] sm:h-[340px]">
      {/* soft blob */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] sm:h-[260px] sm:w-[260px]"
        style={{ backgroundColor: s.blob, opacity: 0.12 }}
      />

      {/* doodles */}
      <Sparkle className="absolute left-6 top-4 h-6 w-6 text-neutral-900/70" />
      <Star className="absolute right-7 bottom-8 h-5 w-5 text-neutral-900/30" />

      {/* phone mockup */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg]">
        <div
          className="rounded-[24px] p-2 shadow-[0_24px_45px_-20px_rgba(0,0,0,0.5)]"
          style={{ backgroundColor: s.frame }}
        >
          <div className="w-[150px] rounded-[18px] bg-white px-3 py-4">
            <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-neutral-200" />
            <div className="space-y-2">
              <div
                className="h-3 rounded-full"
                style={{ backgroundColor: s.bar }}
              />
              <div className="h-3 w-3/4 rounded-full bg-neutral-200" />
              <div className="h-3 w-2/3 rounded-full bg-neutral-200" />
            </div>
            <div
              className="mt-4 h-7 rounded-xl"
              style={{ backgroundColor: s.bar }}
            />
          </div>
        </div>
      </div>

      {/* character */}
      <Image
        src={s.character}
        alt=""
        width={180}
        height={200}
        className="absolute left-1/2 top-1/2 h-[170px] w-auto -translate-x-[68%] -translate-y-[72%] object-contain drop-shadow-md sm:h-[190px]"
      />

      {/* floating themed chips */}
      <ChipBadge
        Icon={s.chips[0].Icon}
        color={s.chips[0].color}
        className="right-6 top-6 rotate-6"
      />
      <ChipBadge
        Icon={s.chips[1].Icon}
        color={s.chips[1].color}
        className="left-4 bottom-12 -rotate-6"
      />
      <ChipBadge
        Icon={s.chips[2].Icon}
        color={s.chips[2].color}
        className="right-10 bottom-2 rotate-12"
      />
    </div>
  );
}

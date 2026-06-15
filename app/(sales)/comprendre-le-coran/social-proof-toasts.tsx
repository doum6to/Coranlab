"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";

/** Muslim first names (mixed) used in the social-proof notifications. */
const NAMES = [
  "Yassine", "Mohamed", "Amine", "Bilal", "Hamza", "Omar", "Idriss", "Ismaël",
  "Ibrahim", "Younes", "Mehdi", "Anas", "Rayan", "Adam", "Sami", "Karim",
  "Nabil", "Sofiane", "Walid", "Reda", "Fatima", "Aïcha", "Khadija", "Mariam",
  "Inès", "Sara", "Salma", "Nour", "Imane", "Yasmine", "Leïla", "Lina",
  "Maya", "Assia", "Sofia", "Amira", "Rania", "Hanae", "Manel", "Soumaya",
];

const PRODUCT = "Guide Comprendre 85% du Coran";

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Notif = { name: string; mins: number };

/**
 * Random "X a acheté …" purchase notifications, bottom-left. Spacing is
 * deliberately wide and randomized (one at a time, ~30–75 s apart) so it reads
 * as genuine activity, not a spammy fake ticker. Sits above the sticky CTA bar.
 */
export function SocialProofToasts() {
  const [notif, setNotif] = useState<Notif | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    const run = () => {
      setNotif({ name: pick(NAMES), mins: Math.floor(rand(2, 47)) });
      setVisible(true);
      // Stay ~5 s, then fade out…
      hideTimer = setTimeout(() => setVisible(false), 5000);
      // …and schedule the next one 30–75 s later.
      nextTimer = setTimeout(run, rand(30_000, 75_000));
    };

    // First notification 8–14 s after load (let the page settle first).
    showTimer = setTimeout(run, rand(8000, 14_000));

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-24 left-3 z-40 sm:bottom-6 sm:left-5">
      <div
        className={`flex max-w-[300px] items-center gap-3 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur transition-all duration-500 ${
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brilliant-green/10 text-brilliant-green">
          <BadgeCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[13px] leading-snug text-neutral-800">
            <span className="font-bold">{notif?.name}</span> a acheté{" "}
            <span className="font-semibold">{PRODUCT}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            il y a {notif?.mins} min · achat vérifié
          </p>
        </div>
      </div>
    </div>
  );
}

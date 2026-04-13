"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > 600;

      const finalCta = document.getElementById("final-cta");
      let atFinalCta = false;
      if (finalCta) {
        const rect = finalCta.getBoundingClientRect();
        atFinalCta = rect.top <= window.innerHeight;
      }

      setVisible(pastHero && !atFinalCta);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b border-brilliant-border bg-white/95 backdrop-blur-sm px-4 py-3 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-[988px] mx-auto flex items-center justify-between gap-4">
        <p className="hidden sm:block text-sm font-medium text-brilliant-text">
          Apprends 85% des mots du Coran gratuitement
        </p>
        <Link
          href="/onboarding"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6967fb] px-6 py-2.5 text-sm font-bold text-white uppercase tracking-wide shadow-[0_3px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.97] active:shadow-[0_1px_0_0_#5250d4] active:translate-y-[1px]"
        >
          Commencer gratuitement
        </Link>
      </div>
    </div>
  );
}

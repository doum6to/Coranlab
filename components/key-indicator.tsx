"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  count: number | string;
  size?: "sm" | "md";
  colorClassName?: string;
};

export const KeyIndicator = ({ count, size = "md", colorClassName = "text-yellow-500" }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [open]);

  const iconSize = size === "sm" ? 16 : 20;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      ref={ref}
      className="relative group"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("flex items-center gap-x-1.5 cursor-pointer select-none", colorClassName)}
        aria-label="Information sur les clés"
      >
        <Image src="/key.svg" height={iconSize} width={iconSize} alt="Clés" />
        <span className={cn("font-bold", textClass)}>{count}</span>
      </button>

      {/* Desktop tooltip (hover) */}
      <div
        className="hidden lg:group-hover:block absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs font-medium px-3 py-2 shadow-lg pointer-events-none"
      >
        1 clé offerte chaque semaine
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900" />
      </div>

      {/* Mobile popup (click) */}
      {open && (
        <div className="lg:hidden absolute z-50 top-full mt-2 right-0 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs font-medium px-3 py-2 shadow-lg">
          1 clé offerte chaque semaine
          <span className="absolute -top-1 right-3 w-2 h-2 rotate-45 bg-gray-900" />
        </div>
      )}
    </div>
  );
};

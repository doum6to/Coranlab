"use client";

import { TIER_COLORS, TIER_LABELS, type LeagueTier } from "@/lib/league-utils";

type Props = {
  tier: LeagueTier;
  size?: "sm" | "md" | "lg";
};

export const LeagueTierBadge = ({ tier, size = "md" }: Props) => {
  const color = TIER_COLORS[tier];
  const label = TIER_LABELS[tier];

  const sizes = {
    sm: { shield: 28, font: "text-xs" },
    md: { shield: 44, font: "text-sm" },
    lg: { shield: 64, font: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={s.shield}
        height={s.shield * 1.15}
        viewBox="0 0 44 50"
        fill="none"
      >
        <path
          d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
          fill={color}
          opacity={0.15}
        />
        <path
          d="M22 2L4 10V22C4 34 22 48 22 48C22 48 40 34 40 22V10L22 2Z"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          fill="none"
        />
        <text
          x="22"
          y="28"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill={color}
        >
          {TIER_LABELS[tier].charAt(0)}
        </text>
      </svg>
      <span className={`font-semibold ${s.font}`} style={{ color }}>
        {label}
      </span>
    </div>
  );
};

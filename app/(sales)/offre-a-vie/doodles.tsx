/* Hand-drawn marker doodles used to decorate the hero — pure inline SVG,
   no assets. `currentColor` so they inherit text color. */

type DoodleProps = { className?: string };

export function Sparkle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <path
        d="M20 3c1 8 4 14 16 17-12 3-15 9-16 17-1-8-4-14-16-17 12-3 15-9 16-17Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 14C10 4 16 4 23 14s13 10 20 0 13-10 20 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Star({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 4v24M4 16h24M7 7l18 18M25 7 7 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Loops({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 90 40" fill="none" className={className} aria-hidden>
      <path
        d="M4 30c6-22 16-22 22 0s16 22 22 0 16-22 22 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M6 8c14 2 28 14 32 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M26 38l12 4 2-13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

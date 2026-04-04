import Link from "next/link";
import { X } from "lucide-react";

const BENEFITS = [
  { label: "Leçons quotidiennes", free: true, premium: true },
  { label: "Apprentissage illimité", free: false, premium: true },
  { label: "Sans publicités", free: false, premium: true },
  { label: "Pratique personnalisée", free: false, premium: true },
  { label: "Accès à tous les cours", free: false, premium: true },
];

const CheckIcon = () => (
  <div className="w-7 h-7 rounded-full bg-[#FFD6A5] flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 10.5l4 4 8-9"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const CrossIcon = () => (
  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="#64748B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const PremiumView = () => {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #F3D5FF 0%, transparent 40%), radial-gradient(circle at 90% 0%, #FFF0C4 0%, transparent 45%), radial-gradient(circle at 50% 100%, #FFE2E2 0%, transparent 50%), #FFF9F0",
      }}
    >
      {/* Close */}
      <Link
        href="/learn"
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition z-10"
      >
        <X className="w-6 h-6 text-brilliant-text" />
      </Link>

      <div className="max-w-3xl mx-auto px-6 pt-16 sm:pt-24 pb-12">
        {/* Title */}
        <h1 className="text-center text-4xl sm:text-5xl font-extrabold text-brilliant-text leading-tight font-heading">
          Passe à la vitesse supérieure avec{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #8B9DFF 0%, #C77DFF 35%, #FF77C8 70%, #FFB24A 100%)",
            }}
          >
            Premium
          </span>
        </h1>

        {/* Comparison */}
        <div className="mt-14 sm:mt-20 relative">
          {/* Premium column highlight (gradient frame) */}
          <div
            className="absolute top-0 bottom-0 rounded-3xl p-[3px] pointer-events-none"
            style={{
              right: "0.5rem",
              width: "clamp(110px, 28%, 160px)",
              background:
                "linear-gradient(180deg, #F7C325 0%, #E350E3 25%, #874DE5 55%, #456DFF 100%)",
            }}
          >
            <div className="w-full h-full rounded-3xl bg-white" />
          </div>

          <div className="relative">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 sm:gap-6 items-center pb-4 border-b border-gray-200">
              <div className="font-bold text-brilliant-text text-base sm:text-lg">
                Avantages
              </div>
              <div className="w-[70px] sm:w-[90px] text-center font-bold text-brilliant-muted text-sm sm:text-base">
                Gratuit
              </div>
              <div className="w-[70px] sm:w-[90px] text-center font-bold text-brilliant-text text-sm sm:text-base">
                Premium
              </div>
            </div>

            {/* Benefit rows */}
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] gap-4 sm:gap-6 items-center py-4 border-b border-gray-200"
              >
                <div className="text-brilliant-text text-sm sm:text-base">
                  {b.label}
                </div>
                <div className="w-[70px] sm:w-[90px] flex justify-center">
                  {b.free ? <CheckIcon /> : <CrossIcon />}
                </div>
                <div className="w-[70px] sm:w-[90px] flex justify-center">
                  {b.premium ? <CheckIcon /> : <CrossIcon />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe button */}
        <div className="flex justify-center mt-12 sm:mt-16">
          <Link
            href="/premium/pricing"
            className="rounded-full px-12 sm:px-16 py-4 text-white text-base sm:text-lg font-bold transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "#0F172A",
              boxShadow: "0 4px 0 0 rgba(0, 0, 0, 0.25)",
            }}
          >
            S&apos;abonner maintenant
          </Link>
        </div>
      </div>
    </div>
  );
};

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
  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#FFD6A5] flex items-center justify-center">
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
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
  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gray-200 flex items-center justify-center">
    <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
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
      className="h-[100dvh] w-full relative overflow-hidden flex flex-col"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #F3D5FF 0%, transparent 40%), radial-gradient(circle at 90% 0%, #FFF0C4 0%, transparent 45%), radial-gradient(circle at 50% 100%, #FFE2E2 0%, transparent 50%), #FFF9F0",
      }}
    >
      {/* Close */}
      <Link
        href="/learn"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition z-10"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-brilliant-text" />
      </Link>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-6 sm:pb-12 flex flex-col justify-between">
        {/* Title */}
        <h1 className="text-center text-[22px] leading-[1.15] sm:text-5xl font-extrabold text-brilliant-text font-heading px-2 shrink-0">
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

        {/* Comparison table */}
        <div
          className="relative mx-auto w-full my-4 sm:my-0 sm:mt-16"
          style={
            {
              "--col-label": "1fr",
              "--col-free": "64px",
              "--col-premium": "80px",
              "--col-gap": "6px",
            } as React.CSSProperties
          }
        >
          <style>{`
            @media (min-width: 640px) {
              .pv-compare { --col-free: 100px; --col-premium: 120px; --col-gap: 16px; }
            }
          `}</style>

          <div className="pv-compare relative">
            {/* Gradient frame over the Premium column */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 rounded-2xl sm:rounded-3xl p-[3px] pointer-events-none"
              style={{
                right: 0,
                width: "var(--col-premium)",
                background:
                  "linear-gradient(180deg, #F7C325 0%, #E350E3 25%, #874DE5 55%, #456DFF 100%)",
              }}
            >
              <div className="w-full h-full rounded-[calc(1rem-3px)] sm:rounded-[calc(1.5rem-3px)] bg-white" />
            </div>

            {/* Grid table */}
            <div
              className="relative"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "var(--col-label) var(--col-free) var(--col-premium)",
                columnGap: "var(--col-gap)",
              }}
            >
              {/* Header row */}
              <div className="font-bold text-brilliant-text text-sm sm:text-lg py-2.5 sm:py-4 pl-1 sm:pl-2 border-b border-gray-200">
                Avantages
              </div>
              <div className="flex items-center justify-center font-bold text-brilliant-muted text-xs sm:text-base py-2.5 sm:py-4 border-b border-gray-200">
                Gratuit
              </div>
              <div className="flex items-center justify-center font-bold text-brilliant-text text-xs sm:text-base py-2.5 sm:py-4 border-b border-gray-200">
                Premium
              </div>

              {/* Benefit rows */}
              {BENEFITS.map((b, i) => {
                const isLast = i === BENEFITS.length - 1;
                const borderCls = isLast ? "" : "border-b border-gray-200";
                return (
                  <div key={i} className="contents">
                    <div
                      className={`text-brilliant-text text-xs sm:text-base py-2.5 sm:py-4 pl-1 sm:pl-2 pr-2 ${borderCls}`}
                    >
                      {b.label}
                    </div>
                    <div
                      className={`flex items-center justify-center py-2.5 sm:py-4 ${borderCls}`}
                    >
                      {b.free ? <CheckIcon /> : <CrossIcon />}
                    </div>
                    <div
                      className={`flex items-center justify-center py-2.5 sm:py-4 ${borderCls}`}
                    >
                      {b.premium ? <CheckIcon /> : <CrossIcon />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subscribe button */}
        <div className="flex justify-center shrink-0">
          <Link
            href="/premium/pricing"
            className="rounded-full px-8 sm:px-16 py-3 sm:py-4 text-white text-sm sm:text-lg font-bold transition-transform duration-100 hover:opacity-90 hover:scale-[1.02] active:translate-y-[3px] active:!shadow-none"
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

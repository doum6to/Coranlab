"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { markTutorialDone } from "@/actions/user-progress";

const LIME = "#BEF264";

const BoltSolid = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0F172A">
    <path d="M14 2L4 14h6l-1 8 11-13h-7l1-7z" />
  </svg>
);

const BatteryIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="28" viewBox="0 0 14 20" fill="none">
    <rect x="4" y="1" width="6" height="2" rx="0.5" fill={filled ? LIME : "#E5E7EB"} />
    <rect x="1" y="3" width="12" height="16" rx="1.5" fill={filled ? LIME : "#E5E7EB"} />
  </svg>
);

type Step = {
  title: string;
  content: React.ReactNode;
  buttonLabel: string;
};

export const WelcomeTutorial = () => {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const steps: Step[] = [
    // Step 1: Streaks & Charges
    {
      title: "Les Streaks",
      buttonLabel: "Compris !",
      content: (
        <div className="flex flex-col items-center gap-5">
          {/* Streak visual */}
          <div className="flex items-center gap-3">
            <span className="text-5xl font-extrabold text-brilliant-text">1</span>
            <BoltSolid size={28} />
          </div>

          <p className="text-sm text-brilliant-text text-center leading-relaxed max-w-xs">
            Chaque jour o&ugrave; tu termines une le&ccedil;on, ton <b>streak</b> augmente de 1.
            Plus ton streak est long, plus tu progresses !
          </p>

          {/* Charges visual */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <BatteryIcon filled />
            <BatteryIcon filled />
          </div>

          <p className="text-sm text-brilliant-text text-center leading-relaxed max-w-xs">
            Tu as <b>2 chargements</b> de secours. Si tu manques un jour,
            un chargement est utilis&eacute; pour prot&eacute;ger ton streak.
            Si les 2 sont vides, ton streak repart &agrave; z&eacute;ro.
          </p>

          {/* Days visual */}
          <div className="flex items-center gap-3">
            {["Lu", "Ma", "Me", "Je", "Ve"].map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: i === 0 ? LIME : "#F3F4F6" }}
                >
                  <BoltSolid size={14} />
                </div>
                <span className={`text-[11px] ${i === 0 ? "font-bold text-brilliant-text" : "text-brilliant-muted"}`}>
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // Step 2: Premium
    {
      title: "Quranlab Premium",
      buttonLabel: "C'est parti !",
      content: (
        <div className="flex flex-col items-center gap-5">
          {/* Premium icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
            }}
          >
            <Image src="/unlimited.svg" alt="Premium" width={36} height={36} />
          </div>

          <p className="text-sm text-brilliant-text text-center leading-relaxed max-w-xs">
            Avec <b>Premium</b>, d&eacute;bloque <b>toutes les le&ccedil;ons</b>
            {" "}et apprends &agrave; ton rythme.
          </p>

          <div className="w-full max-w-xs space-y-2">
            {[
              "Acc\u00e8s \u00e0 tous les cours",
              "Le\u00e7ons illimit\u00e9es",
              "Apprentissage personnalis\u00e9",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FFD6A5] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10.5l4 4 8-9" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-brilliant-text">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-brilliant-muted text-center max-w-xs">
            Tu pourras d&eacute;couvrir Premium &agrave; tout moment depuis les param&egrave;tres
            ou la sidebar.
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      startTransition(() => {
        markTutorialDone().then(() => {
          router.push("/premium");
        });
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                backgroundColor: i <= step ? "#6967FB" : "#E5E7EB",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-brilliant-text text-center mt-4 px-6">
          {currentStep.title}
        </h2>

        {/* Content */}
        <div className="px-6 py-5">
          {currentStep.content}
        </div>

        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleNext}
            disabled={pending}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: isLast
                ? "linear-gradient(90deg, #050C38 0%, #6700A3 25%, #E02F75 50%, #FF5A57 75%, #050C38 100%)"
                : "#6967FB",
              backgroundSize: isLast ? "400% 100%" : undefined,
              boxShadow: `0 4px 0 0 ${isLast ? "rgba(5,12,56,0.4)" : "#4a48d4"}`,
            }}
          >
            {pending ? "..." : currentStep.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

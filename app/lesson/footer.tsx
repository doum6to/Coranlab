import { useKey } from "react-use";
import { CheckCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  correctAnswer?: string;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  correctAnswer,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);

  return (
    <footer className={cn(
      "lg:h-[140px] shrink-0 border-t border-[#E0E0E0]",
      status === "correct" && "border-transparent bg-brilliant-success",
      status === "wrong" && "border-transparent bg-rose-50",
      status === "wrong" ? "h-auto min-h-[80px] py-3" : "h-[80px]",
    )}>
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {status === "correct" && (
          <div className="text-brilliant-green font-bold text-sm sm:text-base lg:text-2xl flex items-center">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-10 lg:w-10 mr-2 sm:mr-4" />
            Bien joué !
          </div>
        )}
        {status === "wrong" && (
          <div className="flex flex-col gap-0.5">
            <div className="text-rose-500 font-bold text-sm sm:text-base lg:text-2xl flex items-center">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-10 lg:w-10 mr-2 sm:mr-4 shrink-0" />
              Pas tout à fait !
            </div>
            {correctAnswer && (
              <p className="text-rose-400 text-xs sm:text-sm ml-7 sm:ml-10 lg:ml-14">
                Bonne réponse : <span className="font-semibold">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}
        {status === "completed" && (
          <div className="w-auto min-w-[140px] lg:min-w-[180px]">
            <ShinyButton
              variant="outline-green"
              onClick={() => window.location.href = `/lesson/${lessonId}`}
            >
              Pratiquer à nouveau
            </ShinyButton>
          </div>
        )}
        <div className="ml-auto w-auto min-w-[140px] lg:min-w-[180px]">
          <ShinyButton
            variant={status === "wrong" ? "dark" : "green"}
            disabled={disabled}
            onClick={onCheck}
          >
            {status === "none" && "Vérifier"}
            {status === "correct" && "Suivant"}
            {status === "wrong" && "Suivant"}
            {status === "completed" && "Continuer"}
          </ShinyButton>
        </div>
      </div>
    </footer>
  );
};

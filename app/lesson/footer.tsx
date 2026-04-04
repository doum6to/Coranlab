import { useKey } from "react-use";
import { CheckCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);

  return (
    <footer className={cn(
      "lg:h-[140px] h-[80px] shrink-0 border-t border-[#E0E0E0]",
      status === "correct" && "border-transparent bg-brilliant-success",
      status === "wrong" && "border-transparent bg-rose-50",
    )}>
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {status === "correct" && (
          <div className="text-brilliant-green font-bold text-sm sm:text-base lg:text-2xl flex items-center">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-10 lg:w-10 mr-2 sm:mr-4" />
            Bien joué !
          </div>
        )}
        {status === "wrong" && (
          <div className="text-rose-500 font-bold text-sm sm:text-base lg:text-2xl flex items-center">
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-10 lg:w-10 mr-2 sm:mr-4" />
            Essaie encore.
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
            {status === "wrong" && "Réessayer"}
            {status === "completed" && "Continuer"}
          </ShinyButton>
        </div>
      </div>
    </footer>
  );
};

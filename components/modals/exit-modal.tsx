"use client";

import { useEffect, useState } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useExitModal } from "@/store/use-exit-modal";
import { useT } from "@/lib/i18n/use-t";

export const ExitModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();
  const t = useT();

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-sm rounded-2xl border-2 border-[#E0E0E0] bg-white p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-4">
            <ExitMascot />
          </div>
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-brilliant-text">
            {t.exitModal.title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-brilliant-muted mt-1">
            {t.exitModal.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3 w-full mt-4">
          <ShinyButton
            variant="green"
            onClick={close}
          >
            {t.exitModal.keepLearning}
          </ShinyButton>
          <ShinyButton
            variant="outline-green"
            onClick={() => {
              close();
              window.location.href = "/learn";
            }}
          >
            {t.exitModal.endSession}
          </ShinyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function ExitMascot() {
  const { RiveComponent } = useRive({
    src: "/animations/mascot_breath.riv",
    stateMachines: "breath loop",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  return (
    <div className="h-[180px] w-[180px]">
      <RiveComponent className="h-full w-full" aria-label="Mascotte" />
    </div>
  );
}

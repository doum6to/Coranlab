"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useExitModal } from "@/store/use-exit-modal";
import { completeLessonChallenges } from "@/actions/challenge-progress";

export const ExitModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close, pendingSaveIds } = useExitModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-sm rounded-2xl border-2 border-[#E0E0E0] bg-white p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-4">
            <Image
              src="/mascot_sad.svg"
              alt="Mascotte"
              height={120}
              width={120}
            />
          </div>
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-brilliant-text">
            Attends, ne pars pas !
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-brilliant-muted mt-1">
            Tu es sur le point de quitter la leçon. Es-tu sûr ?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3 w-full mt-4">
          <ShinyButton
            variant="green"
            onClick={close}
          >
            Continuer à apprendre
          </ShinyButton>
          <ShinyButton
            variant="outline-green"
            onClick={async () => {
              close();
              // Save any progress before leaving
              if (pendingSaveIds.length > 0) {
                try {
                  await completeLessonChallenges(pendingSaveIds);
                } catch {}
              }
              window.location.href = "/learn";
            }}
          >
            Terminer la session
          </ShinyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

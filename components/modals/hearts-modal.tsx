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
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  const onClick = () => {
    close();
    window.location.href = "/shop";
  };

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
              height={100}
              width={100}
            />
          </div>
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-brilliant-text">
            Tu n&apos;as plus de clés !
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-brilliant-muted mt-1">
            Reviens demain pour recevoir une clé gratuite, ou passe en Pro pour des clés illimitées.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3 w-full mt-4">
          <ShinyButton
            variant="green"
            onClick={onClick}
          >
            Passer en Pro
          </ShinyButton>
          <ShinyButton
            variant="outline-green"
            onClick={close}
          >
            Non merci
          </ShinyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

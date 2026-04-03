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
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = usePracticeModal();

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
              src="/mascot.svg"
              alt="Mascotte"
              height={100}
              width={100}
            />
          </div>
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-brilliant-text">
            Leçon de pratique
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base text-brilliant-muted mt-1">
            Utilise les leçons de pratique pour regagner des cœurs et des points. Tu ne peux pas perdre de cœurs ou de points dans les leçons de pratique.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3 w-full mt-4">
          <ShinyButton
            variant="green"
            onClick={close}
          >
            J&apos;ai compris
          </ShinyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

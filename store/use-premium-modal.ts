import { create } from "zustand";

type PremiumModalState = {
  isOpen: boolean;
  /** Optional short reason shown in the modal (e.g. why it opened). */
  reason: string | null;
  open: (reason?: string) => void;
  close: () => void;
};

/** Global "go Premium" modal — opened from locked content, banners, nudges. */
export const usePremiumModal = create<PremiumModalState>((set) => ({
  isOpen: false,
  reason: null,
  open: (reason) => set({ isOpen: true, reason: reason ?? null }),
  close: () => set({ isOpen: false }),
}));

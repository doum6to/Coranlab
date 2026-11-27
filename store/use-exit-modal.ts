import { create } from "zustand";

type ExitModalState = {
  isOpen: boolean;
  /** Whether what was done so far is kept (false in the welcome demo). */
  saved: boolean;
  open: (saved?: boolean) => void;
  close: () => void;
};

export const useExitModal = create<ExitModalState>((set) => ({
  isOpen: false,
  saved: true,
  open: (saved = true) => set({ isOpen: true, saved }),
  close: () => set({ isOpen: false }),
}));

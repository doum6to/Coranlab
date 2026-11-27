import { create } from "zustand";

type ExitModalState = {
  isOpen: boolean;
  /** Whether what was done so far is kept (false in the welcome demo). */
  saved: boolean;
  /** Where "end the session" leads. */
  returnTo: string;
  open: (saved?: boolean, returnTo?: string) => void;
  close: () => void;
};

export const useExitModal = create<ExitModalState>((set) => ({
  isOpen: false,
  saved: true,
  returnTo: "/learn",
  open: (saved = true, returnTo = "/learn") => set({ isOpen: true, saved, returnTo }),
  close: () => set({ isOpen: false }),
}));

import { create } from "zustand";

type ExitModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  pendingSaveIds: number[];
  setPendingSaveIds: (ids: number[]) => void;
};

export const useExitModal = create<ExitModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  pendingSaveIds: [],
  setPendingSaveIds: (ids) => set({ pendingSaveIds: ids }),
}));

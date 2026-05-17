import { create } from 'zustand';

export type AppMode = 'entrepreneur' | 'investor';

interface ModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'entrepreneur',
  setMode: (mode) => set({ mode }),
}));

import { create } from 'zustand';

export type PersonaKey = 'junior-sen' | 'senior-sen';

export interface PersonaConfig {
  label: string;
  blinkRate: number;
  mouthGain: number;
  headSway: number;
  voicePitch: number;
  description: string;
}

export const PERSONAS: Record<PersonaKey, PersonaConfig> = {
  'junior-sen': {
    label: 'Junior Sen',
    blinkRate: 2600,
    mouthGain: 0.82,
    headSway: 0.09,
    voicePitch: 1.15,
    description: 'Hızlı, enerjik ve canlı cevaplar verir.',
  },
  'senior-sen': {
    label: 'Senior Sen',
    blinkRate: 4200,
    mouthGain: 1.18,
    headSway: 0.05,
    voicePitch: 0.92,
    description: 'Derin, sakin ve düşünceli bir ton kullanır.',
  },
};

interface PersonaState {
  current: PersonaKey;
  setPersona: (persona: PersonaKey) => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  current: 'junior-sen',
  setPersona: (current) => set({ current }),
}));

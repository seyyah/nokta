import { useSyncExternalStore } from 'react';
import type { Question, Spec, ProviderName } from '@/types';
import type { AppMode } from './modeStore';

interface SessionState {
  idea: string;
  questions: Question[];
  answers: Record<string, string>;
  spec: Spec | null;
  provider: ProviderName | null;
  attempts: number;
  duplicateOf: string | null;
  mode: AppMode;
  selectedKeywords?: string[];
  userGeneratedContent?: string;
}

const initial: SessionState = {
  idea: '',
  questions: [],
  answers: {},
  spec: null,
  provider: null,
  attempts: 0,
  duplicateOf: null,
  mode: 'entrepreneur',
};

let state: SessionState = initial;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const session = {
  get: () => state,
  set: (patch: Partial<SessionState>) => {
    state = { ...state, ...patch };
    emit();
  },
  reset: () => {
    state = initial;
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(session.subscribe, session.get, session.get);
}

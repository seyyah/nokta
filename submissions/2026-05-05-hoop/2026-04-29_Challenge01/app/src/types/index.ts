export type Track = 'A' | 'B' | 'C';

export interface Question {
  id: string;
  category: 'problem' | 'user' | 'scope' | 'constraint' | 'success';
  text: string;
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface Spec {
  title: string;
  markdown: string;
  createdAt: number;
  rawIdea: string;
}

export interface SpecHistoryEntry extends Spec {
  id: string;
  embedding: number[];
}

export type ProviderName = 'anthropic' | 'gemini' | 'groq';

export interface ProviderResult<T> {
  data: T;
  provider: ProviderName;
  attempts: number;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

export class AllProvidersFailedError extends Error {
  constructor(public errors: Record<string, unknown>) {
    super(`Tüm provider'lar başarısız: ${Object.keys(errors).join(', ')}`);
    this.name = 'AllProvidersFailedError';
  }
}

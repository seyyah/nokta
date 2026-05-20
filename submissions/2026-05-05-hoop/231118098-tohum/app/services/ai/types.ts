import type { ChatTurn, NoktaAiResponse } from '@/constants/schema';

export type ProviderName = 'gemini' | 'groq';

export interface NoktaProvider {
  readonly name: ProviderName;
  isConfigured(): boolean;
  ask(history: ChatTurn[]): Promise<NoktaAiResponse>;
}

import type { ProviderName, ProviderResult, Question, Spec } from '@/types';
import { AllProvidersFailedError } from '@/types';
import * as anthropic from './anthropic';
import * as gemini from './gemini';
import * as groq from './groq';

interface ProviderEntry {
  name: ProviderName;
  apiKey: string | undefined;
  proposeQuestions: (key: string, idea: string) => Promise<Question[]>;
  emitSpec: (key: string, idea: string, qs: Question[], ans: Record<string, string>) => Promise<Spec>;
}

function providers(): ProviderEntry[] {
  return [
    {
      name: 'anthropic',
      apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      proposeQuestions: anthropic.proposeQuestions,
      emitSpec: anthropic.emitSpec,
    },
    {
      name: 'gemini',
      apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      proposeQuestions: gemini.proposeQuestions,
      emitSpec: gemini.emitSpec,
    },
    {
      name: 'groq',
      apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
      proposeQuestions: groq.proposeQuestions,
      emitSpec: groq.emitSpec,
    },
  ];
}

export function availableProviders(): ProviderName[] {
  return providers()
    .filter((p) => !!p.apiKey)
    .map((p) => p.name);
}

async function runWithFailover<T>(
  fn: (p: ProviderEntry) => Promise<T>
): Promise<ProviderResult<T>> {
  const errs: Record<string, unknown> = {};
  let attempts = 0;
  for (const p of providers()) {
    if (!p.apiKey) continue;
    attempts += 1;
    try {
      const data = await fn(p);
      return { data, provider: p.name, attempts };
    } catch (e) {
      errs[p.name] = e instanceof Error ? e.message : String(e);
    }
  }
  throw new AllProvidersFailedError(errs);
}

export function proposeQuestions(idea: string): Promise<ProviderResult<Question[]>> {
  return runWithFailover((p) => p.proposeQuestions(p.apiKey!, idea));
}

export function emitSpec(
  idea: string,
  questions: Question[],
  answers: Record<string, string>
): Promise<ProviderResult<Spec>> {
  return runWithFailover((p) => p.emitSpec(p.apiKey!, idea, questions, answers));
}

import { GoogleGenerativeAI } from '@google/generative-ai';

import { NOKTA_SYSTEM_PROMPT } from '@/constants/prompt';
import { isNoktaAiResponse, type ChatTurn, type NoktaAiResponse } from '@/constants/schema';

import {
  MalformedResponseError,
  NetworkError,
  RateLimitError,
  TohumAiError,
} from '../errors';
import { extractJson } from '../extract-json';
import type { NoktaProvider } from '../types';

const GEMINI_MODEL = 'gemini-2.5-flash';

class GeminiProvider implements NoktaProvider {
  readonly name = 'gemini' as const;

  isConfigured(): boolean {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    return typeof key === 'string' && key.length > 10;
  }

  async ask(history: ChatTurn[]): Promise<NoktaAiResponse> {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!key) throw new TohumAiError('Gemini anahtarı yok.');

    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: NOKTA_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const contents = history.map((turn) => {
      if (turn.role === 'user') {
        return { role: 'user' as const, parts: [{ text: turn.content }] };
      }
      const envelope = {
        message: turn.content,
        suggestions: turn.suggestions,
        rubric: turn.rubric,
        ready: turn.ready,
        idea_md: turn.idea_md,
      };
      return {
        role: 'model' as const,
        parts: [{ text: JSON.stringify(envelope) }],
      };
    });

    let result;
    try {
      result = await model.generateContent({ contents });
    } catch (err: unknown) {
      throw classifyGeminiError(err);
    }

    const text = result.response.text();
    const parsed = extractJson(text);
    if (!isNoktaAiResponse(parsed)) {
      throw new MalformedResponseError(text);
    }
    return parsed;
  }
}

function classifyGeminiError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined;

  if (status === 429 || /rate.?limit|quota/i.test(message)) {
    return new RateLimitError('Gemini');
  }
  if (status && status >= 500) {
    return new NetworkError(err);
  }
  if (/fetch|network|timeout/i.test(message)) {
    return new NetworkError(err);
  }
  return new TohumAiError(message, err);
}

export const geminiProvider: NoktaProvider = new GeminiProvider();

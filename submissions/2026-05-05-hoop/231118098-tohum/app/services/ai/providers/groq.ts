import Groq from 'groq-sdk';

import { NOKTA_SYSTEM_PROMPT } from '@/constants/prompt';
import {
  isNoktaAiResponse,
  type ChatTurn,
  type NoktaAiResponse,
} from '@/constants/schema';

import {
  MalformedResponseError,
  NetworkError,
  RateLimitError,
  TohumAiError,
} from '../errors';
import { extractJson } from '../extract-json';
import type { NoktaProvider } from '../types';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

class GroqProvider implements NoktaProvider {
  readonly name = 'groq' as const;

  isConfigured(): boolean {
    const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    return typeof key === 'string' && key.length > 10;
  }

  async ask(history: ChatTurn[]): Promise<NoktaAiResponse> {
    const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!key) throw new TohumAiError('Groq anahtarı yok.');

    const client = new Groq({
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: NOKTA_SYSTEM_PROMPT },
      ...history.map<Groq.Chat.ChatCompletionMessageParam>((turn) => {
        if (turn.role === 'user') {
          return { role: 'user', content: turn.content };
        }
        const envelope = {
          message: turn.content,
          suggestions: turn.suggestions,
          rubric: turn.rubric,
          ready: turn.ready,
          idea_md: turn.idea_md,
        };
        return { role: 'assistant', content: JSON.stringify(envelope) };
      }),
    ];

    let response: Groq.Chat.ChatCompletion;
    try {
      response = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2048,
      });
    } catch (err: unknown) {
      throw classifyGroqError(err);
    }

    const text = response.choices[0]?.message?.content ?? '';
    if (text.length === 0) {
      throw new MalformedResponseError('(empty response)');
    }

    const parsed = extractJson(text);
    if (!isNoktaAiResponse(parsed)) {
      throw new MalformedResponseError(text);
    }
    return parsed;
  }
}

function classifyGroqError(err: unknown): Error {
  if (err instanceof Groq.APIError) {
    if (err.status === 429) return new RateLimitError('Groq');
    if (err.status && err.status >= 500) return new NetworkError(err);
    return new TohumAiError(err.message, err);
  }
  const message = err instanceof Error ? err.message : String(err);
  if (/fetch|network|timeout/i.test(message)) return new NetworkError(err);
  return new TohumAiError(message, err);
}

export const groqProvider: NoktaProvider = new GroqProvider();

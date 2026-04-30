import { SYSTEM_PROMPT, TOOLS } from '@/prompts/system';
import type { Question, Spec } from '@/types';
import { isRetryableStatus, backoff } from './streaming';

const MODEL = 'claude-sonnet-4-6';
const URL = 'https://api.anthropic.com/v1/messages';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'tool_use'; id: string; name: string; input: unknown }
        | { type: 'tool_result'; tool_use_id: string; content: string }
      >;
}

async function callAnthropic(
  apiKey: string,
  messages: AnthropicMessage[],
  maxAttempts = 3
): Promise<{ stop_reason: string; content: AnthropicMessage['content'] }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { stop_reason: string; content: AnthropicMessage['content'] };
      return json;
    }
    lastErr = new Error(`Anthropic ${res.status}: ${await res.text()}`);
    if (!isRetryableStatus(res.status)) throw lastErr;
    await backoff(attempt);
  }
  throw lastErr;
}

export async function proposeQuestions(apiKey: string, idea: string): Promise<Question[]> {
  const out = await callAnthropic(apiKey, [
    { role: 'user', content: `Ham fikir: ${idea}\n\nLütfen propose_questions tool'unu çağır.` },
  ]);
  const block = Array.isArray(out.content)
    ? out.content.find((b) => b.type === 'tool_use' && b.name === 'propose_questions')
    : null;
  if (!block || block.type !== 'tool_use') throw new Error('Anthropic propose_questions tool çağırmadı');
  const input = block.input as { questions?: Question[] };
  if (!input.questions?.length) throw new Error('questions boş');
  return input.questions;
}

export async function emitSpec(
  apiKey: string,
  idea: string,
  questions: Question[],
  answers: Record<string, string>
): Promise<Spec> {
  const qaText = questions
    .map((q) => `[${q.category}] ${q.text}\nCEVAP: ${answers[q.id] ?? '(boş)'}`)
    .join('\n\n');
  const out = await callAnthropic(apiKey, [
    {
      role: 'user',
      content: `Ham fikir: ${idea}\n\nSorular ve cevaplar:\n${qaText}\n\nLütfen emit_spec tool'unu çağır.`,
    },
  ]);
  const block = Array.isArray(out.content)
    ? out.content.find((b) => b.type === 'tool_use' && b.name === 'emit_spec')
    : null;
  if (!block || block.type !== 'tool_use') throw new Error('Anthropic emit_spec tool çağırmadı');
  const input = block.input as { title?: string; markdown?: string };
  if (!input.title || !input.markdown) throw new Error('spec eksik field');
  return {
    title: input.title,
    markdown: input.markdown,
    createdAt: Date.now(),
    rawIdea: idea,
  };
}

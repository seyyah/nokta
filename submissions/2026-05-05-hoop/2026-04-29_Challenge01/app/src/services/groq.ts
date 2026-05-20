import { SYSTEM_PROMPT } from '@/prompts/system';
import type { Question, Spec } from '@/types';
import { isRetryableStatus, backoff } from './streaming';

const MODEL = 'llama-3.3-70b-versatile';
const URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(apiKey: string, userPrompt: string, maxAttempts = 3): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: 'json_object' },
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new Error('Groq boş yanıt');
      return text;
    }
    lastErr = new Error(`Groq ${res.status}: ${await res.text()}`);
    if (!isRetryableStatus(res.status)) throw lastErr;
    await backoff(attempt);
  }
  throw lastErr;
}

export async function proposeQuestions(apiKey: string, idea: string): Promise<Question[]> {
  const text = await callGroq(
    apiKey,
    `Ham fikir: ${idea}\n\nÇıkış formatı (JSON): {"questions":[{"id":"q1","category":"problem|user|scope|constraint|success","text":"..."}]}`
  );
  const parsed = JSON.parse(text) as { questions?: Question[] };
  if (!parsed.questions?.length) throw new Error('questions boş');
  return parsed.questions;
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
  const text = await callGroq(
    apiKey,
    `Ham fikir: ${idea}\n\nSorular ve cevaplar:\n${qaText}\n\nÇıkış formatı (JSON): {"title":"...","markdown":"..."}`
  );
  const parsed = JSON.parse(text) as { title?: string; markdown?: string };
  if (!parsed.title || !parsed.markdown) throw new Error('spec eksik field');
  return { title: parsed.title, markdown: parsed.markdown, createdAt: Date.now(), rawIdea: idea };
}

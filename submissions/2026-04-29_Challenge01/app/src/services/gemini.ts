import { SYSTEM_PROMPT } from '@/prompts/system';
import type { Question, Spec } from '@/types';
import { isRetryableStatus, backoff } from './streaming';

const MODEL = 'gemini-2.5-flash';

const QUESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string', enum: ['problem', 'user', 'scope', 'constraint', 'success'] },
          text: { type: 'string' },
        },
        required: ['id', 'category', 'text'],
      },
    },
  },
  required: ['questions'],
};

const SPEC_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    markdown: { type: 'string' },
  },
  required: ['title', 'markdown'],
};

async function callGemini(
  apiKey: string,
  prompt: string,
  schema: object,
  maxAttempts = 3
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.4,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini boş yanıt');
      return text;
    }
    lastErr = new Error(`Gemini ${res.status}: ${await res.text()}`);
    if (!isRetryableStatus(res.status)) throw lastErr;
    await backoff(attempt);
  }
  throw lastErr;
}

function repairJson(s: string): string {
  return s
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function safeParse<T>(raw: string): T {
  try {
    return JSON.parse(repairJson(raw)) as T;
  } catch (e) {
    throw new Error(
      `Gemini JSON parse hatası: ${e instanceof Error ? e.message : String(e)}. Ham yanıt (ilk 400ch): ${raw.slice(0, 400)}`
    );
  }
}

export async function proposeQuestions(apiKey: string, idea: string): Promise<Question[]> {
  const text = await callGemini(
    apiKey,
    `Ham fikir: ${idea}\n\nÇıkış: 3-5 engineering sorusu (problem, user, scope, constraint, success kategorilerinden).`,
    QUESTIONS_SCHEMA
  );
  const parsed = safeParse<{ questions?: Question[] }>(text);
  if (!parsed.questions?.length) {
    throw new Error(`questions boş. Ham yanıt: ${text.slice(0, 300)}`);
  }
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
  const text = await callGemini(
    apiKey,
    `Ham fikir: ${idea}\n\nSorular ve cevaplar:\n${qaText}\n\nÇıkış: { "title": "3-5 kelime özet", "markdown": "tam spec — # başlık ile başla, ## Problem, ## Hedef kullanıcı, ## MVP scope, ## NE YAPMAYACAĞIZ, ## Tek teknik kısıt, ## Başarı sinyali, ## Risk, ## Bir sonraki adım bölümleriyle" }`,
    SPEC_SCHEMA
  );
  const parsed = safeParse<{ title?: string; markdown?: string }>(text);
  if (!parsed.title || !parsed.markdown) {
    throw new Error(
      `spec eksik field (title=${!!parsed.title}, markdown=${!!parsed.markdown}). Ham yanıt: ${text.slice(0, 400)}`
    );
  }
  return { title: parsed.title, markdown: parsed.markdown, createdAt: Date.now(), rawIdea: idea };
}

import { SYSTEM_PROMPT } from '@/prompts/system';
import type { Question, Spec } from '@/types';
import { isRetryableStatus, backoff } from './streaming';

const MODEL = 'gemini-2.5-flash';

async function callGemini(apiKey: string, prompt: string, maxAttempts = 3): Promise<string> {
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
          temperature: 0.4,
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

export async function proposeQuestions(apiKey: string, idea: string): Promise<Question[]> {
  const text = await callGemini(
    apiKey,
    `Ham fikir: ${idea}\n\nÇıkış formatı (JSON, sadece bu): {"questions":[{"id":"q1","category":"problem|user|scope|constraint|success","text":"..."}]}`
  );
  const parsed = JSON.parse(repairJson(text)) as { questions?: Question[] };
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
  const text = await callGemini(
    apiKey,
    `Ham fikir: ${idea}\n\nSorular ve cevaplar:\n${qaText}\n\nÇıkış formatı (JSON): {"title":"...","markdown":"# ...\\n\\n## Problem ..."}`
  );
  const parsed = JSON.parse(repairJson(text)) as { title?: string; markdown?: string };
  if (!parsed.title || !parsed.markdown) throw new Error('spec eksik field');
  return { title: parsed.title, markdown: parsed.markdown, createdAt: Date.now(), rawIdea: idea };
}

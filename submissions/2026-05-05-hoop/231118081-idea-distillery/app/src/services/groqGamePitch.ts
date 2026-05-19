import {
  distillFromGamePitchDraft,
  GamePitchAiDraft,
} from '../engine/distill';
import { DistillationResult } from '../types/draft';

type GroqChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export function hasGroqKey() {
  return Boolean(process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim());
}

export async function distillGamePitchWithGroq(
  rawNotes: string
): Promise<DistillationResult> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not configured.');
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.EXPO_PUBLIC_GROQ_MODEL?.trim() || DEFAULT_MODEL,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You are Nokta Game Pitch, an anti-feature-creep product designer for solo indie game developers.',
            'Turn messy game notes into a strict JSON GDD-lite brief.',
            'Never invent production facts. If the notes are missing a detail, expose it as a decision or scope boundary.',
            'Prefer small playable prototype scope over big game ambition.',
            'Return only valid JSON with this shape:',
            '{"title":"string","gameSummary":["string"],"coreLoop":["string"],"playerFantasy":["string"],"mechanics":["string"],"scopeBoundary":["string"],"featureCreepWarnings":["string"],"contradictions":[{"topic":"tone|combat|scope|platform|production|multiplayer","claimA":"string","claimB":"string","rationale":"string","severity":"low|medium|high"}],"prototypePlan":["string"],"nextDecisions":["string"],"recommendedMentor":"string","mentorQuestions":["string"]}',
          ].join(' '),
        },
        {
          role: 'user',
          content: rawNotes,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with ${response.status}.`);
  }

  const body = (await response.json()) as GroqChatCompletion;
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq returned an empty game pitch.');
  }

  const aiDraft = parseGamePitchJson(content);
  return distillFromGamePitchDraft(rawNotes, aiDraft);
}

function parseGamePitchJson(content: string): GamePitchAiDraft {
  const json = content.trim().match(/\{[\s\S]*\}/)?.[0] ?? content.trim();
  const parsed = JSON.parse(json) as unknown;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Groq game pitch response is not an object.');
  }

  return parsed as GamePitchAiDraft;
}

import Groq from 'groq-sdk';
import {
  decideMascotAction,
  detectEscalationNeed,
  normalizeEscalationTopic,
  type MascotChatMessage,
  type MascotDecision,
  type MascotDecisionAction,
  type MascotDecisionInput,
} from '@nokta-hoop/hoop-core';

type GroqChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type RawMascotDecision = Partial<{
  action: string;
  answer: string;
  confidence: number;
  reason: string;
  topic: string;
  question: string;
}>;

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const LLM_TIMEOUT_MS = 18_000;

export async function decideMascotActionWithAi(
  input: MascotDecisionInput,
): Promise<MascotDecision> {
  const deterministicDecision = decideMascotAction(input);
  const groqApiKey = process.env.GROQ_API_KEY?.trim();

  if (!groqApiKey) {
    return deterministicDecision;
  }

  const explicitEscalation = detectEscalationNeed(input.message);
  if (explicitEscalation || deterministicDecision.action === 'escalate') {
    return {
      ...deterministicDecision,
      source: 'deterministic',
      reason: explicitEscalation
        ? `${deterministicDecision.reason}. User explicitly asked for expert support.`
        : `${deterministicDecision.reason}. Deterministic expert-domain rule overrides LLM answer.`,
    };
  }

  try {
    const decision = await withTimeout(
      requestGroqDecision(input, groqApiKey),
      LLM_TIMEOUT_MS,
    );
    return coerceMascotDecision(decision, input, deterministicDecision);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown LLM decision error.';
    console.warn('Mascot LLM decision failed, using deterministic fallback:', message);
    return {
      ...deterministicDecision,
      reason: `${deterministicDecision.reason} LLM fallback: ${message}`,
    };
  }
}

async function requestGroqDecision(
  input: MascotDecisionInput,
  apiKey: string,
): Promise<RawMascotDecision> {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: buildGroqMessages(input),
    model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 420,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty decision.');
  }

  return parseDecisionJson(content);
}

function buildGroqMessages(input: MascotDecisionInput): GroqChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        'Sen Nokta Maskot adında Türkçe konuşan bir human-in-the-loop asistansın.',
        'Görevin kullanıcının sorusuna ya kısa ve pratik cevap vermek ya da mentor/uzman desteği gerektiğine karar vermektir.',
        'Mentor desteği şu durumlarda gerekir: kullanıcı açıkça uzman/mentor isterse, konu hukuki/sağlık/finans/vergi/regülasyon gibi riskliyse, yatırım/pazar doğrulaması için gerçek uzman yorumu gerekiyorsa, cevap için kurum/mentor bilgisi şartsa veya soru algoritma/veri yapıları/akademik teknik ispat gibi uzmanlık gerektiren bir alandaysa.',
        'Özellikle çizge/graph, Hamilton döngüsü, algoritma karmaşıklığı, NP-complete/NP-hard ve ispat sorularında action mutlaka escalate olmalıdır.',
        'Genel fikir geliştirme, MVP kapsamı, demo akışı, ürünleştirme, teknik açıklama ve yazım yardımında önce sen cevap ver.',
        'Cevaplar 1-3 cümle, net, Türkçe ve samimi olsun.',
        'Sadece geçerli JSON döndür. Markdown, açıklama veya kod bloğu yazma.',
        'action escalate ise answer kullanıcıya uzman desteği öneren ve onay isteyen bir cümle olmalı; kullanıcı açıkça uzman istemediyse talebi otomatik oluşturma izlenimi verme.',
        'JSON şeması: {"action":"answer|escalate","answer":"string","confidence":0.0,"reason":"string","topic":"string","question":"string"}',
        'action answer ise topic ve question boş olabilir. action escalate ise topic ve question doldur.',
      ].join(' '),
    },
    ...historyToGroqMessages(input.history ?? []),
    {
      role: 'user',
      content: input.message,
    },
  ];
}

function historyToGroqMessages(
  history: MascotChatMessage[],
): GroqChatMessage[] {
  return history
    .slice(-10)
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.text,
    }));
}

function parseDecisionJson(content: string): RawMascotDecision {
  const trimmed = content.trim();
  const json = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  const parsed = JSON.parse(json) as unknown;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Groq decision is not an object.');
  }

  return parsed as RawMascotDecision;
}

function coerceMascotDecision(
  raw: RawMascotDecision,
  input: MascotDecisionInput,
  fallback: MascotDecision,
): MascotDecision {
  const action = coerceAction(raw.action);
  const answer =
    typeof raw.answer === 'string' && raw.answer.trim().length > 0
      ? raw.answer.trim()
      : fallback.answer;
  const reason =
    typeof raw.reason === 'string' && raw.reason.trim().length > 0
      ? raw.reason.trim()
      : 'LLM decision.';
  const confidence =
    typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
      ? Math.max(0, Math.min(1, raw.confidence))
      : fallback.confidence;

  if (action === 'answer') {
    return {
      action,
      answer,
      confidence,
      reason,
      source: 'llm',
    };
  }

  const question =
    typeof raw.question === 'string' && raw.question.trim().length >= 4
      ? raw.question.trim()
      : input.message.trim();
  const topic =
    typeof raw.topic === 'string' && raw.topic.trim().length >= 2
      ? normalizeEscalationTopic(raw.topic)
      : normalizeEscalationTopic(question);

  return {
    action,
    answer,
    confidence,
    reason,
    source: 'llm',
    question,
    topic,
  };
}

function coerceAction(value: string | undefined): MascotDecisionAction {
  if (value === 'escalate') {
    return 'escalate';
  }

  return 'answer';
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Groq decision timed out.'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

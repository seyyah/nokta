const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const REQUEST_TIMEOUT_MS = 7000;

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
}

function extractOutputText(result: OpenAIResponse): string {
  if (result.output_text?.trim()) return result.output_text.trim();

  return (result.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? '')
    .join(' ')
    .trim();
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateOpenAIReply(userText: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  const model = process.env.EXPO_PUBLIC_OPENAI_MODEL?.trim() || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('OpenAI API anahtari eksik. EXPO_PUBLIC_OPENAI_API_KEY degerini .env dosyasina ekleyin.');
  }

  const response = await fetchWithTimeout(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions:
        'You are Senior-Sen, a concise and helpful voice companion inside Nokta Voice Forge. ' +
        'Always answer in the same language as the user. Keep spoken answers under 80 words unless detail is necessary.',
      input: userText,
      max_output_tokens: 180,
      store: false,
    }),
  });

  const result = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(result.error?.message || `OpenAI API error (${response.status})`);
  }

  const reply = extractOutputText(result);
  if (!reply) throw new Error('OpenAI bos bir yanit dondurdu.');
  return reply;
}

async function generateGeminiReply(userText: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
  if (!apiKey) throw new Error('Gemini API anahtari eksik.');

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'You are Senior-Sen, a concise voice companion. Answer in the same language as the user using at most two short sentences.',
          }],
        },
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.4 },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || `Gemini API error (${response.status})`);

  const reply = (result?.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part.text ?? '')
    .join(' ')
    .trim();
  if (!reply) throw new Error('Gemini bos bir yanit dondurdu.');
  return reply;
}

export async function generateGeminiAudioReply(
  audioBase64: string,
  mimeType = 'audio/m4a',
): Promise<{ transcript: string; reply: string }> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
  if (!apiKey) throw new Error('Gemini API anahtari eksik.');

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            {
              text:
                'Transcribe this audio, then answer it in the same language using at most two short sentences. ' +
                'Return only JSON with keys transcript and reply.',
            },
            { inlineData: { mimeType, data: audioBase64 } },
          ],
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || `Gemini API error (${response.status})`);
  const text = (result?.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();
  const parsed = JSON.parse(text);
  if (!parsed.transcript || !parsed.reply) throw new Error('Gemini audio yaniti eksik.');
  return { transcript: String(parsed.transcript), reply: String(parsed.reply) };
}

export async function generateAvatarReply(userText: string): Promise<string> {
  const preferredProvider = process.env.EXPO_PUBLIC_CHAT_PROVIDER?.trim().toLowerCase();
  if (preferredProvider === 'gemini') return generateGeminiReply(userText);

  try {
    return await generateOpenAIReply(userText);
  } catch (openAIError) {
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim()) throw openAIError;
    console.warn('[Conversation] OpenAI failed, using Gemini fallback:', openAIError);
    return generateGeminiReply(userText);
  }
}

export function detectSpeechLanguage(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
  if (/[çğıöşüÇĞİÖŞÜ]/.test(text)) return 'tr-TR';
  return 'tr-TR';
}

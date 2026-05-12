import { getTokenServerUrl } from './transcript';

type MascotSpeechResponse = {
  audioPath?: string;
  audioUrl?: string;
  provider?: string;
};

type MascotSpeechWarmupResponse = {
  count?: number;
  status?: string;
};

const MASCOT_TTS_PROVIDER =
  process.env.EXPO_PUBLIC_MASCOT_TTS_PROVIDER ?? 'chatterbox';
const MASCOT_TTS_LANGUAGE =
  process.env.EXPO_PUBLIC_MASCOT_TTS_LANGUAGE ?? 'tr';
const MASCOT_TTS_TIMEOUT_MS = Number.parseInt(
  process.env.EXPO_PUBLIC_MASCOT_TTS_TIMEOUT_MS ?? '20000',
  10,
);

export async function requestMascotSpeechAudioUrl(input: {
  text: string;
}): Promise<string | null> {
  if (MASCOT_TTS_PROVIDER === 'device') {
    return null;
  }

  const tokenServerUrl = getTokenServerUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MASCOT_TTS_TIMEOUT_MS);

  try {
    const response = await fetch(`${tokenServerUrl}/tts/mascot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input.text,
        language_id: MASCOT_TTS_LANGUAGE,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await getResponseMessage(response));
    }

    const body = (await response.json()) as MascotSpeechResponse;
    const audioUrl = body.audioUrl ?? body.audioPath;
    if (!audioUrl) {
      throw new Error('Mascot TTS response is invalid.');
    }

    return audioUrl.startsWith('http')
      ? audioUrl
      : `${tokenServerUrl}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
  } finally {
    clearTimeout(timeout);
  }
}

export async function warmupMascotSpeechCache(input: {
  texts: string[];
}): Promise<void> {
  if (MASCOT_TTS_PROVIDER === 'device') {
    return;
  }

  const texts = input.texts.map((text) => text.trim()).filter(Boolean);
  if (texts.length === 0) {
    return;
  }

  const tokenServerUrl = getTokenServerUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${tokenServerUrl}/tts/warmup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: MASCOT_TTS_LANGUAGE,
        texts,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await getResponseMessage(response));
    }

    const body = (await response.json()) as MascotSpeechWarmupResponse;
    if (body.status && body.status !== 'queued') {
      throw new Error(`Mascot TTS warmup failed: ${body.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function getResponseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string;
      detail?: string;
      provider?: string;
    };
    return body.error ?? body.detail ?? `Mascot TTS failed: ${response.status}`;
  } catch {
    return `Mascot TTS failed: ${response.status}`;
  }
}

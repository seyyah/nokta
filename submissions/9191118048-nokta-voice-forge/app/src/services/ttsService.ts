import * as FileSystem from 'expo-file-system/legacy';

const SAMPLE_RATE = 24000;

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index++) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function pcmToWavBase64(pcmBase64: string): string {
  const pcmBinary = atob(pcmBase64);
  const wav = new Uint8Array(44 + pcmBinary.length);
  const view = new DataView(wav.buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmBinary.length, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, pcmBinary.length, true);
  for (let index = 0; index < pcmBinary.length; index++) wav[44 + index] = pcmBinary.charCodeAt(index);

  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < wav.length; offset += chunkSize) {
    binary += String.fromCharCode(...wav.subarray(offset, Math.min(offset + chunkSize, wav.length)));
  }
  return btoa(binary);
}

export async function generateMaleSpeechFile(text: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = process.env.EXPO_PUBLIC_GEMINI_TTS_MODEL?.trim() || 'gemini-3.1-flash-tts-preview';
  const voiceName = process.env.EXPO_PUBLIC_GEMINI_TTS_VOICE?.trim() || 'Charon';
  if (!apiKey) throw new Error('Gemini TTS API anahtari eksik.');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Speak as a calm adult man with a naturally deep voice. Read only this text:\n${text}` }],
        }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || `Gemini TTS error (${response.status})`);
  const pcmBase64 = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!pcmBase64) throw new Error('Gemini TTS ses verisi dondurmedi.');

  const outputUri = `${FileSystem.cacheDirectory}senior-sen-reply-${Date.now()}.wav`;
  await FileSystem.writeAsStringAsync(outputUri, pcmToWavBase64(pcmBase64), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return outputUri;
}

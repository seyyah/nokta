/**
 * Nokta Voice Forge — Speech-to-Text & Report Generation Service
 * Implements real Deepgram REST API STT with a clearly labeled manual fallback.
 */

import { STTResult } from '../types';

const STT_TIMEOUT_MS = 8000;

const SAMPLE_SENTENCES: string[] = [
  'Denetim raporuna göre kullanıcı giriş ekranında doğrulama hatası tespit edildi.',
  'Voice Forge döngüsü başarıyla tamamlandı ve değişiklikler commit edildi.',
  'API yanıt süresi belirlenen eşiğin üzerine çıktı, timeout değeri artırılmalı.',
  'Dark mode renk kontrastı WCAG AA standardını karşılamıyor, düzeltme gerekli.',
];

/**
 * Transcribe an audio file using Deepgram if API key is present.
 * Otherwise, returns a simulated STT result clearly labeled as manual fallback.
 */
export async function transcribeAudio(
  fileUri: string,
  durationMs: number
): Promise<STTResult> {
  const openAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  const deepgramKey = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY?.trim();
  const preferredProvider = process.env.EXPO_PUBLIC_STT_PROVIDER?.trim().toLowerCase() || 'deepgram';
  let lastError: unknown = null;

  if (openAIKey && preferredProvider === 'openai') {
    try {
      console.log('[STT] Sending audio to OpenAI transcription API...');
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'gpt-4o-mini-transcribe');
      formData.append('response_format', 'json');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openAIKey}` },
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || `OpenAI STT error (${response.status})`);

      return {
        text: result.text || '',
        confidence: 0.95,
        language: 'auto',
        duration: durationMs,
        isFinal: true,
        isRealSTT: true,
      };
    } catch (error) {
      lastError = error;
      console.warn('[STT] OpenAI transcription failed, trying Deepgram:', error);
    }
  }

  if (deepgramKey) {
    try {
      console.log('[STT] Sending audio to Deepgram API...');
      const audioBlob = await (await fetch(fileUri)).blob();
      const language = process.env.EXPO_PUBLIC_STT_LANGUAGE?.trim() || 'tr';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);
      const response = await fetch(
        `https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&language=${encodeURIComponent(language)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${deepgramKey}`,
            'Content-Type': 'audio/m4a',
          },
          body: audioBlob,
          signal: controller.signal,
        },
      ).finally(() => clearTimeout(timeout));

      if (response.ok) {
        const result = await response.json();
        const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
        const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0.9;
        
        return {
          text: transcript || '(Ses anlaşılamadı)',
          confidence,
          language: result.results?.channels[0]?.detected_language || 'tr-TR',
          duration: durationMs,
          isFinal: true,
          isRealSTT: true,
        };
      } else {
        const errorBody = await response.text();
        console.error('[STT] Deepgram API Error:', errorBody);
        throw new Error(`Deepgram API returned ${response.status}`);
      }
    } catch (error) {
      lastError = error;
      console.error('[STT] STT Upload Error:', error);
      // Fall through to manual fallback on error
    }
  }

  if (openAIKey || deepgramKey) {
    const detail = lastError instanceof Error ? lastError.message : 'provider request failed';
    throw new Error(`STT tamamlanamadi: ${detail}`);
  }

  // MANUAL FALLBACK / API KEY MISSING
  console.log('[STT] Using manual fallback (API key missing or request failed)');
  const sentenceIndex = Math.floor(Math.random() * SAMPLE_SENTENCES.length);
  const selectedSentence = SAMPLE_SENTENCES[sentenceIndex];

  // Simulate network delay
  const processingDelay = Math.min(Math.max(durationMs * 0.3, 500), 2000);
  await new Promise<void>((resolve) => setTimeout(resolve, processingDelay));

  return {
    text: `[MANUAL FALLBACK / API KEY MISSING]: ${selectedSentence}`,
    confidence: 0.85 + Math.random() * 0.14,
    language: 'tr-TR',
    duration: durationMs,
    isFinal: true,
    isRealSTT: false,
  };
}

/**
 * Generate a Markdown Audit Report from a transcript.
 */
export function generateAuditReportMarkdown(transcript: string, isRealSTT: boolean): string {
  const dateStr = new Date().toLocaleString('tr-TR');
  const reportId = `audit-report-${Math.floor(1000 + Math.random() * 9000)}`;

  return `# Audit Report: ${reportId}
> Tarih: ${dateStr}
> STT Modu: ${isRealSTT ? '🟢 Gerçek (Deepgram)' : '🔴 Manuel Fallback / Mock'}

## Tespit Edilen Problem (Transkript)
${transcript}

## Sistem Analizi
- **Severity**: High
- **Etkilenen Modül**: Frontend UI / Core Logic
- **Beklenen Davranış**: Sistemin kararlı ve gereksinimlere uygun çalışması.
- **Gözlemlenen Davranış**: Hata logları ve UI anormallikleri tespit edildi.
- **Önerilen Çözüm**: Forge döngüsüne aktarılarak HYPOTHESIZE ve REPAIR aşamalarının çalıştırılması.
`;
}

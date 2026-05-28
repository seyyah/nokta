/**
 * Nokta Voice Forge — Speech-to-Text & Report Generation Service
 * Implements real Deepgram REST API STT with a clearly labeled manual fallback.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { STTResult } from '../types';

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
  const apiKey = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log('[STT] Sending audio to Deepgram API...');
      const response = await FileSystem.uploadAsync(
        'https://api.deepgram.com/v1/listen?model=nova-2&language=tr',
        fileUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            Authorization: `Token ${apiKey}`,
            'Content-Type': 'audio/m4a',
          },
        }
      );

      if (response.status === 200) {
        const result = JSON.parse(response.body);
        const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
        const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0.9;
        
        return {
          text: transcript || '(Ses anlaşılamadı)',
          confidence,
          language: 'tr-TR',
          duration: durationMs,
          isFinal: true,
          isRealSTT: true,
        };
      } else {
        console.error('[STT] Deepgram API Error:', response.body);
        throw new Error('Deepgram API returned non-200 status');
      }
    } catch (error) {
      console.error('[STT] STT Upload Error:', error);
      // Fall through to manual fallback on error
    }
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

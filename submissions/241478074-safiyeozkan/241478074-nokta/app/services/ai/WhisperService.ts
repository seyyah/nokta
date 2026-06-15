import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || (Constants.expoConfig?.extra?.OPENAI_API_KEY as string) || '';
const OPENAI_TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  source: 'whisper' | 'fallback';
}

export const WhisperService = {
  async transcribe(uri: string): Promise<TranscriptionResult> {
    if (!OPENAI_API_KEY) {
      return {
        text: 'Kaydedilen ses analizi hazır. Burada gerçek ilişkilendirme için OpenAI anahtarı gereklidir.',
        source: 'fallback',
      };
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return { text: 'Ses kaydı bulunamadı. Lütfen tekrar deneyin.', source: 'fallback' };
    }

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'tr');

    const response = await fetch(OPENAI_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const fallbackText = await response.text();
      return {
        text: `Transkripsiyon hatası: ${response.status}. ${fallbackText}`,
        source: 'fallback',
      };
    }

    const result = await response.json();
    return {
      text: result.text ?? 'Ses başarıyla alındı, ancak metne çevrilemedi.',
      source: 'whisper',
    };
  },
};

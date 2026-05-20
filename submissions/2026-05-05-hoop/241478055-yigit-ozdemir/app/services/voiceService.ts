/**
 * Nokta — Ses Kayıt & Transkripsiyon Servisi
 * expo-av ile ses kaydı + Groq Whisper API ile metne dönüştürme.
 * iOS, Android ve Web'de çalışır.
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

// ─── Tipler ──────────────────────────────────────────────────

export interface TranscriptionResult {
  success: true;
  text: string;
}

export interface TranscriptionError {
  success: false;
  error: string;
}

export type TranscriptionResponse = TranscriptionResult | TranscriptionError;

// ─── Ses Kaydı Yöneticisi ────────────────────────────────────

let recording: Audio.Recording | null = null;

/**
 * Mikrofon izni iste ve ses kaydını başlat.
 */
export async function startRecording(): Promise<{ success: boolean; error?: string }> {
  try {
    // İzin iste
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      return { success: false, error: 'Mikrofon izni reddedildi. Lütfen ayarlardan mikrofon erişimine izin verin.' };
    }

    // Ses modunu ayarla
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Kaydı başlat
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Ses kaydı başlatılamadı: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Kaydı durdur ve Groq Whisper API ile metne dönüştür.
 */
export async function stopAndTranscribe(): Promise<TranscriptionResponse> {
  if (!recording) {
    return { success: false, error: 'Aktif bir ses kaydı bulunamadı.' };
  }

  try {
    // Kaydı durdur
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    const uri = recording.getURI();
    recording = null;

    if (!uri) {
      return { success: false, error: 'Ses dosyası oluşturulamadı.' };
    }

    // Ses dosyasını Groq Whisper API'ye gönder
    return await transcribeAudio(uri);
  } catch (err) {
    recording = null;
    return {
      success: false,
      error: `Ses kaydı durdurulamadı: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Kaydı iptal et (transkripsiyon yapmadan).
 */
export async function cancelRecording(): Promise<void> {
  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // sessizce devam et
    }
    recording = null;
  }
}

// ─── Groq Whisper Transkripsiyon ─────────────────────────────

async function transcribeAudio(uri: string): Promise<TranscriptionResponse> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API anahtarı yapılandırılmamış.' };
  }

  try {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Web: fetch ile blob al
      const audioResponse = await fetch(uri);
      const blob = await audioResponse.blob();
      formData.append('file', blob, 'recording.webm');
    } else {
      // Mobile: dosya URI'sini doğrudan ekle
      formData.append('file', {
        uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);
    }

    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'tr');
    formData.append('response_format', 'json');

    const response = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Bilinmeyen hata');
      return {
        success: false,
        error: `Transkripsiyon hatası (${response.status}): ${errorBody.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const text = data?.text?.trim();

    if (!text) {
      return { success: false, error: 'Ses kaydında konuşma tespit edilemedi. Lütfen tekrar deneyin.' };
    }

    return { success: true, text };
  } catch (err) {
    return {
      success: false,
      error: `Transkripsiyon başarısız: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

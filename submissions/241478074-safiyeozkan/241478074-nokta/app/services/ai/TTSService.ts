import * as Speech from 'expo-speech';

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
  language?: string;
}

export const TTSService = {
  speak(text: string, options?: SpeakOptions) {
    Speech.stop();
    Speech.speak(text, {
      pitch: options?.pitch ?? 1,
      rate: options?.rate ?? 1,
      language: options?.language ?? 'tr-TR',
      onDone: () => {},
      onError: (error) => {
        console.warn('TTS error', error);
      },
    });
  },
  stop() {
    Speech.stop();
  },
};

import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';

interface VoiceInputState {
  listening: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceInput extends VoiceInputState {
  start: () => Promise<void>;
  stop: () => void;
  supported: boolean;
}

function useVoiceInputNative(): VoiceInput {
  const [state, setState] = useState<VoiceInputState>({ listening: false, transcript: '', error: null });

  const {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
  } = require('expo-speech-recognition') as typeof import('expo-speech-recognition');

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results?.[0]?.transcript ?? '';
    if (text) setState((s) => ({ ...s, transcript: text }));
  });
  useSpeechRecognitionEvent('end', () => setState((s) => ({ ...s, listening: false })));
  useSpeechRecognitionEvent('error', (e) =>
    setState((s) => ({ ...s, listening: false, error: e.error ?? 'voice error' }))
  );

  const start = useCallback(async () => {
    setState({ listening: true, transcript: '', error: null });
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setState({ listening: false, transcript: '', error: 'Mikrofon izni reddedildi' });
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: 'tr-TR', interimResults: true });
  }, [ExpoSpeechRecognitionModule]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setState((s) => ({ ...s, listening: false }));
  }, [ExpoSpeechRecognitionModule]);

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* noop */
      }
    };
  }, [ExpoSpeechRecognitionModule]);

  return { ...state, start, stop, supported: true };
}

function useVoiceInputUnsupported(): VoiceInput {
  return {
    listening: false,
    transcript: '',
    error: null,
    supported: false,
    start: async () => {
      /* no-op */
    },
    stop: () => {
      /* no-op */
    },
  };
}

export function useVoiceInput(): VoiceInput {
  if (Platform.OS === 'web') return useVoiceInputUnsupported();
  return useVoiceInputNative();
}

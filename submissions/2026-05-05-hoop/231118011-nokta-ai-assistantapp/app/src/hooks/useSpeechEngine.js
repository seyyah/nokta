import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState
} from "expo-audio";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { transcribeAudioWithGroq } from "../services/groqSpeechService";
import { useAssistantStore } from "../store/assistantStore";

const SPEECH_LANGUAGE = "tr-TR";
const SPEECH_RATE = Platform.OS === "ios" ? 0.9 : 1.2;
const SPEECH_PITCH = 1.03;

export const useSpeechEngine = () => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  const [isVoiceAvailable, setIsVoiceAvailable] = useState(true);
  const [isVoiceReady, setIsVoiceReady] = useState(true);
  const [partialText, setPartialText] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const startListeningState = useAssistantStore((state) => state.startListeningState);
  const stopListeningState = useAssistantStore((state) => state.stopListeningState);
  const setTranscript = useAssistantStore((state) => state.setTranscript);
  const setError = useAssistantStore((state) => state.setError);
  const finishSpeaking = useAssistantStore((state) => state.finishSpeaking);

  useEffect(() => {
    const prepareAudio = async () => {
      try {
        const permission = await requestRecordingPermissionsAsync();

        if (!permission.granted) {
          setIsVoiceAvailable(false);
          setIsVoiceReady(false);
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true
        });

        setIsVoiceAvailable(true);
        setIsVoiceReady(true);
      } catch (error) {
        setIsVoiceAvailable(false);
        setIsVoiceReady(false);
      }
    };

    prepareAudio();

    return () => {
      Speech.stop();

      setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true
      }).catch(() => {});
    };
  }, []);

  const speak = useCallback(
    async (text) => {
      const content = String(text || "").trim();

      if (!content) {
        finishSpeaking();
        return;
      }

      try {
        await Speech.stop();

        Speech.speak(content, {
          language: SPEECH_LANGUAGE,
          pitch: SPEECH_PITCH,
          rate: SPEECH_RATE,
          onDone: () => {
            finishSpeaking();
          },
          onStopped: () => {
            finishSpeaking();
          },
          onError: () => {
            finishSpeaking();
          }
        });
      } catch (error) {
        finishSpeaking();
      }
    },
    [finishSpeaking]
  );

  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
    } catch (error) {
      // Sessiz geç.
    } finally {
      finishSpeaking();
    }
  }, [finishSpeaking]);

  const startListening = useCallback(async () => {
    try {
      setRecognizedText("");
      setPartialText("");
      setIsTranscribing(false);

      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setError("Mikrofon izni verilmedi. Ayarlardan mikrofon iznini açman gerekiyor.");
        setIsVoiceAvailable(false);
        setIsVoiceReady(false);
        return;
      }

      await Speech.stop();

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      startListeningState();
      setPartialText("Kayıt başladı. Konuşmayı bitirince mikrofona tekrar bas.");
    } catch (error) {
      setError(error?.message || "Ses kaydı başlatılamadı.");
      stopListeningState();
    }
  }, [recorder, setError, startListeningState, stopListeningState]);

  const stopListening = useCallback(async () => {
    try {
      setPartialText("Ses kaydı durduruluyor...");

      await recorder.stop();

      stopListeningState();

      const audioUri = recorder.uri;

      if (!audioUri) {
        setPartialText("");
        setError("Ses kaydı alınamadı. Tekrar dene.");
        return;
      }

      setIsTranscribing(true);
      setPartialText("Ses yazıya çevriliyor...");

      const transcript = await transcribeAudioWithGroq(audioUri);

      setRecognizedText(transcript);
      setTranscript(transcript);
      setPartialText(`Algılandı: ${transcript}`);
    } catch (error) {
      setError(error?.message || "Ses metne çevrilemedi.");
      setPartialText("");
    } finally {
      setIsTranscribing(false);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true
      }).catch(() => {});
    }
  }, [recorder, setError, setTranscript, stopListeningState]);

  const cancelListening = useCallback(async () => {
    try {
      await recorder.stop();
    } catch (error) {
      // Sessiz geç.
    } finally {
      stopListeningState();
      setPartialText("");
      setIsTranscribing(false);
    }
  }, [recorder, stopListeningState]);

  const clearRecognizedText = useCallback(() => {
    setRecognizedText("");
    setPartialText("");
  }, []);

  const toggleListening = useCallback(async () => {
    if (recorderState?.isRecording) {
      await stopListening();
      return;
    }

    await startListening();
  }, [recorderState?.isRecording, startListening, stopListening]);

  return {
    isVoiceAvailable,
    isVoiceReady,
    isRecording: Boolean(recorderState?.isRecording),
    isTranscribing,
    partialText,
    recognizedText,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    cancelListening,
    toggleListening,
    clearRecognizedText
  };
};
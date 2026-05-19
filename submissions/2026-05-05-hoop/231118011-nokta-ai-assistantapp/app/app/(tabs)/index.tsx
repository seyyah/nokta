import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { ChatPanel } from "../../src/components/ChatPanel";
import { FloatingInputBar } from "../../src/components/FloatingInputBar";
import { NoktaAvatar } from "../../src/components/NoktaAvatar";
import { QuickActionBar } from "../../src/components/QuickActionBar";
import { StatusCard } from "../../src/components/StatusCard";
import { useSpeechEngine } from "../../src/hooks/useSpeechEngine";
// @ts-ignore
import { useAssistantStore } from "../../src/store/assistantStore";

export default function HomeScreen() {
  const lastVoiceTextRef = useRef("");

  const sendMessageToAssistant = useAssistantStore(
    (state: any) => state.sendMessageToAssistant
  );

  const resetInactivityTimer = useAssistantStore(
    (state: any) => state.resetInactivityTimer
  );

  const isListening = useAssistantStore(
    (state: any) => state.isListening
  );

  const isThinking = useAssistantStore(
    (state: any) => state.isThinking
  );

  const lastError = useAssistantStore(
    (state: any) => state.lastError
  );

  const {
    isVoiceReady,
    isRecording,
    isTranscribing,
    recognizedText,
    partialText,
    speak,
    startListening,
    stopListening,
    stopSpeaking,
    clearRecognizedText
  } = useSpeechEngine();

  useEffect(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (lastError) {
      console.log("Nokta error:", lastError);
    }
  }, [lastError]);

  const handleSend = async (text: string) => {
    const cleanText = String(text || "").trim();

    if (!cleanText || isThinking) {
      return;
    }

    await stopSpeaking();

    const assistantMessage = await sendMessageToAssistant(cleanText);

    if (assistantMessage?.content) {
      await speak(assistantMessage.content);
    }
  };

  useEffect(() => {
    const cleanVoiceText = String(recognizedText || "").trim();

    if (!cleanVoiceText) {
      return;
    }

    if (cleanVoiceText === lastVoiceTextRef.current) {
      return;
    }

    if (isThinking) {
      return;
    }

    lastVoiceTextRef.current = cleanVoiceText;

    const sendVoiceMessage = async () => {
      await handleSend(cleanVoiceText);
      clearRecognizedText();
    };

    sendVoiceMessage();
  }, [recognizedText, isThinking, clearRecognizedText]);

  const handleStartListening = async () => {
    if (isRecording) {
      await stopListening();
      return;
    }

    await startListening();
  };

  const handleStopListening = async () => {
    await stopListening();
  };

  const voicePreviewText = isTranscribing
    ? "Ses yazıya çevriliyor..."
    : partialText;

  return (
    <LinearGradient colors={["#07111F", "#0B1020", "#111827"]} style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>NOKTA AI ASSISTANT</Text>
            <Text style={styles.title}>Fikrini söyle, Nokta onu netleştirsin.</Text>
            <Text style={styles.subtitle}>
              Mikrofona bas, fikrini sesli anlat. Nokta sesi yazıya çevirip cevap versin.
            </Text>
          </View>

          <NoktaAvatar />

          <StatusCard />

          <QuickActionBar />

          {voicePreviewText ? (
            <View style={styles.voicePreviewBox}>
              <Text style={styles.voicePreviewLabel}>Ses durumu:</Text>
              <Text style={styles.voicePreviewText}>{voicePreviewText}</Text>
            </View>
          ) : null}

          <View style={styles.chatWrapper}>
            <ChatPanel />
          </View>
        </ScrollView>

        <FloatingInputBar
          voiceReady={isVoiceReady}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onSend={handleSend}
        />

        {isListening ? (
          <View style={styles.listeningBanner}>
            <Text style={styles.listeningText}>
              {isRecording ? "Kayıt alınıyor... Bitirmek için mikrofona tekrar bas." : "Nokta dinliyor..."}
            </Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 38 : 58
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 18
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8
  },
  kicker: {
    color: "#67E8F9",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 8
  },
  subtitle: {
    color: "rgba(234,246,255,0.66)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10
  },
  voicePreviewBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "rgba(37,99,235,0.16)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.22)"
  },
  voicePreviewLabel: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4
  },
  voicePreviewText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  chatWrapper: {
    minHeight: 310
  },
  listeningBanner: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 92,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.92)",
    alignItems: "center",
    justifyContent: "center"
  },
  listeningText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  }
});
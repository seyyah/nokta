import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import RoboJudge from "./components/RoboJudge";
import ScoreMeter from "./components/ScoreMeter";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

function parseVerdict(text) {
  if (!text) return { score: null, justification: "" };
  const scoreMatch = text.match(/SLOP\s*SCORE\s*:\s*(\d{1,3})/i);
  const justMatch = text.match(/JUSTIFICATION\s*:\s*([\s\S]+)/i);
  const raw = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  const score = raw == null || Number.isNaN(raw) ? null : Math.max(0, Math.min(100, raw));
  const justification = justMatch ? justMatch[1].trim() : text.trim();
  return { score, justification };
}

function moodFromScore(score) {
  if (score == null) return "skeptical";
  if (score >= 70) return "outraged";
  if (score >= 40) return "skeptical";
  return "grounded";
}

export default function App() {
  const [pitchInput, setPitchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [verdict, setVerdict] = useState({ score: null, justification: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const mood = useMemo(() => {
    if (loading) return "analyzing";
    if (errorMsg) return "skeptical";
    if (!aiResponse) return "idle";
    return moodFromScore(verdict.score);
  }, [loading, errorMsg, aiResponse, verdict.score]);

  useEffect(
    () => () => {
      Speech.stop();
    },
    []
  );

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      return;
    }
    if (!verdict.justification) return;
    setSpeaking(true);
    Speech.speak(verdict.justification, {
      language: "en-US",
      rate: 1.0,
      pitch: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const analyzePitch = async () => {
    if (!pitchInput.trim() || loading) {
      return;
    }

    stopSpeaking();
    setLoading(true);
    setAiResponse("");
    setVerdict({ score: null, justification: "" });
    setErrorMsg("");

    try {
      const apiKey = process.env.EXPO_PUBLIC_API_KEY;
      if (!apiKey) {
        throw new Error("Missing EXPO_PUBLIC_API_KEY");
      }

      const prompt = `You are a highly critical, no-nonsense startup investor and tech market analyst. Your job is to read startup pitch paragraphs and detect "slop"—which means unrealistic hype, overuse of tech buzzwords (like AI, blockchain, synergy), unverified market claims, and meaningless fluff. Analyze the following pitch and give it a "Slop Score".
      You must reply EXACTLY in this format, with no extra conversation:
      SLOP SCORE: [Enter a number from 1 to 100, where 100 is pure buzzword nonsense/scam, and 1 is a highly realistic, grounded, and honest business].
      JUSTIFICATION: [Write 2 to 3 short, punchy sentences explaining exactly why you gave this score. Call out the specific unrealistic claims or ridiculous buzzwords they used.]
      Here is the pitch to analyze: ${pitchInput}`;

      const response = await fetch(`${API_URL}${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const apiMessage = data?.error?.message;
        const statusInfo = `Request failed (${response.status})`;
        throw new Error(
          apiMessage ? `${statusInfo}: ${apiMessage}` : statusInfo,
        );
      }
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response returned.";

      setAiResponse(text);
      setVerdict(parseVerdict(text));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the pitch.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Startup Pitch Tester</Text>
          <Text style={styles.subtitle}>
            Paste your pitch. JUDGE-7 will read it and rule.
          </Text>
        </View>

        <View style={styles.judgeStage}>
          <RoboJudge mood={mood} score={verdict.score} speaking={speaking} />
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Paste your startup pitch here..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={pitchInput}
            onChangeText={setPitchInput}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={analyzePitch}
          disabled={loading || !pitchInput.trim()}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Submit to JUDGE-7</Text>
          )}
        </TouchableOpacity>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Connection error</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {verdict.score != null && !errorMsg ? (
          <View style={styles.resultCard}>
            <ScoreMeter score={verdict.score} />
            <View style={styles.divider} />
            <View style={styles.justifyHeader}>
              <Text style={styles.resultTitle}>Justification</Text>
              <TouchableOpacity
                onPress={toggleSpeak}
                style={[styles.speakBtn, speaking && styles.speakBtnActive]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.speakBtnText,
                    speaking && styles.speakBtnTextActive,
                  ]}
                >
                  {speaking ? "■  Stop" : "▶  Hear verdict"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{verdict.justification}</Text>
          </View>
        ) : aiResponse && !errorMsg ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Verdict</Text>
            <Text style={styles.resultText}>{aiResponse}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "left",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 20,
  },
  judgeStage: {
    alignItems: "center",
    marginBottom: 14,
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  input: {
    minHeight: 140,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#312E81",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resultCard: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  justifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  speakBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  speakBtnActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4338CA",
  },
  speakBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4338CA",
    letterSpacing: 0.4,
  },
  speakBtnTextActive: {
    color: "#FFFFFF",
  },
  resultText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  errorCard: {
    marginTop: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B91C1C",
    letterSpacing: 1,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 20,
  },
});

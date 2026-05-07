import React, { useState } from "react";
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

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

export default function App() {
  const [pitchInput, setPitchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const analyzePitch = async () => {
    if (!pitchInput.trim() || loading) {
      return;
    }

    setLoading(true);
    setAiResponse("");

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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the pitch.";
      setAiResponse(message);
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
            Paste your pitch and get a brutally honest slop score.
          </Text>
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
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Analyze Pitch</Text>
          )}
        </TouchableOpacity>

        {aiResponse ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Result</Text>
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
    marginBottom: 20,
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
    minHeight: 160,
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
    letterSpacing: 0.2,
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
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  resultText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
});

import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

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

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response returned.";

      setAiResponse(text);
    } catch (error) {
      setAiResponse(
        "Something went wrong while analyzing the pitch. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Startup Pitch Tester</Text>

        <TextInput
          style={styles.input}
          placeholder="Paste your startup pitch here..."
          placeholderTextColor="#8C8C8C"
          multiline
          value={pitchInput}
          onChangeText={setPitchInput}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={analyzePitch}
          disabled={loading}
          activeOpacity={0.8}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginBottom: 18,
  },
  input: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#1A1A1A",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#1B5E57",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111111",
  },
  resultText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 21,
  },
});

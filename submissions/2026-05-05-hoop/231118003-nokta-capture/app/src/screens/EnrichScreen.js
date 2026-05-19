import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ENGINEERING_QUESTIONS, generateSpec } from "../services/gemini";
import { COLORS } from "../theme";

export default function EnrichScreen({ route, navigation }) {
  const { rawIdea } = route.params;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const q = ENGINEERING_QUESTIONS[currentQ];
    const newAnswers = { ...answers, [q.id]: text };
    setAnswers(newAnswers);
    setText("");

    if (currentQ < 4) {
      setCurrentQ(currentQ + 1);
    } else {
      setLoading(true);
      try {
        const spec = await generateSpec(rawIdea, newAnswers);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace("Spec", { spec });
      } catch(e) {
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("AI Hatası", e.message || "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
        console.error("Gemini Error:", e);
      }
    }
  };

  if (loading) return (
    <LinearGradient colors={[COLORS.bg, "#1A0830"]} style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.mint} />
      <Text style={{color: "#fff", marginTop: 20}}>AI Mühendisleri Çalışıyor...</Text>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[COLORS.bg, "#1A0830"]} style={styles.container}>
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>Adım {currentQ + 1} / 5</Text>
      </View>
      <Text style={styles.iconText}>{ENGINEERING_QUESTIONS[currentQ].icon}</Text>
      <Text style={styles.qText}>{ENGINEERING_QUESTIONS[currentQ].question}</Text>
      <TextInput
        style={styles.input}
        placeholder="Mühendislik cevabın..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnT}>{currentQ === 4 ? "Sentezle 🚀" : "Sıradaki →"}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  progressBox: { position: "absolute", top: 60, right: 30, backgroundColor: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 12 },
  progressText: { color: COLORS.pink, fontWeight: "bold" },
  iconText: { fontSize: 40, marginBottom: 10 },
  qText: { fontSize: 24, color: "#fff", fontWeight: "700", marginBottom: 30 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 15, padding: 20, color: "#fff", fontSize: 18, minHeight: 120, marginBottom: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  btn: { backgroundColor: COLORS.mint, padding: 18, borderRadius: 30, alignItems: "center", shadowColor: COLORS.mint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnT: { fontWeight: "800", color: "#0A0A18", fontSize: 16 }
});

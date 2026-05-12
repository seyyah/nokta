import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const GEMINI_API_KEY = "AIzaSyAeKS0xqrVEGPhPAek95MFy3gvf9GTrdBg";

const QUESTIONS = [
  (topic) => `"${topic}" konusunda şu an sıfır mısın, yoksa biraz biliyor musun?`,
  () => `Haftada kaç saat ayırabilirsin? (örn: 2 saat, 5 saat)`,
  () => `Hedefin ne? Hobi mi, profesyonel mi, yoksa merak mı?`,
  () => `Öğrenirken hangi yöntem sana daha iyi gidiyor? (video, okuma, pratik yapma)`,
  () => `Kaç ay içinde somut bir ilerleme görmek istersin?`,
];

async function generateSpec(topic, answers) {
  const prompt = `Sen bir öğrenme koçusun. Kullanıcı şunu öğrenmek istiyor: "${topic}"

Kullanıcının cevapları:
1. Mevcut seviye: ${answers[0]}
2. Haftalık süre: ${answers[1]}
3. Hedef: ${answers[2]}
4. Öğrenme yöntemi: ${answers[3]}
5. Zaman hedefi: ${answers[4]}

Buna göre kişiselleştirilmiş tek sayfalık öğrenme spec'i oluştur. Şu bölümleri içersin:

## 🎯 Hedef
(1-2 cümle, net hedef)

## 📋 Başlangıç Noktası
(seviyeye göre nereden başlayacak)

## 🗓️ Haftalık Plan
(hafta hafta somut adımlar)

## 🛠️ Araçlar & Kaynaklar
(ücretsiz, somut öneriler)

## ✅ İlk 3 Adım (Bu Hafta)
(hemen başlayabileceği 3 görev)

## ⚠️ Tuzaklar
(yaygın 2-3 hata)

Türkçe yaz. Samimi ve motive edici ol.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Spec oluşturulamadı.";
  } catch (e) {
    return "⚠️ Bağlantı hatası. Lütfen tekrar deneyin.";
  }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [topic, setTopic] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const handleStart = () => {
    if (!topic.trim()) return;
    setScreen("questions");
    setCurrentQ(0);
    setAnswers([]);
    fadeIn();
  };

  const handleAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      fadeIn();
    } else {
      setScreen("spec");
      setLoading(true);
      const result = await generateSpec(topic, newAnswers);
      setSpec(result);
      setLoading(false);
      fadeIn();
    }
  };

  const restart = () => {
    setScreen("home");
    setTopic("");
    setAnswers([]);
    setCurrentAnswer("");
    setSpec(null);
    setCurrentQ(0);
    fadeAnim.setValue(1);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <View style={styles.container}>

        {screen === "home" && (
          <View style={styles.center}>
            <Text style={styles.logo}>●</Text>
            <Text style={styles.title}>LearnDot</Text>
            <Text style={styles.subtitle}>Ne öğrenmek istiyorsun?{"\n"}Bir nokta yaz, yol haritanı çıkaralım.</Text>
            <TextInput
              style={styles.input}
              placeholder="örn: gitar, İspanyolca, yüzme..."
              placeholderTextColor="#555"
              value={topic}
              onChangeText={setTopic}
              onSubmitEditing={handleStart}
              returnKeyType="go"
            />
            <TouchableOpacity style={[styles.btn, !topic.trim() && styles.btnDisabled]} onPress={handleStart} disabled={!topic.trim()}>
              <Text style={styles.btnText}>Başla →</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === "questions" && (
          <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
            <View style={styles.progressRow}>
              {QUESTIONS.map((_, i) => (
                <View key={i} style={[styles.progressDot, i <= currentQ && styles.progressDotActive]} />
              ))}
            </View>
            <Text style={styles.qLabel}>Soru {currentQ + 1} / {QUESTIONS.length}</Text>
            <Text style={styles.question}>{QUESTIONS[currentQ](topic)}</Text>
            <TextInput
              style={styles.input}
              placeholder="Cevabın..."
              placeholderTextColor="#555"
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              onSubmitEditing={handleAnswer}
              returnKeyType="next"
              autoFocus
            />
            <TouchableOpacity style={[styles.btn, !currentAnswer.trim() && styles.btnDisabled]} onPress={handleAnswer} disabled={!currentAnswer.trim()}>
              <Text style={styles.btnText}>{currentQ < QUESTIONS.length - 1 ? "Sonraki →" : "Spec Üret ✨"}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {screen === "spec" && (
          <View style={{ flex: 1, width: "100%" }}>
            <View style={styles.specHeader}>
              <Text style={styles.specTitle}>● {topic} Yol Haritası</Text>
            </View>
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>AI spec'ini hazırlıyor...</Text>
              </View>
            ) : (
              <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                  <Text style={styles.specText}>{spec}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.restartBtn} onPress={restart}>
                  <Text style={styles.btnText}>● Yeni Fikir</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { fontSize: 56, color: "#7C3AED", marginBottom: 8 },
  title: { fontSize: 36, fontWeight: "800", color: "#FFF", letterSpacing: 1 },
  subtitle: { fontSize: 15, color: "#888", textAlign: "center", marginTop: 8, marginBottom: 32, lineHeight: 22 },
  input: {
    width: "100%", backgroundColor: "#1A1A1A", borderRadius: 12,
    padding: 16, color: "#FFF", fontSize: 16, borderWidth: 1,
    borderColor: "#2A2A2A", marginBottom: 16,
  },
  btn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingVertical: 14, width: "100%", alignItems: "center" },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  progressRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2A2A2A" },
  progressDotActive: { backgroundColor: "#7C3AED" },
  qLabel: { fontSize: 12, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  question: { fontSize: 20, color: "#FFF", fontWeight: "600", textAlign: "center", marginBottom: 28, lineHeight: 28 },
  specHeader: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" },
  specTitle: { fontSize: 20, fontWeight: "800", color: "#7C3AED" },
  specText: { fontSize: 15, color: "#DDD", lineHeight: 26 },
  loadingText: { color: "#666", marginTop: 16, fontSize: 14 },
  restartBtn: { margin: 20, backgroundColor: "#1A1A1A", borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#7C3AED" },
});
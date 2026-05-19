import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView as RNSafeAreaView,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type QAItem = {
  question: string;
  answer: string;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-4o-mini";

const fallbackQuestions = (idea: string): string[] => {
  const shortIdea = idea.trim().slice(0, 80);
  return [
    `Asil problem nedir ve neden simdi cozulmeli? (${shortIdea})`,
    "Birincil hedef kullanici kim, hangi durumda bu urunu aciyor?",
    "MVP kapsami nedir: ilk surumde mutlaka olacak 3 ozellik ne?",
    "Teknik ve operasyonel kisitlar neler (zaman, butce, veri, cihaz)?",
    "Basari metrigi ne olacak: 2 haftada neyi olcersek dogru yolda oldugumuzu anlariz?",
  ];
};

const fallbackSpec = (idea: string, qaItems: QAItem[]): string => {
  const filled = qaItems.filter((item) => item.answer.trim().length > 0);
  const answerMap = new Map(filled.map((item) => [item.question, item.answer.trim()]));

  return [
    "# One-Page Product Spec",
    "",
    "## Product Idea",
    idea.trim(),
    "",
    "## Problem",
    answerMap.get(qaItems[0]?.question ?? "") || "Netlestirilecek.",
    "",
    "## Target User",
    answerMap.get(qaItems[1]?.question ?? "") || "Netlestirilecek.",
    "",
    "## MVP Scope",
    answerMap.get(qaItems[2]?.question ?? "") || "Netlestirilecek.",
    "",
    "## Constraints",
    answerMap.get(qaItems[3]?.question ?? "") || "Netlestirilecek.",
    "",
    "## Success Metric",
    answerMap.get(qaItems[4]?.question ?? "") || "Netlestirilecek.",
    "",
    "## First Sprint Plan",
    "- Day 1-2: requirements freeze + wireframe",
    "- Day 3-4: core flow implementation",
    "- Day 5: QA + demo prep",
  ].join("\n");
};

const extractListItems = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, "").trim())
    .filter((line) => line.length > 0);

async function callOpenRouter(prompt: string): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/mrkarahann/nokta",
      "X-Title": "Nokta Dot Capture Submission",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a strict product coach. Keep output concise, practical, and engineering focused.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

export default function App() {
  const [ideaText, setIdeaText] = useState("");
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [specText, setSpecText] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState(true);

  const hasAnswers = useMemo(
    () => qaItems.some((item) => item.answer.trim().length > 0),
    [qaItems],
  );

  const handleGenerateQuestions = async () => {
    if (!ideaText.trim()) {
      Alert.alert("Bos fikir", "Devam etmek icin once bir fikir girisi yap.");
      return;
    }

    setLoadingQuestions(true);
    setSpecText("");

    try {
      const prompt = [
        "Asagidaki ham fikir icin 5 tane engineering discovery sorusu uret.",
        "Her soru ayri satirda olsun, numaralandirma kullanabilirsin.",
        "Kapsam: problem, user, scope, constraint, success metric.",
        "",
        `Fikir: ${ideaText.trim()}`,
      ].join("\n");

      const aiResponse = await callOpenRouter(prompt);
      const parsedQuestions = aiResponse ? extractListItems(aiResponse).slice(0, 5) : [];
      const finalQuestions = parsedQuestions.length >= 3 ? parsedQuestions : fallbackQuestions(ideaText);

      setQaItems(finalQuestions.map((question) => ({ question, answer: "" })));
    } catch {
      setQaItems(fallbackQuestions(ideaText).map((question) => ({ question, answer: "" })));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleGenerateSpec = async () => {
    if (!ideaText.trim()) {
      Alert.alert("Bos fikir", "Spec uretmek icin once fikir girisi yap.");
      return;
    }

    if (!hasAnswers) {
      Alert.alert("Cevap gerekli", "Spec uretmek icin en az bir soruyu cevapla.");
      return;
    }

    setLoadingSpec(true);
    try {
      const prompt = [
        "Asagidaki girdilerle tek sayfa urun spec'i yaz.",
        "Basliklar: Product Idea, Problem, Target User, MVP Scope, Constraints, Success Metric, First Sprint Plan.",
        "Yalnizca markdown don.",
        "",
        `Fikir: ${ideaText.trim()}`,
        "",
        "Soru-Cevap:",
        ...qaItems.map(
          (item, index) =>
            `${index + 1}. Soru: ${item.question}\n   Cevap: ${item.answer || "Bos"}`,
        ),
      ].join("\n");

      const aiResponse = await callOpenRouter(prompt);
      setSpecText(aiResponse?.trim() || fallbackSpec(ideaText, qaItems));
    } catch {
      setSpecText(fallbackSpec(ideaText, qaItems));
    } finally {
      setLoadingSpec(false);
    }
  };

  const resetAll = () => {
    setIdeaText("");
    setQaItems([]);
    setSpecText("");
    setExpandedSpec(true);
  };

  return (
    <RNSafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Track A - Dot Capture & Enrich</Text>
          <Text style={styles.heroTitle}>Nokta Spec Pilot</Text>
          <Text style={styles.heroSubtitle}>
            Ham fikri netlestir, sorulari cevapla, tek sayfa urun spec'ini saniyeler icinde olustur.
          </Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDone]} />
            <View style={[styles.progressDot, qaItems.length > 0 ? styles.progressDone : styles.progressIdle]} />
            <View style={[styles.progressDot, hasAnswers ? styles.progressDone : styles.progressIdle]} />
            <View style={[styles.progressDot, specText.length > 0 ? styles.progressDone : styles.progressIdle]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1) Ham Fikir Girisi</Text>
            <Text style={styles.sectionDescription}>
              Fikrini 2-3 cumleyle yaz. Ne problem cozdugunu ve kimin icin oldugunu belirt.
            </Text>
            <TextInput
              value={ideaText}
              onChangeText={setIdeaText}
              placeholder="Ornek: Mahalle kafeleri icin gunluk talep tahmini ve atik azaltma asistani"
              multiline
              style={styles.ideaInput}
            />
            <Pressable
              style={[styles.primaryButton, loadingQuestions && styles.primaryButtonDisabled]}
              onPress={handleGenerateQuestions}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>2) AI Sorularini Uret</Text>
              )}
            </Pressable>
          </View>

          {qaItems.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>3) Engineering Sorulari</Text>
              <Text style={styles.sectionDescription}>
                Kisa ve net cevap ver. Bu cevaplar spec kalitesini dogrudan belirler.
              </Text>
              {qaItems.map((item, index) => (
                <View key={`${item.question}-${index}`} style={styles.qaBlock}>
                  <Text style={styles.questionText}>
                    Soru {index + 1}: {item.question}
                  </Text>
                  <TextInput
                    value={item.answer}
                    onChangeText={(answer) => {
                      setQaItems((prev) =>
                        prev.map((entry, i) => (i === index ? { ...entry, answer } : entry)),
                      );
                    }}
                    placeholder="Cevabini buraya yaz..."
                    multiline
                    style={styles.answerInput}
                  />
                </View>
              ))}

              <Pressable
                style={[styles.primaryButton, loadingSpec && styles.primaryButtonDisabled]}
                onPress={handleGenerateSpec}
                disabled={loadingSpec}
              >
                {loadingSpec ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>4) One-Page Spec Uret</Text>
                )}
              </Pressable>
            </View>
          )}

          {specText.length > 0 && (
            <View style={styles.card}>
              <View style={styles.specHeader}>
                <Text style={styles.sectionTitle}>Spec Ciktisi</Text>
                <Pressable onPress={() => setExpandedSpec((prev) => !prev)} style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>{expandedSpec ? "Daralt" : "Genislet"}</Text>
                </Pressable>
              </View>
              {expandedSpec && (
                <Text selectable style={styles.specText}>
                  {specText}
                </Text>
              )}
            </View>
          )}

          <Pressable style={styles.secondaryButton} onPress={resetAll}>
            <Text style={styles.secondaryText}>Tum Alani Temizle</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  safeArea: {
    flex: 1,
  },
  hero: {
    paddingTop: Platform.OS === "android" ? (RNStatusBar.currentHeight ?? 0) + 10 : 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#111c3b",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    color: "#a5b4fc",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#f8fafc",
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  progressRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    height: 7,
    borderRadius: 999,
    flex: 1,
  },
  progressDone: {
    backgroundColor: "#22c55e",
  },
  progressIdle: {
    backgroundColor: "#334155",
  },
  container: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionDescription: {
    marginTop: 4,
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
  },
  ideaInput: {
    marginTop: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    minHeight: 120,
    padding: 12,
    textAlignVertical: "top",
    color: "#0f172a",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  qaBlock: {
    gap: 8,
    marginTop: 6,
  },
  questionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  answerInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    minHeight: 84,
    padding: 10,
    textAlignVertical: "top",
    color: "#0f172a",
  },
  specHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  specText: {
    marginTop: 8,
    color: "#0f172a",
    lineHeight: 22,
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 2,
  },
  secondaryText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
});

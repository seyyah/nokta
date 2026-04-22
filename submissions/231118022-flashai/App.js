import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView,
  KeyboardAvoidingView, Platform, Animated
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API anahtarını ortam değişkeninden al veya buraya yaz
// Gerçek projede .env dosyası kullanın: EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-...
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || "YOUR_API_KEY_HERE";

const STORAGE_KEY = "flashai_saved_cards";

export default function App() {
  const [screen, setScreen] = useState("home"); // home | loading | cards | saved
  const [inputText, setInputText] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [cards, setCards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [savedSets, setSavedSets] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState("Metin analiz ediliyor...");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [storedKey, setStoredKey] = useState(ANTHROPIC_API_KEY);

  // Flip animasyonu
  const flipAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadSavedCards();
    loadApiKey();
  }, []);

  async function loadApiKey() {
    try {
      const key = await AsyncStorage.getItem("flashai_api_key");
      if (key) setStoredKey(key);
    } catch (_) {}
  }

  async function saveApiKey() {
    if (apiKeyInput.startsWith("sk-ant-")) {
      await AsyncStorage.setItem("flashai_api_key", apiKeyInput);
      setStoredKey(apiKeyInput);
      setShowApiKey(false);
      Alert.alert("✓ Kaydedildi", "API anahtarı güvenle saklandı.");
    } else {
      Alert.alert("Hata", "Geçerli bir Anthropic API anahtarı girin (sk-ant- ile başlamalı).");
    }
  }

  async function loadSavedCards() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setSavedSets(JSON.parse(raw));
    } catch (_) {}
  }

  async function saveCurrentCards() {
    try {
      const newSet = {
        id: Date.now(),
        title: inputText.slice(0, 40) + "...",
        cards,
        date: new Date().toLocaleDateString("tr-TR"),
      };
      const updated = [newSet, ...savedSets].slice(0, 10); // max 10 set
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSets(updated);
      Alert.alert("✓ Kaydedildi", "Kart seti kaydedildi.");
    } catch (_) {
      Alert.alert("Hata", "Kartlar kaydedilemedi.");
    }
  }

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (result.canceled) return;
      const text = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setInputText(text.slice(0, 4000));
      Alert.alert("✓ PDF Yüklendi", `${text.slice(0, 60)}...`);
    } catch {
      Alert.alert("Hata", "PDF okunamadı. Metin bazlı PDF kullandığınızdan emin olun.");
    }
  }

  const loadingMessages = [
    "Metin analiz ediliyor...",
    "Önemli kavramlar çıkarılıyor...",
    "Sorular formüle ediliyor...",
    "Kartlar derleniyor...",
  ];

  async function generateCards(regenerateIndex = null) {
    if (inputText.trim().length < 50) {
      Alert.alert("Uyarı", "Lütfen en az 50 karakter metin girin.");
      return;
    }

    const apiKey = storedKey !== "YOUR_API_KEY_HERE" ? storedKey : null;
    if (!apiKey) {
      setShowApiKey(true);
      return;
    }

    setScreen("loading");
    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 2000);

    try {
      const isRegen = regenerateIndex !== null;
      const prompt = isRegen
        ? `Sen bir sınav hazırlık asistanısın.
Aşağıdaki ders notundan 1 adet flashcard üret. Daha önce "${cards[regenerateIndex].question}" sorusu zaten var, FARKLI bir soru üret.
Format: {"question": "...", "answer": "..."}
Sadece tek bir JSON objesi döndür, array değil.
Türkçe metin için Türkçe kart üret.

Metin:
${inputText.slice(0, 3000)}`
        : `Sen bir sınav hazırlık asistanısın.
Aşağıdaki ders notundan ${cardCount} adet flashcard üret.
Her kart için {"question": "...", "answer": "..."} formatını kullan.
Sadece JSON array döndür, başka hiçbir şey yazma. Markdown ya da açıklama ekleme.
Türkçe metin için Türkçe kart üret.

Metin:
${inputText.slice(0, 3000)}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.[0]?.text || (isRegen ? "{}" : "[]");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (isRegen) {
        const updated = [...cards];
        updated[regenerateIndex] = parsed;
        setCards(updated);
        setFlipped(false);
        setScreen("cards");
      } else {
        setCards(parsed);
        setCardIndex(0);
        setFlipped(false);
        setScreen("cards");
      }
    } catch (e) {
      setScreen("home");
      Alert.alert("Hata", "Kartlar üretilemedi.\n\n" + (e.message || "API anahtarı ve internet bağlantısını kontrol edin."));
    } finally {
      clearInterval(interval);
    }
  }

  function nextCard() {
    if (cardIndex < cards.length - 1) {
      setCardIndex(cardIndex + 1);
      setFlipped(false);
    } else {
      Alert.alert("🎉 Tamamlandı!", "Tüm kartları gözden geçirdin.", [
        { text: "Kaydet", onPress: saveCurrentCards },
        { text: "Başa dön", onPress: () => { setCardIndex(0); setFlipped(false); } },
        { text: "Yeni set", onPress: () => setScreen("home") },
      ]);
    }
  }

  function prevCard() {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setFlipped(false);
    }
  }

  // ── LOADING SCREEN ──
  if (screen === "loading") {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color="#534AB7" />
        <Text style={s.loadingText}>{loadingMsg}</Text>
        <Text style={s.loadingHint}>Claude ile güçlendirildi</Text>
      </SafeAreaView>
    );
  }

  // ── API KEY MODAL ──
  if (showApiKey) {
    return (
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scroll}>
            <Text style={s.appTitle}>🔑 API Anahtarı</Text>
            <Text style={[s.appSubtitle, { marginBottom: 24 }]}>
              Anthropic API anahtarınızı girin.{"\n"}
              console.anthropic.com adresinden alabilirsiniz.
            </Text>
            <TextInput
              style={s.textInput}
              placeholder="sk-ant-..."
              placeholderTextColor="#888"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity style={[s.generateBtn, { marginTop: 16 }]} onPress={saveApiKey}>
              <Text style={s.generateBtnText}>Kaydet ve Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.restartBtn} onPress={() => setShowApiKey(false)}>
              <Text style={s.restartText}>İptal</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── CARDS SCREEN ──
  if (screen === "cards" && cards.length > 0) {
    const card = cards[cardIndex];
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.headerTitle}>FlashAI</Text>
          <Text style={s.headerCount}>{cardIndex + 1} / {cards.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${((cardIndex + 1) / cards.length) * 100}%` }]} />
        </View>

        <TouchableOpacity style={s.card} onPress={() => setFlipped(!flipped)} activeOpacity={0.85}>
          <View style={[s.cardBadge, flipped && s.cardBadgeAnswer]}>
            <Text style={[s.cardTag, flipped && s.cardTagAnswer]}>{flipped ? "CEVAP" : "SORU"}</Text>
          </View>
          <Text style={s.cardText}>{flipped ? card.answer : card.question}</Text>
          <Text style={s.cardHint}>{flipped ? "Anladım → Sonraki" : "Çevirmek için dokun"}</Text>
        </TouchableOpacity>

        <View style={s.navRow}>
          <TouchableOpacity
            style={[s.navBtn, cardIndex === 0 && s.navDisabled]}
            onPress={prevCard}
            disabled={cardIndex === 0}
          >
            <Text style={s.navBtnText}>← Önceki</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={nextCard}>
            <Text style={s.navBtnText}>{cardIndex < cards.length - 1 ? "Sonraki →" : "Bitir ✓"}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => generateCards(cardIndex)}>
            <Text style={s.actionBtnText}>↺ Yeniden Üret</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={saveCurrentCards}>
            <Text style={s.actionBtnText}>♥ Kaydet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => setScreen("home")}>
            <Text style={s.actionBtnText}>+ Yeni Set</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── HOME SCREEN ──
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.titleRow}>
            <Text style={s.appTitle}>FlashAI</Text>
            <TouchableOpacity onPress={() => setShowApiKey(true)}>
              <Text style={s.keyIcon}>🔑</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.appSubtitle}>Ders notunu yükle, AI flashcard üretsin</Text>

          <TouchableOpacity style={s.pdfBtn} onPress={pickPDF}>
            <Text style={s.pdfBtnText}>📄  PDF Yükle</Text>
          </TouchableOpacity>

          <Text style={s.orLabel}>— veya metni yapıştır —</Text>

          <TextInput
            style={s.textInput}
            placeholder="Ders notunu buraya yapıştır (en az 50 karakter)..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={8}
            value={inputText}
            onChangeText={setInputText}
          />
          <Text style={s.charCount}>{inputText.length} karakter</Text>

          <Text style={s.sectionLabel}>Kart sayısı</Text>
          <View style={s.countRow}>
            {[5, 10, 20].map(n => (
              <TouchableOpacity
                key={n}
                style={[s.countBtn, cardCount === n && s.countBtnActive]}
                onPress={() => setCardCount(n)}
              >
                <Text style={[s.countBtnText, cardCount === n && s.countBtnTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.generateBtn} onPress={() => generateCards()}>
            <Text style={s.generateBtnText}>⚡  Flashcard Üret</Text>
          </TouchableOpacity>

          {savedSets.length > 0 && (
            <>
              <Text style={[s.sectionLabel, { marginTop: 28 }]}>Kaydedilen Setler</Text>
              {savedSets.map(set => (
                <TouchableOpacity
                  key={set.id}
                  style={s.savedCard}
                  onPress={() => {
                    setCards(set.cards);
                    setCardIndex(0);
                    setFlipped(false);
                    setScreen("cards");
                  }}
                >
                  <Text style={s.savedTitle}>{set.title}</Text>
                  <Text style={s.savedMeta}>{set.cards.length} kart • {set.date}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PURPLE = "#534AB7";
const DARK = "#26215C";
const LIGHT_BG = "#F8F7FF";
const CARD_BORDER = "#AFA9EC";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: LIGHT_BG },
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 60 },

  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  keyIcon: { fontSize: 20, marginLeft: 10 },
  appTitle: { fontSize: 34, fontWeight: "800", color: DARK, textAlign: "center" },
  appSubtitle: { fontSize: 15, color: PURPLE, textAlign: "center", marginBottom: 28 },

  pdfBtn: { borderWidth: 1.5, borderColor: CARD_BORDER, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 16, backgroundColor: "#EEEDFE" },
  pdfBtnText: { color: "#3C3489", fontWeight: "600", fontSize: 15 },
  orLabel: { textAlign: "center", color: "#888", fontSize: 13, marginBottom: 12 },

  textInput: {
    borderWidth: 1, borderColor: "#D3D1C7", borderRadius: 12,
    padding: 14, fontSize: 14, color: "#2C2C2A", backgroundColor: "#fff",
    minHeight: 140, textAlignVertical: "top",
  },
  charCount: { textAlign: "right", color: "#B4B2A9", fontSize: 12, marginTop: 4 },

  sectionLabel: { fontSize: 13, color: "#5F5E5A", marginTop: 20, marginBottom: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  countRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  countBtn: { flex: 1, borderWidth: 1.5, borderColor: "#D3D1C7", borderRadius: 10, padding: 12, alignItems: "center", backgroundColor: "#fff" },
  countBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  countBtnText: { fontSize: 16, color: "#5F5E5A", fontWeight: "600" },
  countBtnTextActive: { color: "#fff" },

  generateBtn: { backgroundColor: PURPLE, borderRadius: 14, padding: 16, alignItems: "center" },
  generateBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  savedCard: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E0F8" },
  savedTitle: { fontSize: 14, color: DARK, fontWeight: "600" },
  savedMeta: { fontSize: 12, color: "#888", marginTop: 4 },

  loadingText: { marginTop: 20, fontSize: 18, fontWeight: "700", color: DARK },
  loadingHint: { marginTop: 8, fontSize: 13, color: "#888" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: DARK },
  headerCount: { fontSize: 15, color: PURPLE, fontWeight: "600" },

  progressBg: { height: 4, backgroundColor: "#E2E0F8", marginHorizontal: 20, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: PURPLE, borderRadius: 2 },

  card: {
    margin: 20, flex: 1, backgroundColor: "#fff", borderRadius: 20,
    padding: 32, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: CARD_BORDER,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  cardBadge: { backgroundColor: "#EEEDFE", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 20 },
  cardBadgeAnswer: { backgroundColor: "#E8F5E9" },
  cardTag: { fontSize: 11, color: PURPLE, fontWeight: "700", letterSpacing: 1.5 },
  cardTagAnswer: { color: "#2E7D32" },
  cardText: { fontSize: 20, color: DARK, fontWeight: "600", textAlign: "center", lineHeight: 30 },
  cardHint: { fontSize: 12, color: "#B4B2A9", marginTop: 28 },

  navRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 8 },
  navBtn: { flex: 1, backgroundColor: "#EEEDFE", borderRadius: 12, padding: 14, alignItems: "center" },
  navDisabled: { opacity: 0.35 },
  navBtnText: { color: "#3C3489", fontWeight: "700", fontSize: 15 },

  actionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  actionBtn: { flex: 1, alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: "#F0EFF9" },
  actionBtnText: { color: PURPLE, fontSize: 12, fontWeight: "600" },

  restartBtn: { alignItems: "center", paddingTop: 16 },
  restartText: { color: "#888", fontSize: 14 },
});

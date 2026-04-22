import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Dimensions, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');
const ANTHROPIC_KEY_STORAGE = 'flashai_api_key';
const SAVED_SETS_STORAGE = 'flashai_saved_sets';

// ─── API ────────────────────────────────────────────────────────────────────
async function generateFlashcards(text, count, apiKey) {
  const prompt = `Sen bir sınav hazırlık asistanısın.
Aşağıdaki ders notundan ${count} adet flashcard üret.
Her kart: {"question": "...", "answer": "..."}
Sadece JSON array döndür, başka hiçbir şey yazma.
Türkçe metin için Türkçe kart üret.

Metin:
${text.slice(0, 4000)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API hatası');
  }

  const data = await res.json();
  const raw = data.content[0].text.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function regenerateOne(card, apiKey) {
  const prompt = `Bu flashcard sorusunu farklı bir şekilde yeniden üret.
Mevcut soru: "${card.question}"
Mevcut cevap: "${card.answer}"
Sadece JSON döndür: {"question": "...", "answer": "..."}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.content[0].text.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ─── SCREENS ────────────────────────────────────────────────────────────────

// API Key Screen
function ApiKeyScreen({ onSave }) {
  const [key, setKey] = useState('');
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centered}>
        <Text style={styles.emoji}>🔑</Text>
        <Text style={styles.title}>API Anahtarı</Text>
        <Text style={styles.subtitle}>Anthropic API anahtarını gir</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-ant-..."
          placeholderTextColor="#666"
          value={key}
          onChangeText={setKey}
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => key.trim() && onSave(key.trim())}
        >
          <Text style={styles.btnText}>Kaydet & Devam Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Home Screen
function HomeScreen({ onGenerate, onSaved, onChangeKey }) {
  const [text, setText] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(ANTHROPIC_KEY_STORAGE).then(k => k && setApiKey(k));
  }, []);

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.canceled) return;
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      }).catch(() => null);
      if (content) setText(content.slice(0, 5000));
      else Alert.alert('Uyarı', 'PDF\'den metin okunamadı. Lütfen metin yapıştırın.');
    } catch (e) {
      Alert.alert('Hata', 'PDF yüklenemedi.');
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return Alert.alert('Hata', 'Lütfen metin girin.');
    if (!apiKey) return Alert.alert('Hata', 'API anahtarı bulunamadı.');
    setLoading(true);
    try {
      const cards = await generateFlashcards(text, count, apiKey);
      onGenerate(cards, text.slice(0, 50));
    } catch (e) {
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>⚡ FlashAI</Text>
          <TouchableOpacity onPress={onChangeKey}>
            <Text style={styles.keyBtn}>🔑</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Ders Notunu Yapıştır</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={8}
          placeholder="Ders notunu buraya yapıştır veya PDF yükle..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={pickPDF}>
          <Text style={styles.btnTextDark}>📄 PDF Yükle</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Kart Sayısı</Text>
        <View style={styles.countRow}>
          {[5, 10, 20].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.countBtn, count === n && styles.countBtnActive]}
              onPress={() => setCount(n)}
            >
              <Text style={[styles.countBtnText, count === n && styles.countBtnTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>✨ Flashcard Üret</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.savedBtn} onPress={onSaved}>
          <Text style={styles.savedBtnText}>📚 Kayıtlı Setler</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Flashcard Viewer
function CardViewer({ cards, title, apiKey, onBack, onSave }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [localCards, setLocalCards] = useState(cards);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const goNext = () => {
    if (index < localCards.length - 1) {
      setFlipped(false);
      flipAnim.setValue(0);
      setIndex(index + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setFlipped(false);
      flipAnim.setValue(0);
      setIndex(index - 1);
    }
  };

  const regen = async () => {
    setRegenLoading(true);
    try {
      const newCard = await regenerateOne(localCards[index], apiKey);
      const updated = [...localCards];
      updated[index] = newCard;
      setLocalCards(updated);
      setFlipped(false);
      flipAnim.setValue(0);
    } catch (e) {
      Alert.alert('Hata', e.message);
    } finally {
      setRegenLoading(false);
    }
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const progress = ((index + 1) / localCards.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.viewerContainer}>
        {/* Header */}
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.cardCounter}>{index + 1} / {localCards.length}</Text>
          <TouchableOpacity onPress={() => onSave(localCards, title)}>
            <Text style={styles.saveBtn}>💾</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Card */}
        <TouchableOpacity onPress={flip} activeOpacity={0.9}>
          {/* Front */}
          <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
            <Text style={styles.cardLabel}>SORU</Text>
            <Text style={styles.cardText}>{localCards[index]?.question}</Text>
            <Text style={styles.tapHint}>Çevirmek için dokun 👆</Text>
          </Animated.View>
          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
            <Text style={styles.cardLabel}>CEVAP</Text>
            <Text style={styles.cardText}>{localCards[index]?.answer}</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Nav Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={index === 0}
          >
            <Text style={styles.navBtnText}>◀ Önceki</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.regenBtn} onPress={regen} disabled={regenLoading}>
            {regenLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.regenText}>🔄</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, index === localCards.length - 1 && styles.navBtnDisabled]}
            onPress={goNext}
            disabled={index === localCards.length - 1}
          >
            <Text style={styles.navBtnText}>Sonraki ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Saved Sets Screen
function SavedSetsScreen({ onBack, onLoad }) {
  const [sets, setSets] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_SETS_STORAGE).then(data => {
      if (data) setSets(JSON.parse(data));
    });
  }, []);

  const deleteSet = async (i) => {
    const updated = sets.filter((_, idx) => idx !== i);
    setSets(updated);
    await AsyncStorage.setItem(SAVED_SETS_STORAGE, JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.homeContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.appTitle}>📚 Kayıtlı Setler</Text>
          <View style={{ width: 40 }} />
        </View>

        {sets.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Henüz kayıtlı set yok.</Text>
          </View>
        ) : (
          <ScrollView>
            {sets.map((set, i) => (
              <View key={i} style={styles.setItem}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => onLoad(set.cards, set.title)}>
                  <Text style={styles.setTitle}>{set.title}</Text>
                  <Text style={styles.setMeta}>{set.cards.length} kart • {set.date}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSet(i)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('loading');
  const [apiKey, setApiKey] = useState('');
  const [cards, setCards] = useState([]);
  const [cardTitle, setCardTitle] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(ANTHROPIC_KEY_STORAGE).then(key => {
      if (key) { setApiKey(key); setScreen('home'); }
      else setScreen('apikey');
    });
  }, []);

  const saveApiKey = async (key) => {
    await AsyncStorage.setItem(ANTHROPIC_KEY_STORAGE, key);
    setApiKey(key);
    setScreen('home');
  };

  const handleGenerate = (newCards, title) => {
    setCards(newCards);
    setCardTitle(title || 'Flashcard Seti');
    setScreen('viewer');
  };

  const handleSave = async (saveCards, title) => {
    try {
      const existing = await AsyncStorage.getItem(SAVED_SETS_STORAGE);
      const sets = existing ? JSON.parse(existing) : [];
      const newSet = {
        title: title || 'Sınav Seti',
        cards: saveCards,
        date: new Date().toLocaleDateString('tr-TR'),
      };
      const updated = [newSet, ...sets].slice(0, 10);
      await AsyncStorage.setItem(SAVED_SETS_STORAGE, JSON.stringify(updated));
      Alert.alert('✅ Kaydedildi', 'Flashcard seti kaydedildi!');
    } catch (e) {
      Alert.alert('Hata', 'Kaydedilemedi.');
    }
  };

  if (screen === 'loading') {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (screen === 'apikey') return <ApiKeyScreen onSave={saveApiKey} />;

  if (screen === 'home') return (
    <HomeScreen
      onGenerate={handleGenerate}
      onSaved={() => setScreen('saved')}
      onChangeKey={() => setScreen('apikey')}
    />
  );

  if (screen === 'viewer') return (
    <CardViewer
      cards={cards}
      title={cardTitle}
      apiKey={apiKey}
      onBack={() => setScreen('home')}
      onSave={handleSave}
    />
  );

  if (screen === 'saved') return (
    <SavedSetsScreen
      onBack={() => setScreen('home')}
      onLoad={(c, t) => { setCards(c); setCardTitle(t); setScreen('viewer'); }}
    />
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F1A' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  homeContainer: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  appTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  keyBtn: { fontSize: 22 },

  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },

  label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, marginTop: 16, letterSpacing: 1 },

  input: {
    backgroundColor: '#1A1A2E', color: '#fff', borderRadius: 12,
    padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2A2A3E',
    marginBottom: 16, width: '100%',
  },
  textArea: {
    backgroundColor: '#1A1A2E', color: '#fff', borderRadius: 12,
    padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#2A2A3E',
    minHeight: 160, marginBottom: 12,
  },

  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  btnPrimary: { backgroundColor: '#6C63FF' },
  btnSecondary: { backgroundColor: '#1E1E30', borderWidth: 1, borderColor: '#2A2A3E' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextDark: { color: '#aaa', fontSize: 15, fontWeight: '600' },

  countRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  countBtn: {
    flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#1A1A2E',
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A3E',
  },
  countBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  countBtnText: { color: '#666', fontSize: 16, fontWeight: '700' },
  countBtnTextActive: { color: '#fff' },

  savedBtn: { alignItems: 'center', marginTop: 20, padding: 12 },
  savedBtnText: { color: '#6C63FF', fontSize: 15, fontWeight: '600' },

  // Viewer
  viewerContainer: { flex: 1, padding: 20 },
  viewerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  cardCounter: { color: '#888', fontSize: 15 },
  saveBtn: { fontSize: 22 },

  progressBg: { height: 4, backgroundColor: '#1A1A2E', borderRadius: 4, marginBottom: 28 },
  progressFill: { height: 4, backgroundColor: '#6C63FF', borderRadius: 4 },

  card: {
    backgroundColor: '#1A1A2E', borderRadius: 20, padding: 28,
    minHeight: 260, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A3E',
    backfaceVisibility: 'hidden',
    position: 'absolute', width: '100%',
  },
  cardFront: { backgroundColor: '#1A1A2E' },
  cardBack: { backgroundColor: '#12102A' },
  cardLabel: { fontSize: 11, fontWeight: '800', color: '#6C63FF', letterSpacing: 2, marginBottom: 16 },
  cardText: { fontSize: 18, color: '#fff', textAlign: 'center', lineHeight: 26 },
  tapHint: { position: 'absolute', bottom: 16, color: '#444', fontSize: 12 },

  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 300, paddingTop: 16,
  },
  navBtn: {
    backgroundColor: '#1A1A2E', paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2A3E',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  regenBtn: {
    backgroundColor: '#6C63FF', width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  regenText: { fontSize: 20 },

  // Saved
  setItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E',
    borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A3E',
  },
  setTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  setMeta: { color: '#666', fontSize: 12 },
  deleteBtn: { fontSize: 20, paddingLeft: 12 },
  emptyText: { color: '#666', fontSize: 16 },
});

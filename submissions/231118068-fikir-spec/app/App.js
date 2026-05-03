import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert, Share
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const OPENROUTER_API_KEY = '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';

const SYSTEM_PROMPT = `Sen NOKTA adlı bir ürün geliştirme asistanısın.

KURALLAR (ÇOK ÖNEMLİ):
- Her mesajında SADECE TEK BİR SORU sor. Asla birden fazla soru sorma.
- Kısa ve net yaz. Paragraf yazma.
- Kullanıcı cevap verdikçe sıradaki soruya geç.

SORU SIRASI (birer birer sor):
1. "Bu fikir tam olarak hangi problemi çözüyor?"
2. "Hedef kullanıcın kim? Yaş ve alışkanlık olarak."
3. "MVP için en kritik 1-2 özellik ne olur?"
4. "Teknik veya bütçe kısıtın var mı?"
5. "Mevcut alternatifler ne, farkın ne?"

4-5 soru bittikten sonra spec üret ve yanıtının EN SONUNA tam olarak şu kelimeyi yaz: SPEC_HAZIR

SPEC FORMATI:
# 📄 ÜRÜN SPEC: [Fikir Adı]

## Problem
[açıklama]

## Hedef Kullanıcı
[açıklama]

## Çözüm
[açıklama]

## MVP Özellikleri
- [özellik]
- [özellik]

## Kısıtlar & Riskler
[açıklama]

## Başarı Metrikleri
[açıklama]

## Sonraki Adım
[açıklama]

SPEC_HAZIR`;

const COLORS = {
  bg: '#0A0A0F',
  surface: '#13131A',
  card: '#1C1C28',
  border: '#2A2A3D',
  accent: '#7C6FF7',
  accentLight: '#A99FF7',
  accentDim: '#3D3875',
  text: '#E8E8F0',
  textMuted: '#8888A8',
  textDim: '#555570',
  success: '#4ECDC4',
  white: '#FFFFFF',
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [ideaInput, setIdeaInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [screen]);

  const loadHistory = async () => {
    try {
      const saved = await SecureStore.getItemAsync('spec_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  };

  const saveToHistory = async (specText, idea) => {
    try {
      const newItem = {
        id: Date.now().toString(),
        idea: idea,
        spec: specText,
        date: new Date().toLocaleDateString('tr-TR'),
      };
      const newHistory = [newItem, ...history].slice(0, 20);
      setHistory(newHistory);
      await SecureStore.setItemAsync('spec_history', JSON.stringify(newHistory));
    } catch (e) {}
  };

  const deleteFromHistory = async (id) => {
    try {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      await SecureStore.setItemAsync('spec_history', JSON.stringify(newHistory));
    } catch (e) {}
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const callAI = async (msgs) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/zeynepacil/nokta',
        'X-Title': 'NOKTA App',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...msgs,
        ],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  };

  const startChat = async () => {
    if (!ideaInput.trim()) return;
    setScreen('chat');
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    const msgs = [{ role: 'user', content: ideaInput.trim() }];
    setMessages([{ type: 'user', text: ideaInput.trim() }]);
    setLoading(true);

    try {
      const reply = await callAI(msgs);
      setMessages(prev => [...prev, { type: 'ai', text: reply }]);
      setQuestionCount(1);
      scrollToBottom();
    } catch (e) {
      Alert.alert('Hata', 'API bağlantısı kurulamadı.\n\n' + e.message);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;
    const userText = inputText.trim();
    setInputText('');

    const updatedMessages = [...messages, { type: 'user', text: userText }];
    setMessages(updatedMessages);
    scrollToBottom();
    setLoading(true);

    const apiMsgs = [
      { role: 'user', content: ideaInput },
      ...updatedMessages.slice(1).map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    try {
      const reply = await callAI(apiMsgs);
      setMessages(prev => [...prev, { type: 'ai', text: reply }]);
      setQuestionCount(prev => prev + 1);

      if (reply.includes('SPEC_HAZIR')) {
        const cleanedSpec = reply.replace('SPEC_HAZIR', '').trim();
        await saveToHistory(cleanedSpec, ideaInput);
        setTimeout(() => {
          setSpec(cleanedSpec);
          setScreen('spec');
          fadeAnim.setValue(0);
          slideAnim.setValue(30);
        }, 1500);
      }
      scrollToBottom();
    } catch (e) {
      Alert.alert('Hata', 'Mesaj gönderilemedi.\n\n' + e.message);
    }
    setLoading(false);
  };

  const copySpec = async () => {
    await Clipboard.setStringAsync(spec);
    Alert.alert('✅ Kopyalandı', 'Spec panoya kopyalandı.');
  };

  const shareSpec = async () => {
    try {
      await Share.share({ message: spec, title: 'NOKTA Ürün Spec' });
    } catch (e) {}
  };

  const reset = () => {
    setScreen('home');
    setMessages([]);
    setIdeaInput('');
    setInputText('');
    setSpec('');
    setQuestionCount(0);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
  };

  const openHistoryItem = (item) => {
    setSpec(item.spec);
    setScreen('spec');
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
  };

  // ─── HOME SCREEN ───
  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.homeScroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.homeContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              <View style={styles.logoRow}>
                <View style={styles.logoDot} />
                <Text style={styles.logoText}>NOKTA</Text>
              </View>

              <Text style={styles.homeTagline}>Ham fikrinden{'\n'}ürün spec'ine.</Text>
              <Text style={styles.homeDesc}>
                Fikrini yaz. AI sana mühendislik soruları sorar.{'\n'}Cevapla. Tek sayfa spec hazır.
              </Text>

              <View style={styles.stepsRow}>
                {['💡 Fikir', '🤖 Sorular', '📄 Spec'].map((s, i) => (
                  <View key={i} style={styles.stepBadge}>
                    <Text style={styles.stepText}>{s}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>FİKRİN NEDİR?</Text>
                <TextInput
                  style={styles.ideaInput}
                  placeholder="Örn: Üniversite öğrencileri için not paylaşım uygulaması..."
                  placeholderTextColor={COLORS.textDim}
                  value={ideaInput}
                  onChangeText={setIdeaInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.startBtn, !ideaInput.trim() && styles.startBtnDisabled]}
                onPress={startChat}
                disabled={!ideaInput.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.startBtnText}>Başla</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>

              {history.length > 0 && (
                <View style={styles.historySection}>
                  <Text style={styles.historyTitle}>📋 Geçmiş Spec'ler</Text>
                  {history.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.historyCard}
                      onPress={() => openHistoryItem(item)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyIdea} numberOfLines={2}>{item.idea}</Text>
                        <Text style={styles.historyDate}>{item.date}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Sil', 'Bu spec silinsin mi?', [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => deleteFromHistory(item.id) },
                        ])}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─── CHAT SCREEN ───
  if (screen === 'chat') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={reset} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatHeaderTitle}>Fikir Analizi</Text>
              <Text style={styles.chatHeaderSub}>{questionCount} / 5 soru</Text>
            </View>
            <View style={styles.progressPill}>
              <View style={[styles.progressFill, { width: `${Math.min((questionCount / 5) * 100, 100)}%` }]} />
            </View>
          </View>

          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>
            {messages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.type === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                {msg.type === 'ai' && (
                  <View style={styles.aiBadge}>
                    <View style={styles.aiDot} />
                    <Text style={styles.aiBadgeText}>NOKTA AI</Text>
                  </View>
                )}
                <Text style={msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.bubble, styles.bubbleAI]}>
                <View style={styles.aiBadge}>
                  <View style={styles.aiDot} />
                  <Text style={styles.aiBadgeText}>NOKTA AI</Text>
                </View>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                  <Text style={styles.typingText}>düşünüyor...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Cevabını yaz..."
              placeholderTextColor={COLORS.textDim}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─── SPEC SCREEN ───
  if (screen === 'spec') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <View style={styles.specHeader}>
          <TouchableOpacity onPress={reset} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.specHeaderTitle}>Ürün Spec</Text>
          <View style={styles.specHeaderActions}>
            <TouchableOpacity onPress={shareSpec} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={20} color={COLORS.accentLight} />
            </TouchableOpacity>
            <TouchableOpacity onPress={copySpec} style={styles.iconBtn}>
              <Ionicons name="copy-outline" size={20} color={COLORS.accentLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.specSuccessBanner}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={styles.specSuccessText}>Spec başarıyla oluşturuldu!</Text>
        </View>

        <ScrollView style={styles.specScroll} contentContainerStyle={styles.specScrollContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {renderSpecMarkdown(spec)}
          </Animated.View>
        </ScrollView>

        <View style={styles.specFooter}>
          <TouchableOpacity style={styles.newIdeaBtn} onPress={reset}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.newIdeaBtnText}>Yeni Fikir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

function renderSpecMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('# ')) return <Text key={i} style={styles.mdH1}>{line.replace('# ', '')}</Text>;
    if (line.startsWith('## ')) return <Text key={i} style={styles.mdH2}>{line.replace('## ', '')}</Text>;
    if (line.startsWith('- ')) return (
      <View key={i} style={styles.mdListRow}>
        <View style={styles.mdBullet} />
        <Text style={styles.mdListText}>{line.replace('- ', '')}</Text>
      </View>
    );
    if (line.trim() === '---') return <View key={i} style={styles.mdDivider} />;
    if (line.trim() === '') return <View key={i} style={{ height: 8 }} />;
    return <Text key={i} style={styles.mdBody}>{line}</Text>;
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  homeScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  homeContent: { gap: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: 4 },
  homeTagline: { fontSize: 36, fontWeight: '800', color: COLORS.white, lineHeight: 44 },
  homeDesc: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22 },
  stepsRow: { flexDirection: 'row', gap: 10 },
  stepBadge: { backgroundColor: COLORS.accentDim, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.accent + '40' },
  stepText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '600' },
  inputCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  inputLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  ideaInput: { color: COLORS.text, fontSize: 15, lineHeight: 22, minHeight: 100 },
  startBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  historySection: { gap: 10 },
  historyTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  historyCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  historyIdea: { color: COLORS.text, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  historyDate: { color: COLORS.textDim, fontSize: 12, marginTop: 4 },
  deleteBtn: { padding: 6 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  chatHeaderTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  chatHeaderSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  progressPill: { width: 60, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 2 },
  chatScroll: { flex: 1 },
  chatScrollContent: { padding: 16, gap: 12 },
  bubble: { borderRadius: 16, padding: 14, maxWidth: '88%' },
  bubbleUser: { backgroundColor: COLORS.accentDim, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  aiBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  bubbleTextUser: { color: COLORS.white, fontSize: 14, lineHeight: 20 },
  bubbleTextAI: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingText: { color: COLORS.textMuted, fontSize: 13 },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  chatInput: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  specHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  specHeaderTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  specHeaderActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copyBtnText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  specSuccessBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.success + '15', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.success + '30' },
  specSuccessText: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  specScroll: { flex: 1 },
  specScrollContent: { padding: 20, paddingBottom: 40 },
  mdH1: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 16, lineHeight: 28 },
  mdH2: { color: COLORS.accentLight, fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 8, letterSpacing: 0.5 },
  mdBody: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  mdListRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 3 },
  mdBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 8 },
  mdListText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 22 },
  mdDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  specFooter: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  newIdeaBtn: { backgroundColor: COLORS.accentDim, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.accent + '40' },
  newIdeaBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
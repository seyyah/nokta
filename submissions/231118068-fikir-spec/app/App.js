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
  warning: '#F59E0B',
  white: '#FFFFFF',
};

const EXPERTS = [
  { id: '1', name: 'Ahmet Yılmaz', title: 'Ürün Yöneticisi', company: 'Trendyol', expertise: ['Mobil Ürün', 'E-ticaret', 'MVP'], bio: '8 yıllık ürün yönetimi deneyimi. 50+ özellik lansmanı.', avatar: '👨‍💼', rating: 4.9, sessions: 124 },
  { id: '2', name: 'Zeynep Kaya', title: 'Girişim Danışmanı', company: 'Y Combinator Alumni', expertise: ['Startup', 'Yatırım', 'Go-to-Market'], bio: '3 şirket kurdu, ikisini başarıyla exit etti.', avatar: '👩‍💻', rating: 4.8, sessions: 89 },
  { id: '3', name: 'Can Demir', title: 'UX Araştırmacısı', company: 'Getir', expertise: ['Kullanıcı Araştırması', 'Tasarım', 'Prototip'], bio: 'Kullanıcı odaklı tasarım ve araştırma uzmanı.', avatar: '🎨', rating: 4.7, sessions: 67 },
  { id: '4', name: 'Elif Şahin', title: 'Yazılım Mimarı', company: 'Peak Games', expertise: ['Teknik Mimari', 'Ölçeklenebilirlik', 'Backend'], bio: 'Milyonlarca kullanıcıya sahip sistemler tasarladı.', avatar: '⚙️', rating: 4.9, sessions: 156 },
];

export default function App() {
  const [userType, setUserType] = useState(null); // null | 'user' | 'expert'
  const [currentExpert, setCurrentExpert] = useState(null);
  const [screen, setScreen] = useState('home');
  const [ideaInput, setIdeaInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [expertMessage, setExpertMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadHistory();
    loadAllMessages();
  }, [screen]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [screen, userType]);

  const loadHistory = async () => {
    try {
      const saved = await SecureStore.getItemAsync('spec_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  };

  const loadAllMessages = async () => {
    try {
      const saved = await SecureStore.getItemAsync('expert_messages');
      if (saved) setAllMessages(JSON.parse(saved));
    } catch (e) {}
  };

  const saveToHistory = async (specText, idea) => {
    try {
      const newItem = { id: Date.now().toString(), idea, spec: specText, date: new Date().toLocaleDateString('tr-TR') };
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

  const sendMessageToExpert = async (expert) => {
    if (!expertMessage.trim()) return;
    try {
      const newMsg = {
        id: Date.now().toString(),
        expertId: expert.id,
        expertName: expert.name,
        userMessage: expertMessage.trim(),
        spec: spec || '',
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        replies: [],
        read: false,
      };
      const updated = [newMsg, ...allMessages];
      setAllMessages(updated);
      await SecureStore.setItemAsync('expert_messages', JSON.stringify(updated));
      setExpertMessage('');
      Alert.alert('✅ Gönderildi', `${expert.name} en kısa sürede cevap verecek.`);
      setScreen('experts');
    } catch (e) {}
  };

  const sendReply = async (conversationId) => {
    if (!replyText.trim()) return;
    try {
      const updated = allMessages.map(msg => {
        if (msg.id === conversationId) {
          return {
            ...msg,
            replies: [...msg.replies, {
              id: Date.now().toString(),
              text: replyText.trim(),
              from: currentExpert.name,
              time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            }],
            read: true,
          };
        }
        return msg;
      });
      setAllMessages(updated);
      await SecureStore.setItemAsync('expert_messages', JSON.stringify(updated));
      setReplyText('');
      setSelectedConversation(updated.find(m => m.id === conversationId));
    } catch (e) {}
  };

  const scrollToBottom = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

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
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...msgs],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  };

  const startChat = async () => {
    if (!ideaInput.trim()) return;
    setScreen('chat');
    fadeAnim.setValue(0); slideAnim.setValue(30);
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
      ...updatedMessages.slice(1).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text })),
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
          fadeAnim.setValue(0); slideAnim.setValue(30);
        }, 1500);
      }
      scrollToBottom();
    } catch (e) {
      Alert.alert('Hata', 'Mesaj gönderilemedi.\n\n' + e.message);
    }
    setLoading(false);
  };

  const reset = () => {
    setScreen('home');
    setMessages([]); setIdeaInput(''); setInputText('');
    setSpec(''); setQuestionCount(0);
    setSelectedExpert(null); setExpertMessage('');
    fadeAnim.setValue(0); slideAnim.setValue(30);
  };

  const logout = () => {
    setUserType(null); setCurrentExpert(null);
    setScreen('home'); reset();
    fadeAnim.setValue(0); slideAnim.setValue(30);
  };

  // ─── LOGIN SCREEN ───
  if (!userType && screen !== 'expertLogin') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.loginScroll}>
          <Animated.View style={[styles.loginContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoRow}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>NOKTA</Text>
            </View>
            <Text style={styles.loginTitle}>Hoş Geldin!</Text>
            <Text style={styles.loginSub}>Nasıl giriş yapmak istiyorsun?</Text>

            <TouchableOpacity style={styles.loginCard} onPress={() => { setUserType('user'); fadeAnim.setValue(0); slideAnim.setValue(30); }} activeOpacity={0.8}>
              <Text style={styles.loginCardIcon}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.loginCardTitle}>Kullanıcı Olarak Gir</Text>
                <Text style={styles.loginCardSub}>Fikir yaz, spec üret, uzman desteği al</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.accentLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.loginCard, styles.loginCardExpert]} onPress={() => setScreen('expertLogin')} activeOpacity={0.8}>
              <Text style={styles.loginCardIcon}>👨‍💼</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.loginCardTitle}>Uzman Olarak Gir</Text>
                <Text style={styles.loginCardSub}>Gelen mesajları gör, cevap ver</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.accentLight} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ─── EXPERT LOGIN SCREEN ───
  if (screen === 'expertLogin') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => { setScreen('home'); setUserType(null); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>Uzman Seç</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Text style={styles.expertLoginInfo}>Hangi uzman olarak giriş yapmak istiyorsun?</Text>
          {EXPERTS.map(expert => (
            <TouchableOpacity
              key={expert.id}
              style={styles.expertLoginCard}
              onPress={() => {
                setCurrentExpert(expert);
                setUserType('expert');
                setScreen('expertPanel');
                fadeAnim.setValue(0); slideAnim.setValue(30);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.expertAvatar}>{expert.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertTitle}>{expert.title} · {expert.company}</Text>
              </View>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {allMessages.filter(m => m.expertId === expert.id && !m.read).length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─── EXPERT PANEL ───
  if (userType === 'expert' && screen === 'expertPanel') {
    const myMessages = allMessages.filter(m => m.expertId === currentExpert.id);
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <Text style={styles.expertPanelAvatar}>{currentExpert.avatar}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatHeaderTitle}>{currentExpert.name}</Text>
            <Text style={styles.chatHeaderSub}>Uzman Paneli</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {myMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
              <Text style={styles.emptyDesc}>Kullanıcılar sana mesaj gönderdiğinde burada görünecek.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              <Text style={styles.inboxTitle}>📬 Gelen Mesajlar ({myMessages.length})</Text>
              {myMessages.map(msg => (
                <TouchableOpacity
                  key={msg.id}
                  style={[styles.inboxCard, !msg.read && styles.inboxCardUnread]}
                  onPress={() => { setSelectedConversation(msg); setScreen('conversation'); fadeAnim.setValue(0); slideAnim.setValue(30); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.inboxCardTop}>
                    <View style={styles.inboxUserAvatar}>
                      <Text style={{ fontSize: 16 }}>👤</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inboxUserName}>Anonim Kullanıcı</Text>
                      <Text style={styles.inboxDate}>{msg.date} · {msg.time}</Text>
                    </View>
                    {!msg.read && <View style={styles.unreadDot} />}
                    {msg.replies.length > 0 && (
                      <Text style={styles.replyCount}>{msg.replies.length} cevap</Text>
                    )}
                  </View>
                  <Text style={styles.inboxPreview} numberOfLines={2}>{msg.userMessage}</Text>
                  {msg.spec ? (
                    <View style={styles.specAttachBadge}>
                      <Ionicons name="document-text" size={12} color={COLORS.success} />
                      <Text style={styles.specAttachText}>Spec eklendi</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    );
  }

  // ─── CONVERSATION SCREEN ───
  if (screen === 'conversation' && selectedConversation) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setScreen('expertPanel')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>Konuşma</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>

            <View style={[styles.bubble, styles.bubbleAI]}>
              <View style={styles.aiBadge}>
                <Text style={{ fontSize: 12 }}>👤</Text>
                <Text style={styles.aiBadgeText}>KULLANICI · {selectedConversation.time}</Text>
              </View>
              <Text style={styles.bubbleTextAI}>{selectedConversation.userMessage}</Text>
            </View>

            {selectedConversation.spec ? (
              <TouchableOpacity
                style={styles.specPreviewCard}
                onPress={() => { setSpec(selectedConversation.spec); setScreen('specView'); }}
              >
                <Ionicons name="document-text" size={16} color={COLORS.accentLight} />
                <Text style={styles.specPreviewText}>Spec'i görüntüle</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.accentLight} />
              </TouchableOpacity>
            ) : null}

            {selectedConversation.replies.map((reply, i) => (
              <View key={i} style={[styles.bubble, styles.bubbleUser]}>
                <Text style={styles.bubbleTextUser}>{reply.text}</Text>
                <Text style={styles.replyTime}>{reply.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Cevabını yaz..."
              placeholderTextColor={COLORS.textDim}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
              onPress={() => sendReply(selectedConversation.id)}
              disabled={!replyText.trim()}
            >
              <Ionicons name="send" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ─── SPEC VIEW (for expert) ───
  if (screen === 'specView') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.specHeader}>
          <TouchableOpacity onPress={() => setScreen('conversation')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.specHeaderTitle}>Kullanıcı Spec'i</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView style={styles.specScroll} contentContainerStyle={styles.specScrollContent}>
          {renderSpecMarkdown(spec)}
        </ScrollView>
      </View>
    );
  }

  // ─── HOME SCREEN (user) ───
  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.homeScroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.homeContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              <View style={styles.homeHeaderRow}>
                <View style={styles.logoRow}>
                  <View style={styles.logoDot} />
                  <Text style={styles.logoText}>NOKTA</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                  <Ionicons name="log-out-outline" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.homeTagline}>Ham fikrinden{'\n'}ürün spec'ine.</Text>
              <Text style={styles.homeDesc}>Fikrini yaz. AI sana mühendislik soruları sorar.{'\n'}Cevapla. Tek sayfa spec hazır.</Text>

              <View style={styles.stepsRow}>
                {['💡 Fikir', '🤖 Sorular', '📄 Spec', '👨‍💼 Uzman'].map((s, i) => (
                  <View key={i} style={styles.stepBadge}><Text style={styles.stepText}>{s}</Text></View>
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
                  multiline numberOfLines={4} textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={[styles.startBtn, !ideaInput.trim() && styles.startBtnDisabled]} onPress={startChat} disabled={!ideaInput.trim()} activeOpacity={0.8}>
                <Text style={styles.startBtnText}>Başla</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.expertBannerBtn} onPress={() => setScreen('experts')} activeOpacity={0.8}>
                <View style={styles.expertBannerLeft}>
                  <Text style={styles.expertBannerIcon}>👨‍💼</Text>
                  <View>
                    <Text style={styles.expertBannerTitle}>Uzman Desteği Al</Text>
                    <Text style={styles.expertBannerSub}>Deneyimli mentorlarla çalış</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.accentLight} />
              </TouchableOpacity>

              {allMessages.length > 0 && (
                <TouchableOpacity style={styles.inboxBannerBtn} onPress={() => setScreen('userInbox')} activeOpacity={0.8}>
                  <View style={styles.expertBannerLeft}>
                    <Text style={styles.expertBannerIcon}>📬</Text>
                    <View>
                      <Text style={styles.expertBannerTitle}>Gönderilen Mesajlarım</Text>
                      <Text style={styles.expertBannerSub}>{allMessages.filter(m => m.replies.length > 0).length} cevap var</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.accentLight} />
                </TouchableOpacity>
              )}

              {history.length > 0 && (
                <View style={styles.historySection}>
                  <Text style={styles.historyTitle}>📋 Geçmiş Spec'ler</Text>
                  {history.map(item => (
                    <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => { setSpec(item.spec); setScreen('spec'); fadeAnim.setValue(0); slideAnim.setValue(30); }} activeOpacity={0.7}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyIdea} numberOfLines={2}>{item.idea}</Text>
                        <Text style={styles.historyDate}>{item.date}</Text>
                      </View>
                      <TouchableOpacity onPress={() => Alert.alert('Sil', 'Bu spec silinsin mi?', [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => deleteFromHistory(item.id) }])} style={styles.deleteBtn}>
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
        <StatusBar barStyle="light-content" />
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
                {msg.type === 'ai' && (<View style={styles.aiBadge}><View style={styles.aiDot} /><Text style={styles.aiBadgeText}>NOKTA AI</Text></View>)}
                <Text style={msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI}>{msg.text}</Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.bubble, styles.bubbleAI]}>
                <View style={styles.aiBadge}><View style={styles.aiDot} /><Text style={styles.aiBadgeText}>NOKTA AI</Text></View>
                <View style={styles.typingRow}><ActivityIndicator size="small" color={COLORS.accent} /><Text style={styles.typingText}>düşünüyor...</Text></View>
              </View>
            )}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput style={styles.chatInput} placeholder="Cevabını yaz..." placeholderTextColor={COLORS.textDim} value={inputText} onChangeText={setInputText} multiline maxLength={500} />
            <TouchableOpacity style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!inputText.trim() || loading}>
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
        <StatusBar barStyle="light-content" />
        <View style={styles.specHeader}>
          <TouchableOpacity onPress={reset} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.specHeaderTitle}>Ürün Spec</Text>
          <View style={styles.specHeaderActions}>
            <TouchableOpacity onPress={async () => { try { await Share.share({ message: spec }); } catch (e) {} }} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={20} color={COLORS.accentLight} />
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(spec); Alert.alert('✅ Kopyalandı', 'Spec panoya kopyalandı.'); }} style={styles.iconBtn}>
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
          <TouchableOpacity style={styles.expertBtn} onPress={() => setScreen('experts')} activeOpacity={0.8}>
            <Text style={styles.expertBtnIcon}>👨‍💼</Text>
            <Text style={styles.expertBtnText}>Uzman Desteği Al</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newIdeaBtn} onPress={reset}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.newIdeaBtnText}>Yeni Fikir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── USER INBOX SCREEN ───
  if (screen === 'userInbox') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <View>
            <Text style={styles.chatHeaderTitle}>Gönderilen Mesajlarım</Text>
            <Text style={styles.chatHeaderSub}>{allMessages.length} mesaj</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {allMessages.map(msg => {
            const expert = EXPERTS.find(e => e.id === msg.expertId);
            return (
              <View key={msg.id} style={styles.userInboxCard}>
                <View style={styles.userInboxHeader}>
                  <Text style={styles.userInboxExpert}>{expert?.avatar} {msg.expertName}</Text>
                  <Text style={styles.inboxDate}>{msg.date} · {msg.time}</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleUser, { alignSelf: 'flex-end', maxWidth: '100%' }]}>
                  <Text style={styles.bubbleTextUser}>{msg.userMessage}</Text>
                </View>
                {msg.replies.length === 0 ? (
                  <View style={styles.waitingBadge}>
                    <ActivityIndicator size="small" color={COLORS.textMuted} />
                    <Text style={styles.waitingText}>Uzman cevap bekliyor...</Text>
                  </View>
                ) : (
                  msg.replies.map((reply, i) => (
                    <View key={i} style={[styles.bubble, styles.bubbleAI, { maxWidth: '100%' }]}>
                      <View style={styles.aiBadge}>
                        <Text style={{ fontSize: 12 }}>{expert?.avatar}</Text>
                        <Text style={styles.aiBadgeText}>{reply.from} · {reply.time}</Text>
                      </View>
                      <Text style={styles.bubbleTextAI}>{reply.text}</Text>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ─── EXPERTS SCREEN ───
  if (screen === 'experts') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setScreen(spec ? 'spec' : 'home')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <View>
            <Text style={styles.chatHeaderTitle}>Uzman Desteği</Text>
            <Text style={styles.chatHeaderSub}>{EXPERTS.length} uzman mevcut</Text>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14 }}>
          {EXPERTS.map(expert => (
            <TouchableOpacity key={expert.id} style={styles.expertCard} onPress={() => { setSelectedExpert(expert); setExpertMessage(''); setScreen('expertDetail'); }} activeOpacity={0.8}>
              <View style={styles.expertCardTop}>
                <Text style={styles.expertAvatar}>{expert.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expertName}>{expert.name}</Text>
                  <Text style={styles.expertTitle}>{expert.title} · {expert.company}</Text>
                </View>
                <View style={styles.ratingBadge}><Text style={styles.ratingText}>⭐ {expert.rating}</Text></View>
              </View>
              <Text style={styles.expertBio}>{expert.bio}</Text>
              <View style={styles.expertTags}>
                {expert.expertise.map((tag, i) => (
                  <View key={i} style={styles.expertTag}><Text style={styles.expertTagText}>{tag}</Text></View>
                ))}
              </View>
              <View style={styles.expertCardFooter}>
                <Text style={styles.expertSessions}>{expert.sessions} oturum</Text>
                <View style={styles.contactBtn}>
                  <Text style={styles.contactBtnText}>İletişime Geç</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─── EXPERT DETAIL ───
  if (screen === 'expertDetail' && selectedExpert) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setScreen('experts')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.accentLight} />
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>{selectedExpert.name}</Text>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
            <View style={styles.expertDetailCard}>
              <Text style={styles.expertDetailAvatar}>{selectedExpert.avatar}</Text>
              <Text style={styles.expertDetailName}>{selectedExpert.name}</Text>
              <Text style={styles.expertDetailTitle}>{selectedExpert.title}</Text>
              <Text style={styles.expertDetailCompany}>{selectedExpert.company}</Text>
              <View style={styles.expertDetailStats}>
                <View style={styles.expertStatItem}>
                  <Text style={styles.expertStatValue}>⭐ {selectedExpert.rating}</Text>
                  <Text style={styles.expertStatLabel}>Puan</Text>
                </View>
                <View style={styles.expertStatDivider} />
                <View style={styles.expertStatItem}>
                  <Text style={styles.expertStatValue}>{selectedExpert.sessions}</Text>
                  <Text style={styles.expertStatLabel}>Oturum</Text>
                </View>
              </View>
              <Text style={styles.expertDetailBio}>{selectedExpert.bio}</Text>
              <View style={styles.expertTags}>
                {selectedExpert.expertise.map((tag, i) => (
                  <View key={i} style={styles.expertTag}><Text style={styles.expertTagText}>{tag}</Text></View>
                ))}
              </View>
            </View>
            <View style={styles.messageCard}>
              <Text style={styles.messageCardTitle}>Mesaj Gönder</Text>
              <Text style={styles.messageCardSub}>Fikrin ve spec'in hakkında uzmanına yaz.</Text>
              {spec ? (
                <View style={styles.specAttachBadge}>
                  <Ionicons name="document-text" size={14} color={COLORS.success} />
                  <Text style={styles.specAttachText}>Spec otomatik eklenecek</Text>
                </View>
              ) : null}
              <TextInput
                style={styles.messageInput}
                placeholder="Merhaba, fikrim hakkında görüşünüzü almak istiyorum..."
                placeholderTextColor={COLORS.textDim}
                value={expertMessage}
                onChangeText={setExpertMessage}
                multiline numberOfLines={5} textAlignVertical="top"
              />
              <TouchableOpacity style={[styles.sendMessageBtn, !expertMessage.trim() && styles.startBtnDisabled]} onPress={() => sendMessageToExpert(selectedExpert)} disabled={!expertMessage.trim()} activeOpacity={0.8}>
                <Ionicons name="send" size={18} color={COLORS.white} />
                <Text style={styles.sendMessageBtnText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return null;
}

function renderSpecMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
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
  loginScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  loginContent: { gap: 24 },
  loginTitle: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  loginSub: { fontSize: 15, color: COLORS.textMuted },
  loginCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: COLORS.border },
  loginCardExpert: { borderColor: COLORS.accent + '40' },
  loginCardIcon: { fontSize: 32 },
  loginCardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  loginCardSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  homeScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  homeContent: { gap: 20 },
  homeHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: 4 },
  logoutBtn: { padding: 8 },
  homeTagline: { fontSize: 32, fontWeight: '800', color: COLORS.white, lineHeight: 40 },
  homeDesc: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22 },
  stepsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  stepBadge: { backgroundColor: COLORS.accentDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent + '40' },
  stepText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },
  inputCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  inputLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  ideaInput: { color: COLORS.text, fontSize: 15, lineHeight: 22, minHeight: 100 },
  startBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  expertBannerBtn: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border },
  expertBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expertBannerIcon: { fontSize: 28 },
  expertBannerTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  expertBannerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
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
  replyTime: { color: COLORS.accentLight + '80', fontSize: 10, marginTop: 4, textAlign: 'right' },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  chatInput: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  specHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  specHeaderTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  specHeaderActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  specSuccessBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.success + '15', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.success + '30' },
  specSuccessText: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  specScroll: { flex: 1 },
  specScrollContent: { padding: 20, paddingBottom: 40 },
  mdH1: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 16, lineHeight: 28 },
  mdH2: { color: COLORS.accentLight, fontSize: 15, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  mdBody: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  mdListRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 3 },
  mdBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 8 },
  mdListText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 22 },
  mdDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  specFooter: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  expertBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  expertBtnIcon: { fontSize: 18 },
  expertBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  newIdeaBtn: { backgroundColor: COLORS.accentDim, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.accent + '40' },
  newIdeaBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  expertCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  expertCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expertAvatar: { fontSize: 36 },
  expertName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  expertTitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  ratingBadge: { backgroundColor: COLORS.warning + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { color: COLORS.warning, fontSize: 13, fontWeight: '700' },
  expertBio: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  expertTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  expertTag: { backgroundColor: COLORS.accentDim, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accent + '30' },
  expertTagText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },
  expertCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expertSessions: { color: COLORS.textDim, fontSize: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  expertDetailCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border },
  expertDetailAvatar: { fontSize: 56, marginBottom: 4 },
  expertDetailName: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  expertDetailTitle: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },
  expertDetailCompany: { color: COLORS.textMuted, fontSize: 13 },
  expertDetailStats: { flexDirection: 'row', alignItems: 'center', gap: 20, marginVertical: 8 },
  expertStatItem: { alignItems: 'center', gap: 4 },
  expertStatValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  expertStatLabel: { color: COLORS.textMuted, fontSize: 11 },
  expertStatDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  expertDetailBio: { color: COLORS.text, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  messageCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, gap: 12, borderWidth: 1, borderColor: COLORS.border },
  messageCardTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  messageCardSub: { color: COLORS.textMuted, fontSize: 13 },
  specAttachBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.success + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  specAttachText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  messageInput: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 14, minHeight: 120, borderWidth: 1, borderColor: COLORS.border },
  sendMessageBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  sendMessageBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  inboxBannerBtn: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.success + '40' },
  userInboxCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  userInboxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  userInboxExpert: { color: COLORS.accentLight, fontSize: 14, fontWeight: '700' },
  waitingBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10 },
  waitingText: { color: COLORS.textMuted, fontSize: 13 },
  expertLoginInfo: { color: COLORS.textMuted, fontSize: 14, marginBottom: 4 },
  unreadBadge: { backgroundColor: COLORS.accent, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  expertPanelAvatar: { fontSize: 28 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  emptyDesc: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  inboxTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  inboxCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  inboxCardUnread: { borderColor: COLORS.accent + '60' },
  inboxCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inboxUserAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accentDim, alignItems: 'center', justifyContent: 'center' },
  inboxUserName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  inboxDate: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  replyCount: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },
  inboxPreview: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  specPreviewCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accentDim, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.accent + '30', alignSelf: 'flex-start' },
  specPreviewText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '600' },
});
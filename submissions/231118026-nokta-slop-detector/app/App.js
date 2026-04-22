import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Animated, Platform, Dimensions,
  Modal, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const USE_MOCK   = !process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const LIBRARY_KEY = '@nokta_library';
const { width: SW, height: SH } = Dimensions.get('window');

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const BG = ['#04000f', '#0b0428', '#070c36', '#02071c'];
const BG_STOPS = [0, 0.3, 0.65, 1];

const GLASS = 'rgba(255,255,255,0.06)';
const BORDER = 'rgba(255,255,255,0.09)';

const C = {
  white: '#f0f0ff',
  sub: 'rgba(200,200,255,0.58)',
  muted: 'rgba(155,155,205,0.38)',
  purple: '#8b5cf6',
  violet: '#7c3aed',
  error: '#f87171',
  ok: '#34d399',
};

const TAG = {
  'Ürün': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', grad: ['rgba(245,158,11,0.45)', 'rgba(245,158,11,0.0)'] },
  'Strateji': { color: '#10b981', bg: 'rgba(16,185,129,0.12)', grad: ['rgba(16,185,129,0.45)', 'rgba(16,185,129,0.0)'] },
  'Araştırma': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', grad: ['rgba(167,139,250,0.45)', 'rgba(167,139,250,0.0)'] },
  'Büyüme': { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', grad: ['rgba(236,72,153,0.45)', 'rgba(236,72,153,0.0)'] },
  'Teknik': { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', grad: ['rgba(56,189,248,0.45)', 'rgba(56,189,248,0.0)'] },
};
const TAGS = Object.keys(TAG);
const ICONS = ['💡', '🚀', '🔍', '⚡', '🎯'];

// ─── MOCK / API ───────────────────────────────────────────────────────────────
const mockGenerateCards = (text) => {
  const sentences = text.split(/[\n.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const unique = [...new Set(sentences)];
  return unique.slice(0, 5).map((s, i) => ({
    id: `${Date.now()}_${i}`,
    icon: ICONS[i % ICONS.length],
    title: s.length > 55 ? s.slice(0, 52) + '...' : s,
    description: `"${s.slice(0, 90)}${s.length > 90 ? '...' : ''}"`,
    action: "Bir sonraki sprint'e al ve araştır.",
    tag: TAGS[i % TAGS.length],
  }));
};

const mockGenerateIdeaMd = (card) => `# ${card.icon} ${card.title}

## Özet
${card.description}

## Problem
Bu fikir, kullanıcıların karşılaştığı temel bir sorunu çözmeyi hedefliyor.

## Çözüm
${card.action}

## Hedef Kitle
- Erken benimseyenler ve meraklı kullanıcılar
- Alakalı sektördeki profesyoneller

## Temel Özellikler
- Temel işlevsellik ve kullanıcı dostu arayüz
- Hızlı prototipleme ve test imkânı
- Gerçek zamanlı geri bildirim döngüsü

## Sonraki Adımlar
- [ ] Problem ve hedef kitle doğrulaması yap
- [ ] Düşük maliyetli prototip oluştur
- [ ] 5 potansiyel kullanıcıyla görüş

---
*Kategori: ${card.tag} · nokta ile oluşturuldu*
`;

const DIMENSION_ICONS = { 'Pazar İddiası': '📊', 'Kullanıcı Edinimi': '🎯', 'Varsayım Testi': '🔬', 'Kapsam': '📐', 'Özgünlük': '✨' };

const mockGenerateFull = (text) => ({
  score: {
    total: 47,
    dimensions: [
      { name: 'Pazar İddiası', score: 10, critique: 'TAM tahmini yok, pazar büyüklüğü kanıtsız.' },
      { name: 'Kullanıcı Edinimi', score: 9, critique: 'Edinim kanalı belirsiz, organik büyüme varsayılıyor.' },
      { name: 'Varsayım Testi', score: 11, critique: 'Temel varsayımlar test edilmemiş.' },
      { name: 'Kapsam', score: 8, critique: 'v1 kapsamı çok geniş, önceliklendirilmemiş özellikler var.' },
      { name: 'Özgünlük', score: 9, critique: 'Rakip analizi eksik.' },
    ],
  },
  cards: mockGenerateCards(text),
});

const FULL_SYSTEM_PROMPT = `Sen bir fikir değerlendirme uzmanısın. Verilen metni 5 boyutta puanla ve idea card'lar oluştur. SADECE şu JSON formatını döndür: {"score":{"total":<0-100>,"dimensions":[{"name":"Pazar İddiası","score":<0-20>,"critique":"<1 cümle Türkçe>"},{"name":"Kullanıcı Edinimi","score":<0-20>,"critique":"<1 cümle>"},{"name":"Varsayım Testi","score":<0-20>,"critique":"<1 cümle>"},{"name":"Kapsam","score":<0-20>,"critique":"<1 cümle>"},{"name":"Özgünlük","score":<0-20>,"critique":"<1 cümle>"}]},"cards":[{"icon":"...","title":"...","description":"...","action":"...","tag":"..."}]} Puan düşük = belirsiz/slop. Yüksek = somut/kanıtlı. Max 5 card.`;

const IDEA_MD_PROMPT = `Sen bir ürün geliştirme uzmanısın. Verilen fikir kartına göre Türkçe detaylı bir idea.md dosyası oluştur.

Tam olarak bu format:
# [icon] [Başlık]

## Özet
[2-3 cümle]

## Problem
[Hangi problemi çözüyor?]

## Çözüm
[Nasıl çözüyor?]

## Hedef Kitle
- [Segment 1]
- [Segment 2]

## Temel Özellikler
- [Özellik 1]
- [Özellik 2]
- [Özellik 3]

## Sonraki Adımlar
- [ ] [Adım 1]
- [ ] [Adım 2]
- [ ] [Adım 3]

---
*Kategori: [tag] · nokta ile oluşturuldu*

SADECE markdown döndür, başka açıklama ekleme.`;

const callGroqFull = async (notes) => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: FULL_SYSTEM_PROMPT },
        { role: 'user', content: `Şu metni değerlendir:\n\n${notes}` },
      ],
      temperature: 0.7, max_tokens: 1500,
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `API ${res.status}`); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Geçersiz API yanıtı');
  const parsed = JSON.parse(match[0]);
  return {
    score: parsed.score,
    cards: (parsed.cards || []).map((c, i) => ({ ...c, id: `${Date.now()}_${i}` })),
  };
};

const callGroqForIdeaMd = async (card) => {
  const cardText = `Başlık: ${card.title}\nAçıklama: ${card.description}\nSomut Adım: ${card.action}\nKategori: ${card.tag}`;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: IDEA_MD_PROMPT },
        { role: 'user', content: `Şu fikir kartı için idea.md oluştur:\n\n${cardText}` },
      ],
      temperature: 0.7, max_tokens: 1024,
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `API ${res.status}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
};

// ─── SLOP SCORE ───────────────────────────────────────────────────────────────
const slopColor = (total) => total >= 71 ? C.ok : total >= 41 ? '#f59e0b' : C.error;
const slopLabel = (total) => total >= 71 ? 'Düşük Slop' : total >= 41 ? 'Orta Slop' : 'Yüksek Slop';

function DimensionRow({ dim, index }) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const pct = dim.score / 20;
  const color = slopColor(dim.score * 5);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: pct,
      duration: 600,
      delay: index * 80,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.dimRow}>
      <View style={styles.dimTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Text style={styles.dimIcon}>{DIMENSION_ICONS[dim.name] || '•'}</Text>
          <Text style={styles.dimName}>{dim.name}</Text>
        </View>
        <Text style={[styles.dimScore, { color }]}>{dim.score}<Text style={styles.dimScoreMax}>/20</Text></Text>
      </View>
      <View style={styles.dimBarBg}>
        <Animated.View style={[styles.dimBarFill, {
          width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: color,
        }]} />
      </View>
      <Text style={styles.dimCritique}>{dim.critique}</Text>
    </View>
  );
}

function SlopScoreCard({ score }) {
  const total = score.total;
  const color = slopColor(total);
  const label = slopLabel(total);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], marginBottom: 24 }}>
      <View style={[styles.scoreCard, { borderColor: color + '40' }]}>
        <LinearGradient
          colors={[color + '18', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreLabel}>SLOP SKORU</Text>
          <View style={[styles.scorePill, { backgroundColor: color + '20', borderColor: color + '50' }]}>
            <Text style={[styles.scorePillText, { color }]}>{label}</Text>
          </View>
        </View>
        <View style={styles.scoreNumRow}>
          <Text style={[styles.scoreNum, { color }]}>{total}</Text>
          <Text style={styles.scoreNumMax}>/100</Text>
        </View>
        <View style={styles.dimList}>
          {score.dimensions.map((dim, i) => (
            <DimensionRow key={dim.name} dim={dim} index={i} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
function Background() {
  const orb = (w, h, style, color) => (
    <View style={[{
      position: 'absolute', width: w, height: h,
      borderRadius: 999, opacity: 0.14, backgroundColor: color,
    }, style]} />
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {orb(400, 400, { top: -140, left: -140 }, '#5b21b6')}
      {orb(280, 280, { top: 90, right: -90 }, '#1d4ed8')}
      {orb(220, 220, { top: SH * 0.42, left: SW * 0.18 }, '#0369a1')}
      {orb(340, 340, { bottom: 30, right: -130 }, '#4c1d95')}
      {orb(200, 200, { bottom: 160, left: -70 }, '#be185d')}
    </View>
  );
}

// ─── SAVE BUTTON ─────────────────────────────────────────────────────────────
function SaveButton({ saved, onPress, color }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 20 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <Animated.View style={[
        styles.saveBtn,
        {
          borderColor: saved ? (color + '70') : 'rgba(255,255,255,0.2)',
          backgroundColor: saved ? (color + '20') : 'rgba(0,0,0,0.25)'
        },
        { transform: [{ scale }] },
      ]}>
        <Text style={{ fontSize: 14 }}>{saved ? '🔖' : '🩶'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── IDEA CARD ────────────────────────────────────────────────────────────────
function IdeaCard({ card, savedIds, onToggleSave, index, onExpand }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;
  const isSaved = savedIds.has(card.id);
  const p = TAG[card.tag] || TAG['Ürün'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, delay: index * 90, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, speed: 18, bounciness: 4, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], marginBottom: 16 }}>
      <View style={[styles.card, isSaved && { borderColor: p.color + '60' }]}>

        {/* ── Colored gradient banner (top) */}
        <LinearGradient
          colors={p.grad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.cardBanner}
        >
          <View style={styles.bannerTopRow}>
            <View style={[styles.tagChip, { backgroundColor: 'rgba(0,0,0,0.28)', borderColor: p.color + '55' }]}>
              <View style={[styles.tagDot, { backgroundColor: p.color }]} />
              <Text style={[styles.tagChipText, { color: '#fff' }]}>{card.tag}</Text>
            </View>
            <SaveButton saved={isSaved} onPress={() => onToggleSave(card)} color={p.color} />
          </View>

          <View style={styles.bannerIconWrap}>
            <Text style={styles.bannerIcon}>{card.icon}</Text>
          </View>
        </LinearGradient>

        {/* ── Glass content (bottom) */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDesc}>{card.description}</Text>

          <View style={[styles.actionRow, { backgroundColor: p.bg, borderColor: p.color + '30' }]}>
            <View style={[styles.actionDot, { backgroundColor: p.color }]} />
            <Text style={styles.actionText}>{card.action}</Text>
          </View>

          {onExpand && (
            <TouchableOpacity
              style={[styles.expandBtn, { borderColor: p.color + '50', backgroundColor: p.color + '12' }]}
              onPress={() => onExpand(card)}
            >
              <Text style={[styles.expandBtnText, { color: p.color }]}>✦  idea.md Oluştur</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </Animated.View>
  );
}

// ─── IDEA MD MODAL ────────────────────────────────────────────────────────────
function IdeaMdModal({ visible, card, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible || !card) return;
    setContent(''); setError('');
    setLoading(true);
    const run = async () => {
      try {
        const md = USE_MOCK
          ? (await new Promise(r => setTimeout(r, 1200)), mockGenerateIdeaMd(card))
          : await callGroqForIdeaMd(card);
        setContent(md);
      } catch (e) {
        setError(e.message || 'Hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [visible, card]);

  const handleShare = async () => {
    try {
      await Share.share({ message: content, title: card?.title || 'idea.md' });
    } catch { }
  };

  const p = card ? (TAG[card.tag] || TAG['Ürün']) : TAG['Ürün'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <LinearGradient colors={BG} locations={BG_STOPS} style={StyleSheet.absoluteFill} />

          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>idea.md</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={C.purple} size="large" />
                <Text style={styles.modalLoadingText}>Fikir geliştiriliyor...</Text>
              </View>
            )}
            {error !== '' && !loading && (
              <View style={[styles.toast, { borderColor: C.error + '50', backgroundColor: C.error + '12' }]}>
                <Text style={[styles.toastText, { color: C.error }]}>{error}</Text>
              </View>
            )}
            {content !== '' && !loading && (
              <View style={[styles.mdBox, { borderColor: p.color + '30' }]}>
                <Text style={styles.mdContent}>{content}</Text>
              </View>
            )}
          </ScrollView>

          {content !== '' && !loading && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <LinearGradient
                  colors={[p.color, p.color + 'cc']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.shareBtnGrad}
                >
                  <Text style={styles.shareBtnText}>↑  Paylaş / Kopyala</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.65, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sh = (w, h = 12) => (
    <View style={{ width: w, height: h, backgroundColor: BORDER, borderRadius: 6, marginBottom: 10 }} />
  );

  return (
    <Animated.View style={{ opacity: pulse, marginBottom: 16 }}>
      <View style={styles.card}>
        <View style={[styles.cardBanner, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
        <View style={styles.cardBody}>
          {sh('80%', 17)}
          {sh('60%', 12)}
          {sh('70%', 12)}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── TOAST BANNER ────────────────────────────────────────────────────────────
function Toast({ type, message, onRetry }) {
  const isErr = type === 'error';
  const color = isErr ? C.error : C.ok;
  return (
    <View style={[styles.toast, { borderColor: color + '50', backgroundColor: color + '12' }]}>
      <View style={[styles.toastDot, { backgroundColor: color }]} />
      <Text style={[styles.toastText, { color }]}>{message}</Text>
      {isErr && onRetry && (
        <TouchableOpacity onPress={onRetry} style={[styles.retryBtn, { borderColor: color + '60' }]}>
          <Text style={{ color, fontSize: 12, fontWeight: '700' }}>Tekrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ isLibrary }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.emptyWrap}>
      <Animated.View style={{ opacity: pulse }}>
        <LinearGradient
          colors={['rgba(139,92,246,0.4)', 'rgba(99,102,241,0.2)', 'rgba(56,189,248,0.1)']}
          style={styles.emptyCircle}
        >
          <Text style={{ fontSize: 48 }}>{isLibrary ? '🔖' : '✦'}</Text>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.emptyTitle}>
        {isLibrary ? 'Kütüphane boş' : 'Notlarını buraya yapıştır'}
      </Text>
      <Text style={styles.emptyDesc}>
        {isLibrary
          ? 'Ürettiğin card\'lardaki 🩶 ikonuna basarak\nfikirleri buraya kaydet.'
          : 'Toplantı notu, WhatsApp export, bullet\nliste — anında idea card\'lara dönüştür.'}
      </Text>
    </View>
  );
}

// ─── PILL LABEL ──────────────────────────────────────────────────────────────
function PillLabel({ text, count }) {
  return (
    <View style={styles.pillLabelRow}>
      <View style={styles.pillLabelWrap}>
        <Text style={styles.pillLabelText}>{text}</Text>
        {count != null && (
          <View style={styles.pillLabelBadge}>
            <Text style={styles.pillLabelBadgeText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── GENERATE SCREEN ─────────────────────────────────────────────────────────
function GenerateScreen({ savedIds, onToggleSave, notes, setNotes, cards, setCards, score, setScore, status, setStatus, errorMsg, setError }) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const lastNotes = useRef('');

  const animBtn = v => Animated.spring(btnScale, { toValue: v, useNativeDriver: true, speed: 24 }).start();

  const generate = async (text) => {
    lastNotes.current = text;
    if (!text.trim()) { Alert.alert('Boş Notlar', 'Lütfen önce notlarını yapıştır.'); return; }
    setStatus('loading'); setCards([]); setScore(null); setError('');
    try {
      const result = USE_MOCK
        ? (await new Promise(r => setTimeout(r, 1400)), mockGenerateFull(text))
        : await callGroqFull(text);
      setScore(result.score);
      setCards(result.cards);
      setStatus('success');
    } catch (e) {
      setError(e.message || 'Bilinmeyen hata'); setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {status === 'error' && (
        <Toast type="error" message={errorMsg} onRetry={() => generate(lastNotes.current)} />
      )}
      {status === 'success' && cards.length > 0 && (
        <Toast type="success" message={`${cards.length} fikir oluşturuldu`} />
      )}

      {/* ── Input card */}
      <View style={styles.inputCard}>
        <View style={styles.inputCardHeader}>
          <Text style={styles.inputCardLabel}>NOTLARINIZ</Text>
          {notes.length > 0 && !isLoading && (
            <TouchableOpacity onPress={() => setNotes('')}>
              <Text style={styles.clearText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[styles.input, isLoading && { opacity: 0.35 }]}
          multiline
          placeholder="Toplantı notu, bullet liste, WhatsApp export..."
          placeholderTextColor={C.muted}
          value={notes}
          onChangeText={setNotes}
          editable={!isLoading}
          textAlignVertical="top"
        />
        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>{notes.length} karakter</Text>
        </View>
      </View>

      {/* ── CTA button */}
      <Animated.View style={{ transform: [{ scale: btnScale }], marginBottom: 32 }}>
        <TouchableOpacity
          onPress={() => generate(notes)}
          onPressIn={() => animBtn(0.96)}
          onPressOut={() => animBtn(1)}
          disabled={isLoading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={isLoading ? ['#1a1035', '#1a1035'] : ['#8b5cf6', '#6d28d9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <View style={styles.ctaGlass} />
            {isLoading ? (
              <View style={styles.ctaRow}>
                <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
                <Text style={styles.ctaText}>  Analiz ediliyor...</Text>
              </View>
            ) : (
              <View style={styles.ctaRow}>
                <Text style={styles.ctaSpark}>✦</Text>
                <Text style={styles.ctaText}>  Idea Card'lara Dönüştür</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Loading skeletons */}
      {isLoading && (
        <>
          <PillLabel text="OLUŞTURULUYOR" />
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </>
      )}

      {/* ── Empty */}
      {!isLoading && cards.length === 0 && status !== 'error' && <EmptyState isLibrary={false} />}

      {/* ── Score + Cards */}
      {!isLoading && cards.length > 0 && (
        <>
          {score && <SlopScoreCard score={score} />}
          <PillLabel text="FİKİRLER" count={cards.length} />
          {cards.map((card, i) => (
            <IdeaCard
              key={card.id}
              card={card}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
              index={i}
            />
          ))}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => { setCards([]); setScore(null); setNotes(''); setStatus(null); }}
          >
            <Text style={styles.resetBtnText}>↺  Yeniden başlat</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// ─── LIBRARY SCREEN ──────────────────────────────────────────────────────────
function LibraryScreen({ library, savedIds, onToggleSave }) {
  const [modalCard, setModalCard] = useState(null);

  if (library.length === 0) return <EmptyState isLibrary />;
  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PillLabel text="KAYITLI FİKİRLER" count={library.length} />
        {library.map((card, i) => (
          <IdeaCard
            key={card.id}
            card={card}
            savedIds={savedIds}
            onToggleSave={onToggleSave}
            index={i}
            onExpand={setModalCard}
          />
        ))}
      </ScrollView>

      <IdeaMdModal
        visible={modalCard !== null}
        card={modalCard}
        onClose={() => setModalCard(null)}
      />
    </>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
function TabBar({ active, onSelect, libraryCount }) {
  const tabs = [
    { key: 'generate', label: 'Üret', icon: '✦' },
    { key: 'library', label: 'Kütüphane', icon: '🔖', badge: libraryCount },
  ];

  return (
    <View style={styles.tabBarOuter}>
      <BlurView intensity={55} tint="dark" style={styles.tabBarInner}>
        {tabs.map(tab => {
          const isActive = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => onSelect(tab.key)}
              activeOpacity={0.75}
            >
              {isActive && (
                <LinearGradient
                  colors={['rgba(139,92,246,0.35)', 'rgba(109,40,217,0.20)']}
                  style={styles.tabActivePill}
                />
              )}
              <View style={styles.tabIconWrap}>
                <Text style={[styles.tabIcon, isActive && styles.tabIconOn]}>{tab.icon}</Text>
                {!!tab.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelOn]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header({ tab }) {
  return (
    <BlurView intensity={30} tint="dark" style={styles.header}>
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#8b5cf6', '#6366f1', '#38bdf8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.headerDot}
          />
          <Text style={styles.headerLogo}>nokta</Text>
          {USE_MOCK && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockText}>MOCK</Text>
            </View>
          )}
        </View>
        <View style={styles.headerPageChip}>
          <Text style={styles.headerPageText}>
            {tab === 'generate' ? 'Üret' : 'Kütüphane'}
          </Text>
        </View>
      </View>
    </BlurView>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('generate');
  const [library, setLibrary] = useState([]);

  // Generate screen state lifted here to persist across tab switches
  const [genNotes, setGenNotes] = useState('');
  const [genCards, setGenCards] = useState([]);
  const [genScore, setGenScore] = useState(null);
  const [genStatus, setGenStatus] = useState(null);
  const [genError, setGenError] = useState('');

  const savedIds = new Set(library.map(c => c.id));

  useEffect(() => {
    AsyncStorage.getItem(LIBRARY_KEY)
      .then(raw => { if (raw) setLibrary(JSON.parse(raw)); })
      .catch(() => { });
  }, []);

  const toggleSave = useCallback((card) => {
    setLibrary(prev => {
      const next = prev.some(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [card, ...prev];
      AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(next)).catch(() => { });
      return next;
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient colors={BG} locations={BG_STOPS} style={StyleSheet.absoluteFill} />
      <Background />

      <Header tab={tab} />

      <View style={{ flex: 1 }}>
        {tab === 'generate'
          ? (
            <GenerateScreen
              savedIds={savedIds}
              onToggleSave={toggleSave}
              notes={genNotes}
              setNotes={setGenNotes}
              cards={genCards}
              setCards={setGenCards}
              score={genScore}
              setScore={setGenScore}
              status={genStatus}
              setStatus={setGenStatus}
              errorMsg={genError}
              setError={setGenError}
            />
          )
          : <LibraryScreen library={library} savedIds={savedIds} onToggleSave={toggleSave} />
        }
      </View>

      <TabBar active={tab} onSelect={setTab} libraryCount={library.length} />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  headerInner: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    letterSpacing: 3,
  },
  mockBadge: {
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  mockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 1.3,
  },
  headerPageChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  headerPageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c4b5fd',
    letterSpacing: 0.3,
  },

  // ── Scroll
  scrollContent: {
    padding: 18,
    paddingTop: 22,
    paddingBottom: 48,
  },

  // ── Input card
  inputCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    overflow: 'hidden',
    marginBottom: 16,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  inputCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: C.muted,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  input: {
    minHeight: 160,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    color: C.white,
  },
  inputFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: C.muted,
  },

  // ── CTA
  ctaBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 10,
  },
  ctaGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaSpark: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Idea card
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    backgroundColor: GLASS,
  },
  cardBanner: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIconWrap: {
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 44,
  },
  cardBody: {
    padding: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontSize: 13,
    color: C.sub,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  actionText: {
    fontSize: 13,
    color: C.sub,
    flex: 1,
    lineHeight: 18,
  },
  expandBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Idea MD Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    height: SH * 0.82,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    color: C.sub,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 32,
  },
  modalLoading: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  modalLoadingText: {
    fontSize: 14,
    color: C.sub,
  },
  mdBox: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: GLASS,
    padding: 16,
  },
  mdContent: {
    fontSize: 13,
    color: C.white,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalFooter: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  shareBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },

  // ── Toast
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  // ── Pill label
  pillLabelRow: {
    marginBottom: 16,
    marginTop: 4,
  },
  pillLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    backgroundColor: 'rgba(139,92,246,0.08)',
  },
  pillLabelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#a78bfa',
  },
  pillLabelBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(139,92,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pillLabelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },

  // ── Reset button
  resetBtn: {
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    color: C.sub,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ── Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  emptyDesc: {
    fontSize: 14,
    color: C.sub,
    textAlign: 'center',
    lineHeight: 23,
  },

  // ── Tab bar
  tabBarOuter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 18,
    position: 'relative',
    gap: 3,
  },
  tabActivePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    color: C.muted,
  },
  tabIconOn: {
    color: '#c4b5fd',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.2,
  },
  tabLabelOn: {
    color: '#c4b5fd',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -14,
    backgroundColor: '#7c3aed',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '800',
  },

  // ── Slop Score Card
  scoreCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: GLASS,
    padding: 20,
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: C.muted,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scoreNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  scoreNum: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -2,
  },
  scoreNumMax: {
    fontSize: 18,
    fontWeight: '600',
    color: C.muted,
    marginBottom: 6,
    marginLeft: 4,
  },
  dimList: {
    gap: 14,
  },
  dimRow: {
    gap: 6,
  },
  dimTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimIcon: {
    fontSize: 14,
  },
  dimName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.white,
  },
  dimScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  dimScoreMax: {
    fontSize: 11,
    fontWeight: '500',
    color: C.muted,
  },
  dimBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  dimBarFill: {
    height: 5,
    borderRadius: 3,
  },
  dimCritique: {
    fontSize: 12,
    color: C.sub,
    lineHeight: 17,
  },
});

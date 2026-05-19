import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Share,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ─── Örnek Pitchler ───
const EXAMPLES = [
  {
    label: '🟢 İyi',
    text: "Türkiye'deki 2.3 milyon freelancer için fatura ve vergi takibi yapan mobil uygulama. Mevcut çözümler masaüstü odaklı ve aylık 200₺+. Biz aylık 49₺'ye otomatik e-fatura, KDV hesaplama ve GİB entegrasyonu sunuyoruz. Beta'da 340 kullanıcı, %82 retention, 12K MRR.",
  },
  {
    label: '🔴 Kötü',
    text: 'We are building the next-generation AI-powered revolutionary platform that will disrupt the $50 billion market. Our cutting-edge technology leverages advanced machine learning and blockchain to deliver a seamless, game-changing experience. We are the Uber of productivity.',
  },
  {
    label: '🟡 Orta',
    text: "Üniversite öğrencileri için ders notu paylaşım platformu. Türkiye'de 8 milyon üniversite öğrencisi var. Notları AI ile özetliyoruz ve flashcard'lara çeviriyoruz. Henüz kullanıcımız yok ama büyük potansiyel görüyoruz.",
  },
];

// ─── Boyut meta verileri ───
const DIM_META = {
  buzzword_yogunlugu: { icon: '🔤', title: 'Buzzword Yoğunluğu' },
  kanit_eksikligi: { icon: '📊', title: 'Kanıt Eksikliği' },
  pazar_sisirme: { icon: '📈', title: 'Pazar Şişirme' },
  belirsiz_fayda: { icon: '🌫️', title: 'Belirsiz Fayda' },
  teknik_muglaklık: { icon: '⚙️', title: 'Teknik Muğlaklık' },
};

// ─── Claude API çağrısı ───
async function analyzePitch(pitchText, apiKey) {
  const systemPrompt = `Sen bir startup pitch analizcisisin. Kullanıcının yapıştırdığı pitch paragrafını analiz edip "slop score" üreteceksin.

Her pitch'i şu 5 boyutta 0-10 arası puanla:
1. buzzword_yogunlugu: Boş jargon oranı
2. kanit_eksikligi: Veri/metrik olmadan yapılan büyük iddialar
3. pazar_sisirme: Abartılı pazar büyüklüğü iddiaları
4. belirsiz_fayda: Somut değer yerine genel vaatler
5. teknik_muglaklık: Teknik detay vermeden teknoloji kullanımı

SADECE JSON yanıt ver, başka bir şey yazma:
{
  "slop_score": <0-100>,
  "kategori_label": "<Düşük Slop|Orta Slop|Yüksek Slop|Aşırı Slop>",
  "boyutlar": {
    "buzzword_yogunlugu": { "puan": <0-10>, "aciklama": "<kısa>" },
    "kanit_eksikligi": { "puan": <0-10>, "aciklama": "<kısa>" },
    "pazar_sisirme": { "puan": <0-10>, "aciklama": "<kısa>" },
    "belirsiz_fayda": { "puan": <0-10>, "aciklama": "<kısa>" },
    "teknik_muglaklık": { "puan": <0-10>, "aciklama": "<kısa>" }
  },
  "oneriler": ["<1>", "<2>", "<3>"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Analiz et:\n\n"${pitchText}"` }],
    }),
  });

  if (!response.ok) throw new Error(`API hatası: ${response.status}`);

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

// ─── Skor Göstergesi ───
function ScoreGauge({ score, label }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const color = score <= 25 ? '#22c55e' : score <= 50 ? '#eab308' : score <= 75 ? '#f97316' : '#ef4444';

  return (
    <View style={s.gaugeBox}>
      <Text style={s.gaugeScore}>{score}</Text>
      <Text style={[s.gaugeLabel, { color }]}>{label}</Text>
      <View style={s.barBg}>
        <Animated.View
          style={[
            s.barFill,
            {
              backgroundColor: color,
              width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Boyut Kartı ───
function DimCard({ icon, title, puan, aciklama }) {
  const color = puan <= 3 ? '#22c55e' : puan <= 6 ? '#eab308' : puan <= 8 ? '#f97316' : '#ef4444';
  return (
    <View style={s.dimCard}>
      <View style={s.dimRow}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>
        <Text style={s.dimTitle}>{title}</Text>
        <Text style={[s.dimPuan, { color }]}>{puan}/10</Text>
      </View>
      <View style={s.barBgSmall}>
        <View style={[s.barFillSmall, { width: `${puan * 10}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.dimDesc}>{aciklama}</Text>
    </View>
  );
}

// ─── Human Loop Modu ───
// HOOTL → AI otonom analiz eder
// HOTL  → Sonuç gösterilir, kullanıcı onaylar veya reddeder
// HITL  → Kullanıcı skoru manuel düzenler, tam kontrol

// ─── Ana Uygulama ───
export default function App() {
  const [pitch, setPitch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Human Loop states
  const [loopMode, setLoopMode] = useState('HOOTL'); // HOOTL | HOTL | HITL
  const [pendingResult, setPendingResult] = useState(null);
  const [hitlScore, setHitlScore] = useState('');

  const handleAnalyze = async () => {
    if (!pitch.trim()) return;
    if (!apiKey.trim()) {
      setShowKey(true);
      setError('Önce API key girin.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    fadeAnim.setValue(0);

    try {
      const res = await analyzePitch(pitch, apiKey);
      // HOOTL → HOTL: AI bitti, insan onayına sun
      setPendingResult(res);
      setLoopMode('HOTL');
    } catch (e) {
      setError('Analiz başarısız: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // HOTL: Kullanıcı onayladı → sonucu kabul et
  const handleApprove = () => {
    setResult(pendingResult);
    setPendingResult(null);
    setLoopMode('HOOTL');
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  // HOTL: Kullanıcı reddetti → HITL moduna geç
  const handleReject = () => {
    setHitlScore(String(pendingResult.slop_score));
    setLoopMode('HITL');
  };

  // HITL: Kullanıcı skoru manuel düzenleyip onayladı
  const handleHitlConfirm = () => {
    const edited = { ...pendingResult, slop_score: parseInt(hitlScore) || 0 };
    setResult(edited);
    setPendingResult(null);
    setLoopMode('HOOTL');
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const handleShare = async () => {
    if (!result) return;
    const msg =
      `💩 SLOP SCORE: ${result.slop_score}/100 (${result.kategori_label})\n\n` +
      Object.entries(result.boyutlar)
        .map(([k, v]) => `• ${DIM_META[k]?.title || k}: ${v.puan}/10 — ${v.aciklama}`)
        .join('\n') +
      `\n\n💡 Öneriler:\n${result.oneriler.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
    await Share.share({ message: msg });
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={s.header}>
            <Text style={{ fontSize: 48 }}>💩</Text>
            <Text style={s.h1}>Slop Dedektörü</Text>
            <Text style={s.sub}>Pitch'ini yapıştır, AI slop skorunu öğren</Text>
          </View>

          {/* API Key toggle */}
          <TouchableOpacity style={s.keyBtn} onPress={() => setShowKey(!showKey)}>
            <Text style={s.keyBtnText}>{apiKey ? '🔑 Key ayarlandı' : '🔑 API Key gir'}</Text>
          </TouchableOpacity>
          {showKey && (
            <TextInput
              style={s.keyInput}
              placeholder="sk-ant-... (Anthropic API Key)"
              placeholderTextColor="#555"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              autoCapitalize="none"
            />
          )}

          {/* Örnekler */}
          <Text style={s.label}>ÖRNEKLER</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {EXAMPLES.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={s.chip}
                onPress={() => {
                  setPitch(ex.text);
                  setResult(null);
                  setError(null);
                }}
              >
                <Text style={s.chipText}>{ex.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text input */}
          <TextInput
            style={s.textArea}
            placeholder="Pitch paragrafını buraya yapıştır..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            value={pitch}
            onChangeText={setPitch}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{pitch.length} karakter</Text>

          {/* Analiz butonu */}
          <TouchableOpacity
            style={[s.analyzeBtn, (!pitch.trim() || loading) && { opacity: 0.4 }]}
            onPress={handleAnalyze}
            disabled={!pitch.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.analyzeBtnText}>🔍 Analiz Et</Text>
            )}
          </TouchableOpacity>

          {/* Hata */}
          {error && (
            <View style={s.errBox}>
              <Text style={s.errText}>⚠️ {error}</Text>
            </View>
          )}

          {/* HOTL — Onay Ekranı */}
          {loopMode === 'HOTL' && pendingResult && (
            <View style={s.hotlBox}>
              <Text style={s.hotlTitle}>👤 Human On The Loop</Text>
              <Text style={s.hotlDesc}>
                AI analizi tamamladı. Slop Score: <Text style={{ fontWeight: '800', color: '#e11d48' }}>{pendingResult.slop_score}/100</Text>
              </Text>
              <Text style={s.hotlDesc}>Bu sonucu onaylıyor musun?</Text>
              <View style={s.hotlBtns}>
                <TouchableOpacity style={s.rejectBtn} onPress={handleReject}>
                  <Text style={s.rejectBtnText}>✏️ Düzenle (HITL)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.approveBtn} onPress={handleApprove}>
                  <Text style={s.approveBtnText}>✅ Onayla</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* HITL — Manuel Düzenleme */}
          {loopMode === 'HITL' && pendingResult && (
            <View style={s.hitlBox}>
              <Text style={s.hotlTitle}>🧑‍💻 Human In The Loop</Text>
              <Text style={s.hotlDesc}>Slop score'u manuel olarak düzenle:</Text>
              <TextInput
                style={s.hitlInput}
                value={hitlScore}
                onChangeText={setHitlScore}
                keyboardType="numeric"
                maxLength={3}
              />
              <TouchableOpacity style={s.approveBtn} onPress={handleHitlConfirm}>
                <Text style={s.approveBtnText}>✅ Onayla ve Kaydet</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sonuçlar */}
          {result && (
            <Animated.View style={{ opacity: fadeAnim, marginTop: 8 }}>
              <ScoreGauge score={result.slop_score} label={result.kategori_label} />

              <Text style={s.section}>📋 Detaylı Analiz</Text>
              {Object.entries(result.boyutlar).map(([k, v]) => (
                <DimCard key={k} icon={DIM_META[k]?.icon} title={DIM_META[k]?.title} puan={v.puan} aciklama={v.aciklama} />
              ))}

              <Text style={s.section}>💡 Öneriler</Text>
              {result.oneriler.map((o, i) => (
                <View key={i} style={s.oneriRow}>
                  <Text style={s.oneriNum}>{i + 1}</Text>
                  <Text style={s.oneriText}>{o}</Text>
                </View>
              ))}

              <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
                <Text style={s.shareBtnText}>📤 Sonucu Paylaş</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Stiller ───
const card = {
  backgroundColor: '#1a1a1a',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#2a2a2a',
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 12 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: '#888', marginTop: 4, textAlign: 'center' },
  keyBtn: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, ...card, marginBottom: 12 },
  keyBtnText: { color: '#aaa', fontSize: 13 },
  keyInput: { ...card, borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16 },
  label: { color: '#666', fontSize: 11, marginBottom: 8, letterSpacing: 1.5, fontWeight: '600' },
  chip: { ...card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8 },
  chipText: { color: '#ccc', fontSize: 13 },
  textArea: { ...card, borderRadius: 16, padding: 16, color: '#fff', fontSize: 15, lineHeight: 22, minHeight: 140 },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginTop: 4, marginBottom: 12 },
  analyzeBtn: { backgroundColor: '#e11d48', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  errBox: { backgroundColor: '#2d1215', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#5c2328' },
  errText: { color: '#fca5a5', fontSize: 14 },
  gaugeBox: { alignItems: 'center', ...card, borderRadius: 20, padding: 28, marginBottom: 20 },
  gaugeScore: { fontSize: 64, fontWeight: '900', color: '#fff' },
  gaugeLabel: { fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  barBg: { width: '100%', height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  section: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12, marginTop: 4 },
  dimCard: { ...card, padding: 16, marginBottom: 10 },
  dimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dimTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ddd' },
  dimPuan: { fontSize: 15, fontWeight: '800' },
  barBgSmall: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  barFillSmall: { height: '100%', borderRadius: 2 },
  dimDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
  oneriRow: { flexDirection: 'row', ...card, padding: 14, marginBottom: 8, alignItems: 'flex-start' },
  oneriNum: { fontSize: 14, fontWeight: '800', color: '#e11d48', marginRight: 12, minWidth: 20 },
  oneriText: { flex: 1, fontSize: 14, color: '#ccc', lineHeight: 20 },
  shareBtn: { backgroundColor: '#1e3a5f', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#2a5a8f' },
  shareBtnText: { color: '#93c5fd', fontSize: 16, fontWeight: '600' },
  // HOTL / HITL
  hotlBox: { ...card, borderRadius: 16, padding: 20, marginBottom: 16, borderColor: '#854d0e' },
  hitlBox: { ...card, borderRadius: 16, padding: 20, marginBottom: 16, borderColor: '#1e40af' },
  hotlTitle: { fontSize: 16, fontWeight: '800', color: '#fbbf24', marginBottom: 8 },
  hotlDesc: { fontSize: 14, color: '#ccc', marginBottom: 6, lineHeight: 20 },
  hotlBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: { flex: 1, backgroundColor: '#292524', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#44403c' },
  rejectBtnText: { color: '#d6d3d1', fontSize: 14, fontWeight: '600' },
  approveBtn: { flex: 1, backgroundColor: '#14532d', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#166534' },
  approveBtnText: { color: '#86efac', fontSize: 14, fontWeight: '600' },
  hitlInput: { ...card, borderRadius: 12, padding: 14, color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
});
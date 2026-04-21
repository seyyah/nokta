import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
  bg: '#0a0a1a',
  surface: '#12122a',
  card: '#1a1a35',
  border: '#252550',
  primary: '#7c3aed',
  primaryLight: '#a855f7',
  danger: '#ef4444',
  dangerLight: '#f87171',
  warning: '#f59e0b',
  success: '#10b981',
  successLight: '#34d399',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textFaint: '#475569',
  accent: '#06b6d4',
};

// ─── Slop Scoring Engine ──────────────────────────────────────────────────────
const SLOP_SIGNALS = [
  {
    id: 'ai_buzzwords',
    label: 'AI/Blockchain Jargon Yüklemesi',
    keywords: [
      'yapay zeka', 'blockchain', 'ai powered', 'machine learning', 'web3',
      'metaverse', 'nft', 'crypto', 'ai-driven', 'leveraging ai',
      'game-changing', 'revolutionary', 'disruptive', 'unprecedented',
      'cutting-edge', 'next-generation', 'best-in-class', 'synergy',
    ],
    weight: 25,
    description: 'Teknik derinlik yerine moda jargonlara yaslanmak, fikrin boş olduğunun işareti.',
  },
  {
    id: 'market_size',
    label: 'Doğrulanmamış Pazar Büyüklüğü',
    keywords: [
      'trilyon dolarlık', '$1 trillion', '$500 billion', 'billion dollar',
      'multi-billion', 'massive market', 'huge opportunity', 'enormous market',
      'vast market', 'global market of', 'tüm dünya', 'herkes kullanır',
      'milyarlık pazar', 'milyar dolarlık',
    ],
    weight: 20,
    description: 'Kaynak gösterilmeden pazar büyüklüğü iddiası, slop\'un klasik belirtisidir.',
  },
  {
    id: 'no_competitor',
    label: 'Rakip Yokluğu Yanılsaması',
    keywords: [
      'rakip yok', 'no competitor', 'first of its kind', 'unique solution',
      'nothing like this', 'market gap', 'boşluk', 'blue ocean', 'first mover',
      'benzeri yok', 'dünyanın ilki', 'hiç kimse yapmadı',
    ],
    weight: 20,
    description: 'Her gerçek fikrin rakibi vardır. "Rakip yok" ifadesi araştırma eksikliğini gösterir.',
  },
  {
    id: 'vague_solution',
    label: 'Belirsiz / Muğlak Çözüm',
    keywords: [
      'kolay kullanım', 'user-friendly', 'seamless experience', 'end-to-end',
      'all-in-one', 'hepsi bir arada', 'platform', 'ecosystem', 'holistic',
      'comprehensive solution', 'complete solution', 'one-stop-shop',
    ],
    weight: 15,
    description: 'Somut özellik yerine genel vaatler, fikrin henüz olgunlaşmadığını gösterir.',
  },
  {
    id: 'passive_user',
    label: 'Kullanıcı Araştırması Yokluğu',
    keywords: [
      'herkes ister', 'everyone needs', 'users will love', 'kullanıcılar sever',
      'obvious need', 'clear demand', 'açıkça ihtiyaç', 'tüm kullanıcılar',
      'everybody wants',
    ],
    weight: 10,
    description: '"Herkes ister" varsayımı, gerçek kullanıcı görüşmesi yapılmadığının göstergesidir.',
  },
  {
    id: 'hockey_stick',
    label: 'Hockey-Stick Gelir Projeksiyonu',
    keywords: [
      '%1000 büyüme', '10x growth', '100x', 'exponential growth', 'hockey stick',
      'viral growth', 'viral olur', 'self-sustaining', 'network effect',
      'milyona ulaşır', 'hızla büyür',
    ],
    weight: 10,
    description: 'Temelsiz büyüme projeksiyonları, gerçekçi bir iş planı olmadığının işareti.',
  },
];

function analyzePitch(text) {
  if (!text || text.trim().length < 20) return null;

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).length;
  const detectedSignals = [];
  let totalPenalty = 0;

  for (const signal of SLOP_SIGNALS) {
    const hits = signal.keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      const penalty = Math.min(signal.weight, signal.weight * (hits.length / 2));
      detectedSignals.push({
        ...signal,
        hits,
        penalty: Math.round(penalty),
      });
      totalPenalty += penalty;
    }
  }

  // Pozitif sinyaller
  const positiveSignals = [];
  const hasNumbers = /\d+/.test(text);
  const hasSourceWords = /kaynak|source|araştırma|research|survey|rapor|report|çalışma|study/i.test(text);
  const hasUserWords = /kullanıcı görüşmesi|user interview|beta test|pilot|mvp|prototype|prototip/i.test(text);
  const hasConstraints = /kısıt|constraint|sınır|limit|bütçe|budget|zaman|timeline/i.test(text);
  const hasCompetitorAnalysis = /rakip analiz|competitor|benchmark|karşılaştırma|vs\.|versus/i.test(text);

  if (hasNumbers) positiveSignals.push({ label: 'Somut Sayısal Veri', boost: 5 });
  if (hasSourceWords) positiveSignals.push({ label: 'Kaynaklı Araştırma', boost: 8 });
  if (hasUserWords) positiveSignals.push({ label: 'Kullanıcı Doğrulaması', boost: 10 });
  if (hasConstraints) positiveSignals.push({ label: 'Kısıt Farkındalığı', boost: 7 });
  if (hasCompetitorAnalysis) positiveSignals.push({ label: 'Rakip Analizi', boost: 8 });
  if (words > 100) positiveSignals.push({ label: 'Detaylı Açıklama', boost: 5 });

  const totalBoost = positiveSignals.reduce((acc, s) => acc + s.boost, 0);
  const rawScore = Math.max(0, 100 - Math.round(totalPenalty) + Math.round(totalBoost * 0.5));
  const slopScore = Math.min(100, Math.max(0, rawScore));

  const verdict = getSlopVerdict(slopScore);

  // Rewrite önerisi
  const rewriteSuggestions = generateRewriteSuggestions(detectedSignals, positiveSignals);

  return {
    slopScore,
    verdict,
    detectedSignals,
    positiveSignals,
    totalPenalty: Math.round(totalPenalty),
    totalBoost: Math.round(totalBoost * 0.5),
    wordCount: words,
    rewriteSuggestions,
    marketReady: slopScore >= 80,
  };
}

function getSlopVerdict(score) {
  if (score >= 90) return { label: 'Pazar Hazır ✅', color: COLORS.success, emoji: '🚀', detail: 'Güçlü, temelli, pazar yerine girmeye hazır.' };
  if (score >= 80) return { label: 'Kabul Edilebilir 👍', color: COLORS.successLight, emoji: '✅', detail: 'Birkaç iyileştirme ile pazar yerinde yer bulabilir.' };
  if (score >= 65) return { label: 'Geliştirme Gerekli ⚠️', color: COLORS.warning, emoji: '⚠️', detail: 'Slop sinyalleri var. Kullanıcı araştırması ve rakip analizi ekle.' };
  if (score >= 50) return { label: 'Yüksek Slop 🔴', color: COLORS.dangerLight, emoji: '🚨', detail: 'Piyasaya çıkamaz. Temel varsayımlar doğrulanmalı.' };
  return { label: 'Saf Slop ❌', color: COLORS.danger, emoji: '💀', detail: 'Bu pitch bir LLM çıktısından ayırt edilemiyor. Sıfırdan yeniden yaz.' };
}

function generateRewriteSuggestions(detectedSignals, positiveSignals) {
  const suggestions = [];
  const hasSource = positiveSignals.some((s) => s.label === 'Kaynaklı Araştırma');
  const hasUser = positiveSignals.some((s) => s.label === 'Kullanıcı Doğrulaması');
  const hasCompetitor = positiveSignals.some((s) => s.label === 'Rakip Analizi');

  if (!hasSource) suggestions.push('📊 Pazar büyüklüğü iddialarına kaynak ekle (Gartner, Statista, CB Insights vb.)');
  if (!hasUser) suggestions.push('🎤 En az 5 kullanıcı görüşmesi yap ve bulgularını 1-2 cümleyle özetle');
  if (!hasCompetitor) suggestions.push('⚔️ Rakip analizi yap: hangi çözümler var, senden farkın nedir?');

  for (const signal of detectedSignals) {
    if (signal.id === 'ai_buzzwords') {
      suggestions.push('🤖 "AI destekli" ifadesini somutlaştır: hangi model, hangi veri, hangi çıktı?');
    }
    if (signal.id === 'vague_solution') {
      suggestions.push('🔧 "Kolay" ve "kapsamlı" yerine 3 spesifik özelliği listele');
    }
    if (signal.id === 'hockey_stick') {
      suggestions.push('📈 Büyüme projeksiyonunu tarihsel benzer vaka (analogue) ile destekle');
    }
    if (signal.id === 'no_competitor') {
      suggestions.push('🔍 "Rakip yok" yerine dolaylı rakipleri de listele (alternatif çözüm yolları)');
    }
  }

  return [...new Set(suggestions)].slice(0, 5);
}

// ─── Components ───────────────────────────────────────────────────────────────
function ScoreMeter({ score, animated }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const verdict = getSlopVerdict(score);

  return (
    <View style={styles.meterContainer}>
      <View style={styles.meterCircle}>
        <Text style={[styles.meterScore, { color: verdict.color }]}>{score}</Text>
        <Text style={styles.meterLabel}>/100</Text>
      </View>
      <Text style={[styles.verdictBadge, { color: verdict.color }]}>{verdict.label}</Text>
      <Text style={styles.verdictDetail}>{verdict.detail}</Text>
    </View>
  );
}

function SignalCard({ signal, type }) {
  const isNegative = type === 'negative';
  const color = isNegative ? COLORS.dangerLight : COLORS.successLight;
  return (
    <View style={[styles.signalCard, { borderLeftColor: color }]}>
      <View style={styles.signalHeader}>
        <Text style={[styles.signalTitle, { color }]}>{signal.label}</Text>
        {isNegative && (
          <View style={[styles.penaltyBadge, { backgroundColor: COLORS.danger + '33' }]}>
            <Text style={[styles.penaltyText, { color: COLORS.dangerLight }]}>
              -{signal.penalty}p
            </Text>
          </View>
        )}
        {!isNegative && (
          <View style={[styles.penaltyBadge, { backgroundColor: COLORS.success + '33' }]}>
            <Text style={[styles.penaltyText, { color: COLORS.successLight }]}>+{signal.boost}p</Text>
          </View>
        )}
      </View>
      {isNegative && signal.description && (
        <Text style={styles.signalDesc}>{signal.description}</Text>
      )}
      {isNegative && signal.hits && signal.hits.length > 0 && (
        <View style={styles.hitsRow}>
          {signal.hits.slice(0, 3).map((h, i) => (
            <View key={i} style={styles.hitChip}>
              <Text style={styles.hitText}>"{h}"</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function RewriteCard({ suggestions }) {
  return (
    <View style={styles.rewriteContainer}>
      <Text style={styles.sectionTitle}>🛠 Rewrite Önerileri</Text>
      {suggestions.map((s, i) => (
        <View key={i} style={styles.rewriteItem}>
          <Text style={styles.rewriteText}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [pitch, setPitch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState('input'); // 'input' | 'result'
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleAnalyze = () => {
    if (pitch.trim().length < 30) {
      Alert.alert('Yetersiz Metin', 'Lütfen en az 30 karakterlik bir pitch metni girin.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const analysis = analyzePitch(pitch);
      setResult(analysis);
      setLoading(false);
      setScreen('result');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1200);
  };

  const handleReset = () => {
    setScreen('input');
    setResult(null);
    setPitch('');
    fadeAnim.setValue(0);
  };

  // ── Input Screen ───────────────────────────────────────────────────────────
  if (screen === 'input') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🔬</Text>
            <Text style={styles.headerTitle}>Slop Detector</Text>
            <Text style={styles.headerSubtitle}>
              Pitch metnini yapıştır — AI pazar iddialarını test eder, slop skoru + gerekçe üretir.
            </Text>
            <View style={styles.thresholdBadge}>
              <Text style={styles.thresholdText}>Pazar Eşiği: 80/100</Text>
            </View>
          </View>

          {/* Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>📋 Pitch Metni</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              placeholder="Ürününüzün pitch paragrafını buraya yapıştırın..."
              placeholderTextColor={COLORS.textFaint}
              value={pitch}
              onChangeText={setPitch}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{pitch.length} karakter · {pitch.split(/\s+/).filter(Boolean).length} kelime</Text>
          </View>

          {/* Example Pitches */}
          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>💡 Örnek Pitch'ler</Text>
            <TouchableOpacity
              style={styles.exampleChip}
              onPress={() => setPitch('Yapay zeka destekli platformumuz, blockchain teknolojisiyle devrimci bir çözüm sunuyor. Trilyon dolarlık bu pazarda rakibimiz yok ve kullanıcılar bu ürünü kesinlikle sevecek. %1000 büyüme hedefliyoruz.')}
            >
              <Text style={styles.exampleChipText}>⚠️ Yüksek Slop Örnek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exampleChip, { borderColor: COLORS.success + '44' }]}
              onPress={() => setPitch('CB Insights 2024 raporuna göre KOBİ fintech pazarı 180 milyar $. 12 kullanıcı görüşmesi yaptık: muhasebecilerin %70\'i manuel mutabakat için günde 3+ saat harcıyor. Mevcut rakipler (QuickBooks, Xero) API entegrasyon desteği vermiyor. MVP\'imiz 40 beta kullanıcıyla 6 hafta test edildi, NPS: 62.')}
            >
              <Text style={[styles.exampleChipText, { color: COLORS.successLight }]}>✅ Kaliteli Pitch Örnek</Text>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[styles.analyzeBtn, loading && { opacity: 0.7 }]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeBtnText}>🔬 Analiz Et</Text>
            )}
          </TouchableOpacity>

          {/* How It Works */}
          <View style={styles.howCard}>
            <Text style={styles.howTitle}>Nasıl Çalışır?</Text>
            <Text style={styles.howText}>
              Slop Detector, pitch metninizi 6 farklı kritere göre analiz eder:{'\n\n'}
              🔴 <Text style={{ color: COLORS.dangerLight }}>Slop Sinyalleri</Text> — jargon yüklemesi, doğrulanmamış pazar büyüklüğü, rakip yokluğu yanılsaması, muğlak çözüm vaatleri{'\n\n'}
              🟢 <Text style={{ color: COLORS.successLight }}>Kalite Sinyalleri</Text> — kaynaklı araştırma, kullanıcı doğrulaması, rakip analizi, somut veri{'\n\n'}
              80/100 altında kalan fikirler pazar yerine alınmaz; geliştirme evresine geri döner.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Result Screen ──────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.headerTitle}>📊 Analiz Sonucu</Text>
          {result.marketReady ? (
            <View style={[styles.marketBadge, { backgroundColor: COLORS.success + '22', borderColor: COLORS.success }]}>
              <Text style={[styles.marketBadgeText, { color: COLORS.successLight }]}>
                🟢 PAZAR YERİ ONAYI
              </Text>
            </View>
          ) : (
            <View style={[styles.marketBadge, { backgroundColor: COLORS.danger + '22', borderColor: COLORS.danger }]}>
              <Text style={[styles.marketBadgeText, { color: COLORS.dangerLight }]}>
                🔴 PAZAR YERİNE ALINMAZ — GELİŞTİRME EVES
              </Text>
            </View>
          )}
        </View>

        {/* Score Meter */}
        <ScoreMeter score={result.slopScore} />

        {/* Score Breakdown */}
        <View style={styles.breakdownRow}>
          <View style={[styles.breakdownItem, { borderColor: COLORS.danger + '55' }]}>
            <Text style={[styles.breakdownNum, { color: COLORS.dangerLight }]}>-{result.totalPenalty}</Text>
            <Text style={styles.breakdownLabel}>Slop Cezası</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: COLORS.success + '55' }]}>
            <Text style={[styles.breakdownNum, { color: COLORS.successLight }]}>+{result.totalBoost}</Text>
            <Text style={styles.breakdownLabel}>Kalite Bonusu</Text>
          </View>
          <View style={[styles.breakdownItem, { borderColor: COLORS.accent + '55' }]}>
            <Text style={[styles.breakdownNum, { color: COLORS.accent }]}>{result.wordCount}</Text>
            <Text style={styles.breakdownLabel}>Kelime</Text>
          </View>
        </View>

        {/* Negative Signals */}
        {result.detectedSignals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Tespit Edilen Slop Sinyalleri</Text>
            {result.detectedSignals.map((s) => (
              <SignalCard key={s.id} signal={s} type="negative" />
            ))}
          </View>
        )}

        {/* Positive Signals */}
        {result.positiveSignals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Kalite Sinyalleri</Text>
            {result.positiveSignals.map((s, i) => (
              <SignalCard key={i} signal={s} type="positive" />
            ))}
          </View>
        )}

        {/* Rewrite Suggestions */}
        {result.rewriteSuggestions.length > 0 && (
          <RewriteCard suggestions={result.rewriteSuggestions} />
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>← Yeni Analiz</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Nokta · Track B — Slop Detector{'\n'}
          by Halide Ceyda Sarıçelik · 231118037
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 320,
  },
  thresholdBadge: {
    marginTop: 12,
    backgroundColor: COLORS.primary + '22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
  },
  thresholdText: { color: COLORS.primaryLight, fontWeight: '600', fontSize: 13 },

  // Input
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  textInput: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 160,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: { color: COLORS.textFaint, fontSize: 12, marginTop: 8, textAlign: 'right' },

  // Examples
  examplesSection: { marginBottom: 20 },
  examplesTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 },
  exampleChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.danger + '44',
    marginBottom: 8,
  },
  exampleChipText: { color: COLORS.dangerLight, fontSize: 13, fontWeight: '500' },

  // Analyze Button
  analyzeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // How it works
  howCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  howTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: 10 },
  howText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },

  // Result
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  marketBadge: {
    marginTop: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  marketBadgeText: { fontWeight: '700', fontSize: 13 },

  // Meter
  meterContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  meterCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  meterScore: { fontSize: 42, fontWeight: '800', lineHeight: 48 },
  meterLabel: { color: COLORS.textMuted, fontSize: 14 },
  verdictBadge: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  verdictDetail: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 280 },

  // Breakdown
  breakdownRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  breakdownItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  breakdownNum: { fontSize: 22, fontWeight: '800' },
  breakdownLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },

  // Signal Cards
  signalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  signalTitle: { fontWeight: '600', fontSize: 14, flex: 1, paddingRight: 8 },
  penaltyBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  penaltyText: { fontSize: 12, fontWeight: '700' },
  signalDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  hitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hitChip: {
    backgroundColor: COLORS.danger + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hitText: { color: COLORS.dangerLight, fontSize: 11 },

  // Rewrite
  rewriteContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    marginBottom: 20,
  },
  rewriteItem: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rewriteText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },

  // Actions
  actionRow: { marginBottom: 20 },
  resetBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetBtnText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },

  // Footer
  footer: {
    color: COLORS.textFaint,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import GlowDot from '../components/GlowDot';
import ScoreRing from '../components/ScoreRing';
import { colors, specColors, dimensionColors } from '../constants/colors';
import { generateSpec, generateNoktaScore, generateStackAndCost } from '../services/geminiService';

const SPEC_SECTIONS = [
  { key: 'problem', icon: '🔴', label: 'Problem' },
  { key: 'user', icon: '👤', label: 'Kullanıcı' },
  { key: 'scope', icon: '📐', label: 'Kapsam' },
  { key: 'constraint', icon: '⚠️', label: 'Kısıt' },
  { key: 'metric', icon: '📊', label: 'Başarı Metriği' },
];

const STACK_ITEMS = [
  { key: 'frontend', icon: '📱', label: 'Frontend', color: '#60A5FA' },
  { key: 'backend', icon: '⚙️', label: 'Backend', color: '#A78BFA' },
  { key: 'ai', icon: '🤖', label: 'AI / ML', color: '#6EE7B7' },
  { key: 'infra', icon: '☁️', label: 'Altyapı', color: '#FBBF24' },
];

function SpecCard({ spec }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.specCard, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      <Text style={styles.specTitle}>{spec.title}</Text>
      {SPEC_SECTIONS.map((s) => (
        <View key={s.key} style={styles.specRow}>
          <View style={[styles.specIconWrap, { borderColor: specColors[s.key] + '44' }]}>
            <Text style={styles.specIcon}>{s.icon}</Text>
          </View>
          <View style={styles.specTextWrap}>
            <Text style={[styles.specLabel, { color: specColors[s.key] }]}>{s.label}</Text>
            <Text style={styles.specValue}>{spec[s.key]}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

function ScoreSection({ noktaScore }) {
  const totalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(totalAnim, { toValue: noktaScore.total, duration: 1200, useNativeDriver: false }).start();
  }, [noktaScore.total]);

  return (
    <View style={styles.scoreSection}>
      <Text style={styles.scoreSectionTitle}>✦ Nokta Skoru</Text>

      <View style={styles.totalScoreRow}>
        <Animated.Text style={styles.totalScoreNumber}>
          {totalAnim.interpolate({ inputRange: [0, 100], outputRange: ['0', String(Math.round(noktaScore.total))] })}
        </Animated.Text>
        <Text style={styles.totalScoreMax}>/100</Text>
      </View>

      <Text style={styles.verdict}>"{noktaScore.verdict}"</Text>

      <View style={styles.ringsGrid}>
        {noktaScore.dimensions.map((dim) => (
          <View key={dim.id} style={styles.ringItem}>
            <View style={styles.ringWrapper}>
              <ScoreRing score={dim.score} dimension={dim.id} size={80} />
              <Text style={[styles.ringScore, { color: dimensionColors[dim.id] }]}>{dim.score}</Text>
            </View>
            <Text style={styles.ringLabel}>{dim.label}</Text>
            <Text style={styles.ringReason}>{dim.reason}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StackSection({ stackData }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ gap: 16 }, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      {/* Tech Stack */}
      <View style={styles.stackCard}>
        <Text style={styles.stackCardTitle}>🔧 Teknoloji Stack</Text>
        {STACK_ITEMS.map((item) => (
          <View key={item.key} style={styles.stackRow}>
            <View style={[styles.stackIconWrap, { borderColor: item.color + '44' }]}>
              <Text style={styles.stackIcon}>{item.icon}</Text>
            </View>
            <View style={styles.stackTextWrap}>
              <Text style={[styles.stackLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.stackValue}>{stackData.stack[item.key]}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Cost Estimation */}
      <View style={styles.stackCard}>
        <Text style={styles.stackCardTitle}>💰 Maliyet Tahmini (3 Ay)</Text>
        <View style={styles.costRow}>
          <View style={styles.costBadge}>
            <Text style={styles.costBadgeLabel}>Solo Geliştirici</Text>
            <Text style={styles.costBadgeValue}>{stackData.cost.solo_3months}</Text>
          </View>
          <View style={[styles.costBadge, { borderColor: 'rgba(167,139,250,0.3)' }]}>
            <Text style={[styles.costBadgeLabel, { color: '#A78BFA' }]}>Küçük Ekip</Text>
            <Text style={[styles.costBadgeValue, { color: '#A78BFA' }]}>{stackData.cost.small_team_3months}</Text>
          </View>
        </View>
        <View style={styles.costNote}>
          <Text style={styles.costNoteText}>💡 {stackData.cost.note}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SpecScreen({ navigation, route }) {
  const { idea, questionsAndAnswers } = route.params;
  const [spec, setSpec] = useState(null);
  const [noktaScore, setNoktaScore] = useState(null);
  const [stackData, setStackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingStack, setLoadingStack] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('spec'); // 'spec' | 'score' | 'stack'

  useEffect(() => {
    generateAll();
  }, []);

  const generateAll = async () => {
    try {
      setLoading(true);
      const specData = await generateSpec(idea, questionsAndAnswers);
      setSpec(specData);
      setLoading(false);

      // Paralel olarak skor ve stack üret
      setLoadingScore(true);
      setLoadingStack(true);

      const [scoreData, stackResult] = await Promise.allSettled([
        generateNoktaScore(specData),
        generateStackAndCost(specData),
      ]);

      if (scoreData.status === 'fulfilled') setNoktaScore(scoreData.value);
      if (stackResult.status === 'fulfilled') setStackData(stackResult.value);
    } catch (e) {
      setError('Spec üretilemedi. Lütfen tekrar dene.');
      setLoading(false);
    } finally {
      setLoadingScore(false);
      setLoadingStack(false);
    }
  };

  const handleCopy = async () => {
    if (!spec) return;
    const text = `${spec.title}\n\nProblem: ${spec.problem}\nKullanıcı: ${spec.user}\nKapsam: ${spec.scope}\nKısıt: ${spec.constraint}\nMetrik: ${spec.metric}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!spec) return;
    const scoreText = noktaScore ? `\n\nNokta Skoru: ${noktaScore.total}/100\n${noktaScore.verdict}` : '';
    await Share.share({
      title: spec.title,
      message: `${spec.title}\n\n🔴 Problem: ${spec.problem}\n👤 Kullanıcı: ${spec.user}\n📐 Kapsam: ${spec.scope}\n⚠️ Kısıt: ${spec.constraint}\n📊 Metrik: ${spec.metric}${scoreText}\n\n— Nokta tarafından oluşturuldu`,
    });
  };

  const TABS = [
    { key: 'spec', label: 'Spec' },
    { key: 'score', label: noktaScore ? `Skor ${noktaScore.total}` : loadingScore ? 'Skor...' : 'Skor' },
    { key: 'stack', label: '🔧 Stack' },
  ];

  return (
    <LinearGradient colors={['#080814', '#0D0B24', '#080814']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <GlowDot size={18} phase="complete" />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <GlowDot size={20} phase="active" />
          <Text style={styles.loadingText}>Spec üretiliyor...</Text>
          <Text style={styles.loadingSubText}>Fikrin olgunlaşıyor</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={generateAll} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Golden star badge */}
          <View style={styles.successBadge}>
            <Text style={styles.successEmoji}>✦</Text>
            <Text style={styles.successText}>Fikrin Olgunlaştı</Text>
          </View>

          {/* 3 Tab switcher */}
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'spec' && spec && <SpecCard spec={spec} />}

            {activeTab === 'score' && (
              loadingScore ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={colors.dotComplete} />
                  <Text style={styles.loadingText}>Nokta Skoru hesaplanıyor...</Text>
                </View>
              ) : noktaScore ? (
                <ScoreSection noktaScore={noktaScore} />
              ) : null
            )}

            {activeTab === 'stack' && (
              loadingStack ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color="#60A5FA" />
                  <Text style={styles.loadingText}>Stack & Maliyet analiz ediliyor...</Text>
                </View>
              ) : stackData ? (
                <StackSection stackData={stackData} />
              ) : null
            )}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleCopy} activeOpacity={0.8}>
              <Text style={styles.outlineBtnText}>{copied ? '✓ Kopyalandı' : 'Kopyala'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filledBtn} onPress={handleShare} activeOpacity={0.8}>
              <Text style={styles.filledBtnText}>Paylaş →</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.restartBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.restartText}>Yeni Fikir Başlat</Text>
          </TouchableOpacity>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  backBtn: { padding: 8 },
  backText: { color: colors.textMuted, fontSize: 14 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 60 },
  loadingText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  loadingSubText: { color: colors.textMuted, fontSize: 13 },
  errorText: { color: colors.error, fontSize: 15, textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.accentDim, borderRadius: 10 },
  retryBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  successBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 4 },
  successEmoji: { fontSize: 20, color: colors.dotComplete },
  successText: { color: colors.dotComplete, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: colors.text, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 10 },
  specCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  specTitle: { color: colors.white, fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 4 },
  specRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  specIconWrap: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', flexShrink: 0,
  },
  specIcon: { fontSize: 16 },
  specTextWrap: { flex: 1 },
  specLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  specValue: { color: colors.text, fontSize: 14, lineHeight: 21 },
  scoreSection: { gap: 16 },
  scoreSectionTitle: { color: colors.dotComplete, fontSize: 17, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  totalScoreRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  totalScoreNumber: { color: colors.dotComplete, fontSize: 64, fontWeight: '800', lineHeight: 72 },
  totalScoreMax: { color: colors.textMuted, fontSize: 22, marginBottom: 10 },
  verdict: { color: colors.textMuted, fontSize: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 20, paddingHorizontal: 16 },
  ringsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  ringItem: { width: '44%', alignItems: 'center', gap: 6 },
  ringWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringScore: { position: 'absolute', fontSize: 18, fontWeight: '800' },
  ringLabel: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  ringReason: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  // Stack & Cost styles
  stackCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  stackCardTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  stackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stackIconWrap: {
    width: 34, height: 34, borderRadius: 9, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', flexShrink: 0,
  },
  stackIcon: { fontSize: 15 },
  stackTextWrap: { flex: 1 },
  stackLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  stackValue: { color: colors.text, fontSize: 13, lineHeight: 19 },
  costRow: { flexDirection: 'row', gap: 10 },
  costBadge: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  costBadgeLabel: { color: colors.accent, fontSize: 11, fontWeight: '600' },
  costBadgeValue: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  costNote: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
  },
  costNoteText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 12 },
  outlineBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center',
  },
  outlineBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  filledBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: colors.accent, alignItems: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  filledBtnText: { color: '#080814', fontSize: 15, fontWeight: '700' },
  restartBtn: { alignItems: 'center', paddingVertical: 12, paddingBottom: 30 },
  restartText: { color: colors.textDim, fontSize: 13 },
});

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { SlopGauge } from '../components/SlopGauge';
import { ClaimCard } from '../components/ClaimCard';
import type { RootStackParamList } from '../../App';

type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<ResultRoute>();
  const { result, pitch } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    const msg =
      `🔍 Nokta Due Diligence Raporu\n\n` +
      `Slop Skoru: ${result.slopScore}/100\n\n` +
      `Özet: ${result.summary}\n\n` +
      `Öneri: ${result.recommendation}\n\n` +
      `— Nokta Slop Dedektörü`;
    await Share.share({ message: msg });
  };

  const scoreColor =
    result.slopScore < 35 ? colors.green :
    result.slopScore < 65 ? colors.amber : colors.red;

  const scoreBg =
    result.slopScore < 35 ? 'rgba(34,197,94,0.1)' :
    result.slopScore < 65 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0F1117', '#1A1025']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Analiz Raporu</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>↑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Score Card ── */}
          <View style={[styles.scoreCard, { borderColor: `${scoreColor}44` }]}>
            <SlopGauge score={result.slopScore} />

            {/* Score interpretation band */}
            <View style={[styles.interpretBand, { backgroundColor: scoreBg, borderColor: `${scoreColor}44` }]}>
              <Text style={[styles.interpretText, { color: scoreColor }]}>
                {result.slopScore < 35 ? '✓ Güçlü Pitch — Hızlı değerlendirmeye alın' :
                 result.slopScore < 65 ? '⚠ Şüpheli — Detay istenebilir' :
                 '✗ Yüksek Slop Riski — Fon ciddi riski taşır'}
              </Text>
            </View>
          </View>

          {/* ── Summary ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AI ÖZETİ</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          </View>

          {/* ── Claims ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>İDDİA ANALİZİ · {result.claims.length} BULGU</Text>
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </View>

          {/* ── Recommendation ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YATIRIMC IÖNERİSİ</Text>
            <LinearGradient
              colors={['rgba(124,58,237,0.15)', 'rgba(236,72,153,0.10)']}
              style={styles.recommendCard}
            >
              <Text style={styles.recommendText}>{result.recommendation}</Text>
            </LinearGradient>
          </View>

          {/* ── Pitch Snippet ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ANALİZ EDİLEN PİTCH</Text>
            <View style={styles.pitchSnippet}>
              <Text style={styles.pitchText} numberOfLines={5}>{pitch}</Text>
            </View>
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>↩  Yeni Pitch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={handleShare}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>↑  Raporu Paylaş</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: colors.textPrimary },
  topTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  shareBtn: {
    width: 36, height: 36,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { fontSize: 18, color: colors.textPrimary },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  scoreCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
    gap: 16,
  },
  interpretBand: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  interpretText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purple,
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  summaryCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 16,
  },
  summaryText: { color: colors.textPrimary, fontSize: 14, lineHeight: 21 },

  recommendCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  recommendText: { color: colors.textPrimary, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },

  pitchSnippet: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 14,
  },
  pitchText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowRadius: 10,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

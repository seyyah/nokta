import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../theme/colors';
import { SlopGauge } from '../components/features/SlopGauge';
import { ClaimCard } from '../components/features/ClaimCard';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useResultAnimation } from '../hooks/useResultAnimation';
import type { RootStackParamList, NavigationProp } from '../types';
import { Ionicons } from '@expo/vector-icons';

type ResultRoute = RouteProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultRoute>();
  const { result, pitch } = route.params;
  const { fadeAnim, slideAnim } = useResultAnimation();

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
    result.slopScore < 35 ? colors.success :
    result.slopScore < 65 ? colors.warning : colors.error;

  const scoreBg =
    result.slopScore < 35 ? 'rgba(34,197,94,0.1)' :
    result.slopScore < 65 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.textPrimary }]}>Analiz Raporu</Text>
        <TouchableOpacity onPress={handleShare} style={[styles.iconBtn, { backgroundColor: colors.bgCard, borderColor: colors.bgCardBorder }]}>
          <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Score Card */}
          <Card style={[styles.scoreCard, { borderColor: `${scoreColor}44` }]}>
            <SlopGauge score={result.slopScore} />

            {/* Score interpretation band */}
            <View style={[styles.interpretBand, { backgroundColor: scoreBg, borderColor: `${scoreColor}44` }]}>
              <Text style={[styles.interpretText, { color: scoreColor }]}>
                {result.slopScore < 35 ? '✓ Güçlü Pitch — Hızlı değerlendirmeye alın' :
                 result.slopScore < 65 ? '⚠ Şüpheli — Detay istenebilir' :
                 '✗ Yüksek Slop Riski — Fon ciddi riski taşır'}
              </Text>
            </View>
          </Card>

          {/* AI Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>AI ÖZETİ</Text>
            <Card>
              <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{result.summary}</Text>
            </Card>
          </View>

          {/* Claims Analysis */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>İDDİA ANALİZİ · {result.claims.length} BULGU</Text>
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </View>

          {/* Investor Recommendation */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>YATIRIMCI ÖNERİSİ</Text>
            <View style={[styles.recommendCard, { backgroundColor: colors.bgCard, borderColor: `${colors.primary}33` }]}>
              <Text style={[styles.recommendText, { color: colors.textPrimary }]}>{result.recommendation}</Text>
            </View>
          </View>

          {/* Analyzed Pitch Snippet */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>ANALİZ EDİLEN PİTCH</Text>
            <Card style={styles.pitchSnippet}>
              <Text style={[styles.pitchText, { color: colors.textMuted }]} numberOfLines={5}>{pitch}</Text>
            </Card>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="secondary"
              text="↩  Yeni Pitch"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Button
              text="↑  Raporu Paylaş"
              onPress={handleShare}
              style={{ flex: 1 }}
            />
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  topTitle: { fontSize: 16, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  scoreCard: {
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
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  summaryText: { fontSize: 14, lineHeight: 21 },

  recommendCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  recommendText: { fontSize: 14, lineHeight: 21, fontStyle: 'italic' },

  pitchSnippet: {
    padding: 14,
  },
  pitchText: { fontSize: 13, lineHeight: 19 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';

export interface ArtifactData {
  thesis: string;
  problem: string;
  techConstraints: string;
}

interface ArtifactViewProps {
  originalIdea: string;
  artifact: ArtifactData;
  questionsCount: number;
  answeredCount: number;
  onReset: () => void;
}

// ─── Slop Detection Engine ───────────────────────────────────

const SLOP_WORDS_TR = [
  'devrimci', 'çığır açan', 'inovatif', 'yenilikçi', 'muhteşem',
  'harika', 'mükemmel', 'benzersiz', 'eşsiz', 'olağanüstü',
  'game-changing', 'revolutionary', 'cutting-edge', 'innovative',
  'groundbreaking', 'state-of-the-art', 'next-generation', 'world-class',
  'paradigm shift', 'synergy', 'leverage', 'disruptive',
  'son derece', 'en iyi', 'dünya çapında', 'lider',
];

function calculateSlopScore(text: string): number {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return 0;

  let slopCount = 0;
  for (const slopWord of SLOP_WORDS_TR) {
    const regex = new RegExp(slopWord.toLowerCase(), 'gi');
    const matches = lowerText.match(regex);
    if (matches) slopCount += matches.length;
  }

  // Percentage of slop words relative to total word count
  const rawScore = (slopCount / words.length) * 100;
  return Math.min(Math.round(rawScore * 10) / 10, 100); // cap at 100, 1 decimal
}

function calculateSpecGrade(artifact: ArtifactData, answeredCount: number, totalQuestions: number): string {
  let score = 0;

  // Section completeness (each section max 25 points)
  const sections = [artifact.thesis, artifact.problem, artifact.techConstraints];
  for (const section of sections) {
    const wordCount = section.split(/\s+/).length;
    if (wordCount >= 40) score += 25;
    else if (wordCount >= 25) score += 20;
    else if (wordCount >= 15) score += 15;
    else if (wordCount >= 5) score += 10;
    else score += 5;
  }

  // Answer coverage bonus (max 25 points)
  const coverageRatio = answeredCount / totalQuestions;
  score += Math.round(coverageRatio * 25);

  // Grade mapping
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  return 'C';
}

export default function ArtifactView({
  originalIdea,
  artifact,
  questionsCount,
  answeredCount,
  onReset,
}: ArtifactViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const generatedAt = new Date().toISOString().split('T')[0];

  // ─── Calculate scores ─────────────────────────────────────
  const scores = useMemo(() => {
    const fullText = `${artifact.thesis} ${artifact.problem} ${artifact.techConstraints}`;
    const slopScore = calculateSlopScore(fullText);
    const specGrade = calculateSpecGrade(artifact, answeredCount, questionsCount);
    return { slopScore, specGrade };
  }, [artifact, answeredCount, questionsCount]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getFullText = () => {
    let text = `# NOKTA SPEC — Oluşturulma: ${generatedAt}\n\n`;
    text += `## Tez\n${artifact.thesis}\n\n`;
    text += `## Problem\n${artifact.problem}\n\n`;
    text += `## Teknik Kısıtlar\n${artifact.techConstraints}\n\n`;
    text += `---\n`;
    text += `Spec Notu: ${scores.specGrade} | Slop Skoru: %${scores.slopScore} | Boyut: ${answeredCount}/${questionsCount}\n`;
    text += `Nokta tarafından oluşturuldu · Track A · AI Destekli · Slop-Free\n`;
    return text;
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(getFullText());
      } else {
        await Clipboard.setStringAsync(getFullText());
      }
      Alert.alert('Kopyalandı', 'Çıktı panoya kopyalandı.');
    } catch {
      Alert.alert('Hata', 'Kopyalama başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  // Slop score color
  const slopColor = scores.slopScore === 0
    ? '#22c55e'
    : scores.slopScore < 5
    ? '#eab308'
    : '#ef4444';

  // Grade color
  const gradeColor = scores.specGrade.startsWith('A')
    ? NoktaColors.accent
    : scores.specGrade.startsWith('B')
    ? '#eab308'
    : '#ef4444';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Faz başlığı */}
        <View style={styles.phaseHeader}>
          <Text style={styles.phaseTag}>FAZ 03</Text>
          <Text style={styles.phaseTitle}>Spesifikasyon Çıktısı</Text>
          <Text style={styles.phaseDesc}>
            Noktanız IDEA Standardı kullanılarak resmi bir Proje Anayasasına
            dönüştürüldü.
          </Text>
        </View>

        {/* Durum rozeti */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SPEC TAMAMLANDI</Text>
          </View>
          <Text style={styles.dateText}>{generatedAt}</Text>
        </View>

        {/* Çıktı dokümanı */}
        <View style={styles.docCard}>
          <View style={styles.docHeader}>
            <View style={styles.docHeaderDots}>
              <View style={[styles.termDot, { backgroundColor: '#ef4444' }]} />
              <View style={[styles.termDot, { backgroundColor: '#eab308' }]} />
              <View style={[styles.termDot, { backgroundColor: '#22c55e' }]} />
            </View>
            <Text style={styles.docHeaderTitle}>nokta-spec.md</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Destekli</Text>
            </View>
          </View>

          {/* Tez */}
          <View style={styles.docSection}>
            <Text style={styles.sectionTag}>TEZ</Text>
            <Text style={styles.sectionBody}>{artifact.thesis}</Text>
          </View>

          <View style={styles.docDivider} />

          {/* Problem */}
          <View style={styles.docSection}>
            <Text style={styles.sectionTag}>PROBLEM</Text>
            <Text style={styles.sectionBody}>{artifact.problem}</Text>
          </View>

          <View style={styles.docDivider} />

          {/* Teknik Kısıtlar */}
          <View style={styles.docSection}>
            <Text style={styles.sectionTag}>TEKNİK KISITLAR</Text>
            <Text style={styles.sectionBody}>{artifact.techConstraints}</Text>
          </View>

          {/* Alt bilgi */}
          <View style={styles.docFooter}>
            <Text style={styles.footerText}>
              Nokta tarafından oluşturuldu · Track A · AI Destekli · Slop-Free
            </Text>
          </View>
        </View>

        {/* Skor kartı */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>KALİTE ANALİZİ</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>
                {answeredCount}/{questionsCount}
              </Text>
              <Text style={styles.scoreLabel}>Boyut</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreValue, { color: gradeColor }]}>
                {scores.specGrade}
              </Text>
              <Text style={styles.scoreLabel}>Spec Notu</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreValue, { color: slopColor }]}>
                %{scores.slopScore}
              </Text>
              <Text style={styles.scoreLabel}>Slop Skoru</Text>
            </View>
          </View>

          {/* Score explanations */}
          <View style={styles.scoreExplain}>
            <Text style={styles.scoreExplainText}>
              Boyut: cevaplanmış soru sayısı · Spec Notu: içerik derinliği ve kapsam · Slop Skoru: pazarlama/dolgu kelime oranı (düşük = iyi)
            </Text>
          </View>
        </View>

        {/* Aksiyon butonları */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCopy}
          >
            <Text style={styles.primaryButtonText}>Çıktıyı Kopyala</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onReset}
          >
            <Text style={styles.secondaryButtonText}>Yeni Nokta ↻</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },
  phaseHeader: { marginBottom: Spacing.xl },
  phaseTag: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  phaseTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  phaseDesc: {
    fontSize: FontSize.sm,
    color: NoktaColors.textSecondary,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NoktaColors.accentGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: NoktaColors.accentMuted,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NoktaColors.accent,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
  },
  docCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NoktaColors.borderSubtle,
    backgroundColor: NoktaColors.bgElevated,
  },
  docHeaderDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: Spacing.md,
  },
  termDot: { width: 10, height: 10, borderRadius: 5 },
  docHeaderTitle: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '500',
    flex: 1,
  },
  aiBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  aiBadgeText: {
    fontSize: 9,
    color: '#60a5fa',
    fontWeight: '600',
  },
  docSection: { padding: Spacing.lg },
  sectionTag: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  sectionBody: {
    fontSize: FontSize.sm,
    color: NoktaColors.textPrimary,
    lineHeight: 22,
  },
  docDivider: {
    height: 1,
    backgroundColor: NoktaColors.borderSubtle,
    marginHorizontal: Spacing.lg,
  },
  docFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: NoktaColors.borderSubtle,
    backgroundColor: NoktaColors.bgElevated,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
  },
  scoreCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  scoreCardTitle: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: { alignItems: 'center' },
  scoreValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  scoreLabel: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: NoktaColors.borderSubtle,
  },
  scoreExplain: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: NoktaColors.borderSubtle,
  },
  scoreExplainText: {
    fontSize: 10,
    color: NoktaColors.textDimmed,
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonRow: { gap: Spacing.md },
  primaryButton: {
    backgroundColor: NoktaColors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: NoktaColors.bgCard,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: NoktaColors.border,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: NoktaColors.bg,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: NoktaColors.textSecondary,
    letterSpacing: 0.5,
  },
});

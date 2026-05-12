import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { ExpertFeedback } from '@/services/expertService';
import { EXPERT_PROFILES } from '@/services/expertService';

interface ExpertReviewPanelProps {
  feedback: ExpertFeedback;
}

export default function ExpertReviewPanel({ feedback }: ExpertReviewPanelProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const expert = EXPERT_PROFILES.find((e) => e.id === feedback.expertId);
  const accentColor = expert?.accentColor ?? NoktaColors.accent;

  const scoreColor =
    feedback.score >= 80
      ? '#22c55e'
      : feedback.score >= 60
      ? '#eab308'
      : '#ef4444';

  const scoreLabel =
    feedback.score >= 80
      ? 'Güçlü'
      : feedback.score >= 60
      ? 'Orta'
      : 'Zayıf';

  const verifiedDate = new Date(feedback.verifiedAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    Animated.sequence([
      // Content fade-in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Score counter animation
      Animated.timing(scoreAnim, {
        toValue: feedback.score,
        duration: 800,
        useNativeDriver: false,
      }),
      // Badge pop
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, badgeScale, scoreAnim, feedback.score]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTag}>EXPERT FEEDBACK</Text>
        <Text style={styles.sectionTitle}>Uzman Değerlendirmesi</Text>
      </View>

      {/* Expert Info Bar */}
      <View style={styles.expertBar}>
        <View
          style={[
            styles.expertIconSmall,
            { backgroundColor: accentColor + '15' },
          ]}
        >
          <Text style={styles.expertIconEmoji}>{expert?.icon ?? '👤'}</Text>
        </View>
        <View style={styles.expertBarInfo}>
          <Text style={styles.expertBarTitle}>{feedback.expertTitle}</Text>
          <Text style={styles.expertBarDate}>{verifiedDate}</Text>
        </View>
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCircleOuter}>
          <View style={[styles.scoreCircleInner, { borderColor: scoreColor }]}>
            <Animated.Text
              style={[styles.scoreNumber, { color: scoreColor }]}
            >
              {feedback.score}
            </Animated.Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>
        <View style={styles.scoreInfo}>
          <View style={styles.scoreLabelRow}>
            <Text style={styles.scoreLabelTitle}>Uzman Onay Puanı</Text>
            <View
              style={[
                styles.scorePill,
                { backgroundColor: scoreColor + '20' },
              ]}
            >
              <Text style={[styles.scorePillText, { color: scoreColor }]}>
                {scoreLabel}
              </Text>
            </View>
          </View>

          {/* Score Bar */}
          <View style={styles.scoreBarBg}>
            <Animated.View
              style={[
                styles.scoreBarFill,
                {
                  backgroundColor: scoreColor,
                  width: `${feedback.score}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Feedback Content */}
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <Text style={styles.feedbackLabel}>KRİTİK GERİ BİLDİRİM</Text>
          <View style={styles.redTeamBadge}>
            <Text style={styles.redTeamText}>Red-Team</Text>
          </View>
        </View>
        <Text style={styles.feedbackText}>{feedback.feedback}</Text>
      </View>

      {/* Human-Verified Badge */}
      {feedback.isHumanVerified && (
        <Animated.View
          style={[
            styles.verifiedBadge,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <View style={styles.verifiedDot} />
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>Human-Verified</Text>
          <Text style={styles.verifiedSubText}>İnsan Onaylı</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing['2xl'],
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTag: {
    fontSize: FontSize.xs,
    color: '#f59e0b',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
  },
  expertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NoktaColors.borderSubtle,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  expertIconSmall: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertIconEmoji: {
    fontSize: 18,
  },
  expertBarInfo: {
    flex: 1,
  },
  expertBarTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
  },
  expertBarDate: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    marginTop: 2,
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  scoreCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NoktaColors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    backgroundColor: NoktaColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 10,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
    marginTop: -2,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scoreLabelTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: NoktaColors.textSecondary,
  },
  scorePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  scorePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scoreBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: NoktaColors.bgElevated,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  feedbackCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NoktaColors.borderSubtle,
    backgroundColor: NoktaColors.bgElevated,
  },
  feedbackLabel: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '700',
    letterSpacing: 1,
  },
  redTeamBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  redTeamText: {
    fontSize: 9,
    color: '#ef4444',
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: FontSize.sm,
    color: NoktaColors.textPrimary,
    lineHeight: 22,
    padding: Spacing.lg,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.accentMuted,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  verifiedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NoktaColors.accent,
  },
  verifiedIcon: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: NoktaColors.accent,
  },
  verifiedText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: NoktaColors.accent,
  },
  verifiedSubText: {
    fontSize: FontSize.xs,
    color: NoktaColors.accentMuted,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
});

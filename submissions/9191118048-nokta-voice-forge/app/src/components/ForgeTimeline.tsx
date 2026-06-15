/**
 * ForgeTimeline — Vertical timeline visualization of forge cycles
 * Color-coded cards with expandable details and phase indicators
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  Layout,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { ForgeCycle, ForgePhase, ForgeResult } from '../types';

interface ForgeTimelineProps {
  cycles: ForgeCycle[];
  onCyclePress?: (cycle: ForgeCycle) => void;
}

// ─── Constants ──────────────────────────────────────────

const PHASE_ORDER: ForgePhase[] = [
  'READ',
  'LOCATE',
  'HYPOTHESIZE',
  'REPAIR',
  'TEST',
  'VERIFY',
  'COMMIT',
  'ROLLBACK',
];

const RESULT_CONFIG: Record<
  ForgeResult,
  { color: string; bgColor: string; label: string; emoji: string }
> = {
  SUCCESS: {
    color: colors.success,
    bgColor: `${colors.success}22`,
    label: 'BAŞARILI',
    emoji: '✅',
  },
  ROLLBACK: {
    color: colors.accent,
    bgColor: `${colors.accent}22`,
    label: 'GERİ ALINDI',
    emoji: '↩️',
  },
  IN_PROGRESS: {
    color: colors.warning,
    bgColor: `${colors.warning}22`,
    label: 'DEVAM EDİYOR',
    emoji: '🔄',
  },
  STUCK: {
    color: colors.error,
    bgColor: `${colors.error}22`,
    label: 'TAKILI',
    emoji: '🛑',
  },
  FAIL: {
    color: colors.error,
    bgColor: `${colors.error}18`,
    label: 'BAŞARISIZ',
    emoji: '❌',
  },
};

const PHASE_STATUS_COLORS: Record<string, string> = {
  pending: colors.textMuted,
  active: colors.warning,
  done: colors.success,
  failed: colors.error,
};

// ─── Helper Functions ───────────────────────────────────

function getResultColor(result: ForgeResult): string {
  return RESULT_CONFIG[result]?.color ?? colors.textMuted;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return '<1dk';
  if (minutes < 60) return `${Math.round(minutes)}dk`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}sa ${m}dk`;
}

// ─── Phase Dots Component ───────────────────────────────

const PhaseDots: React.FC<{
  phases: ForgeCycle['phases'];
  currentPhase: ForgePhase;
}> = ({ phases, currentPhase }) => {
  const dotSize = 8;
  const dotGap = 4;
  const totalWidth = PHASE_ORDER.length * (dotSize + dotGap) - dotGap;

  return (
    <View style={phaseStyles.container}>
      <Svg width={totalWidth} height={dotSize + 4}>
        {PHASE_ORDER.map((phase, index) => {
          const phaseData = phases.find((p: any) => p.phase === phase);
          const status = phaseData?.status ?? 'pending';
          const isCurrent = phase === currentPhase;
          const fillColor = PHASE_STATUS_COLORS[status] ?? colors.textMuted;

          return (
            <React.Fragment key={phase}>
              {/* Connecting line */}
              {index > 0 && (
                <SvgLine
                  x1={index * (dotSize + dotGap) - dotGap / 2}
                  y1={(dotSize + 4) / 2}
                  x2={index * (dotSize + dotGap) - dotGap / 2 - dotGap}
                  y2={(dotSize + 4) / 2}
                  stroke={colors.textMuted}
                  strokeWidth={1}
                  opacity={0.3}
                />
              )}
              <SvgCircle
                cx={index * (dotSize + dotGap) + dotSize / 2}
                cy={(dotSize + 4) / 2}
                r={isCurrent ? dotSize / 2 + 1 : dotSize / 2 - 0.5}
                fill={fillColor}
                opacity={status === 'pending' ? 0.3 : 1}
                stroke={isCurrent ? 'white' : 'none'}
                strokeWidth={isCurrent ? 1 : 0}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <Text style={phaseStyles.label}>{currentPhase}</Text>
    </View>
  );
};

const phaseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
});

// ─── Expanded Details Component ─────────────────────────

const ExpandedDetails: React.FC<{ cycle: ForgeCycle }> = ({ cycle }) => (
  <Animated.View
    entering={FadeInDown.duration(250)}
    style={expandedStyles.container}
  >
    {/* Phases */}
    <Text style={expandedStyles.sectionTitle}>Aşamalar</Text>
    <View style={expandedStyles.phasesList}>
      {cycle.phases.map((p: any, idx: number) => (
        <View key={idx} style={expandedStyles.phaseRow}>
          <View
            style={[
              expandedStyles.phaseDot,
              { backgroundColor: PHASE_STATUS_COLORS[p.status] },
            ]}
          />
          <Text style={expandedStyles.phaseName}>{p.phase}</Text>
          <Text style={expandedStyles.phaseStatus}>{p.status}</Text>
          {p.notes ? (
            <Text style={expandedStyles.phaseNotes} numberOfLines={1}>
              {p.notes}
            </Text>
          ) : null}
        </View>
      ))}
    </View>

    {/* Changed Files */}
    {cycle.changedFiles.length > 0 && (
      <>
        <Text style={expandedStyles.sectionTitle}>Değişen Dosyalar</Text>
        {cycle.changedFiles.map((file: string, idx: number) => (
          <Text key={idx} style={expandedStyles.fileName}>
            📄 {file}
          </Text>
        ))}
      </>
    )}

    {/* Test Result */}
    {cycle.testResult ? (
      <>
        <Text style={expandedStyles.sectionTitle}>Test Sonucu</Text>
        <View style={expandedStyles.testResultBox}>
          <Text style={expandedStyles.testResultText}>
            {cycle.testResult}
          </Text>
        </View>
      </>
    ) : null}

    {/* Commit Hash */}
    {cycle.commitHash ? (
      <View style={expandedStyles.commitRow}>
        <Text style={expandedStyles.commitLabel}>Commit:</Text>
        <Text style={expandedStyles.commitHash}>
          {cycle.commitHash.substring(0, 8)}
        </Text>
      </View>
    ) : null}

    {/* Duration & HTP */}
    <View style={expandedStyles.metaRow}>
      <Text style={expandedStyles.metaText}>
        ⏱ {formatDuration(cycle.durationMinutes)}
      </Text>
      <Text style={expandedStyles.metaText}>
        👆 HTP: {cycle.humanTouchPoints}
      </Text>
    </View>
  </Animated.View>
);

const expandedStyles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  phasesList: {
    gap: 3,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseName: {
    ...typography.micro,
    fontSize: 10,
    color: colors.textSecondary,
    width: 70,
  },
  phaseStatus: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
    width: 45,
  },
  phaseNotes: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
    flex: 1,
    textTransform: 'none',
  },
  fileName: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: 2,
  },
  testResultBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  testResultText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text,
    fontFamily: 'monospace',
  },
  commitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  commitLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  commitHash: {
    ...typography.caption,
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'monospace',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
});

// ─── Timeline Card Component ────────────────────────────

const TimelineCard: React.FC<{
  cycle: ForgeCycle;
  index: number;
  isLast: boolean;
  onPress?: (cycle: ForgeCycle) => void;
}> = ({ cycle, index, isLast, onPress }) => {
  const [expanded, setExpanded] = useState(false);
  const resultConfig = RESULT_CONFIG[cycle.result] ?? RESULT_CONFIG.FAIL;
  const dotColor = resultConfig.color;

  const handlePress = useCallback(() => {
    setExpanded((prev) => !prev);
    onPress?.(cycle);
  }, [cycle, onPress]);

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 80)
        .duration(350)
        .springify()}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      {/* Timeline line + dot */}
      <View style={styles.timelineTrack}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: dotColor },
            cycle.result === 'STUCK' && styles.timelineDotStuck,
          ]}
        />
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor:
                  cycle.result === 'SUCCESS'
                    ? `${colors.success}40`
                    : `${colors.textMuted}30`,
              },
            ]}
          />
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: `${dotColor}40`,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cycleNumber}>#{cycle.id}</Text>
            <Text style={styles.reportName} numberOfLines={1}>
              {cycle.reportName}
            </Text>
          </View>
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: resultConfig.bgColor },
            ]}
          >
            <Text style={styles.resultEmoji}>{resultConfig.emoji}</Text>
            <Text style={[styles.resultText, { color: resultConfig.color }]}>
              {resultConfig.label}
            </Text>
          </View>
        </View>

        {/* Hypothesis */}
        <Text style={styles.hypothesis} numberOfLines={expanded ? 10 : 2}>
          {cycle.hypothesis}
        </Text>

        {/* Phase dots + kg */}
        <View style={styles.cardFooter}>
          <PhaseDots phases={cycle.phases} currentPhase={cycle.currentPhase} />
          <View style={styles.kgBadge}>
            <Text style={styles.kgValue}>{cycle.kg.toFixed(1)}</Text>
            <Text style={styles.kgUnit}>kg</Text>
          </View>
        </View>

        {/* Expanded details */}
        {expanded && <ExpandedDetails cycle={cycle} />}

        {/* Expand indicator */}
        <Text style={styles.expandIndicator}>
          {expanded ? '▲ Daralt' : '▼ Detaylar'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Summary Bar Component ──────────────────────────────

const SummaryBar: React.FC<{ cycles: ForgeCycle[] }> = ({ cycles }) => {
  const totalCycles = cycles.length;
  const successCount = cycles.filter((c) => c.result === 'SUCCESS').length;
  const rollbackCount = cycles.filter(
    (c) => c.result === 'ROLLBACK' || c.result === 'FAIL'
  ).length;
  const totalKg = cycles.reduce((sum, c) => sum + c.kg, 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.summaryBar}
    >
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{totalCycles}</Text>
        <Text style={styles.summaryLabel}>Toplam</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: colors.success }]}>
          {successCount}
        </Text>
        <Text style={styles.summaryLabel}>Başarılı</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: colors.accent }]}>
          {rollbackCount}
        </Text>
        <Text style={styles.summaryLabel}>Geri Alım</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: colors.primary }]}>
          {totalKg.toFixed(1)}
        </Text>
        <Text style={styles.summaryLabel}>kg</Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Component ─────────────────────────────────────

const ForgeTimeline: React.FC<ForgeTimelineProps> = ({
  cycles,
  onCyclePress,
}) => {
  if (cycles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔨</Text>
        <Text style={styles.emptyTitle}>Henüz döngü yok</Text>
        <Text style={styles.emptySubtitle}>
          Forge döngüleri başladığında burada görünecek
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary */}
      <SummaryBar cycles={cycles} />

      {/* Timeline */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cycles.map((cycle, index) => (
          <TimelineCard
            key={cycle.id}
            cycle={cycle}
            index={index}
            isLast={index === cycles.length - 1}
            onPress={onCyclePress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // ─── Summary Bar ──────────────
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceGlass,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.subheading,
    fontSize: 20,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },

  // ─── Card Wrapper ─────────────
  cardWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },

  // ─── Timeline Track ───────────
  timelineTrack: {
    width: 28,
    alignItems: 'center',
    paddingTop: spacing.md + 2,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
    ...shadows.sm,
  },
  timelineDotStuck: {
    borderWidth: 2,
    borderColor: 'rgba(255, 71, 87, 0.5)',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },

  // ─── Card ─────────────────────
  card: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  cycleNumber: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  reportName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  resultEmoji: {
    fontSize: 11,
  },
  resultText: {
    ...typography.micro,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  hypothesis: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kgBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  kgValue: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  kgUnit: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
  },
  expandIndicator: {
    ...typography.micro,
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },

  // ─── Empty State ──────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.subheading,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default ForgeTimeline;

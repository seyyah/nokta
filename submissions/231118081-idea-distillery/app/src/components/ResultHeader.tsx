import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '../theme';
import { DistillationMetrics, ReadinessReview, ResultSource } from '../types/draft';

type ResultHeaderProps = {
  title: string;
  metrics: DistillationMetrics;
  readiness: ReadinessReview;
  source: ResultSource;
  onBack: () => void;
};

export function ResultHeader({
  title,
  metrics,
  readiness,
  source,
  onBack,
}: ResultHeaderProps) {
  return (
    <LinearGradient
      colors={['#FBFAF5', '#EEF2F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Pressable onPress={onBack} style={styles.backAction}>
        <Text style={styles.backActionText}>Edit Notes</Text>
      </Pressable>

      <Text style={styles.eyebrow}>Game Design Brief / {source.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        The raw game dump has been distilled into a scoped prototype brief with review guidance.
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Readiness</Text>
          <Text style={styles.metricValue}>{readiness.score}</Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Review Mode</Text>
          <Text style={styles.metricMode}>{readiness.mode}</Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Feature Risks</Text>
          <Text style={styles.metricValue}>{metrics.featureCreepCount}</Text>
        </View>
        <View style={styles.metricChip}>
          <Text style={styles.metricLabel}>Duplicates Cut</Text>
          <Text style={styles.metricValue}>{metrics.duplicatesCollapsed}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    gap: 12,
  },
  backAction: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backActionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.inkSoft,
  },
  eyebrow: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.blueDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 40,
    lineHeight: 42,
    color: palette.ink,
    letterSpacing: -1,
  },
  subtitle: {
    maxWidth: 320,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 6,
  },
  metricChip: {
    minWidth: 104,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  metricLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 26,
    color: palette.ink,
  },
  metricMode: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 22,
    color: palette.ink,
  },
});

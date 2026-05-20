import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

type ScorePanelProps = {
  score: number;
};

function getRiskLabel(score: number) {
  if (score >= 75) {
    return 'Severe slop';
  }

  if (score >= 50) {
    return 'Needs skepticism';
  }

  if (score >= 25) {
    return 'Mixed signal';
  }

  return 'Relatively concrete';
}

function getTone(score: number) {
  if (score >= 75) {
    return theme.colors.danger;
  }

  if (score >= 50) {
    return theme.colors.accent;
  }

  if (score >= 25) {
    return theme.colors.moss;
  }

  return theme.colors.ink;
}

export function ScorePanel({ score }: ScorePanelProps) {
  const bars = Array.from({ length: 12 }, (_, index) => index);
  const filledBars = Math.max(1, Math.round((score / 100) * bars.length));
  const tone = getTone(score);

  return (
    <View style={styles.shell}>
      <View style={styles.headerRow}>
        <View style={styles.scoreBubble}>
          <Text style={[styles.scoreValue, { color: tone }]}>{score}</Text>
          <Text style={styles.scoreLabel}>slop score</Text>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.riskLabel}>{getRiskLabel(score)}</Text>
          <Text style={styles.riskBody}>
            Higher scores mean the pitch relies more on hype, hand-waving, or non-testable
            claims instead of a specific wedge.
          </Text>
        </View>
      </View>

      <View style={styles.barRow}>
        {bars.map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              bar < filledBars ? { backgroundColor: tone } : styles.barMuted,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: theme.colors.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 18,
    ...theme.shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  scoreBubble: {
    width: 120,
    minHeight: 120,
    borderRadius: 28,
    backgroundColor: theme.colors.scoreBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  scoreValue: {
    fontFamily: theme.fonts.display,
    fontSize: 44,
    lineHeight: 48,
  },
  scoreLabel: {
    marginTop: 4,
    fontFamily: theme.fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
  },
  copyBlock: {
    flex: 1,
    gap: 8,
  },
  riskLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    color: theme.colors.ink,
  },
  riskBody: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.muted,
  },
  barRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bar: {
    flex: 1,
    height: 10,
    borderRadius: 999,
  },
  barMuted: {
    backgroundColor: theme.colors.inputBorder,
  },
});

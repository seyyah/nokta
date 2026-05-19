import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';

function getScoreColor(score: number, palette: AppPalette): string {
  if (score >= 67) {
    return palette.danger;
  }
  if (score >= 34) {
    return palette.warning;
  }
  return palette.success;
}

type ScoreCardProps = {
  score: number;
  palette: AppPalette;
};

export function ScoreCard({ score, palette }: ScoreCardProps) {
  const scoreColor = getScoreColor(score, palette);

  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.textMuted }]}>Slop Score</Text>
      <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
      <Text style={[styles.scale, { color: palette.textMuted }]}>0 = grounded | 100 = high slop risk</Text>
      <View style={[styles.track, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: scoreColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 16
  },
  fill: {
    borderRadius: 999,
    height: '100%'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase'
  },
  scale: {
    fontSize: 12,
    marginTop: 6
  },
  score: {
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 62,
    marginTop: 4
  },
  track: {
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    marginTop: 12,
    overflow: 'hidden'
  }
});

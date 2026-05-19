import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';

type CategoryRowProps = {
  name: string;
  score: number;
  explanation: string;
  palette: AppPalette;
};

function scoreColor(score: number, palette: AppPalette): string {
  if (score >= 67) {
    return palette.danger;
  }
  if (score >= 34) {
    return palette.warning;
  }
  return palette.success;
}

export function CategoryRow({ name, score, explanation, palette }: CategoryRowProps) {
  const tint = scoreColor(score, palette);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: palette.textPrimary }]}>{name}</Text>
        <Text style={[styles.score, { color: tint }]}>{score}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: palette.cardSoft, borderColor: palette.border }]}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: tint }]} />
      </View>
      <Text style={[styles.explanation, { color: palette.textSecondary }]}>{explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12
  },
  explanation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  fill: {
    borderRadius: 999,
    height: '100%'
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8
  },
  score: {
    fontSize: 16,
    fontWeight: '700'
  },
  track: {
    borderRadius: 999,
    borderWidth: 1,
    height: 8,
    marginTop: 6,
    overflow: 'hidden'
  }
});

import { StyleSheet, Text, View } from 'react-native';
import { VerdictLabel } from '../types/analysis';
import { AppPalette } from '../theme/palette';

function getVerdictColors(verdict: VerdictLabel, palette: AppPalette): { bg: string; text: string } {
  if (verdict === 'High Slop') {
    return { bg: '#FFE3E3', text: '#9B1C1C' };
  }

  if (verdict === 'Medium Slop') {
    return { bg: '#FFF2D8', text: '#8A5500' };
  }

  return { bg: '#DDF7E7', text: '#126438' };
}

type VerdictBadgeProps = {
  verdict: VerdictLabel;
  palette: AppPalette;
};

export function VerdictBadge({ verdict, palette }: VerdictBadgeProps) {
  const colors = getVerdictColors(verdict, palette);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{verdict}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2
  }
});

import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme';
import { UndefinedArea } from '../types/draft';

type UndefinedAreaCardProps = {
  area: UndefinedArea;
};

export function UndefinedAreaCard({ area }: UndefinedAreaCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.area}>{area.area}</Text>
      <Text style={styles.explanation}>{area.explanation}</Text>
      <Text style={styles.severity}>Severity: {area.severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.rustSoft,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  area: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 24,
    color: palette.ink,
    letterSpacing: -0.4,
  },
  explanation: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  severity: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.rust,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

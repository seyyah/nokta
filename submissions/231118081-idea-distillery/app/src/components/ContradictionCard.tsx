import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme';
import { Contradiction } from '../types/draft';

type ContradictionCardProps = {
  contradiction: Contradiction;
};

export function ContradictionCard({ contradiction }: ContradictionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{contradiction.severity.toUpperCase()}</Text>
      </View>
      <Text style={styles.claim}>{contradiction.claimA}</Text>
      <Text style={styles.versus}>vs</Text>
      <Text style={styles.claim}>{contradiction.claimB}</Text>
      <Text style={styles.reason}>{contradiction.rationale}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.amberSoft,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    letterSpacing: 0.7,
    color: palette.amber,
  },
  claim: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    lineHeight: 22,
    color: palette.ink,
  },
  versus: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 20,
    color: palette.rust,
  },
  reason: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: palette.inkSoft,
  },
});

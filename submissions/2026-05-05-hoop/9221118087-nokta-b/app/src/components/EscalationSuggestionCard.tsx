import { StyleSheet, Text, View } from 'react-native';
import { AppPalette } from '../theme/palette';
import { PrimaryButton } from './PrimaryButton';

type EscalationSuggestionCardProps = {
  palette: AppPalette;
  reasons: string[];
  onRequestExpertReview: () => void;
  onNeedDeeperReview: () => void;
};

export function EscalationSuggestionCard({
  palette,
  reasons,
  onRequestExpertReview,
  onNeedDeeperReview
}: EscalationSuggestionCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: palette.accentSoft, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>AI Escalation Suggestion</Text>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>This pitch may need human expert review.</Text>

      <View style={styles.reasonsArea}>
        {reasons.slice(0, 4).map((reason, index) => (
          <View key={`${reason}-${index}`} style={styles.reasonRow}>
            <Text style={[styles.marker, { color: palette.textMuted }]}>-</Text>
            <Text style={[styles.reasonText, { color: palette.textSecondary }]}>{reason}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton label="Request Expert Review" onPress={onRequestExpertReview} palette={palette} variant="primary" />
        <PrimaryButton label="Need deeper review" onPress={onNeedDeeperReview} palette={palette} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 14
  },
  marker: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: 7
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  reasonsArea: {
    marginTop: 8
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  title: {
    fontSize: 15,
    fontWeight: '800'
  }
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme';
import { NextDecision } from '../types/draft';

type NextDecisionCardProps = {
  decision: NextDecision;
  resolved: boolean;
  selectedOption?: string;
  onToggle: () => void;
  onSelectOption: (option: string) => void;
};

export function NextDecisionCard({
  decision,
  resolved,
  selectedOption,
  onToggle,
  onSelectOption,
}: NextDecisionCardProps) {
  const canToggle = Boolean(selectedOption);

  return (
    <View style={[styles.card, resolved ? styles.cardResolved : undefined]}>
      <View style={styles.header}>
        <View style={styles.priorityChip}>
          <Text style={styles.priorityText}>{decision.priority}</Text>
        </View>
        <Pressable
          onPress={onToggle}
          disabled={!canToggle}
          style={[
            styles.toggle,
            !canToggle ? styles.toggleDisabled : undefined,
            resolved ? styles.toggleResolved : undefined,
          ]}
        >
          <Text style={[styles.toggleText, resolved ? styles.toggleTextResolved : undefined]}>
            {resolved ? 'Clear Decision' : canToggle ? 'Mark Decision' : 'Choose Option'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.question}>{decision.question}</Text>
      <Text style={styles.recommendation}>{decision.recommendation}</Text>

      <View style={styles.optionRow}>
        {decision.options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onSelectOption(option)}
            style={({ pressed }) => [
              styles.optionChip,
              selectedOption === option ? styles.optionChipSelected : undefined,
              pressed ? styles.optionChipPressed : undefined,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === option ? styles.optionTextSelected : undefined,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedOption ? (
        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>Selected:</Text>
          <Text style={styles.selectionValue}>{selectedOption}</Text>
        </View>
      ) : (
        <View style={styles.selectionRow}>
          <Text style={styles.selectionHint}>Choose one option to confirm the decision.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  cardResolved: {
    backgroundColor: palette.successSoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  priorityChip: {
    backgroundColor: palette.blueSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priorityText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    letterSpacing: 0.7,
    color: palette.blueDeep,
    textTransform: 'uppercase',
  },
  toggle: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleDisabled: {
    opacity: 0.55,
  },
  toggleResolved: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.inkSoft,
  },
  toggleTextResolved: {
    color: palette.success,
  },
  question: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 26,
    lineHeight: 28,
    color: palette.ink,
    letterSpacing: -0.5,
  },
  recommendation: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: palette.inkSoft,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipSelected: {
    backgroundColor: palette.blue,
  },
  optionChipPressed: {
    opacity: 0.82,
  },
  optionText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: palette.inkSoft,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  selectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  selectionLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  selectionValue: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: palette.success,
  },
  selectionHint: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: palette.muted,
  },
});

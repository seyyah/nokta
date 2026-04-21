import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export type SuggestionChipsProps = {
  suggestions: string[];
  onPick: (suggestion: string) => void;
};

export function SuggestionChips({ suggestions, onPick }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {suggestions.map((s, i) => (
        <Pressable
          key={`${i}-${s}`}
          onPress={() => onPick(s)}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <Text style={styles.chipText} numberOfLines={1}>
            {s}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: colors.suggestionChipSurface,
    borderColor: colors.suggestionChip,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxWidth: 260,
  },
  chipPressed: { opacity: 0.7 },
  chipText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.suggestionChip,
  },
});

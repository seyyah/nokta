import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';

export type SuggestionPanelProps = {
  suggestions: string[];
  onPick: (suggestion: string) => void;
  onDismiss: () => void;
};

export function SuggestionPanel({
  suggestions,
  onPick,
  onDismiss,
}: SuggestionPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dot} />
          <Text style={styles.headerLabel}>AI ÖNERİSİ — istersen dokun</Text>
        </View>
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Atla</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {suggestions.map((s, i) => (
          <Pressable
            key={`${i}-${s}`}
            onPress={() => onPick(s)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.accent} />
            <Text style={styles.cardText} numberOfLines={2}>
              {s}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.suggestionChip,
  },
  headerLabel: {
    fontFamily: typography.label,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  dismissBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dismissText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.75,
    backgroundColor: colors.surface,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.suggestionChip,
  },
  cardText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  arrow: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.lg,
    color: colors.suggestionChip,
    fontWeight: '600',
  },
});

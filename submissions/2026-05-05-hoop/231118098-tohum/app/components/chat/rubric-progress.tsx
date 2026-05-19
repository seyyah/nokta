import { StyleSheet, View } from 'react-native';

import { RUBRIC_KEYS } from '@/constants/prompt';
import type { RubricState } from '@/constants/schema';
import { colors, radius, spacing } from '@/constants/theme';

export type RubricProgressProps = {
  rubric: RubricState;
};

export function RubricProgress({ rubric }: RubricProgressProps) {
  return (
    <View style={styles.row}>
      {RUBRIC_KEYS.map((key) => {
        const status = rubric[key];
        const backgroundColor =
          status === 'strong'
            ? colors.primary
            : status === 'partial'
              ? colors.secondary
              : colors.border;
        return (
          <View
            key={key}
            style={[styles.dot, { backgroundColor }]}
            accessibilityLabel={`${key}: ${status}`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
});

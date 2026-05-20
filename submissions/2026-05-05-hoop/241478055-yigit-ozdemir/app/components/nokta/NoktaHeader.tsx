import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NoktaColors, FontSize, Spacing } from '@/constants/theme';

export default function NoktaHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.dotIcon}>
          <View style={styles.dotInner} />
        </View>
        <Text style={styles.logoText}>NOKTA</Text>
      </View>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Track A</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dotIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: NoktaColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NoktaColors.accentGlow,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NoktaColors.accent,
  },
  logoText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    letterSpacing: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NoktaColors.accentGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NoktaColors.accentMuted,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NoktaColors.accent,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fontSize,
  radius,
  spacing,
  typography,
} from '@/constants/theme';

const MIN_SEED_LENGTH = 10;

export default function DotEntry() {
  const [seed, setSeed] = useState('');
  const trimmed = seed.trim();
  const canGrow = trimmed.length >= MIN_SEED_LENGTH;

  const onGrow = () => {
    if (!canGrow) return;
    router.push({ pathname: '/chat', params: { seed: trimmed } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Pressable
            onPress={() => router.push('/history')}
            hitSlop={8}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>Fikirlerim →</Text>
          </Pressable>
        </View>
        <View style={styles.header}>
          <Text style={styles.brand}>Tohum</Text>
          <Text style={styles.tagline}>Fikrin bir nokta ile başlar.</Text>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Fikrini buraya yaz..."
            placeholderTextColor={colors.textDim}
            value={seed}
            onChangeText={setSeed}
            multiline
            autoFocus
            textAlignVertical="top"
            selectionColor={colors.primary}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>AI HAZIR</Text>
          </View>

          <Pressable
            onPress={onGrow}
            disabled={!canGrow}
            style={({ pressed }) => [
              styles.cta,
              !canGrow && styles.ctaDisabled,
              pressed && canGrow && styles.ctaPressed,
            ]}
          >
            <Text
              style={[styles.ctaText, !canGrow && styles.ctaTextDisabled]}
            >
              Büyüt
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  topBarSpacer: { width: 80 },
  historyLink: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  historyLinkText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  brand: {
    fontFamily: typography.headline,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: typography.body,
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  inputArea: {
    flex: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  badgeText: {
    fontFamily: typography.label,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: colors.surfaceRaised,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.md,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ctaTextDisabled: {
    color: colors.textDim,
  },
});

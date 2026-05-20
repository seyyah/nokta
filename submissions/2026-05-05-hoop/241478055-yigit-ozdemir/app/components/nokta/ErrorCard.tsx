import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';
import type { AIError } from '@/services/aiService';

interface ErrorCardProps {
  error: AIError;
  onRetry: () => void;
}

const ERROR_ICONS: Record<AIError['type'], string> = {
  API_ERROR: '⚠️',
  PARSE_ERROR: '🧩',
  NETWORK_ERROR: '🔌',
  SLOP_DETECTED: '🛑',
};

const ERROR_TITLES: Record<AIError['type'], string> = {
  API_ERROR: 'API Hatası',
  PARSE_ERROR: 'Ayrıştırma Hatası',
  NETWORK_ERROR: 'Bağlantı Kesildi',
  SLOP_DETECTED: 'Slop Tespit Edildi',
};

export default function ErrorCard({ error, onRetry }: ErrorCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Text style={styles.icon}>{ERROR_ICONS[error.type]}</Text>
          <Text style={styles.errorType}>{ERROR_TITLES[error.type]}</Text>
        </View>
        <Text style={styles.message}>{error.message}</Text>
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryPressed]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>
            {error.type === 'SLOP_DETECTED' ? '← Girdiyi Düzelt' : 'Tekrar Dene →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#3f1515',
    padding: Spacing['2xl'],
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 20,
    color: NoktaColors.error,
  },
  errorType: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: NoktaColors.error,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: FontSize.sm,
    color: NoktaColors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    backgroundColor: NoktaColors.bgElevated,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  retryPressed: {
    opacity: 0.7,
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: NoktaColors.textPrimary,
  },
});

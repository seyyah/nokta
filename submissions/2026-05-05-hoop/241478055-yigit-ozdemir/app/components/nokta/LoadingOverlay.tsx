import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';

interface LoadingOverlayProps {
  message: string;
  subMessage?: string;
}

export default function LoadingOverlay({ message, subMessage }: LoadingOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Cascading dots
    const createDotAnim = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );

    createDotAnim(dotAnim1, 0).start();
    createDotAnim(dotAnim2, 200).start();
    createDotAnim(dotAnim3, 400).start();
  }, [pulseAnim, dotAnim1, dotAnim2, dotAnim3]);

  return (
    <View style={styles.container}>
      {/* Pulsing circle */}
      <Animated.View style={[styles.pulseRing, { opacity: pulseAnim }]}>
        <View style={styles.innerDot} />
      </Animated.View>

      {/* Processing dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[styles.processingDot, { opacity: anim }]}
          />
        ))}
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>
      {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  pulseRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NoktaColors.accentGlow,
    borderWidth: 2,
    borderColor: NoktaColors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  innerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NoktaColors.accent,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NoktaColors.accent,
  },
  message: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: NoktaColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subMessage: {
    fontSize: FontSize.sm,
    color: NoktaColors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

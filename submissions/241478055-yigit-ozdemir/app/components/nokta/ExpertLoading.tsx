import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';

interface ExpertLoadingProps {
  expertTitle: string;
  expertIcon: string;
  accentColor: string;
}

export default function ExpertLoading({
  expertTitle,
  expertIcon,
  accentColor,
}: ExpertLoadingProps) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing expert icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar fills over ~5s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4800,
      useNativeDriver: false,
    }).start();

    // Cascading dots
    const createDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

    createDot(dotAnim1, 0).start();
    createDot(dotAnim2, 200).start();
    createDot(dotAnim3, 400).start();
  }, [pulseAnim, progressAnim, dotAnim1, dotAnim2, dotAnim3]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '95%'],
  });

  return (
    <View style={styles.container}>
      {/* Expert Icon */}
      <Animated.View
        style={[
          styles.iconRing,
          {
            opacity: pulseAnim,
            borderColor: accentColor + '40',
            backgroundColor: accentColor + '08',
          },
        ]}
      >
        <View
          style={[
            styles.iconInner,
            { backgroundColor: accentColor + '15' },
          ]}
        >
          <Text style={styles.iconEmoji}>{expertIcon}</Text>
        </View>
      </Animated.View>

      {/* Status Text */}
      <Text style={styles.statusTitle}>Uzman dökümanı inceliyor...</Text>
      <Text style={styles.statusSubtitle}>
        {expertTitle} proje spesifikasyonunuzu analiz ediyor
      </Text>

      {/* Processing Dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: anim,
                backgroundColor: accentColor,
              },
            ]}
          />
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: accentColor,
              } as any,
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>İnceleme devam ediyor</Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {[
          'Döküman okunuyor...',
          'Teknik analiz yapılıyor...',
          'Geri bildirim hazırlanıyor...',
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: accentColor + '60' },
              ]}
            />
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  statusTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  statusSubtitle: {
    fontSize: FontSize.sm,
    color: NoktaColors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing['2xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: NoktaColors.bgElevated,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: NoktaColors.textDimmed,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NoktaColors.borderSubtle,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '500',
  },
});

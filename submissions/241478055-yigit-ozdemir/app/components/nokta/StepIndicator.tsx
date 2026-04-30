import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';

interface StepIndicatorProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: 'YAKALAMA' },
  { number: 2, label: 'ZENGİNLEŞTİR' },
  { number: 3, label: 'ÇIKTI' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step.number}>
            <View style={styles.stepItem}>
              {isActive && (
                <Animated.View
                  style={[
                    styles.glowRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              )}
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.dotNumber,
                      isActive && styles.dotNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isCompleted && styles.labelCompleted,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  stepItem: {
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: NoktaColors.accentGlow,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: NoktaColors.borderFocus,
    backgroundColor: NoktaColors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotActive: {
    borderColor: NoktaColors.accent,
    backgroundColor: NoktaColors.accentMuted,
  },
  dotCompleted: {
    borderColor: NoktaColors.accent,
    backgroundColor: NoktaColors.accent,
  },
  dotNumber: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '600',
  },
  dotNumberActive: {
    color: NoktaColors.accent,
  },
  checkmark: {
    fontSize: FontSize.xs,
    color: NoktaColors.bg,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    marginTop: Spacing.xs,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  labelActive: {
    color: NoktaColors.accent,
  },
  labelCompleted: {
    color: NoktaColors.textTertiary,
  },
  connector: {
    width: 40,
    height: 1.5,
    backgroundColor: NoktaColors.borderSubtle,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.sm,
  },
  connectorCompleted: {
    backgroundColor: NoktaColors.accent,
  },
});

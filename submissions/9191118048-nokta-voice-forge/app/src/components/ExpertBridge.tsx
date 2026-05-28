/**
 * ExpertBridge — STUCK detection and Jitsi expert call launcher
 * Animated warning states with call integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
  cancelAnimation,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, borderRadius, typography, animation, shadows } from '../theme';
import { ForgeState } from '../types';

interface ExpertBridgeProps {
  forgeState: ForgeState;
  onCallComplete: (summary: string) => void;
}

type AlertLevel = 'normal' | 'warning' | 'critical';

function getAlertLevel(forgeState: ForgeState): AlertLevel {
  if (forgeState.isStuck) return 'critical';
  if (forgeState.consecutiveFailures >= 2) return 'warning';
  return 'normal';
}

function getAlertColor(level: AlertLevel): string {
  switch (level) {
    case 'critical':
      return colors.error;
    case 'warning':
      return colors.warning;
    default:
      return colors.primary;
  }
}

// Phone icon SVG
const PhoneIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'white',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Warning icon SVG
const WarningIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = colors.warning,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 9v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={12} cy={17} r={0.5} fill={color} stroke={color} strokeWidth={1} />
  </Svg>
);

const ExpertBridge: React.FC<ExpertBridgeProps> = ({
  forgeState,
  onCallComplete,
}) => {
  const [callSummary, setCallSummary] = useState('');
  const [showSummaryInput, setShowSummaryInput] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [stuckDuration, setStuckDuration] = useState(0);

  const alertLevel = getAlertLevel(forgeState);
  const alertColor = getAlertColor(alertLevel);

  // Pulsing border animation
  const pulseAnim = useSharedValue(0);
  const borderGlow = useSharedValue(0);
  const warningSlide = useSharedValue(0);

  // STUCK timer
  const stuckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (forgeState.isStuck) {
      stuckTimerRef.current = setInterval(() => {
        setStuckDuration((d) => d + 1);
      }, 1000);
    } else {
      setStuckDuration(0);
      if (stuckTimerRef.current) clearInterval(stuckTimerRef.current);
    }
    return () => {
      if (stuckTimerRef.current) clearInterval(stuckTimerRef.current);
    };
  }, [forgeState.isStuck]);

  // Pulse animation for critical state
  useEffect(() => {
    if (alertLevel === 'critical') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      borderGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else if (alertLevel === 'warning') {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      borderGlow.value = withTiming(0.5);
    } else {
      cancelAnimation(pulseAnim);
      cancelAnimation(borderGlow);
      pulseAnim.value = withTiming(0, { duration: 300 });
      borderGlow.value = withTiming(0, { duration: 300 });
    }

    warningSlide.value = withSpring(
      alertLevel !== 'normal' ? 1 : 0,
      animation.springConfig
    );
  }, [alertLevel]);

  const containerAnimStyle = useAnimatedStyle(() => {
    const borderW = interpolate(borderGlow.value, [0, 1], [1, 2.5]);
    return {
      borderWidth: borderW,
      borderColor: interpolateColor(
        pulseAnim.value,
        [0, 1],
        [
          alertLevel === 'critical'
            ? 'rgba(255, 71, 87, 0.4)'
            : alertLevel === 'warning'
            ? 'rgba(255, 179, 71, 0.3)'
            : colors.border,
          alertLevel === 'critical'
            ? 'rgba(255, 71, 87, 0.9)'
            : alertLevel === 'warning'
            ? 'rgba(255, 179, 71, 0.7)'
            : colors.border,
        ]
      ),
    };
  });

  const bannerAnimStyle = useAnimatedStyle(() => ({
    opacity: warningSlide.value,
    transform: [
      {
        translateY: interpolate(warningSlide.value, [0, 1], [-20, 0]),
      },
    ],
  }));

  const pulseOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0, 0.12]),
  }));

  const handleCallExpert = useCallback(async () => {
    setIsInCall(true);
    const timestamp = Date.now();
    const roomUrl = `https://meet.jit.si/nokta-forge-9191118048-${timestamp}`;

    try {
      await WebBrowser.openBrowserAsync(roomUrl);
    } catch (e) {
      // Browser may have been dismissed
    }

    setIsInCall(false);
    setShowSummaryInput(true);
  }, []);

  const handleSubmitSummary = useCallback(() => {
    if (callSummary.trim()) {
      onCallComplete(callSummary.trim());
      setCallSummary('');
      setShowSummaryInput(false);
    }
  }, [callSummary, onCallComplete]);

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Find the last failing cycle
  const failingCycle = forgeState.cycles
    .slice()
    .reverse()
    .find((c: any) => c.result === 'FAIL' || c.result === 'STUCK' || c.result === 'ROLLBACK');

  return (
    <Animated.View style={[styles.container, containerAnimStyle]}>
      {/* Pulse overlay for critical */}
      {alertLevel === 'critical' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.pulseOverlay,
            pulseOverlayStyle,
          ]}
        />
      )}

      {/* ─── Warning Banner ───────────────── */}
      {alertLevel !== 'normal' && (
        <Animated.View
          style={[
            styles.warningBanner,
            { backgroundColor: `${alertColor}18` },
            bannerAnimStyle,
          ]}
        >
          <WarningIcon
            color={alertColor}
            size={18}
          />
          <Text style={[styles.warningText, { color: alertColor }]}>
            {alertLevel === 'critical'
              ? 'STUCK — Uzman yardımı gerekiyor!'
              : `Uyarı: ${forgeState.consecutiveFailures} ardışık başarısızlık`}
          </Text>
        </Animated.View>
      )}

      {/* ─── Status Indicators ────────────── */}
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Ardışık Hata</Text>
          <Text
            style={[
              styles.statusValue,
              {
                color:
                  forgeState.consecutiveFailures >= 3
                    ? colors.error
                    : forgeState.consecutiveFailures >= 2
                    ? colors.warning
                    : colors.text,
              },
            ]}
          >
            {forgeState.consecutiveFailures}
          </Text>
        </View>

        {forgeState.isStuck && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>STUCK Süresi</Text>
            <Text style={[styles.statusValue, { color: colors.error }]}>
              {formatDuration(stuckDuration)}
            </Text>
          </View>
        )}

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Toplam kg</Text>
          <Text style={[styles.statusValue, { color: colors.primary }]}>
            {forgeState.totalKg.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* ─── Failing Cycle Info ────────────── */}
      {failingCycle && alertLevel !== 'normal' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.cycleInfo}
        >
          <Text style={styles.cycleInfoTitle}>
            Döngü #{failingCycle.id}: {failingCycle.reportName}
          </Text>
          <Text style={styles.cycleInfoHypothesis} numberOfLines={2}>
            {failingCycle.hypothesis}
          </Text>
          <View style={styles.cycleInfoPhase}>
            <Text style={styles.phaseLabel}>
              Aşama: {failingCycle.currentPhase}
            </Text>
            <View
              style={[
                styles.resultBadge,
                {
                  backgroundColor:
                    failingCycle.result === 'STUCK'
                      ? `${colors.error}30`
                      : `${colors.warning}30`,
                },
              ]}
            >
              <Text
                style={[
                  styles.resultBadgeText,
                  {
                    color:
                      failingCycle.result === 'STUCK'
                        ? colors.error
                        : colors.warning,
                  },
                ]}
              >
                {failingCycle.result}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ─── STUCK Reason ─────────────────── */}
      {forgeState.isStuck && forgeState.stuckReason && (
        <View style={styles.stuckReasonBox}>
          <Text style={styles.stuckReasonLabel}>Sebep:</Text>
          <Text style={styles.stuckReasonText}>{forgeState.stuckReason}</Text>
        </View>
      )}

      {/* ─── Call Expert Button ───────────── */}
      <TouchableOpacity
        style={[
          styles.callButton,
          {
            backgroundColor:
              alertLevel === 'critical'
                ? colors.error
                : alertLevel === 'warning'
                ? colors.warning
                : colors.primary,
          },
          isInCall && styles.callButtonDisabled,
        ]}
        onPress={handleCallExpert}
        activeOpacity={0.8}
        disabled={isInCall}
      >
        <PhoneIcon
          size={22}
          color={alertLevel === 'warning' ? colors.textInverse : 'white'}
        />
        <Text
          style={[
            styles.callButtonText,
            alertLevel === 'warning' && { color: colors.textInverse },
          ]}
        >
          {isInCall ? 'Görüşme devam ediyor...' : 'Uzmana Bağlan'}
        </Text>
      </TouchableOpacity>

      {/* ─── Call Summary Input ────────────── */}
      {showSummaryInput && (
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={styles.summaryContainer}
        >
          <Text style={styles.summaryTitle}>Görüşme Özeti</Text>
          <TextInput
            style={styles.summaryInput}
            placeholder="Görüşmede ne konuşuldu?"
            placeholderTextColor={colors.textMuted}
            value={callSummary}
            onChangeText={setCallSummary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              !callSummary.trim() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitSummary}
            disabled={!callSummary.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Özeti Kaydet</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  pulseOverlay: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.bodyBold,
    fontSize: 14,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statusValue: {
    ...typography.subheading,
    fontSize: 22,
    fontVariant: ['tabular-nums'],
  },
  cycleInfo: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cycleInfoTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  cycleInfoHypothesis: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cycleInfoPhase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  resultBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  resultBadgeText: {
    ...typography.micro,
    fontSize: 10,
    letterSpacing: 1,
  },
  stuckReasonBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  stuckReasonLabel: {
    ...typography.micro,
    color: colors.error,
    marginBottom: 2,
  },
  stuckReasonText: {
    ...typography.caption,
    color: colors.text,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm + 2,
    ...shadows.md,
  },
  callButtonDisabled: {
    opacity: 0.6,
  },
  callButtonText: {
    ...typography.bodyBold,
    color: 'white',
    fontSize: 16,
  },
  summaryContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.bodyBold,
    color: 'white',
    fontSize: 15,
    minHeight: 80,
    marginBottom: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceGlass,
  },
  submitButtonText: {
    ...typography.bodyBold,
    color: 'white',
    fontSize: 14,
  },
});

export default ExpertBridge;

/**
 * VoiceVisualizer — Beautiful voice amplitude visualization
 * OpenAI voice-mode aesthetic with 32 symmetric bars
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Rect, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, typography, animation } from '../theme';

const BAR_COUNT = 32;
const BAR_WIDTH = 4;
const BAR_GAP = 3;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 150;
const TOTAL_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
const SVG_HEIGHT = MAX_BAR_HEIGHT + 20;
const SVG_WIDTH = TOTAL_WIDTH + 20;

interface VoiceVisualizerProps {
  amplitudes: number[];
  isSpeaking: boolean;
  dB: number;
  barCount?: number;
  style?: ViewStyle;
}

/** Generate bar color based on distance from center */
function getBarColor(index: number, totalCount: number): string {
  const center = totalCount / 2;
  const distFromCenter = Math.abs(index - center) / center;
  // Bright cyan at center → dim at edges
  const r = Math.round(0 + distFromCenter * 30);
  const g = Math.round(212 - distFromCenter * 140);
  const b = Math.round(170 - distFromCenter * 100);
  const a = 1.0 - distFromCenter * 0.55;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Symmetric reorder: center bars get highest amplitudes */
function symmetricIndex(index: number, total: number): number {
  const center = total / 2;
  const distFromCenter = Math.abs(index - center + 0.5);
  // Map: center → index 0 (highest), edges → last index (lowest)
  return Math.floor(distFromCenter);
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  amplitudes,
  isSpeaking,
  dB,
  barCount = BAR_COUNT,
  style,
}) => {
  const [barHeights, setBarHeights] = React.useState<number[]>(
    new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT)
  );
  const pulseAnim = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const statusOpacity = useSharedValue(0.5);
  const frameRef = useRef<number | null>(null);
  const targetHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));
  const currentHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));

  // Pulse animation for silence state
  useEffect(() => {
    pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
      -1,
      false
    );
    return () => cancelAnimation(pulseAnim);
  }, []);

  // Glow and status animations
  useEffect(() => {
    glowOpacity.value = withSpring(isSpeaking ? 0.8 : 0.1, animation.springGentle);
    statusOpacity.value = withSpring(isSpeaking ? 1 : 0.5, animation.springConfig);
  }, [isSpeaking]);

  // Calculate target heights from amplitudes
  useEffect(() => {
    const newTargets = new Array(barCount).fill(MIN_BAR_HEIGHT);
    for (let i = 0; i < barCount; i++) {
      const symIdx = symmetricIndex(i, barCount);
      const ampIdx = Math.min(symIdx, amplitudes.length - 1);
      const amp = amplitudes[ampIdx] ?? 0;
      const height = MIN_BAR_HEIGHT + amp * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
      newTargets[i] = Math.max(MIN_BAR_HEIGHT, Math.min(MAX_BAR_HEIGHT, height));
    }
    targetHeightsRef.current = newTargets;
  }, [amplitudes, barCount]);

  // Smooth ~60fps animation loop using requestAnimationFrame
  useEffect(() => {
    const LERP_FACTOR = 0.18;
    const animate = () => {
      const targets = targetHeightsRef.current;
      const current = currentHeightsRef.current;
      let needsUpdate = false;

      const newCurrent = current.map((val, i) => {
        const target = targets[i];
        const diff = target - val;
        if (Math.abs(diff) > 0.5) {
          needsUpdate = true;
          return val + diff * LERP_FACTOR;
        }
        return target;
      });

      if (needsUpdate) {
        currentHeightsRef.current = newCurrent;
        setBarHeights([...newCurrent]);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnim.value, [0, 1], [0.95, 1.05]);
    return {
      transform: [{ scale }],
    };
  });

  const barContainerStyle = isSpeaking ? undefined : pulseStyle;

  const dBDisplay = dB <= -160 ? '-∞' : `${Math.round(dB)} dB`;

  const totalWidth = barCount * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
  const svgWidth = totalWidth + 20;

  return (
    <View style={[styles.container, style]}>
      {/* Background glow */}
      <Animated.View style={[styles.glowBackground, glowStyle]}>
        <Svg width={svgWidth + 60} height={SVG_HEIGHT + 40} viewBox={`0 0 ${svgWidth + 60} ${SVG_HEIGHT + 40}`}>
          <Defs>
            <RadialGradient id="bgGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.25" />
              <Stop offset="60%" stopColor={colors.primary} stopOpacity="0.08" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={(svgWidth + 60) / 2}
            cy={(SVG_HEIGHT + 40) / 2}
            r={(SVG_HEIGHT + 40) / 2}
            fill="url(#bgGlow)"
          />
        </Svg>
      </Animated.View>

      {/* Bars */}
      <Animated.View style={barContainerStyle}>
        <Svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        >
          {barHeights.map((height, index) => {
            const x = 10 + index * (BAR_WIDTH + BAR_GAP);
            const y = SVG_HEIGHT / 2 - height / 2;
            const barColor = getBarColor(index, barCount);
            const barOpacity = isSpeaking
              ? 0.7 + (height / MAX_BAR_HEIGHT) * 0.3
              : 0.25 + (height / MAX_BAR_HEIGHT) * 0.15;

            return (
              <Rect
                key={index}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={height}
                rx={BAR_WIDTH / 2}
                ry={BAR_WIDTH / 2}
                fill={barColor}
                opacity={barOpacity}
              />
            );
          })}
        </Svg>
      </Animated.View>

      {/* dB Display */}
      <View style={styles.dbContainer}>
        <Text style={[styles.dbText, isSpeaking && styles.dbTextActive]}>
          {dBDisplay}
        </Text>
      </View>

      {/* Status Text */}
      <Animated.View style={statusStyle}>
        <Text style={[styles.statusText, isSpeaking && styles.statusTextActive]}>
          {isSpeaking ? 'Konuşuyor...' : 'Dinleniyor...'}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dbContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dbText: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  dbTextActive: {
    color: colors.primary,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  statusTextActive: {
    color: colors.primary,
  },
});

export default VoiceVisualizer;

/**
 * Nokta Voice Forge — WaveBackground Component
 * Animated background with 3 layered sine waves using SVG and Reanimated
 */

import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaveBackgroundProps {
  intensity?: number; // 0-1, controls wave amplitude
}

interface WaveConfig {
  amplitude: number;
  frequency: number;
  speed: number;      // duration for one full cycle in ms
  yOffset: number;     // vertical position ratio (0-1)
  color: string;
  opacity: number;
}

const WAVE_CONFIGS: WaveConfig[] = [
  {
    amplitude: 30,
    frequency: 1.5,
    speed: 8000,
    yOffset: 0.65,
    color: colors.primary,
    opacity: 0.06,
  },
  {
    amplitude: 22,
    frequency: 2.0,
    speed: 12000,
    yOffset: 0.72,
    color: colors.secondary,
    opacity: 0.04,
  },
  {
    amplitude: 18,
    frequency: 2.8,
    speed: 6000,
    yOffset: 0.80,
    color: colors.primary,
    opacity: 0.03,
  },
];

const NUM_SEGMENTS = 80;

/**
 * Build a smooth sine-wave SVG path string.
 */
function buildWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  yCenter: number
): string {
  const points: string[] = [];
  const segmentWidth = width / NUM_SEGMENTS;

  points.push(`M 0 ${height}`);
  points.push(`L 0 ${yCenter + amplitude * Math.sin(phase)}`);

  for (let i = 1; i <= NUM_SEGMENTS; i++) {
    const x = i * segmentWidth;
    const normalizedX = (i / NUM_SEGMENTS) * Math.PI * 2 * frequency;
    const y = yCenter + amplitude * Math.sin(normalizedX + phase);
    points.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  points.push(`L ${width} ${height}`);
  points.push('Z');

  return points.join(' ');
}

const WaveLayer: React.FC<{
  config: WaveConfig;
  width: number;
  height: number;
  intensity: number;
}> = ({ config, width, height, intensity }) => {
  const phase = useSharedValue(0);

  React.useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: config.speed,
        easing: Easing.linear,
      }),
      -1,  // infinite repeat
      false // no reverse
    );
  }, [config.speed]);

  const effectiveAmplitude = config.amplitude * Math.max(0, Math.min(1, intensity));
  const yCenter = height * config.yOffset;

  const animatedProps = useAnimatedProps(() => {
    // Rebuild the path at each animation frame based on current phase
    const p = phase.value;
    const segments: string[] = [];
    const segWidth = width / NUM_SEGMENTS;

    segments.push(`M 0 ${height}`);
    segments.push(
      `L 0 ${yCenter + effectiveAmplitude * Math.sin(p)}`
    );

    for (let i = 1; i <= NUM_SEGMENTS; i++) {
      const x = i * segWidth;
      const normalizedX = (i / NUM_SEGMENTS) * Math.PI * 2 * config.frequency;
      const y = yCenter + effectiveAmplitude * Math.sin(normalizedX + p);
      segments.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    segments.push(`L ${width} ${height}`);
    segments.push('Z');

    return {
      d: segments.join(' '),
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill={config.color}
      opacity={config.opacity}
    />
  );
};

const WaveBackground: React.FC<WaveBackgroundProps> = ({
  intensity = 0.7,
}) => {
  const { width, height } = useWindowDimensions();

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
      >
        {WAVE_CONFIGS.map((config, index) => (
          <WaveLayer
            key={index}
            config={config}
            width={width}
            height={height}
            intensity={intensity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: colors.background,
  },
});

export default WaveBackground;

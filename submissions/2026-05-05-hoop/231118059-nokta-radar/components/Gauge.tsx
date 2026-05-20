import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export default function Gauge({ score, size = 160, strokeWidth = 15 }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const halfCircle = circumference / 2;

  const animatedScore = useSharedValue(0);

  useEffect(() => {
    animatedScore.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = halfCircle - (animatedScore.value / 100) * halfCircle;
    return {
      strokeDashoffset,
    };
  });

  // Calculate color based on score. High slop (e.g. > 70) = red, low slop = green.
  // We'll just define basic colors for the static representation for simplicity,
  // or use a generic engineering accent.
  const isSlop = score > 50;
  const color = isSlop ? '#FF003C' : '#00FF41'; // Cyberpunk-ish red and green

  return (
    <View style={[styles.container, { width: size, height: size / 2 + strokeWidth }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-180" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a1a1a"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={halfCircle}
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.label}>SLOP SCORE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  label: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginTop: -5,
  },
});

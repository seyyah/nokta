import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';

interface Props {
  score: number; // 0-100
}

const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const SlopGauge: React.FC<Props> = ({ score }) => {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  function scoreColor(score: number): string {
    if (score < 35) return colors.success;
    if (score < 65) return colors.warning;
    return colors.error;
  }

  function scoreLabel(score: number): string {
    if (score < 35) return 'TEMİZ';
    if (score < 65) return 'ŞÜPHELI';
    return 'SLOP!';
  }

  const color = scoreColor(score);
  const label = scoreLabel(score);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.centerText}>
        <Animated.Text style={[styles.scoreNumber, { color }]}>{score}</Animated.Text>
        <Text style={[styles.scorePercent, { color: colors.textMuted }]}>/100</Text>
        <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
  scorePercent: {
    fontSize: 13,
    marginTop: -4,
    fontWeight: '500',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
});

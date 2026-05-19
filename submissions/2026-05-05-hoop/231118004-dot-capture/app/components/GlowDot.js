import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function GlowDot({ size = 24, phase = 'idle', style }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const dotColor =
    phase === 'complete' ? colors.dotComplete :
    phase === 'active' ? colors.dotActive :
    colors.dotIdle;

  const dotSize =
    phase === 'complete' ? size * 2.5 :
    phase === 'active' ? size * 1.6 :
    size;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.container, { width: dotSize * 3, height: dotSize * 3 }, style]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: dotSize * 2.8,
            height: dotSize * 2.8,
            borderRadius: dotSize * 1.4,
            borderColor: dotColor,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Middle ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: dotSize * 2,
            height: dotSize * 2,
            borderRadius: dotSize,
            borderColor: dotColor,
            opacity: Animated.multiply(glowAnim, 0.6),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Core dot */}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dotColor,
            shadowColor: dotColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  dot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
});

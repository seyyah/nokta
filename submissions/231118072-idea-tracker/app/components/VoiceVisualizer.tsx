import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  amplitude: number; // 0 to 1
  barCount?: number;
  color?: string;
}

export function VoiceVisualizer({ amplitude, barCount = 7, color = '#6C63FF' }: Props) {
  // Array of animated values for each bar height
  const anims = useRef(Array.from({ length: barCount }, () => new Animated.Value(4))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      // Create a center-biased scaling factor (center bars jump higher, outer bars stay lower)
      const centerFactor = 1 - Math.abs(i - (barCount - 1) / 2) / (barCount / 2);
      
      // Calculate target height: baseline is 6px, max height is 60px
      const randomNoise = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
      const targetHeight = 6 + amplitude * 54 * centerFactor * randomNoise;

      Animated.timing(anim, {
        toValue: targetHeight,
        duration: 80,
        useNativeDriver: false,
      }).start();
    });
  }, [amplitude, barCount]);

  return (
    <View style={styles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: anim,
              backgroundColor: color,
              // Shadow glow effect
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 4,
              shadowOpacity: 0.5,
              elevation: 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 6,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
});

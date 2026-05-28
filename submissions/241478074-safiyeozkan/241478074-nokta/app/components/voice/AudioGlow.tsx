import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  intensity: number;
  color?: string;
}

function AudioGlow({ intensity, color = '#8B5CF6' }: Props) {
  const opacity = Math.min(0.45, Math.max(0.06, intensity * 0.35));
  return (
    <View style={styles.glowContainer} pointerEvents="none">
      <View
        style={[
          styles.glow,
          {
            backgroundColor: color,
            shadowColor: color,
            opacity,
            transform: [{ scale: 0.9 + intensity * 0.7 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});

export default memo(AudioGlow);

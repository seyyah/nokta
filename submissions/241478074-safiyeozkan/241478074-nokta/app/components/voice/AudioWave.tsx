import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  bins: number[];
  accent?: string;
}

function AudioWave({ bins, accent = '#8B5CF6' }: Props) {
  return (
    <View style={styles.waveContainer}>
      {bins.map((value, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              height: Math.max(6, value * 90),
              backgroundColor: accent,
              opacity: 0.4 + value * 0.55,
              transform: [{ translateY: (1 - value) * 20 }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 18,
    minHeight: 84,
    backgroundColor: '#0b0b11',
    borderRadius: 20,
  },
  segment: {
    width: 4,
    borderRadius: 999,
  },
});

export default memo(AudioWave);

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  bins: number[];
  accent?: string;
}

function AudioBars({ bins, accent = '#8B5CF6' }: Props) {
  return (
    <View style={styles.row}>
      {bins.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: Math.max(4, value * 110),
              backgroundColor: accent,
              opacity: 0.45 + value * 0.55,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    minHeight: 120,
  },
  bar: {
    width: 8,
    borderRadius: 999,
  },
});

export default memo(AudioBars);

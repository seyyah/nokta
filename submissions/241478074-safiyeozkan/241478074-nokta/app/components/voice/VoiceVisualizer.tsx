
import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AudioBars from './AudioBars';
import AudioGlow from './AudioGlow';

interface Props {
  bins: number[];
  amplitude: number;
  label?: string;
}

function VoiceVisualizer({ bins, amplitude, label }: Props) {
  return (
    <View style={styles.container}>
      <AudioGlow intensity={amplitude} color="#8B5CF6" />
      <View style={styles.panel}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <AudioBars bins={bins} accent="#a78bfa" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  panel: {
    width: '100%',
    backgroundColor: 'rgba(30, 23, 60, 0.42)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    padding: 14,
  },
  label: {
    color: '#c8a96e',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});

export default memo(VoiceVisualizer);

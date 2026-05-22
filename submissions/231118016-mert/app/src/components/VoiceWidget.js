import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

const BAR_COUNT = 24;

export default function VoiceWidget({ isRecording, onToggleRecord }) {
  const bars = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      animateBars(true);
    } else {
      animateBars(false);
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isRecording]);

  const animateBars = (active) => {
    if (!active) {
      if (animationRef.current) clearInterval(animationRef.current);
      bars.forEach((bar) => Animated.spring(bar, { toValue: 4, useNativeDriver: false }).start());
      return;
    }
    animationRef.current = setInterval(() => {
      bars.forEach((bar) => {
        const height = active ? Math.random() * 40 + 8 : 4;
        Animated.spring(bar, {
          toValue: height,
          useNativeDriver: false,
          speed: 20,
          bounciness: 6,
        }).start();
      });
    }, 80);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
        onPress={onToggleRecord}
        activeOpacity={0.8}
      >
        <View style={[styles.recordDot, isRecording && styles.recordDotActive]} />
      </TouchableOpacity>
      
      <View style={styles.visualizer}>
        {bars.map((bar, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: bar,
                backgroundColor: isRecording ? `hsl(${200 + i * 3}, 80%, 60%)` : '#cbd5e1',
                opacity: isRecording ? 1 : 0.4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  visualizer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 4,
  },
  recordBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  recordDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
  },
  recordDotActive: {
    borderRadius: 4,
    width: 14,
    height: 14,
  },
});

/**
 * VoiceVisualizer.tsx
 * expo-av ile mikrofon girişi yakalar, RMS metering üzerinden
 * bar animasyonu üretir. OpenAI voice-mode estetiği.
 *
 * Özellikler:
 *  - 20 bar, her 50ms güncelleme
 *  - Sessizlikte söner, konuşunca canlanır
 *  - Latency hedefi < 200ms
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';

const BAR_COUNT = 20;
const UPDATE_INTERVAL_MS = 50;
const SILENCE_THRESHOLD = -50; // dBFS

// Ağırlıklı bar yüksekliği — ortada daha yüksek
const BAR_WEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const center = (BAR_COUNT - 1) / 2;
  const distance = Math.abs(i - center) / center;
  return 1 - distance * 0.4; // ortadakiler %100, kenarlar %60
});

interface Props {
  isListening: boolean;
  color?: string;
  barWidth?: number;
  maxBarHeight?: number;
  style?: any;
}

export default function VoiceVisualizer({
  isListening,
  color = '#00E5FF',
  barWidth = 4,
  maxBarHeight = 80,
  style,
}: Props) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(3))
  ).current;

  // Idle animasyonu — sessizde minimal pulsing
  const idleAnimations = useRef<Animated.CompositeAnimation[]>([]);

  const startIdleAnimation = useCallback(() => {
    idleAnimations.current.forEach(anim => anim.stop());
    idleAnimations.current = animatedValues.map((val, i) => {
      const delay = (i / BAR_COUNT) * 600;
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 6 + Math.random() * 4,
            duration: 800 + Math.random() * 400,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: 3,
            duration: 800 + Math.random() * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      );
      anim.start();
      return anim;
    });
  }, [animatedValues]);

  const stopIdleAnimation = useCallback(() => {
    idleAnimations.current.forEach(anim => anim.stop());
    idleAnimations.current = [];
  }, []);

  const updateBarsFromLevel = useCallback((metering: number) => {
    // metering: dBFS, -160 (sessiz) ile 0 (max) arası
    const normalized = Math.max(0, (metering - SILENCE_THRESHOLD) / Math.abs(SILENCE_THRESHOLD));
    const clamped = Math.min(1, normalized);

    animatedValues.forEach((val, i) => {
      const weight = BAR_WEIGHTS[i];
      // Rastgele sapma ile doğallık kat
      const jitter = 0.7 + Math.random() * 0.6;
      const targetHeight = Math.max(3, clamped * maxBarHeight * weight * jitter);

      Animated.timing(val, {
        toValue: targetHeight,
        duration: UPDATE_INTERVAL_MS * 1.2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [animatedValues, maxBarHeight]);

  // Mikrofon başlat/durdur
  useEffect(() => {
    if (isListening) {
      startMic();
    } else {
      stopMic();
      startIdleAnimation();
    }
    return () => {
      stopMic();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // Başlangıçta idle animasyonu
  useEffect(() => {
    startIdleAnimation();
    return () => stopIdleAnimation();
  }, [startIdleAnimation, stopIdleAnimation]);

  const startMic = async () => {
    try {
      stopIdleAnimation();
      // Barları sıfırla
      animatedValues.forEach(val => val.setValue(3));

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        },
        undefined,
        UPDATE_INTERVAL_MS
      );
      recordingRef.current = recording;

      intervalRef.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            updateBarsFromLevel(status.metering);
          }
        } catch {
          // Recording durmuş olabilir, sessizce atla
        }
      }, UPDATE_INTERVAL_MS);

    } catch (err) {
      console.warn('[VoiceVisualizer] Mic error:', err);
      startIdleAnimation();
    }
  };

  const stopMic = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // zaten durmuş
      }
      recordingRef.current = null;
    }
    // Barları yavaşça sıfırla
    animatedValues.forEach(val => {
      Animated.timing(val, {
        toValue: 3,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  };

  const gap = barWidth * 0.6;
  const totalWidth = BAR_COUNT * barWidth + (BAR_COUNT - 1) * gap;

  return (
    <View style={[styles.container, { width: totalWidth }, style]}>
      {animatedValues.map((val, i) => {
        // Renk: aktifken cyan→yeşil gradient efekti
        const barColor = isListening
          ? i % 3 === 0 ? color : i % 3 === 1 ? '#00FF88' : '#00CFFF'
          : `${color}55`;

        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: val,
                backgroundColor: barColor,
                borderRadius: barWidth / 2,
                marginHorizontal: gap / 2,
                opacity: isListening ? 1 : 0.4,
                shadowColor: barColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isListening ? 0.8 : 0.2,
                shadowRadius: 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  bar: {
    // Base styles, dynamic override above
  },
});

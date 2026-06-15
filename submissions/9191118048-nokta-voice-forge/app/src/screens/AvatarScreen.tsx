/**
 * AvatarScreen — Avatar Chat
 * Clean UI: centred 3D avatar, voice visualizer bars, mic button.
 * No persona tabs, no speech bubble clutter.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList } from '../types';
import AvatarScene from '../components/AvatarScene';

type Props = NativeStackScreenProps<RootStackParamList, 'Avatar'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VISUALIZER_BARS = 20;
const MIC_SIZE = 68;

function generateBands(amplitude: number): number[] {
  const bands: number[] = [];
  const center = VISUALIZER_BARS / 2;
  for (let i = 0; i < VISUALIZER_BARS; i++) {
    const dist = Math.abs(i - center) / center;
    const g = Math.exp(-dist * dist * 2.5);
    const jitter = 0.7 + Math.random() * 0.6;
    bands.push(Math.min(1, Math.max(0, amplitude * g * jitter)));
  }
  return bands;
}

export default function AvatarScreen({ navigation }: Props) {
  const meterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef     = useRef<Audio.Recording | null>(null);

  const [isRecording, setIsRecording]         = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  const [bands, setBands] = useState<number[]>(new Array(VISUALIZER_BARS).fill(0));

  const micScale = useSharedValue(1);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = useCallback(() => {
    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
      meterIntervalRef.current = null;
    }
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
    setSpeakingIntensity(0);
    setBands(new Array(VISUALIZER_BARS).fill(0));
  }, []);

  // ── Real microphone metering ──
  const startRealMetering = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn('[AvatarScreen] Mic permission denied, using demo metering');
        startDemoMetering();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        { ...Audio.RecordingOptionsPresets.LOW_QUALITY, isMeteringEnabled: true },
        undefined,
        80,
      );
      recordingRef.current = recording;

      meterIntervalRef.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            // metering is in dBFS (-160..0). Normalise to 0..1
            const db = status.metering;
            const norm = Math.max(0, Math.min(1, (db + 60) / 60));
            setSpeakingIntensity(norm);
            setBands(generateBands(norm));
          }
        } catch { /* recording might have stopped */ }
      }, 80);
    } catch (err) {
      console.warn('[AvatarScreen] Mic init failed, falling back to demo:', err);
      startDemoMetering();
    }
  }, []);

  // ── Demo metering fallback (no mic) ──
  const startDemoMetering = useCallback(() => {
    let tick = 0;
    meterIntervalRef.current = setInterval(() => {
      tick++;
      const pulse = Math.abs(Math.sin(tick * 0.7));
      const amp = Math.min(1, 0.2 + pulse * 0.65 + Math.random() * 0.15);
      setSpeakingIntensity(amp);
      setBands(generateBands(amp));
    }, 90);
  }, []);

  // ── Toggle ──
  const handleToggle = useCallback(async () => {
    if (isRecording) {
      stopEverything();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      await startRealMetering();
    }
  }, [isRecording, stopEverything, startRealMetering]);

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>

        {/* ── 3D Avatar ── */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.avatarArea}>
          <AvatarScene
            speakingIntensity={isRecording ? speakingIntensity : 0}
          />
        </Animated.View>

        {/* ── Mini visualizer ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.vizContainer}>
          <View style={styles.vizBars}>
            {bands.map((amp, i) => (
              <View
                key={i}
                style={[
                  styles.vizBar,
                  {
                    height: 6 + amp * 30,
                    opacity: isRecording ? 0.85 : 0.2,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Mic button ── */}
        <View style={styles.micArea}>
          {isRecording && <View style={styles.micPulse} />}
          <Animated.View style={micStyle}>
            <Pressable
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              onPressIn={() => { micScale.value = withSpring(0.88, animation.springBouncy); }}
              onPressOut={() => { micScale.value = withSpring(1, animation.springBouncy); }}
              onPress={handleToggle}
            >
              <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
            </Pressable>
          </Animated.View>
          <Text style={styles.micLabel}>
            {isRecording ? 'Dinliyor… Durdurmak için dokun' : 'Konuşmak için dokun'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe:      { flex: 1 },

  // Avatar
  avatarArea: {
    flex: 1,
    marginTop: spacing.sm,
  },

  // Visualizer
  vizContainer: {
    height: 48,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vizBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
    height: '100%',
  },
  vizBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  // Mic
  micArea: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  micPulse: {
    position: 'absolute',
    width: MIC_SIZE + 22,
    height: MIC_SIZE + 22,
    borderRadius: (MIC_SIZE + 22) / 2,
    backgroundColor: 'rgba(0,212,170,0.2)',
  },
  micBtn: {
    width: MIC_SIZE,
    height: MIC_SIZE,
    borderRadius: MIC_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceGlass,
    ...shadows.md,
  },
  micBtnActive: {
    backgroundColor: colors.error,
    borderColor: colors.accent,
  },
  micIcon: { fontSize: 26 },
  micLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

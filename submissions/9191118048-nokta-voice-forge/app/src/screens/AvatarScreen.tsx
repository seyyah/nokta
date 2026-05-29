/**
 * AvatarScreen — Avatar Chat with Persona Switching & Lipsync
 * AvatarPersona responds to voice, speech bubble, mini visualizer, mock conversation
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInDown,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation, personaThemes } from '../theme';
import { RootStackParamList, PersonaId } from '../types';
import AvatarScene from '../components/AvatarScene';

type Props = NativeStackScreenProps<RootStackParamList, 'Avatar'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_VISUALIZER_BARS = 16;
const MIC_BUTTON_SIZE = 64;

const AVATAR_RESPONSES: Record<PersonaId, string[]> = {
  junior: [
    'Vay, çok güzel konuştun! Devam et! 🎉',
    'Hmm, bunu daha önce düşünmemiştim. İlginç! 🤔',
    'Harika! Birlikte öğrenmeye devam edelim! 📚',
    'Sesini duydum! Merak ettim, başka neler söyleyeceksin? 🌟',
    'Bu çok heyecan verici! Daha fazla anlat! 🚀',
  ],
  senior: [
    'Analiz ediyorum... İlginç bir yaklaşım. 📊',
    'Verilere göre doğru yoldasın. Devam et.',
    'Bu hipotezi test etmemiz gerekiyor. Forge döngüsüne ekleyelim.',
    'Performans metrikleri pozitif görünüyor. İyi iş.',
    'Stratejik olarak bu yaklaşımı öneriyorum. 🎯',
  ],
};

function generateMiniBands(amplitude: number): number[] {
  const bands: number[] = [];
  const center = MINI_VISUALIZER_BARS / 2;
  for (let i = 0; i < MINI_VISUALIZER_BARS; i++) {
    const dist = Math.abs(i - center) / center;
    const gaussian = Math.exp(-dist * dist * 2.5);
    const randomVar = 0.6 + Math.random() * 0.8;
    bands.push(Math.min(1, Math.max(0, amplitude * gaussian * randomVar)));
  }
  return bands;
}

export default function AvatarScreen({ navigation }: Props) {
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoMeterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordToggleBusyRef = useRef(false);

  const [currentPersona, setCurrentPersona] = useState<PersonaId>('junior');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  const [speechText, setSpeechText] = useState<string>(
    personaThemes.junior.tone,
  );
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [bands, setBands] = useState<number[]>(
    new Array(MINI_VISUALIZER_BARS).fill(0),
  );

  // Animations
  const micScale = useSharedValue(1);
  const speechBubbleOpacity = useSharedValue(1);

  const stopMetering = useCallback(() => {
    if (demoMeterIntervalRef.current) {
      clearInterval(demoMeterIntervalRef.current);
      demoMeterIntervalRef.current = null;
    }
    setSpeakingIntensity(0);
    setBands(new Array(MINI_VISUALIZER_BARS).fill(0));
  }, []);

  const startSafeDemoMetering = useCallback(() => {
    if (demoMeterIntervalRef.current) {
      clearInterval(demoMeterIntervalRef.current);
    }

    let tick = 0;
    demoMeterIntervalRef.current = setInterval(() => {
      tick += 1;
      const syllablePulse = Math.abs(Math.sin(tick * 0.72));
      const jitter = 0.12 + Math.random() * 0.18;
      const demoAmplitude = Math.min(1, 0.22 + syllablePulse * 0.66 + jitter);
      setSpeakingIntensity(demoAmplitude);
      setBands(generateMiniBands(demoAmplitude));
    }, 90);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMetering();
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    };
  }, [stopMetering]);

  // Mock avatar response after user stops recording
  const triggerAvatarResponse = useCallback(() => {
    const responses = AVATAR_RESPONSES[currentPersona];
    const randomIdx = Math.floor(Math.random() * responses.length);

    setIsAvatarSpeaking(true);
    speechBubbleOpacity.value = withTiming(0, { duration: 150 }, () => {
      speechBubbleOpacity.value = withTiming(1, { duration: 300 });
    });

    // Simulate avatar typing / speaking
    responseTimeoutRef.current = setTimeout(() => {
      setSpeechText(responses[randomIdx]);
      setIsAvatarSpeaking(false);
    }, 1200);
  }, [currentPersona, speechBubbleOpacity]);

  const handleRecordToggle = useCallback(() => {
    if (isRecordToggleBusyRef.current) {
      return;
    }

    isRecordToggleBusyRef.current = true;

    if (isRecording) {
      stopMetering();
      setIsRecording(false);
      triggerAvatarResponse();
      isRecordToggleBusyRef.current = false;
    } else {
      if (true) {
        console.warn('[AvatarScreen] Using crash-safe animated avatar mode.');
        startSafeDemoMetering();
        setIsRecording(true);
        isRecordToggleBusyRef.current = false;
        return;
      }

      if (false) {
        startSafeDemoMetering();
        setIsRecording(true);
        isRecordToggleBusyRef.current = false;
        Alert.alert(
          'Mikrofon başlatılamadı',
          'Lütfen mikrofon iznini kontrol edin ve tekrar deneyin.'
        );
        return;
      }

      setIsRecording(true);
      isRecordToggleBusyRef.current = false;
    }
  }, [isRecording, startSafeDemoMetering, stopMetering, triggerAvatarResponse]);

  const handlePersonaSwitch = useCallback(
    (persona: PersonaId) => {
      setCurrentPersona(persona);
      const theme = personaThemes[persona];
      setSpeechText(theme.tone);
    },
    [],
  );

  const handleMicPressIn = useCallback(() => {
    micScale.value = withSpring(0.88, animation.springBouncy);
  }, [micScale]);

  const handleMicPressOut = useCallback(() => {
    micScale.value = withSpring(1, animation.springBouncy);
  }, [micScale]);

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const speechBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: speechBubbleOpacity.value,
  }));

  const theme = personaThemes[currentPersona];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Persona Toggle */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.personaToggle}
        >
          <Pressable
            style={[
              styles.personaButton,
              currentPersona === 'junior' && styles.personaButtonActiveJunior,
            ]}
            onPress={() => handlePersonaSwitch('junior')}
          >
            <Text
              style={[
                styles.personaButtonText,
                currentPersona === 'junior' && styles.personaButtonTextActive,
              ]}
            >
              Junior-Sen
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.personaButton,
              currentPersona === 'senior' && styles.personaButtonActiveSenior,
            ]}
            onPress={() => handlePersonaSwitch('senior')}
          >
            <Text
              style={[
                styles.personaButtonText,
                currentPersona === 'senior' && styles.personaButtonTextActive,
              ]}
            >
              Senior-Sen
            </Text>
          </Pressable>
        </Animated.View>

        {/* Avatar Display */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.avatarContainer}
        >
          <AvatarScene
            speakingIntensity={isRecording ? speakingIntensity : (isAvatarSpeaking ? 0.4 : 0)}
            persona={currentPersona}
          />
        </Animated.View>

        {/* Speech Bubble */}
        <Animated.View
          entering={SlideInDown.delay(300).duration(500).springify()}
          style={[styles.speechBubbleContainer, speechBubbleAnimatedStyle]}
        >
          <View
            style={[
              styles.speechBubble,
              { borderColor: theme.primaryColor + '40' },
            ]}
          >
            <View style={styles.speechBubbleArrow} />
            <Text style={styles.speechBubbleLabel}>{theme.name}</Text>
            <Text style={styles.speechBubbleText}>{speechText}</Text>
            {isAvatarSpeaking && (
              <Text style={styles.typingIndicator}>düşünüyor...</Text>
            )}
          </View>
        </Animated.View>

        {/* Mini Voice Visualizer */}
        <View style={styles.miniVisualizerContainer}>
          <View style={styles.safeBars}>
            {bands.map((amplitude, index) => (
              <View
                key={index}
                style={[
                  styles.safeBar,
                  {
                    height: 6 + amplitude * 28,
                    opacity: isRecording ? 0.85 : 0.24,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Mic Button */}
        <View style={styles.micButtonArea}>
          {isRecording && (
            <View
              style={[
                styles.micPulseRing,
                {
                  backgroundColor:
                    currentPersona === 'junior'
                      ? 'rgba(0,212,170,0.25)'
                      : 'rgba(124,92,252,0.25)',
                },
              ]}
            />
          )}
          <Animated.View style={micAnimatedStyle}>
            <Pressable
              style={[
                styles.micButton,
                isRecording
                  ? {
                      backgroundColor: colors.error,
                      borderColor: colors.accent,
                    }
                  : {
                      backgroundColor: theme.primaryColor + '20',
                      borderColor: theme.primaryColor,
                    },
              ]}
              onPressIn={handleMicPressIn}
              onPressOut={handleMicPressOut}
              onPress={handleRecordToggle}
            >
              <Text style={styles.micButtonIcon}>
                {isRecording ? '⏹️' : '🎙️'}
              </Text>
            </Pressable>
          </Animated.View>
          <Text style={styles.micLabel}>
            {isRecording ? 'Dinliyor... Durdurmak için dokun' : 'Konuşmak için dokun'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  personaToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  personaButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  personaButtonActiveJunior: {
    backgroundColor: colors.primaryGlow,
  },
  personaButtonActiveSenior: {
    backgroundColor: colors.secondaryGlow,
  },
  personaButtonText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  personaButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  avatarContainer: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
  },
  speechBubbleContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  speechBubble: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'relative',
  },
  speechBubbleArrow: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surfaceGlass,
  },
  speechBubbleLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  speechBubbleText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  typingIndicator: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  miniVisualizerContainer: {
    height: 48,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniVisualizer: {
    width: '100%',
    height: '100%',
  },
  safeBars: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  safeBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  micButtonArea: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  micPulseRing: {
    position: 'absolute',
    width: MIC_BUTTON_SIZE + 20,
    height: MIC_BUTTON_SIZE + 20,
    borderRadius: (MIC_BUTTON_SIZE + 20) / 2,
  },
  micButton: {
    width: MIC_BUTTON_SIZE,
    height: MIC_BUTTON_SIZE,
    borderRadius: MIC_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...shadows.md,
  },
  micButtonIcon: {
    fontSize: 24,
  },
  micLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

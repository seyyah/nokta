/**
 * VoiceScreen — Voice Visualizer with Recording & Live Visualization
 * Generates Real STT Transcriptions and Markdown Audit Reports.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
  cancelAnimation,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList, AuditReport } from '../types';
import VoiceVisualizer from '../components/VoiceVisualizer';
import { AudioService } from '../services/audioService';
import { transcribeAudio, generateAuditReportMarkdown } from '../services/sttService';
import StorageService from '../services/storageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Voice'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const RECORD_BUTTON_SIZE = 72;
const NUM_BANDS = 32;

export default function VoiceScreen({ navigation }: Props) {
  const audioServiceRef = useRef(new AudioService());

  const [isRecording, setIsRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [dB, setDB] = useState(-160);
  const [bands, setBands] = useState<number[]>(new Array(NUM_BANDS).fill(0));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sttText, setSttText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.6, { duration: 1000, easing: Easing.out(Easing.ease) }),
        -1,
        true,
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording, pulseScale, pulseOpacity]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      setDuration(0);
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const stopMetering = useCallback(() => {
    setAmplitude(0);
    setDB(-160);
    setIsSpeaking(false);
    setBands(new Array(NUM_BANDS).fill(0));
  }, []);

  useEffect(() => {
    return () => {
      stopMetering();
      audioServiceRef.current.stopRecording().catch(() => {});
    };
  }, [stopMetering]);

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      // STOP RECORDING
      try {
        const fileUri = await audioServiceRef.current.stopRecording();
        stopMetering();
        setIsRecording(false);
        setIsProcessing(true);
        setSttText('🎙️ Transkripsiyon işleniyor...');

        if (fileUri) {
          const result = await transcribeAudio(fileUri, duration * 1000);
          setSttText(result.text);

          // Generate Audit Report
          const markdown = generateAuditReportMarkdown(result.text, !!result.isRealSTT);
          const newReport: AuditReport = {
            id: `report-${Date.now()}`,
            screenName: 'Voice Generator',
            timestamp: new Date().toISOString(),
            note: result.text,
            markdownContent: markdown,
            screenshotUri: null,
            severity: 'high',
            status: 'open',
          };

          const existingReports = await StorageService.loadAuditReports();
          await StorageService.saveAuditReports([newReport, ...existingReports]);

          Alert.alert(
            'Rapor Oluşturuldu',
            'Ses kaydınız transkript edildi ve Markdown denetim raporu Audit Reports sekmesine kaydedildi.',
            [
              { text: 'Tamam' },
              { text: 'Raporlara Git', onPress: () => navigation.navigate('Audit') }
            ]
          );
        }
      } catch (e) {
        console.error('STT Flow Error:', e);
        setSttText('❌ Transkripsiyon sırasında bir hata oluştu.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // START RECORDING
      try {
        setSttText('');
        const didStart = await audioServiceRef.current.startRecording((meter) => {
          setAmplitude(meter.amplitude);
          setDB(meter.dB);
          setIsSpeaking(meter.isSpeaking);
          setBands(meter.bands);
        });
        if (!didStart) {
          setSttText('Mikrofon başlatılamadı. Lütfen mikrofon iznini kontrol edin.');
          return;
        }
      } catch (e) {
        console.error('Recording start error:', e);
        setSttText('Mikrofon başlatılamadı. Lütfen mikrofon iznini kontrol edin.');
        return;
      }
      setIsRecording(true);
    }
  }, [isRecording, stopMetering, duration, navigation]);

  const handlePressIn = useCallback(() => {
    buttonScale.value = withSpring(0.9, animation.springBouncy);
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(1, animation.springBouncy);
  }, [buttonScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.visualizerContainer}>
            <VoiceVisualizer
              amplitudes={bands}
              isSpeaking={isRecording}
              dB={dB}
              barCount={NUM_BANDS}
              style={styles.visualizer}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statusArea}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isSpeaking ? colors.primary : colors.textMuted },
                ]}
              />
              <Text style={styles.statusText}>
                {isRecording
                  ? isSpeaking
                    ? 'Konuşuyor...'
                    : 'Dinleniyor...'
                  : 'Hazır'}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>dB</Text>
                <Text style={styles.metricValue}>{dB.toFixed(1)}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Amplitude</Text>
                <Text style={styles.metricValue}>{amplitude.toFixed(3)}</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.recordButtonArea}>
            {isRecording && <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />}

            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                style={[
                  styles.recordButton,
                  isRecording ? styles.recordButtonActive : styles.recordButtonIdle,
                  isProcessing && styles.recordButtonDisabled,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleRecordToggle}
                disabled={isProcessing}
              >
                <Text style={styles.recordButtonIcon}>
                  {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎙️'}
                </Text>
              </Pressable>
            </Animated.View>

            <Text style={styles.durationText}>
              {isRecording ? formatDuration(duration) : 'Kayda başlamak için bas'}
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sttContainer}>
            <Text style={styles.sttLabel}>📝 Transkripsiyon & Rapor</Text>
            <View style={styles.sttBox}>
              <Text style={styles.sttText}>
                {sttText || 'Kayıt bittiğinde STT sonucu ve denetim raporu burada gösterilecek...'}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  visualizerContainer: {
    height: SCREEN_HEIGHT * 0.32,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizer: { width: '100%', height: '100%' },
  statusArea: { marginTop: spacing.lg, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.caption, color: colors.textSecondary },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  metricItem: { alignItems: 'center', flex: 1 },
  metricLabel: { ...typography.micro, color: colors.textMuted, marginBottom: spacing.xs },
  metricValue: { ...typography.bodyBold, color: colors.primary, fontSize: 14, fontVariant: ['tabular-nums'] },
  metricDivider: { width: 1, height: 28, backgroundColor: colors.border },
  recordButtonArea: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  pulseRing: {
    position: 'absolute',
    width: RECORD_BUTTON_SIZE + 24,
    height: RECORD_BUTTON_SIZE + 24,
    borderRadius: (RECORD_BUTTON_SIZE + 24) / 2,
    backgroundColor: 'rgba(255, 71, 87, 0.3)',
  },
  recordButton: {
    width: RECORD_BUTTON_SIZE,
    height: RECORD_BUTTON_SIZE,
    borderRadius: RECORD_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  recordButtonIdle: { backgroundColor: colors.surfaceLight, borderWidth: 2, borderColor: colors.borderLight },
  recordButtonActive: { backgroundColor: colors.error, borderWidth: 2, borderColor: colors.accent },
  recordButtonDisabled: { opacity: 0.5 },
  recordButtonIcon: { fontSize: 28 },
  durationText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md, fontVariant: ['tabular-nums'] },
  sttContainer: { marginTop: spacing.md },
  sttLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  sttBox: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  sttText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});

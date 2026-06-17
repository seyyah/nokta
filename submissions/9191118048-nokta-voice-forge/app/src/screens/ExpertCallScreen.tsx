/**
 * ExpertCallScreen — Expert Video Call Bridge
 * STUCK status, Jitsi launch, post-call summary, call history
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  cancelAnimation,
} from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList, ExpertCall } from '../types';
import AnimatedButton from '../components/AnimatedButton';
import GlassCard from '../components/GlassCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpertCall'>;

import StorageService from '../services/storageService';

const JITSI_ROOM_NAME = 'nokta-voice-forge-9191118048';
const JITSI_URL = `https://meet.jit.si/${JITSI_ROOM_NAME}`;

export default function ExpertCallScreen({ navigation, route }: Props) {
  const stuckReason = route.params?.stuckReason ?? 'Ardışık başarısızlıklar tespit edildi';

  const [callHistory, setCallHistory] = useState<ExpertCall[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await StorageService.loadExpertCalls();
      setCallHistory(history);
    };
    loadHistory();
  }, []);
  const [summaryText, setSummaryText] = useState('');
  const [showPostCall, setShowPostCall] = useState(false);

  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing call button animation
  const callButtonPulse = useSharedValue(1);

  useEffect(() => {
    callButtonPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(callButtonPulse);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callButtonPulse]);

  const callButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: callButtonPulse.value }],
  }));

  const handleStartCall = useCallback(async () => {
    setIsInCall(true);
    setCallStartTime(new Date());
    setCallDuration(0);

    // Start duration timer
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    try {
      await WebBrowser.openBrowserAsync(JITSI_URL, {
        toolbarColor: colors.surface,
        controlsColor: colors.primary,
      });
    } catch (_e) {
      // Browser may not open in simulator
    }

    // After browser closes
    setIsInCall(false);
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setShowPostCall(true);
  }, []);

  const handleSaveSummary = useCallback(() => {
    if (!summaryText.trim()) {
      Alert.alert('Uyarı', 'Lütfen görüşme özetini girin.');
      return;
    }

    const newCall: ExpertCall = {
      id: `call-${Date.now()}`,
      triggerReason: stuckReason,
      jitsiRoomUrl: JITSI_URL,
      startTime: callStartTime?.toISOString() ?? new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: callDuration,
      summary: summaryText.trim(),
      participants: ['Öğrenci', 'Uzman'],
      screenShared: false,
      resolutionNotes: summaryText.trim(),
      contextForNextCycle: `Uzman görüşmesi sonucu: ${summaryText.trim()}`,
    };

    const updatedHistory = [newCall, ...callHistory];
    setCallHistory(updatedHistory);
    StorageService.saveExpertCalls(updatedHistory);
    setSummaryText('');
    setShowPostCall(false);
    setCallDuration(0);
  }, [summaryText, stuckReason, callStartTime, callDuration]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.warningHeader}
          >
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>STUCK Durumu Tespit Edildi</Text>
          </Animated.View>

          {/* Info Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
          >
            <GlassCard style={styles.infoCard}>
              <Text style={styles.infoLabel}>Neden STUCK?</Text>
              <Text style={styles.infoText}>
                Ardışık başarısızlıklar tespit edildi. Forge döngüsü kendi başına çözüm üretemiyor.
                Bir uzmanla görüşme yaparak sorunu birlikte çözmeniz önerilir.
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Failing Cycle Details */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
          >
            <View style={styles.failingCycleCard}>
              <Text style={styles.failingCycleTitle}>🔴 Başarısız Döngü Detayı</Text>
              <Text style={styles.failingCycleReason}>{stuckReason}</Text>
              <View style={styles.failingCycleInfo}>
                <Text style={styles.failingCycleLabel}>Durum:</Text>
                <Text style={styles.failingCycleValue}>STUCK — Uzman müdahalesi gerekli</Text>
              </View>
            </View>
          </Animated.View>

          {/* Jitsi Room Info */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
          >
            <GlassCard style={styles.jitsiInfoCard}>
              <Text style={styles.jitsiLabel}>📹 Görüşme Odası</Text>
              <View style={styles.jitsiRow}>
                <Text style={styles.jitsiRoomName}>{JITSI_ROOM_NAME}</Text>
              </View>
              <Text style={styles.jitsiUrl}>{JITSI_URL}</Text>
            </GlassCard>
          </Animated.View>

          {/* Start Call Button */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.callButtonArea}
          >
            <Animated.View style={callButtonAnimatedStyle}>
              <AnimatedButton
                title={isInCall ? `🔴 Görüşmede... ${formatDuration(callDuration)}` : '📞 Görüşmeyi Başlat'}
                onPress={handleStartCall}
                disabled={isInCall}
                style={[
                  styles.callButton,
                  isInCall && styles.callButtonInCall,
                ] as any}
              />
            </Animated.View>
          </Animated.View>

          {/* Post-Call Section */}
          {showPostCall && (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={styles.postCallSection}
            >
              <Text style={styles.postCallTitle}>📝 Görüşme Özeti</Text>

              {callDuration > 0 && (
                <View style={styles.durationDisplay}>
                  <Text style={styles.durationLabel}>Süre:</Text>
                  <Text style={styles.durationValue}>{formatDuration(callDuration)}</Text>
                </View>
              )}

              <TextInput
                style={styles.summaryInput}
                placeholder="Görüşmede ne konuşuldu, hangi çözümler önerildi..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={summaryText}
                onChangeText={setSummaryText}
              />

              <Pressable style={styles.saveButton} onPress={handleSaveSummary}>
                <Text style={styles.saveButtonText}>💾 Kaydet</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Call History */}
          {callHistory.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              style={styles.historySection}
            >
              <Text style={styles.historyTitle}>📜 Geçmiş Görüşmeler</Text>

              {callHistory.map((call, index) => (
                <Animated.View
                  key={call.id}
                  entering={FadeInDown.delay(100 * index).duration(300)}
                >
                  <GlassCard style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>
                        {formatCallDate(call.startTime)}
                      </Text>
                      <View style={styles.historyDurationBadge}>
                        <Text style={styles.historyDurationText}>
                          {call.duration} dk
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyReason}>{call.triggerReason}</Text>
                    <View style={styles.historySummaryBox}>
                      <Text style={styles.historySummaryLabel}>Özet:</Text>
                      <Text style={styles.historySummary}>{call.summary}</Text>
                    </View>
                    {call.resolutionNotes ? (
                      <View style={styles.historyResolution}>
                        <Text style={styles.historyResolutionLabel}>
                          Çözüm Notu:
                        </Text>
                        <Text style={styles.historyResolutionText}>
                          {call.resolutionNotes}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyMetaText}>
                        👥 {call.participants.join(', ')}
                      </Text>
                      {call.screenShared && (
                        <Text style={styles.historyMetaText}>🖥️ Ekran paylaşıldı</Text>
                      )}
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  // ── Warning Header ──
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  warningIcon: {
    fontSize: 28,
  },
  warningTitle: {
    ...typography.heading,
    color: colors.error,
    fontSize: 22,
  },
  // ── Info Card ──
  infoCard: {
    padding: spacing.lg,
  },
  infoLabel: {
    ...typography.bodyBold,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  // ── Failing Cycle ──
  failingCycleCard: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderWidth: 1,
    borderColor: colors.error + '50',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  failingCycleTitle: {
    ...typography.bodyBold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  failingCycleReason: {
    ...typography.body,
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  failingCycleInfo: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  failingCycleLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  failingCycleValue: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  // ── Jitsi Info ──
  jitsiInfoCard: {
    padding: spacing.lg,
  },
  jitsiLabel: {
    ...typography.bodyBold,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  jitsiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  jitsiRoomName: {
    ...typography.subheading,
    color: colors.text,
    fontSize: 16,
  },
  jitsiUrl: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  // ── Call Button ──
  callButtonArea: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  callButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxxl,
    ...shadows.lg,
    minWidth: 240,
    alignItems: 'center',
  },
  callButtonInCall: {
    backgroundColor: colors.accentDim,
    opacity: 0.9,
  },
  callButtonText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  // ── Post-Call ──
  postCallSection: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  postCallTitle: {
    ...typography.subheading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  durationValue: {
    ...typography.bodyBold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  summaryInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    minHeight: 120,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  // ── Call History ──
  historySection: {
    marginTop: spacing.md,
  },
  historyTitle: {
    ...typography.subheading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  historyCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyDurationBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  historyDurationText: {
    ...typography.micro,
    color: colors.primary,
  },
  historyReason: {
    ...typography.body,
    color: colors.accent,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  historySummaryBox: {
    marginBottom: spacing.sm,
  },
  historySummaryLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  historySummary: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  historyResolution: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  historyResolutionLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  historyResolutionText: {
    ...typography.caption,
    color: colors.primary,
    lineHeight: 18,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  historyMetaText: {
    ...typography.micro,
    color: colors.textMuted,
  },
});

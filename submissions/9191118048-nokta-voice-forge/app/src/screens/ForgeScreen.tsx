/**
 * ForgeScreen — Forge Cycle Dashboard
 * Summary stats, ForgeTimeline, STUCK warning, FAB for new cycles
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList, ForgeCycle, ForgeState } from '../types';
import ForgeTimeline from '../components/ForgeTimeline';
import { ForgeService } from '../services/forgeService';
import AnimatedButton from '../components/AnimatedButton';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Forge'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatCardData {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(400).springify()}
      style={styles.statCard}
    >
      <View style={[styles.statIconBg, { backgroundColor: stat.color + '18' }]}>
        <Text style={styles.statIcon}>{stat.icon}</Text>
      </View>
      <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Animated.View>
  );
}

export default function ForgeScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [forgeState, setForgeState] = useState<ForgeState | null>(null);
  const [cycles, setCycles] = useState<ForgeCycle[]>([]);

  // STUCK warning pulse
  const stuckPulse = useSharedValue(1);

  const loadData = useCallback(async () => {
    await ForgeService.init();
    setForgeState(ForgeService.getState());
    setCycles(ForgeService.getCycles());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  useEffect(() => {
    if (forgeState?.isStuck) {
      stuckPulse.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(stuckPulse);
      stuckPulse.value = 1;
    }
  }, [forgeState?.isStuck, stuckPulse]);

  const stuckAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stuckPulse.value }],
  }));

  const handleStartNewCycle = useCallback(async () => {
    await ForgeService.startCycle('Manuel Döngü', 'Kullanıcı tarafından başlatıldı');
    setCycles(ForgeService.getCycles());
    setForgeState(ForgeService.getState());
  }, []);

  const handleExpertCall = useCallback(() => {
    if (forgeState) {
      navigation.navigate('ExpertCall', {
        stuckReason: forgeState.stuckReason,
      });
    }
  }, [navigation, forgeState]);

  if (isLoading || !forgeState) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const successCount = cycles.filter((c) => c.result === 'SUCCESS').length;
  const rollbackCount = cycles.filter(
    (c) => c.result === 'ROLLBACK' || c.result === 'FAIL' || c.result === 'STUCK',
  ).length;

  const stats: StatCardData[] = [
    { label: 'Toplam', value: cycles.length, icon: '🔄', color: colors.info },
    { label: 'Başarılı', value: successCount, icon: '✅', color: colors.success },
    { label: 'Başarısız', value: rollbackCount, icon: '❌', color: colors.error },
    {
      label: 'Toplam kg',
      value: forgeState.totalKg.toFixed(1),
      icon: '⚖️',
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* STUCK Warning Banner */}
          {forgeState.isStuck && (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={stuckAnimatedStyle}
            >
              <View style={styles.stuckBanner}>
                <View style={styles.stuckHeader}>
                  <Text style={styles.stuckIcon}>⚠️</Text>
                  <Text style={styles.stuckTitle}>STUCK Durumu Tespit Edildi</Text>
                </View>
                <Text style={styles.stuckText}>{forgeState.stuckReason}</Text>
                <Text style={styles.stuckSubtext}>
                  Ardışık {forgeState.consecutiveFailures} başarısızlık nedeniyle sistem tıkandı.
                </Text>
                <Pressable
                  style={styles.stuckButton}
                  onPress={handleExpertCall}
                >
                  <Text style={styles.stuckButtonText}>📞 Uzmana Bağlan</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Summary Stats */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.statsRow}
          >
            {stats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </Animated.View>

          {/* Forge Timeline */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.timelineContainer}
          >
            <Text style={styles.sectionTitle}>Forge Döngüleri</Text>
            <ForgeTimeline cycles={cycles} />
          </Animated.View>
        </ScrollView>

        {/* FAB — Start New Cycle */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(400).springify()}
          style={styles.fabContainer}
        >
          <AnimatedButton
            title="+ Yeni Döngü"
            onPress={handleStartNewCycle}
            style={styles.fab}
          />
        </Animated.View>
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
    paddingBottom: 100,
  },
  // ── STUCK Banner ──
  stuckBanner: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderWidth: 1,
    borderColor: colors.error + '60',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stuckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stuckIcon: {
    fontSize: 22,
  },
  stuckTitle: {
    ...typography.subheading,
    color: colors.error,
    fontSize: 17,
  },
  stuckText: {
    ...typography.body,
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  stuckSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  stuckButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  stuckButtonText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 14,
  },
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    ...typography.subheading,
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 9,
  },
  // ── Timeline ──
  timelineContainer: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  // ── FAB ──
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  fab: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.lg,
  },
  fabText: {
    ...typography.bodyBold,
    color: colors.textInverse,
    fontSize: 14,
  },
});

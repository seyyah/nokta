import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type RouteName = Exclude<keyof RootStackParamList, 'Home'>;

const TOOLS: Array<{
  route: RouteName;
  code: string;
  title: string;
  description: string;
  color: string;
}> = [
  { route: 'Avatar', code: '01', title: 'Dijital Ikiz', description: '3D avatar, ses tepkisi ve rig', color: colors.secondary },
  { route: 'Voice', code: '02', title: 'Voice Lab', description: 'Canli metering, STT ve rapor', color: colors.primary },
  { route: 'Forge', code: '03', title: 'Forge', description: 'Cycle, rollback ve STUCK takibi', color: colors.warning },
  { route: 'Audit', code: '04', title: 'Audit', description: 'Burn-in kalite raporlari', color: colors.info },
  { route: 'ExpertCall', code: '05', title: 'Expert Bridge', description: 'Jitsi uzman gorusmesi', color: colors.error },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#15162D', '#090A12', '#07070C']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(450)} style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>NOKTA / FINAL SYSTEM</Text>
              <Text style={styles.title}>Voice Forge</Text>
              <Text style={styles.subtitle}>Ses, avatar, forge ve insan koprusunu tek akista yonet.</Text>
            </View>
            <View style={styles.readyBadge}>
              <View style={styles.readyDot} />
              <Text style={styles.readyText}>SYSTEM READY</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.hero}>
            <LinearGradient colors={['rgba(124,92,252,0.25)', 'rgba(0,212,170,0.06)']} style={StyleSheet.absoluteFill} />
            <Text style={styles.heroLabel}>AKTIF PIPELINE</Text>
            <Text style={styles.heroTitle}>Konus. Gozlemle. Forge et.</Text>
            <Text style={styles.heroText}>
              Mikrofon verisi 3D avatarini hareketlendirir, raporlar Forge dongusune akar,
              sistem takildiginda Expert Bridge devreye girer.
            </Text>
            <View style={styles.phaseRow}>
              {['VOICE', 'AVATAR', 'BRIDGE'].map((phase, index) => (
                <View key={phase} style={styles.phase}>
                  <Text style={styles.phaseIndex}>0{index + 1}</Text>
                  <Text style={styles.phaseText}>{phase}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Text style={styles.sectionLabel}>CALISMA ALANLARI</Text>
          <View style={styles.grid}>
            {TOOLS.map((tool, index) => (
              <Animated.View
                key={tool.route}
                entering={FadeInDown.delay(180 + index * 60).duration(400)}
                style={styles.toolWrapper}
              >
                <Pressable
                  style={({ pressed }) => [styles.toolCard, pressed && styles.toolCardPressed]}
                  onPress={() => navigation.navigate(tool.route as any, tool.route === 'ExpertCall' ? {} : undefined)}
                >
                  <View style={[styles.toolAccent, { backgroundColor: tool.color }]} />
                  <View style={styles.toolHeader}>
                    <Text style={[styles.toolCode, { color: tool.color }]}>{tool.code}</Text>
                    <Text style={styles.toolArrow}>+</Text>
                  </View>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.md },
  eyebrow: { ...typography.micro, color: colors.primary, letterSpacing: 1.7 },
  title: { ...typography.hero, fontSize: 38, marginTop: 5 },
  subtitle: { ...typography.caption, maxWidth: 250, marginTop: 6, lineHeight: 19 },
  readyBadge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.28)',
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  readyText: { ...typography.micro, color: colors.primary, fontSize: 8 },
  hero: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  heroLabel: { ...typography.micro, color: colors.secondary, letterSpacing: 1.4 },
  heroTitle: { ...typography.heading, fontSize: 24, marginTop: spacing.sm },
  heroText: { ...typography.caption, marginTop: spacing.sm, lineHeight: 20, maxWidth: 310 },
  phaseRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  phase: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(8,9,16,0.48)',
  },
  phaseIndex: { ...typography.micro, color: colors.textMuted, fontSize: 8 },
  phaseText: { ...typography.micro, color: colors.text, fontSize: 9, marginTop: 3 },
  sectionLabel: { ...typography.micro, marginTop: spacing.xl, marginBottom: spacing.md, letterSpacing: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toolWrapper: { width: '48.7%' },
  toolCard: {
    minHeight: 142,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,18,28,0.9)',
  },
  toolCardPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  toolAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  toolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolCode: { ...typography.micro, fontSize: 10 },
  toolArrow: { fontSize: 20, fontWeight: '300', color: colors.textMuted },
  toolTitle: { ...typography.bodyBold, marginTop: spacing.lg, fontSize: 15 },
  toolDescription: { ...typography.caption, marginTop: 5, fontSize: 10, lineHeight: 15 },
});

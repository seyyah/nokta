/**
 * AuditScreen — Audit Reports Viewer & Creator
 * Expandable report cards, severity badges, demo reports, AuditWidget modal
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows, animation } from '../theme';
import { RootStackParamList, AuditReport } from '../types';
import GlassCard from '../components/GlassCard';
import AuditWidget from '../components/AuditWidget';

type Props = NativeStackScreenProps<RootStackParamList, 'Audit'>;

const SEVERITY_COLORS: Record<AuditReport['severity'], string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.accent,
  critical: colors.error,
};

const SEVERITY_LABELS: Record<AuditReport['severity'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
};

const STATUS_COLORS: Record<AuditReport['status'], string> = {
  open: colors.info,
  in_progress: colors.warning,
  resolved: colors.success,
};

const STATUS_LABELS: Record<AuditReport['status'], string> = {
  open: 'Açık',
  in_progress: 'Devam Ediyor',
  resolved: 'Çözüldü',
};

const INITIAL_REPORTS: AuditReport[] = [
  {
    id: 'audit-001',
    screenName: 'Voice Visualizer Audit',
    timestamp: '2026-05-28T10:15:00Z',
    note: 'Bar animasyon akıcılığı test edildi. 60fps hedefine yakın performans gözlemlendi.',
    markdownContent: `# Voice Visualizer Audit Report

## Özet
Bar animasyonlarının akıcılığı test edildi.

## Bulgular
- **FPS**: Ortalama 58fps, minimum 45fps
- **Animasyon Gecikmesi**: 16ms ortalama frame time
- **Bar Geçişleri**: Yumuşak, ancak 32 bardan fazlasında performans düşüşü var
- **Renk Geçişleri**: Gradient geçişleri pürüzsüz

## Öneriler
1. Bar sayısı 32'de sabitlenmeli
2. \`useNativeDriver\` aktif olmalı
3. Düşük cihazlarda bar sayısı 16'ya düşürülebilir

## Sonuç
Genel performans **kabul edilebilir** seviyede. Minor optimizasyonlar önerilir.`,
    screenshotUri: null,
    severity: 'medium',
    status: 'open',
  },
  {
    id: 'audit-002',
    screenName: 'Avatar Lipsync Audit',
    timestamp: '2026-05-28T11:30:00Z',
    note: 'Ağız senkronizasyonunda gecikme tespit edildi. 120ms delay mevcut.',
    markdownContent: `# Avatar Lipsync Audit Report

## Özet
Avatar ağız hareketlerinin ses ile senkronizasyonu test edildi.

## Bulgular
- **Gecikme**: ~120ms audio-to-visual delay
- **Ağız Şekilleri**: 5 farklı şekil tanımlandı, ancak geçişler sert
- **Persona Farkları**: Junior daha responsif, Senior daha yavaş tepki veriyor
- **Nefes Animasyonu**: İdle durumda smooth

## Kritik Sorunlar
1. ⚠️ 120ms gecikme fark edilebilir düzeyde
2. ⚠️ Ağız şekli geçişlerinde ara frame eksik
3. Göz kırpma animasyonu bazen takılıyor

## Öneriler
1. Audio buffer size küçültülmeli
2. Mouth shape interpolation eklenmeli
3. Blink timer randomize edilmeli

## Sonuç
**Yüksek öncelikli** düzeltme gerekiyor.`,
    screenshotUri: null,
    severity: 'high',
    status: 'in_progress',
  },
  {
    id: 'audit-003',
    screenName: 'Forge Dashboard Audit',
    timestamp: '2026-05-28T12:00:00Z',
    note: 'Döngü kartları layout testi. Genel yapı iyi, küçük padding düzeltmeleri gerekli.',
    markdownContent: `# Forge Dashboard Audit Report

## Özet
Forge döngü kartlarının layout ve görsel düzeni test edildi.

## Bulgular
- **Kart Düzeni**: Genel olarak düzgün, timeline görünümü anlaşılır
- **Renk Kodlaması**: SUCCESS/ROLLBACK renkleri yeterince belirgin
- **Stat Kartları**: 4'lü grid düzgün hizalı
- **STUCK Banner**: Pulse animasyonu etkili

## Küçük Sorunlar
1. Kart içi padding sağ tarafta 2px eksik
2. Uzun hypothesis metinleri taşıyor
3. Timestamp formatı tutarsız

## Öneriler
1. Padding değerleri tema sisteminden alınmalı
2. Text ellipsis eklenmeli
3. Tarih formatı standardize edilmeli

## Sonuç
**Düşük öncelikli** kozmetik düzeltmeler.`,
    screenshotUri: null,
    severity: 'low',
    status: 'resolved',
  },
];

function ReportCard({
  report,
  index,
  isExpanded,
  onToggle,
}: {
  report: AuditReport;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cardScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.98, animation.springBouncy);
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1, animation.springBouncy);
  }, [cardScale]);

  const severityColor = SEVERITY_COLORS[report.severity];
  const statusColor = STATUS_COLORS[report.status];

  const formattedDate = new Date(report.timestamp).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 80).duration(400).springify()}
      layout={Layout.springify()}
    >
      <Animated.View style={cardAnimatedStyle}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onToggle}
        >
          <GlassCard style={styles.reportCard}>
            {/* Header Row */}
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleArea}>
                <Text style={styles.reportName}>{report.screenName}</Text>
                <Text style={styles.reportTimestamp}>{formattedDate}</Text>
              </View>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: severityColor + '20', borderColor: severityColor + '60' },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: severityColor }]}>
                    {SEVERITY_LABELS[report.severity]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '20', borderColor: statusColor + '60' },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: statusColor }]}>
                    {STATUS_LABELS[report.status]}
                  </Text>
                </View>
              </View>
            </View>

            {/* Preview / Note */}
            <Text style={styles.reportNote} numberOfLines={isExpanded ? undefined : 2}>
              {report.note}
            </Text>

            {/* Expanded Markdown Content */}
            {isExpanded && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.markdownContainer}
              >
                <View style={styles.markdownDivider} />
                <Text style={styles.markdownContent}>
                  {report.markdownContent}
                </Text>
              </Animated.View>
            )}

            {/* Expand indicator */}
            <Text style={styles.expandIndicator}>
              {isExpanded ? '▲ Daralt' : '▼ Genişlet'}
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

import StorageService from '../services/storageService';

export default function AuditScreen({ navigation }: Props) {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAuditWidget, setShowAuditWidget] = useState(false);

  React.useEffect(() => {
    const loadReports = async () => {
      const storedReports = await StorageService.loadAuditReports();
      if (storedReports.length === 0) {
        await StorageService.saveAuditReports(INITIAL_REPORTS);
        setReports(INITIAL_REPORTS);
      } else {
        setReports(storedReports);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadReports();
    });

    loadReports();
    return unsubscribe;
  }, [navigation]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleCreateReport = useCallback(async (report: AuditReport) => {
    const updatedReports = [report, ...reports];
    setReports(updatedReports);
    await StorageService.saveAuditReports(updatedReports);
    setShowAuditWidget(false);
  }, [reports]);

  const handleCloseWidget = useCallback(() => {
    setShowAuditWidget(false);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.headerArea}
          >
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Audit Reports</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{reports.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              Ekran denetimleri ve kalite raporları
            </Text>
          </Animated.View>

          {/* Reports List */}
          {reports.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              index={index}
              isExpanded={expandedId === report.id}
              onToggle={() => handleToggleExpand(report.id)}
            />
          ))}

          {reports.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Henüz rapor yok</Text>
              <Text style={styles.emptySubtext}>
                Yeni bir denetim raporu oluşturmak için + butonuna dokunun
              </Text>
            </View>
          )}
        </ScrollView>

        <AuditWidget
          currentScreen="Audit"
          onReportGenerated={handleCreateReport}
        />
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
    gap: spacing.md,
  },
  // ── Header ──
  headerArea: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  countBadgeText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // ── Report Card ──
  reportCard: {
    padding: spacing.lg,
  },
  reportHeader: {
    marginBottom: spacing.sm,
  },
  reportTitleArea: {
    marginBottom: spacing.sm,
  },
  reportName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  reportTimestamp: {
    ...typography.micro,
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.micro,
    fontSize: 10,
  },
  reportNote: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  markdownContainer: {
    marginTop: spacing.sm,
  },
  markdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  markdownContent: {
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: undefined, // system monospace fallback handled by OS
  },
  expandIndicator: {
    ...typography.micro,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.subheading,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // ── FAB ──
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
});

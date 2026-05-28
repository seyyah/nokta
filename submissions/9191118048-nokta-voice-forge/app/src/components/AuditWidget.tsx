/**
 * AuditWidget — In-app audit report generator
 * FAB with glassmorphism modal overlay
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, typography, animation, shadows } from '../theme';
import { AuditReport } from '../types';

interface AuditWidgetProps {
  currentScreen: string;
  onReportGenerated: (report: AuditReport) => void;
  visible?: boolean;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; emoji: string }> = {
  low: { label: 'Düşük', color: '#4DACFF', emoji: '💡' },
  medium: { label: 'Orta', color: colors.warning, emoji: '⚠️' },
  high: { label: 'Yüksek', color: '#FF8C42', emoji: '🔥' },
  critical: { label: 'Kritik', color: colors.error, emoji: '🚨' },
};

const SCREEN_OPTIONS = [
  'Home',
  'Voice',
  'Avatar',
  'Forge',
  'Audit',
  'ExpertCall',
];

// Clipboard/report icon
const ReportIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = 'white',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M9 16h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Checkmark icon
const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 48,
  color = colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path
      d="M8 12l2.5 2.5L16 9"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AuditWidget: React.FC<AuditWidgetProps> = ({
  currentScreen,
  onReportGenerated,
  visible = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(currentScreen);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('medium');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // FAB bounce animation
  const fabScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      fabScale.value = withDelay(
        300,
        withSpring(1, {
          ...animation.springBouncy,
          damping: 6,
          stiffness: 250,
        })
      );
    }
  }, [visible]);

  // Subtle pulse on FAB
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      fabScale.value = withSequence(
        withTiming(1.08, { duration: 200, easing: Easing.out(Easing.ease) }),
        withSpring(1, animation.springConfig)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleOpenModal = useCallback(() => {
    setSelectedScreen(currentScreen);
    setNote('');
    setSelectedSeverity('medium');
    setShowSuccess(false);
    setModalVisible(true);
  }, [currentScreen]);

  const handleGenerateReport = useCallback(() => {
    const timestamp = new Date().toISOString();
    const severityInfo = SEVERITY_CONFIG[selectedSeverity];

    const markdownContent = `# Audit Report
---
- **Tarih:** ${new Date().toLocaleString('tr-TR')}
- **Ekran:** ${selectedScreen}
- **Seviye:** ${severityInfo.emoji} ${severityInfo.label}
- **Durum:** Açık

## Not
${note || '_Not eklenmedi_'}

---
_Otomatik oluşturuldu — Nokta Voice Forge Audit v1.0_
`;

    const report: AuditReport = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      screenName: selectedScreen,
      timestamp,
      note: note || '',
      markdownContent,
      screenshotUri: null,
      severity: selectedSeverity,
      status: 'open',
    };

    onReportGenerated(report);
    setShowSuccess(true);

    // Auto-close after success animation
    setTimeout(() => {
      setModalVisible(false);
      setShowSuccess(false);
    }, 1500);
  }, [selectedScreen, selectedSeverity, note, onReportGenerated]);

  if (!visible) return null;

  return (
    <>
      {/* ─── FAB ──────────────────────────── */}
      <AnimatedTouchable
        style={[styles.fab, fabAnimStyle, shadows.lg]}
        onPress={handleOpenModal}
        activeOpacity={0.85}
      >
        <ReportIcon size={24} color="white" />
      </AnimatedTouchable>

      {/* ─── Modal ────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !showSuccess && setModalVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {showSuccess ? (
              // ─── Success State ─────────────
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                style={styles.successContainer}
              >
                <CheckIcon size={64} />
                <Text style={styles.successText}>Rapor Oluşturuldu!</Text>
              </Animated.View>
            ) : (
              // ─── Form ──────────────────────
              <Animated.View
                entering={SlideInUp.duration(400).springify()}
                exiting={FadeOut.duration(200)}
                style={styles.modalContent}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📋 Audit Raporu</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* ─── Screen Selector ──────── */}
                  <Text style={styles.formLabel}>Ekran</Text>
                  <View style={styles.pillRow}>
                    {SCREEN_OPTIONS.map((screen) => (
                      <TouchableOpacity
                        key={screen}
                        style={[
                          styles.screenPill,
                          selectedScreen === screen && styles.screenPillActive,
                        ]}
                        onPress={() => setSelectedScreen(screen)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.screenPillText,
                            selectedScreen === screen &&
                              styles.screenPillTextActive,
                          ]}
                        >
                          {screen}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* ─── Severity Selector ─────── */}
                  <Text style={styles.formLabel}>Seviye</Text>
                  <View style={styles.pillRow}>
                    {(Object.keys(SEVERITY_CONFIG) as Severity[]).map((sev) => {
                      const config = SEVERITY_CONFIG[sev];
                      return (
                        <TouchableOpacity
                          key={sev}
                          style={[
                            styles.severityPill,
                            {
                              borderColor:
                                selectedSeverity === sev
                                  ? config.color
                                  : colors.border,
                              backgroundColor:
                                selectedSeverity === sev
                                  ? `${config.color}20`
                                  : 'transparent',
                            },
                          ]}
                          onPress={() => setSelectedSeverity(sev)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.severityEmoji}>
                            {config.emoji}
                          </Text>
                          <Text
                            style={[
                              styles.severityText,
                              {
                                color:
                                  selectedSeverity === sev
                                    ? config.color
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {config.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* ─── Note Input ────────────── */}
                  <Text style={styles.formLabel}>Not</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Detaylı açıklama yazın..."
                    placeholderTextColor={colors.textMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  {/* ─── Generate Button ──────── */}
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateReport}
                    activeOpacity={0.85}
                  >
                    <ReportIcon size={20} color="white" />
                    <Text style={styles.generateButtonText}>
                      Rapor Oluştur
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  formScroll: {
    padding: spacing.lg,
  },
  formLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  screenPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
  },
  screenPillActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  screenPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  screenPillTextActive: {
    color: colors.primary,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    gap: 4,
  },
  severityEmoji: {
    fontSize: 14,
  },
  severityText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    minHeight: 100,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  generateButtonText: {
    ...typography.bodyBold,
    color: 'white',
    fontSize: 15,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  successText: {
    ...typography.subheading,
    color: colors.primary,
    marginTop: spacing.lg,
  },
});

export default AuditWidget;

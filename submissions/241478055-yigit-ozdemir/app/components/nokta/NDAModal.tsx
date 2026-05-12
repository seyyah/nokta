import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';

interface NDAModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export default function NDAModal({ visible, onAccept, onCancel }: NDAModalProps) {
  const [accepted, setAccepted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setAccepted(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.shieldIcon}>
              <Text style={styles.shieldEmoji}>🔒</Text>
            </View>
            <Text style={styles.modalTitle}>
              Dijital Gizlilik Sözleşmesi (NDA)
            </Text>
            <Text style={styles.modalSubtitle}>
              Fikriniz koruma altında
            </Text>
          </View>

          {/* NDA Content */}
          <ScrollView
            style={styles.ndaScrollArea}
            contentContainerStyle={styles.ndaContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.ndaText}>
              Bu proje dökümanı profesyonel bir uzmana gönderilecektir.
              Dijital Gizlilik Sözleşmesi (NDA) uyarınca fikriniz koruma
              altındadır.
            </Text>

            <View style={styles.ndaDivider} />

            <Text style={styles.ndaSectionTitle}>Kapsam</Text>
            <Text style={styles.ndaDetail}>
              • Uzman, proje spesifikasyonunuzu yalnızca değerlendirme
              amacıyla görüntüleyecektir.{'\n'}
              • Hiçbir bilgi üçüncü taraflarla paylaşılmayacaktır.{'\n'}
              • Uzman geri bildirimi gizli tutulacak ve yalnızca size
              sunulacaktır.
            </Text>

            <View style={styles.ndaDivider} />

            <Text style={styles.ndaSectionTitle}>Koruma Süresi</Text>
            <Text style={styles.ndaDetail}>
              Bu sözleşme, inceleme tarihinden itibaren 2 (iki) yıl süreyle
              geçerlidir. Uzman taraf, bu süre zarfında edindiği tüm bilgileri
              gizli tutmakla yükümlüdür.
            </Text>

            <View style={styles.ndaDivider} />

            <Text style={styles.ndaSectionTitle}>Hukuki Dayanak</Text>
            <Text style={styles.ndaDetail}>
              6698 sayılı KVKK ve AB GDPR mevzuatları kapsamında kişisel
              verileriniz ve fikri mülkiyet haklarınız güvence altındadır.
            </Text>
          </ScrollView>

          {/* Checkbox */}
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAccepted(!accepted)}
          >
            <View
              style={[
                styles.checkbox,
                accepted && styles.checkboxChecked,
              ]}
            >
              {accepted && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Okudum, Onaylıyorum
            </Text>
          </Pressable>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.acceptButton,
                !accepted && styles.acceptButtonDisabled,
                pressed && accepted && styles.buttonPressed,
              ]}
              onPress={accepted ? onAccept : undefined}
              disabled={!accepted}
            >
              <Text
                style={[
                  styles.acceptButtonText,
                  !accepted && styles.acceptButtonTextDisabled,
                ]}
              >
                Devam Et →
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: NoktaColors.borderSubtle,
    backgroundColor: NoktaColors.bgElevated,
  },
  shieldIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: NoktaColors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  shieldEmoji: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: NoktaColors.accent,
    fontWeight: '500',
  },
  ndaScrollArea: {
    maxHeight: 260,
  },
  ndaContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  ndaText: {
    fontSize: FontSize.sm,
    color: NoktaColors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  ndaDivider: {
    height: 1,
    backgroundColor: NoktaColors.borderSubtle,
    marginVertical: Spacing.md,
  },
  ndaSectionTitle: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  ndaDetail: {
    fontSize: FontSize.sm,
    color: NoktaColors.textTertiary,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: NoktaColors.borderSubtle,
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: NoktaColors.borderFocus,
    backgroundColor: NoktaColors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: NoktaColors.accent,
    backgroundColor: NoktaColors.accentMuted,
  },
  checkMark: {
    fontSize: 13,
    fontWeight: '700',
    color: NoktaColors.accent,
  },
  checkboxLabel: {
    fontSize: FontSize.sm,
    color: NoktaColors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NoktaColors.bgElevated,
    borderWidth: 1,
    borderColor: NoktaColors.border,
  },
  cancelButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: NoktaColors.textSecondary,
  },
  acceptButton: {
    flex: 1.5,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NoktaColors.accent,
  },
  acceptButtonDisabled: {
    backgroundColor: NoktaColors.bgElevated,
    borderWidth: 1,
    borderColor: NoktaColors.borderSubtle,
  },
  acceptButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: NoktaColors.bg,
  },
  acceptButtonTextDisabled: {
    color: NoktaColors.textDimmed,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

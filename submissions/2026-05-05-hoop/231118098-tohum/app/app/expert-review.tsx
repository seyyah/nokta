import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXPERTS, renderStars } from '@/constants/experts';
import { parseIdeaMd } from '@/constants/idea-md';
import { colors, fontSize, radius, spacing, typography } from '@/constants/theme';
import {
  getSession,
  updateSessionExpertReview,
} from '@/services/storage';

export default function ExpertReview() {
  const { sid, expertId } = useLocalSearchParams<{ sid: string; expertId: string }>();

  const [status, setStatus] = useState<'loading' | 'done'>('loading');
  const [expertEdits, setExpertEdits] = useState<Record<string, string>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [ideaMd, setIdeaMd] = useState('');

  const expert = EXPERTS.find((e) => e.id === expertId);

  useEffect(() => {
    if (!sid) return;
    getSession(sid).then((s) => {
      if (s) setIdeaMd(s.idea_md);
    });
  }, [sid]);

  useEffect(() => {
    if (!sid || !expert) return;

    void updateSessionExpertReview(sid, {
      expertId: expert.id,
      expertName: expert.name,
      requestedAt: Date.now(),
      status: 'pending',
    });

    const timer = setTimeout(async () => {
      await updateSessionExpertReview(sid, {
        expertId: expert.id,
        expertName: expert.name,
        requestedAt: Date.now(),
        status: 'reviewed',
        comment: expert.mockReview.comment,
        rating: expert.mockReview.rating,
        verdict: expert.mockReview.verdict,
        reviewedAt: Date.now(),
        expertEdits: {},
      });
      setStatus('done');
    }, 2000);

    return () => clearTimeout(timer);
  }, [sid, expert]);

  const sections = useMemo(() => {
    if (!ideaMd) return [];
    return parseIdeaMd(ideaMd).sections;
  }, [ideaMd]);

  const onEditStart = useCallback(
    (heading: string) => {
      setEditingSection(heading);
      setEditText(expertEdits[heading] ?? sections.find((s) => s.heading === heading)?.body ?? '');
    },
    [expertEdits, sections],
  );

  const onEditSave = useCallback(async () => {
    if (!editingSection || !sid || !expert) return;
    const newEdits = { ...expertEdits, [editingSection]: editText };
    setExpertEdits(newEdits);
    setEditingSection(null);

    const current = await getSession(sid);
    if (!current?.expertReview) return;
    await updateSessionExpertReview(sid, {
      ...current.expertReview,
      expertEdits: newEdits,
    });
  }, [editingSection, editText, expertEdits, sid, expert]);

  const onEditCancel = useCallback(() => {
    setEditingSection(null);
    setEditText('');
  }, []);

  const onBack = () => {
    try {
      router.dismiss(2);
    } catch {
      router.back();
    }
  };

  if (!expert) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Uzman bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const verdict = expert.mockReview.verdict;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Uzman Görüşü</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Expert profile */}
        <View style={styles.expertCard}>
          <Text style={styles.avatar}>{expert.avatar}</Text>
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{expert.name}</Text>
            <Text style={styles.expertField}>{expert.field}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>{renderStars(expert.rating)}</Text>
              <Text style={styles.ratingNum}>{expert.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Review */}
        {status === 'loading' ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>{expert.name} spec'ini inceliyor...</Text>
          </View>
        ) : (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View
                style={[
                  styles.verdictBadge,
                  verdict === 'onay' ? styles.verdictOnay : styles.verdictRevize,
                ]}
              >
                <Text
                  style={[
                    styles.verdictText,
                    verdict === 'onay' ? styles.verdictTextOnay : styles.verdictTextRevize,
                  ]}
                >
                  {verdict === 'onay' ? '✓ Onaylandı' : '⚠ Revize Gerekli'}
                </Text>
              </View>
              <View style={styles.reviewRatingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.reviewStar,
                      i < expert.mockReview.rating ? styles.reviewStarFull : styles.reviewStarEmpty,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{expert.mockReview.comment}</Text>
          </View>
        )}

        {/* Section editing — only shown after review loads */}
        {status === 'done' && sections.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Bölüm Düzenle</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.sectionHint}>
              Uzman olarak istediğin bölümü düzenle. Değişiklikler spec'te gösterilir.
            </Text>

            {sections.map((section) => {
              const isEdited = !!expertEdits[section.heading];
              return (
                <View
                  key={section.heading}
                  style={[styles.sectionRow, isEdited && styles.sectionRowEdited]}
                >
                  <View style={styles.sectionRowTop}>
                    <Text style={styles.sectionHeading} numberOfLines={1}>
                      {section.heading}
                    </Text>
                    {isEdited ? (
                      <View style={styles.editedPill}>
                        <Text style={styles.editedPillText}>Düzenlendi</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => onEditStart(section.heading)}
                        style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
                        hitSlop={8}
                      >
                        <Text style={styles.editBtnText}>Düzenle</Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.sectionPreview} numberOfLines={2}>
                    {isEdited ? expertEdits[section.heading] : section.body}
                  </Text>
                  {isEdited && (
                    <Pressable
                      onPress={() => onEditStart(section.heading)}
                      hitSlop={8}
                      style={styles.reEditBtn}
                    >
                      <Text style={styles.reEditBtnText}>Tekrar Düzenle</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </>
        )}

        {status === 'done' && (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backToSpec, pressed && styles.backToSpecPressed]}
          >
            <Text style={styles.backToSpecText}>
              {Object.keys(expertEdits).length > 0
                ? `Spec'e Dön (${Object.keys(expertEdits).length} düzenleme)`
                : "Spec'e Dön"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingSection !== null}
        animationType="slide"
        transparent
        onRequestClose={onEditCancel}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {editingSection}
                </Text>
              </View>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                textAlignVertical="top"
                placeholderTextColor={colors.textDim}
                placeholder="Uzman notunu yaz..."
                selectionColor={colors.primary}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={onEditCancel}
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
                >
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </Pressable>
                <Pressable
                  onPress={onEditSave}
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
                >
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingVertical: spacing.xs, minWidth: 60 },
  backText: { fontFamily: typography.bodyMedium, fontSize: fontSize.sm, color: colors.primary },
  headerTitle: {
    fontFamily: typography.headline,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  headerSpacer: { minWidth: 60 },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },

  expertCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatar: { fontSize: 40 },
  expertInfo: { flex: 1, gap: spacing.xs },
  expertName: {
    fontFamily: typography.headline,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  expertField: { fontFamily: typography.bodyMedium, fontSize: fontSize.sm, color: colors.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stars: { fontSize: fontSize.sm, color: colors.warn },
  ratingNum: { fontFamily: typography.bodySemi, fontSize: fontSize.sm, color: colors.text },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  loadingText: { fontFamily: typography.body, fontSize: fontSize.sm, color: colors.textMuted },

  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verdictBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  verdictOnay: { backgroundColor: '#0D2818', borderColor: colors.success },
  verdictRevize: { backgroundColor: '#2A1F00', borderColor: colors.warn },
  verdictText: { fontFamily: typography.bodySemi, fontSize: fontSize.sm, fontWeight: '600' },
  verdictTextOnay: { color: colors.success },
  verdictTextRevize: { color: colors.warn },
  reviewRatingRow: { flexDirection: 'row', gap: 2 },
  reviewStar: { fontSize: fontSize.lg },
  reviewStarFull: { color: colors.warn },
  reviewStarEmpty: { color: colors.textDim },
  reviewComment: {
    fontFamily: typography.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 24,
  },

  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  sectionHint: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textDim,
    lineHeight: 20,
    marginTop: -spacing.sm,
  },

  sectionRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionRowEdited: {
    borderColor: colors.success,
  },
  sectionRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionHeading: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  editedPill: {
    backgroundColor: '#0D2818',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  editedPillText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
  },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editBtnPressed: { opacity: 0.75 },
  editBtnText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  reEditBtn: { alignSelf: 'flex-start', marginTop: -spacing.xs },
  reEditBtnText: {
    fontFamily: typography.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  sectionPreview: {
    fontFamily: typography.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },

  backToSpec: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  backToSpecPressed: { opacity: 0.85 },
  backToSpecText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.md,
    color: colors.bg,
    fontWeight: '600',
  },

  // Modal
  modalWrapper: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.headline,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  editInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: typography.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 22,
    minHeight: 160,
    maxHeight: 300,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnPressed: { opacity: 0.75 },
  cancelBtnText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnText: {
    fontFamily: typography.bodySemi,
    fontSize: fontSize.sm,
    color: colors.bg,
    fontWeight: '600',
  },
  errorText: { color: colors.danger, padding: spacing.lg },
});

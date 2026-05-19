import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AppPalette } from '../theme/palette';
import { EXPERT_REVIEW_REASONS, ExpertReviewReason } from '../types/expertReview';
import { PrimaryButton } from './PrimaryButton';

type ExpertRequestModalProps = {
  visible: boolean;
  palette: AppPalette;
  onClose: () => void;
  onSubmit: (payload: { reason: ExpertReviewReason; note: string }) => Promise<void> | void;
  isSubmitting: boolean;
  errorMessage: string | null;
};

export function ExpertRequestModal({
  visible,
  palette,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage
}: ExpertRequestModalProps) {
  const [reason, setReason] = useState<ExpertReviewReason>('Market validation');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('Market validation');
      setNote('');
    }
  }, [visible]);

  const canSubmit = useMemo(() => {
    if (reason === 'Other') {
      return note.trim().length >= 6;
    }
    return true;
  }, [reason, note]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit({ reason, note });
  };

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
          <View style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: palette.textPrimary }]}>Request Expert Review</Text>
              <Pressable onPress={onClose}>
                <Text style={[styles.closeText, { color: palette.textMuted }]}>Close</Text>
              </Pressable>
            </View>

            <Text style={[styles.prompt, { color: palette.textSecondary }]}>Why do you want expert help?</Text>

            <ScrollView style={styles.optionArea} contentContainerStyle={styles.optionAreaContent}>
              {EXPERT_REVIEW_REASONS.map((option) => {
                const selected = option === reason;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setReason(option)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? palette.accentSoft : palette.cardSoft,
                        borderColor: selected ? palette.accent : palette.border
                      }
                    ]}
                  >
                    <Text style={[styles.optionText, { color: selected ? palette.accent : palette.textSecondary }]}>{option}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.noteLabel, { color: palette.textPrimary }]}>Optional note</Text>
            <TextInput
              style={[styles.noteInput, { color: palette.textPrimary, borderColor: palette.border, backgroundColor: palette.cardSoft }]}
              placeholder="Describe what should be reviewed in depth..."
              placeholderTextColor={palette.textMuted}
              multiline
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />

            {reason === 'Other' ? (
              <Text style={[styles.hint, { color: palette.textMuted }]}>For Other, add at least a short note so the request can be routed.</Text>
            ) : null}

            {errorMessage ? <Text style={[styles.error, { color: palette.danger }]}>{errorMessage}</Text> : null}

            <View style={styles.buttonsRow}>
              <PrimaryButton label="Cancel" onPress={onClose} palette={palette} variant="ghost" />
              <PrimaryButton
                label={isSubmitting ? 'Submitting...' : 'Submit request'}
                onPress={handleSubmit}
                palette={palette}
                disabled={!canSubmit || isSubmitting}
                variant="primary"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 12
  },
  closeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8
  },
  keyboardWrap: {
    justifyContent: 'flex-end'
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    minHeight: 90,
    padding: 10
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6
  },
  option: {
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  optionArea: {
    marginTop: 8,
    maxHeight: 210
  },
  optionAreaContent: {
    gap: 8
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600'
  },
  overlay: {
    backgroundColor: 'rgba(7, 10, 18, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 14
  },
  prompt: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  }
});

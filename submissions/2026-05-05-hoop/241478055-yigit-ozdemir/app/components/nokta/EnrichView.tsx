import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';
import {
  startRecording,
  stopAndTranscribe,
  cancelRecording,
} from '@/services/voiceService';

interface EnrichViewProps {
  originalIdea: string;
  questions: string[];
  onSubmit: (answers: string[]) => void;
  onBack: () => void;
}

const QUESTION_TAGS = ['PROBLEM', 'KULLANICI', 'KAPSAM', 'KISIT', 'FARK'];

export default function EnrichView({ originalIdea, questions, onSubmit, onBack }: EnrichViewProps) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );
  const [activeRecordingIndex, setActiveRecordingIndex] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Temizlik
  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, []);

  const updateAnswer = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const filledCount = answers.filter((a) => a.trim().length > 0).length;
  const minRequired = 3;
  const isValid = filledCount >= minRequired;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(answers);
  };

  // ─── Ses Kaydı (Soru Kartları İçin) ────────────────────────

  const handleMicPress = useCallback(async (questionIndex: number) => {
    if (isTranscribing) return;

    if (activeRecordingIndex === questionIndex) {
      // Kaydı durdur ve metne çevir
      setActiveRecordingIndex(null);
      setIsTranscribing(true);

      const result = await stopAndTranscribe();
      setIsTranscribing(false);

      if (result.success) {
        setAnswers((prev) => {
          const updated = [...prev];
          const existing = updated[questionIndex].trim();
          const separator = existing.length > 0 ? ' ' : '';
          updated[questionIndex] = existing + separator + result.text;
          return updated;
        });
      } else {
        Alert.alert('Transkripsiyon Hatası', result.error);
      }
    } else {
      // Eğer başka bir kayıt varsa, önce onu iptal et
      if (activeRecordingIndex !== null) {
        await cancelRecording();
        setActiveRecordingIndex(null);
      }

      // Yeni kaydı başlat
      const result = await startRecording();
      if (result.success) {
        setActiveRecordingIndex(questionIndex);
      } else {
        Alert.alert('Mikrofon Hatası', result.error);
      }
    }
  }, [activeRecordingIndex, isTranscribing]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Faz başlığı */}
        <View style={styles.phaseHeader}>
          <Text style={styles.phaseTag}>FAZ 02</Text>
          <Text style={styles.phaseTitle}>Mühendislik Zenginleştirmesi</Text>
          <Text style={styles.phaseDesc}>
            AI fikrinizi analiz etti ve {questions.length} hedefli mühendislik
            sorusu üretti. En az {minRequired} tanesini cevaplayın. 🎙 Sesli cevap da verebilirsiniz.
          </Text>
        </View>

        {/* Orijinal fikir kartı */}
        <View style={styles.originalCard}>
          <View style={styles.originalHeader}>
            <View style={styles.originalDot} />
            <Text style={styles.originalLabel}>ORİJİNAL NOKTA</Text>
            <Pressable onPress={onBack} style={styles.editBadge}>
              <Text style={styles.editBadgeText}>← Düzenle</Text>
            </Pressable>
          </View>
          <Text style={styles.originalText} numberOfLines={3}>
            {originalIdea}
          </Text>
        </View>

        {/* Yapay zeka soruları */}
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            index={index}
            tag={QUESTION_TAGS[index] || `S${index + 1}`}
            question={question}
            value={answers[index]}
            onChange={(v) => updateAnswer(index, v)}
            isRecording={activeRecordingIndex === index}
            isTranscribing={isTranscribing && activeRecordingIndex === null}
            onMicPress={() => handleMicPress(index)}
          />
        ))}

        {/* İlerleme + Gönder */}
        <View style={styles.bottomSection}>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(filledCount / questions.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {filledCount}/{questions.length} cevaplanmış
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              !isValid && styles.primaryButtonDisabled,
              pressed && isValid && styles.primaryButtonPressed,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || activeRecordingIndex !== null || isTranscribing}
          >
            <Text
              style={[
                styles.primaryButtonText,
                !isValid && styles.primaryButtonTextDisabled,
              ]}
            >
              Çıktı Oluştur →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ─── Soru Kartı Alt Bileşeni ─────────────────────────────────

interface QuestionCardProps {
  index: number;
  tag: string;
  question: string;
  value: string;
  onChange: (v: string) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  onMicPress: () => void;
}

function QuestionCard({
  index,
  tag,
  question,
  value,
  onChange,
  isRecording,
  isTranscribing,
  onMicPress,
}: QuestionCardProps) {
  const isFilled = value.trim().length > 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <View style={[styles.qCard, isFilled && styles.qCardFilled, isRecording && styles.qCardRecording]}>
      <View style={styles.qHeader}>
        <Text style={[styles.qTag, isFilled && styles.qTagFilled]}>{tag}</Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Üretimi</Text>
        </View>
      </View>
      <Text style={styles.qQuestion}>{question}</Text>

      <View style={styles.qInputRow}>
        <TextInput
          style={styles.qInput}
          value={value}
          onChangeText={onChange}
          placeholder="Yazarak veya 🎙 sesli cevap verin..."
          placeholderTextColor={NoktaColors.textDimmed}
          multiline
          textAlignVertical="top"
          selectionColor={NoktaColors.accent}
        />

        {/* Mikrofon butonu */}
        <Pressable
          onPress={onMicPress}
          disabled={isTranscribing}
          style={({ pressed }) => [
            styles.qMicButton,
            isRecording && styles.qMicButtonRecording,
            pressed && !isTranscribing && styles.qMicButtonPressed,
          ]}
        >
          {isRecording ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.qMicRecordingDot} />
            </Animated.View>
          ) : (
            <Text style={styles.qMicIcon}>🎙</Text>
          )}
        </Pressable>
      </View>

      {isRecording && (
        <View style={styles.qRecordingHint}>
          <View style={styles.qRecordingDotSmall} />
          <Text style={styles.qRecordingText}>Dinleniyor... Durdurmak için tekrar dokunun</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },
  phaseHeader: { marginBottom: Spacing.xl },
  phaseTag: {
    fontSize: FontSize.xs,
    color: NoktaColors.accent,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  phaseTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: NoktaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  phaseDesc: {
    fontSize: FontSize.sm,
    color: NoktaColors.textSecondary,
    lineHeight: 20,
  },
  originalCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.borderSubtle,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  originalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  originalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NoktaColors.textDimmed,
    marginRight: Spacing.sm,
  },
  originalLabel: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '600',
    letterSpacing: 1.5,
    flex: 1,
  },
  editBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: NoktaColors.bgElevated,
    borderWidth: 1,
    borderColor: NoktaColors.border,
  },
  editBadgeText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '500',
  },
  originalText: {
    fontSize: FontSize.sm,
    color: NoktaColors.textTertiary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  qCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  qCardFilled: { borderColor: NoktaColors.accentMuted },
  qCardRecording: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.03)' },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  qTag: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '700',
    letterSpacing: 1.5,
    backgroundColor: NoktaColors.bgElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  qTagFilled: {
    color: NoktaColors.accent,
    backgroundColor: NoktaColors.accentGlow,
  },
  aiBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  aiBadgeText: {
    fontSize: 9,
    color: '#60a5fa',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  qQuestion: {
    fontSize: FontSize.sm,
    color: NoktaColors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  // ─── Input + Mic Row ──────────────────────────────────────
  qInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  qInput: {
    flex: 1,
    minHeight: 72,
    backgroundColor: NoktaColors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NoktaColors.borderSubtle,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontSize: FontSize.sm,
    color: NoktaColors.textPrimary,
    lineHeight: 20,
  },
  qMicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NoktaColors.bgElevated,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  qMicButtonRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  qMicButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  qMicIcon: {
    fontSize: 16,
  },
  qMicRecordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  qRecordingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  qRecordingDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  qRecordingText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '500',
  },
  bottomSection: { marginTop: Spacing.sm },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: NoktaColors.bgCard,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NoktaColors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: NoktaColors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: NoktaColors.bgCard,
    borderWidth: 1,
    borderColor: NoktaColors.border,
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: NoktaColors.bg,
    letterSpacing: 0.5,
  },
  primaryButtonTextDisabled: {
    color: NoktaColors.textDimmed,
  },
});

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  Keyboard,
  Alert,
} from 'react-native';
import { NoktaColors, FontSize, Spacing, Radius } from '@/constants/theme';
import {
  startRecording,
  stopAndTranscribe,
  cancelRecording,
} from '@/services/voiceService';

interface CaptureViewProps {
  onSubmit: (text: string) => void;
}

export default function CaptureView({ onSubmit }: CaptureViewProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

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

    const timer = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  // Kayıt sırasında nabız animasyonu
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

  // Temizlik: bileşen unmount olurken kaydı iptal et
  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, []);

  const charCount = text.length;
  const isValid = charCount >= 10;

  const handleSubmit = () => {
    if (!isValid) return;
    Keyboard.dismiss();
    onSubmit(text);
  };

  // ─── Ses Kaydı İşlevleri ──────────────────────────────────

  const handleMicPress = useCallback(async () => {
    if (isTranscribing) return;

    if (isRecording) {
      // Kaydı durdur ve metne çevir
      setIsRecording(false);
      setIsTranscribing(true);

      const result = await stopAndTranscribe();

      setIsTranscribing(false);

      if (result.success) {
        setText((prev) => {
          const separator = prev.trim().length > 0 ? ' ' : '';
          return prev + separator + result.text;
        });
      } else {
        Alert.alert('Transkripsiyon Hatası', result.error);
      }
    } else {
      // Kaydı başlat
      const result = await startRecording();
      if (result.success) {
        setIsRecording(true);
      } else {
        Alert.alert('Mikrofon Hatası', result.error);
      }
    }
  }, [isRecording, isTranscribing]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Faz başlığı */}
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseTag}>FAZ 01</Text>
        <Text style={styles.phaseTitle}>Noktanı Yakala</Text>
        <Text style={styles.phaseDesc}>
          Her harika ürün ham ve işlenmemiş bir fikir olarak doğar — tek bir nokta.
          Yazarak veya sesli olarak noktanı bırak.
        </Text>
      </View>

      {/* Giriş alanı */}
      <View style={styles.inputCard}>
        <View style={styles.inputHeader}>
          <View style={styles.terminalDots}>
            <View style={[styles.termDot, { backgroundColor: '#ef4444' }]} />
            <View style={[styles.termDot, { backgroundColor: '#eab308' }]} />
            <View style={[styles.termDot, { backgroundColor: '#22c55e' }]} />
          </View>
          <Text style={styles.inputLabel}>ham_fikir.txt</Text>

          {/* Mikrofon butonu */}
          <Pressable
            onPress={handleMicPress}
            disabled={isTranscribing}
            style={({ pressed }) => [
              styles.micButton,
              isRecording && styles.micButtonRecording,
              isTranscribing && styles.micButtonTranscribing,
              pressed && !isTranscribing && styles.micButtonPressed,
            ]}
          >
            {isRecording ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.micRecordingDot} />
              </Animated.View>
            ) : isTranscribing ? (
              <Text style={styles.micIcon}>⏳</Text>
            ) : (
              <Text style={styles.micIcon}>🎙</Text>
            )}
          </Pressable>
        </View>

        {/* Kayıt durumu göstergesi */}
        {(isRecording || isTranscribing) && (
          <View style={styles.recordingBanner}>
            <View style={[styles.recordingIndicator, isRecording && styles.recordingIndicatorLive]} />
            <Text style={styles.recordingText}>
              {isRecording
                ? 'Dinleniyor... Durdurmak için mikrofona tekrar dokunun.'
                : 'Ses metne dönüştürülüyor...'}
            </Text>
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Ham fikrinizi (noktanızı) buraya yazın veya sesli giriş yapın..."
          placeholderTextColor={NoktaColors.textDimmed}
          multiline
          textAlignVertical="top"
          selectionColor={NoktaColors.accent}
        />

        <View style={styles.inputFooter}>
          <Text style={styles.inputMethodHint}>
            ✏️ Yazı veya 🎙 Sesli giriş
          </Text>
          <Text style={[styles.charCount, isValid && styles.charCountValid]}>
            {charCount} karakter {charCount < 10 ? '(min 10)' : '✓'}
          </Text>
        </View>
      </View>

      {/* Gönder butonu */}
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          !isValid && styles.primaryButtonDisabled,
          pressed && isValid && styles.primaryButtonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!isValid || isRecording || isTranscribing}
      >
        <Text
          style={[
            styles.primaryButtonText,
            !isValid && styles.primaryButtonTextDisabled,
          ]}
        >
          Fikri Analiz Et →
        </Text>
      </Pressable>

      {/* İpucu */}
      <Text style={styles.hint}>
        Fikriniz, yapılandırılmış bir spesifikasyon oluşturmak için 5 mühendislik
        sorusu ile analiz edilecektir.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  phaseHeader: {
    marginBottom: Spacing['2xl'],
  },
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
  inputCard: {
    backgroundColor: NoktaColors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NoktaColors.borderSubtle,
    backgroundColor: NoktaColors.bgElevated,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: Spacing.md,
  },
  termDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: NoktaColors.textTertiary,
    fontWeight: '500',
    flex: 1,
  },
  // ─── Mikrofon Stili ──────────────────────────────────────
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NoktaColors.bgCard,
    borderWidth: 1,
    borderColor: NoktaColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  micButtonTranscribing: {
    backgroundColor: NoktaColors.accentGlow,
    borderColor: NoktaColors.accentMuted,
    opacity: 0.7,
  },
  micButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  micIcon: {
    fontSize: 16,
  },
  micRecordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  // ─── Kayıt Banner ────────────────────────────────────────
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.15)',
    gap: Spacing.sm,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NoktaColors.accentMuted,
  },
  recordingIndicatorLive: {
    backgroundColor: '#ef4444',
  },
  recordingText: {
    fontSize: FontSize.xs,
    color: NoktaColors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  textInput: {
    minHeight: 140,
    maxHeight: 220,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: FontSize.md,
    color: NoktaColors.textPrimary,
    lineHeight: 24,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: NoktaColors.borderSubtle,
  },
  inputMethodHint: {
    fontSize: 10,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
  },
  charCount: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    fontWeight: '500',
  },
  charCountValid: {
    color: NoktaColors.accent,
  },
  primaryButton: {
    backgroundColor: NoktaColors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
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
  hint: {
    fontSize: FontSize.xs,
    color: NoktaColors.textDimmed,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
  },
});

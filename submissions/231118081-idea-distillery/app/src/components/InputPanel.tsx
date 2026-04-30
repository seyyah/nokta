import { LinearGradient } from 'expo-linear-gradient';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { palette, shadows } from '../theme';

type InputPanelProps = {
  value: string;
  onChangeText: (value: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onDistill: () => void;
};

const placeholder = `Paste the rough thing here.

Half-finished notes, repeated bullets, conflicting directions, copied chat lines, and vague scope are all valid input.

Nokta Draft will collapse overlap, surface tensions, and return one stronger concept draft.`;

export function InputPanel({
  value,
  onChangeText,
  onLoadSample,
  onClear,
  onDistill,
}: InputPanelProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#F9F8F3', '#EBF0F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>Track C / Concept Distillation</Text>
          <Text style={styles.title}>Nokta Draft</Text>
          <Text style={styles.subtitle}>
            Turn raw planning noise into a structured, decision-ready project concept.
          </Text>
          <View style={styles.capabilityRow}>
            <View style={styles.capabilityChip}>
              <Text style={styles.capabilityText}>Deduplicates overlap</Text>
            </View>
            <View style={styles.capabilityChip}>
              <Text style={styles.capabilityText}>Surfaces tensions</Text>
            </View>
            <View style={styles.capabilityChip}>
              <Text style={styles.capabilityText}>Stays local</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.inputShell}>
          <Text style={styles.inputLabel}>Raw note dump</Text>
          <TextInput
            multiline
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={palette.muted}
            style={styles.input}
            textAlignVertical="top"
          />
          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryAction} onPress={onLoadSample}>
              <Text style={styles.secondaryActionText}>Load Sample</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={onClear}>
              <Text style={styles.secondaryActionText}>Clear</Text>
            </Pressable>
          </View>
          <Text style={styles.helper}>
            Messy is fine. The app splits fragments, deduplicates overlap, and assembles one stronger draft.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryAction,
            !value.trim() && styles.primaryActionDisabled,
            pressed && value.trim() && styles.primaryActionPressed,
          ]}
          onPress={onDistill}
          disabled={!value.trim()}
        >
          <Text style={styles.primaryActionText}>Distill Draft</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 18,
  },
  hero: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    gap: 12,
  },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.blueDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: 'Newsreader_700Bold',
    fontSize: 42,
    color: palette.ink,
    lineHeight: 44,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: palette.inkSoft,
    lineHeight: 24,
    maxWidth: 320,
  },
  capabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  capabilityChip: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  capabilityText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: palette.inkSoft,
  },
  inputShell: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
    ...shadows,
  },
  inputLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: palette.inkSoft,
  },
  input: {
    minHeight: 330,
    padding: 0,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: palette.ink,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryActionText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: palette.inkSoft,
  },
  helper: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 8,
    backgroundColor: palette.background,
  },
  primaryAction: {
    backgroundColor: palette.blue,
    borderRadius: 22,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionDisabled: {
    opacity: 0.45,
  },
  primaryActionPressed: {
    backgroundColor: palette.blueDeep,
  },
  primaryActionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from './src/components/PrimaryButton';
import { ScorePanel } from './src/components/ScorePanel';
import { examples } from './src/data/examples';
import { analyzePitch, type PitchAnalysis } from './src/lib/analyzePitch';
import { theme } from './src/theme';

const MIN_INPUT_LENGTH = 24;

export default function App() {
  const scrollRef = useRef<ScrollView>(null);
  const [pitch, setPitch] = useState('');
  const [analysis, setAnalysis] = useState<PitchAnalysis | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const trimmedPitch = pitch.trim();
  const wordCount = trimmedPitch.length === 0 ? 0 : trimmedPitch.split(/\s+/).length;
  const canAnalyze = trimmedPitch.length >= MIN_INPUT_LENGTH;

  const handleUseExample = () => {
    const nextExample = examples[exampleIndex % examples.length];
    setPitch(nextExample.text);
    setAnalysis(null);
    setExampleIndex((current) => current + 1);
  };

  const handleAnalyze = () => {
    if (!canAnalyze) {
      return;
    }

    const nextAnalysis = analyzePitch(trimmedPitch);
    setAnalysis(nextAnalysis);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const handleReset = () => {
    setPitch('');
    setAnalysis(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardShell}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View pointerEvents="none" style={styles.orbOne} />
          <View pointerEvents="none" style={styles.orbTwo} />

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Track B - Offline pitch due diligence</Text>
            <Text style={styles.title}>PitchSieve</Text>
            <Text style={styles.subtitle}>
              Paste a startup pitch. Get a local slop score, skeptical reasoning, critique
              tags, and a tighter rewrite without sending data anywhere.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pitch paragraph</Text>
            <Text style={styles.cardHint}>
              Language score only. PitchSieve critiques rhetoric and structure, not whether the
              business will succeed.
            </Text>

            <TextInput
              multiline
              numberOfLines={8}
              placeholder="Example: We are building an AI-powered platform that revolutionizes how businesses unlock seamless growth across a massive market..."
              placeholderTextColor={theme.colors.placeholder}
              style={styles.input}
              textAlignVertical="top"
              value={pitch}
              onChangeText={(value) => {
                setPitch(value);
                setAnalysis(null);
              }}
            />

            <View style={styles.inputMetaRow}>
              <Text style={styles.metaText}>{wordCount} words</Text>
              <Text style={styles.metaText}>
                {canAnalyze
                  ? 'Ready for analysis'
                  : `Add at least ${MIN_INPUT_LENGTH - trimmedPitch.length} more characters`}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <PrimaryButton
                label="Use Example"
                onPress={handleUseExample}
                variant="secondary"
              />
              <PrimaryButton label="Analyze" onPress={handleAnalyze} disabled={!canAnalyze} />
            </View>
          </View>

          {analysis ? (
            <View style={styles.resultStack}>
              <ScorePanel score={analysis.score} />

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Critique tags</Text>
                <View style={styles.tagWrap}>
                  {analysis.tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Why it scored this way</Text>
                <View style={styles.reasonStack}>
                  {analysis.reasons.map((reason) => (
                    <View key={reason} style={styles.reasonRow}>
                      <View style={styles.reasonBullet} />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.card, styles.rewriteCard]}>
                <Text style={styles.sectionTitle}>Tighter rewrite</Text>
                <Text style={styles.rewriteText}>{analysis.rewrite}</Text>
              </View>

              <PrimaryButton label="Analyze Another" onPress={handleReset} />
            </View>
          ) : (
            <View style={styles.footerNote}>
              <Text style={styles.footerTitle}>What the score looks for</Text>
              <Text style={styles.footerText}>
                Buzzwords, vague target users, empty market-size flexes, weak differentiation,
                generic problem framing, and claims that sound confident but untestable.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardShell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
  },
  orbOne: {
    position: 'absolute',
    top: -48,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: theme.colors.accentWash,
  },
  orbTwo: {
    position: 'absolute',
    top: 240,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: theme.colors.mossWash,
  },
  hero: {
    gap: 8,
    paddingTop: 8,
  },
  eyebrow: {
    fontFamily: theme.fonts.label,
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.accent,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: theme.colors.ink,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    maxWidth: 620,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 14,
    ...theme.shadow.card,
  },
  cardLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 20,
    color: theme.colors.ink,
  },
  cardHint: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
  },
  input: {
    minHeight: 176,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  inputMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.muted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultStack: {
    gap: 18,
  },
  sectionTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 19,
    color: theme.colors.ink,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.tagBorder,
    backgroundColor: theme.colors.tagBackground,
  },
  tagText: {
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 0.3,
    color: theme.colors.ink,
  },
  reasonStack: {
    gap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reasonBullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    marginTop: 8,
  },
  reasonText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.ink,
  },
  rewriteCard: {
    backgroundColor: theme.colors.panelStrong,
    borderColor: theme.colors.panelStrong,
  },
  rewriteText: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.paper,
  },
  footerNote: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: theme.colors.noteBackground,
  },
  footerTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    color: theme.colors.ink,
  },
  footerText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.muted,
  },
});

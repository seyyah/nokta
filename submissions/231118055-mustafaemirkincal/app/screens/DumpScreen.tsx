import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeNotes, IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dump'>;
};

const PLACEHOLDER = `WhatsApp export or rough notes work fine.

1. Launch idea cards for student projects
2. Need a cleaner way to deduplicate repeated decisions
3. This pitch feels strong but the scope is too wide
4. Follow up with design team before Friday
5. Maybe the mobile app should highlight the most actionable items
6. Decision: keep the first version local-first
7. Risk: no stable API key for the demo device
8. Repeated note: launch idea cards for student projects`;

export default function DumpScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  function handleChange(nextText: string) {
    setText(nextText);
    const lines = nextText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
    setLineCount(lines.length);
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      Alert.alert('Empty input', 'Paste a note dump, pitch, or messy chat export first.');
      return;
    }

    setLoading(true);
    try {
      const cards: IdeaCard[] = await analyzeNotes(text);
      navigation.navigate('Cards', { cards });
    } catch (error: any) {
      Alert.alert('Analysis failed', error?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>NOKTA</Text>
            <Text style={styles.kicker}>Track C, Migration & Dedup</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{lineCount || '0'} lines</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Turn messy notes into idea cards.</Text>
          <Text style={styles.heroCopy}>
            Paste WhatsApp exports, bullet lists, or rough meeting notes. NOKTA groups duplicates,
            trims the noise, and surfaces the most actionable cards.
          </Text>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Dedup</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Traceable</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>AI ready</Text>
            </View>
          </View>
        </View>

        <View style={styles.sampleBox}>
          <Text style={styles.sampleTitle}>What it handles</Text>
          <Text style={styles.sampleText}>
            Repeated ideas, mixed languages, team decisions, action items, and risk notes from
            chaotic chat logs or brainstorming dumps.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor="#7b8095"
          value={text}
          onChangeText={handleChange}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0b1020" />
          ) : (
            <Text style={styles.buttonText}>Analyze and deduplicate</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Local fallback is built in. If `EXPO_PUBLIC_GROQ_API_KEY` is present, the app uses Groq
          for model-backed extraction.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1020',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -100,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    left: -80,
    bottom: -120,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  kicker: {
    color: '#98a2b3',
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: '#dbe4ff',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroCopy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '700',
  },
  sampleBox: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderColor: 'rgba(34, 211, 238, 0.16)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sampleTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  sampleText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 250,
    padding: 18,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#0b1020',
    fontSize: 16,
    fontWeight: '900',
  },
  footerNote: {
    color: '#7c8aa6',
    fontSize: 12,
    lineHeight: 18,
  },
});

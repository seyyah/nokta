import { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import RadarBackground from '@/components/RadarBackground';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { sanitize } from '@/services/sanitize';
import { embed, findMostSimilar, DUPLICATE_THRESHOLD } from '@/services/embeddings';
import { listHistory } from '@/services/storage';
import { proposeQuestions, availableProviders } from '@/services/orchestrator';
import { session } from '@/state/sessionStore';
import { AllProvidersFailedError, type ProviderName } from '@/types';
import { useModeStore } from '@/state/modeStore';
import { generateInvestorQuestions } from '@/services/investorAnalyzer';

const SCANNING_MESSAGES = [
  'Fikir analiz ediliyor...',
  'Teknik derinlik ölçülüyor...',
  'Engineering soruları hazırlanıyor...',
  'Slop tespiti yapılıyor...',
];

export default function CaptureScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanningIndex, setScanningIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const voice = useVoiceInput();
  const providers = availableProviders();
  const { mode, setMode } = useModeStore();

  const draft = voice.transcript || text;

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setScanningIndex((prev) => (prev + 1) % SCANNING_MESSAGES.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const onContinue = async () => {
    setError(null);
    const idea = sanitize(draft);
    if (idea.length < 12) {
      setError('Fikir en az 12 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      const history = await listHistory();
      const dup = findMostSimilar(embed(idea), history);
      const duplicateOf = dup && dup.score >= DUPLICATE_THRESHOLD ? dup.id : null;

      let questions;
      let provider: ProviderName | null = null;
      let attempts = 0;

      if (mode === 'investor') {
        // Use predefined investor questions (no API call needed)
        questions = generateInvestorQuestions();
      } else {
        // Use AI to generate entrepreneur questions
        const result = await proposeQuestions(idea);
        questions = result.data;
        provider = result.provider;
        attempts = result.attempts;
      }

      session.set({
        idea,
        questions,
        answers: {},
        provider,
        attempts,
        duplicateOf,
        spec: null,
        mode,
      });
      router.push('/question-flow');
    } catch (e) {
      if (e instanceof AllProvidersFailedError) {
        setError(`Tüm provider'lar başarısız. Detay: ${JSON.stringify(e.errors)}`);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <RadarBackground />
      <Text style={styles.title}>● NOKTA</Text>
      <Text style={styles.subtitle}>
        {mode === 'entrepreneur' 
          ? 'Bir nokta yakala. Engineering ile spec\'e dönüştür.'
          : 'Pitch analizi. Yatırımcı perspektifiyle değerlendir.'}
      </Text>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'entrepreneur' && styles.modeButtonActive]}
          onPress={() => setMode('entrepreneur')}
        >
          <Text style={[styles.modeButtonText, mode === 'entrepreneur' && styles.modeButtonTextActive]}>
            💡 Entrepreneur
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'investor' && styles.modeButtonActive]}
          onPress={() => setMode('investor')}
        >
          <Text style={[styles.modeButtonText, mode === 'investor' && styles.modeButtonTextActive]}>
            💰 Investor
          </Text>
        </Pressable>
      </View>

      <View style={styles.providersRow}>
        {providers.length === 0 ? (
          <Text style={styles.warn}>Hiç API key yok. `.env`'e en az bir tane ekle.</Text>
        ) : (
          providers.map((p) => (
            <View key={p} style={styles.providerChip}>
              <Text style={styles.providerChipText}>{p}</Text>
            </View>
          ))
        )}
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Yağmurda otobüs durağında aklıma gelen şu fikir…"
        placeholderTextColor="#777"
        value={draft}
        onChangeText={(t) => {
          setText(t);
        }}
        editable={!voice.listening && !loading}
      />

      {voice.supported ? (
        <View style={styles.row}>
          <Button
            variant={voice.listening ? 'danger' : 'ghost'}
            onPress={voice.listening ? voice.stop : voice.start}
            style={styles.flex1}
          >
            {voice.listening ? 'Dinliyor… durdur' : '🎙  Sesli not'}
          </Button>
        </View>
      ) : null}
      {voice.error ? <Text style={styles.warn}>{voice.error}</Text> : null}

      <Button 
        onPress={onContinue} 
        disabled={loading || providers.length === 0}
        style={styles.primaryButton}
      >
        {loading ? 'Analiz ediliyor…' : 'Engineering soruları üret  →'}
      </Button>

      {loading ? (
        <View style={styles.scanningBox}>
          <ActivityIndicator style={styles.loader} color="#00E5FF" size="large" />
          <Text style={styles.scanningText}>{SCANNING_MESSAGES[scanningIndex]}</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  content: { padding: 20, gap: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  providersRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  providerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  providerChipText: { color: '#aaa', fontSize: 11, fontWeight: '600' },
  input: {
    minHeight: 140,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#333',
    lineHeight: 24,
  },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  warn: { color: '#fbbf24', fontSize: 13, lineHeight: 20 },
  error: { color: '#ef4444', fontSize: 13, marginTop: 8, lineHeight: 20 },
  loader: { marginTop: 8 },
  scanningBox: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  scanningText: {
    color: '#00E5FF',
    fontSize: 14,
    marginTop: 12,
    fontFamily: 'monospace',
  },
  primaryButton: {
    backgroundColor: '#00E5FF',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  modeButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#00E5FF',
  },
});

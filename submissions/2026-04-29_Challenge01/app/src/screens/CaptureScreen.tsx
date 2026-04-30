import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { sanitize } from '@/services/sanitize';
import { embed, findMostSimilar, DUPLICATE_THRESHOLD } from '@/services/embeddings';
import { listHistory } from '@/services/storage';
import { proposeQuestions, availableProviders } from '@/services/orchestrator';
import { session } from '@/state/sessionStore';
import { AllProvidersFailedError } from '@/types';

export default function CaptureScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voice = useVoiceInput();
  const providers = availableProviders();

  const draft = voice.transcript || text;

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

      const result = await proposeQuestions(idea);
      session.set({
        idea,
        questions: result.data,
        answers: {},
        provider: result.provider,
        attempts: result.attempts,
        duplicateOf,
        spec: null,
      });
      router.push('/questions');
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
      <Text style={styles.title}>Nokta</Text>
      <Text style={styles.subtitle}>Bir nokta yakala. Engineering ile spec'e dönüştür.</Text>

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
        placeholderTextColor="#555"
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

      <Button onPress={onContinue} disabled={loading || providers.length === 0}>
        {loading ? 'Düşünüyor…' : 'Engineering soruları üret  →'}
      </Button>

      {loading ? <ActivityIndicator style={styles.loader} color="#fff" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20, gap: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 36, fontWeight: '800' },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 12 },
  providersRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  providerChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#222',
  },
  providerChipText: { color: '#888', fontSize: 11, fontWeight: '500' },
  input: {
    minHeight: 140,
    backgroundColor: '#141414',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#222',
  },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  warn: { color: '#fbbf24', fontSize: 13 },
  error: { color: '#ef4444', fontSize: 13 },
  loader: { marginTop: 8 },
});

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession, session } from '@/state/sessionStore';
import { emitSpec } from '@/services/orchestrator';
import { embed } from '@/services/embeddings';
import { saveHistory } from '@/services/storage';
import { AllProvidersFailedError } from '@/types';

const CATEGORY_LABEL: Record<string, string> = {
  problem: 'Problem',
  user: 'Kullanıcı',
  scope: 'Scope',
  constraint: 'Kısıt',
  success: 'Başarı',
};

export default function QuestionsScreen() {
  const s = useSession();
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(s.answers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = s.questions.every((q) => (draft[q.id] ?? '').trim().length >= 3);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      session.set({ answers: draft });
      const result = await emitSpec(s.idea, s.questions, draft);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const entry = { ...result.data, id, embedding: embed(result.data.markdown) };
      await saveHistory(entry);
      session.set({ spec: result.data, provider: result.provider, attempts: result.attempts });
      router.push('/spec');
    } catch (e) {
      if (e instanceof AllProvidersFailedError) {
        setError(`Tüm provider'lar başarısız: ${JSON.stringify(e.errors)}`);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {s.provider ? <StatusBadge provider={s.provider} attempts={s.attempts} /> : null}
      {s.duplicateOf ? (
        <View style={styles.dupWarn}>
          <Text style={styles.dupTitle}>⚠  Benzer fikir geçmişte var</Text>
          <Text style={styles.dupText}>
            Ham fikrin önceki bir spec ile {'>'}85% benzer. Devam edebilirsin ama orijinallik aksında dezavantaj olur.
          </Text>
        </View>
      ) : null}
      <Text style={styles.title}>3-{s.questions.length} engineering sorusu</Text>
      {s.questions.map((q, i) => (
        <View key={q.id} style={styles.qBox}>
          <Text style={styles.qLabel}>
            {i + 1}. {CATEGORY_LABEL[q.category] ?? q.category}
          </Text>
          <Text style={styles.qText}>{q.text}</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Cevabın…"
            placeholderTextColor="#555"
            value={draft[q.id] ?? ''}
            onChangeText={(t) => setDraft({ ...draft, [q.id]: t })}
            editable={!loading}
          />
        </View>
      ))}
      <Button onPress={onSubmit} disabled={!allAnswered || loading}>
        {loading ? 'Spec yazılıyor…' : 'Spec üret  →'}
      </Button>
      {loading ? <ActivityIndicator style={styles.loader} color="#fff" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 20, gap: 16, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  qBox: { backgroundColor: '#141414', padding: 14, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#222' },
  qLabel: { color: '#888', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  qText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  input: {
    minHeight: 70,
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#222',
  },
  dupWarn: {
    backgroundColor: '#3b2a0a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c5e1c',
    gap: 4,
  },
  dupTitle: { color: '#fbbf24', fontWeight: '700', fontSize: 13 },
  dupText: { color: '#d6c89a', fontSize: 12, lineHeight: 18 },
  loader: { marginTop: 8 },
  error: { color: '#ef4444', fontSize: 13 },
});

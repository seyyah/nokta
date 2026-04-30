import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────
type Phase = 'input' | 'questioning' | 'spec';

interface QA {
  question: string;
  answer: string;
}

// ─── Anthropic API ───────────────────────────────────────────────────────────
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

// ─── Prompts ─────────────────────────────────────────────────────────────────
const QUESTION_SYSTEM = `You are an engineering-guided idea interviewer for the NOKTA system.
Your job: Ask ONE sharp, specific engineering question to clarify a raw idea.
Focus on: problem definition, target user, scope, constraints, or success metrics.
Be concise. One sentence. No preamble. Just the question.
Ask in the same language the user used (Turkish or English).`;

const SPEC_SYSTEM = `You are a product spec writer for the NOKTA system.
Given a raw idea and Q&A answers, produce a crisp ONE-PAGE product spec.
Format with these sections: ## Problem, ## User, ## Core Feature, ## Scope, ## Constraints, ## Success Metric
Be specific, no hallucinations, no fluff. Engineering-grade language.
Write in the same language the user used.`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DotCapture() {
  const [phase, setPhase] = useState<Phase>('input');
  const [rawIdea, setRawIdea] = useState('');
  const [qas, setQas] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const MAX_QUESTIONS = 4;

  const fadeTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleIdeaSubmit = useCallback(async () => {
    if (!rawIdea.trim()) return;
    setLoading(true);
    try {
      const q = await callClaude(
        QUESTION_SYSTEM,
        `Raw idea: "${rawIdea}"\nAsk your first engineering question.`
      );
      fadeTransition(() => {
        setCurrentQuestion(q.trim());
        setPhase('questioning');
        setQuestionIndex(1);
      });
    } catch {
      Alert.alert('Hata', 'API bağlantısı başarısız.');
    } finally {
      setLoading(false);
    }
  }, [rawIdea]);

  const handleAnswerSubmit = useCallback(async () => {
    if (!currentAnswer.trim()) return;
    const newQas = [...qas, { question: currentQuestion, answer: currentAnswer }];
    setQas(newQas);
    setCurrentAnswer('');

    if (questionIndex >= MAX_QUESTIONS) {
      setLoading(true);
      try {
        const qaText = newQas.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
        const generatedSpec = await callClaude(
          SPEC_SYSTEM,
          `Raw idea: "${rawIdea}"\n\nQ&A Session:\n${qaText}\n\nGenerate the product spec.`
        );
        fadeTransition(() => {
          setSpec(generatedSpec.trim());
          setPhase('spec');
        });
      } catch {
        Alert.alert('Hata', 'Spec oluşturulamadı.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const qaText = newQas.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
        const nextQ = await callClaude(
          QUESTION_SYSTEM,
          `Raw idea: "${rawIdea}"\n\nPrevious Q&A:\n${qaText}\n\nAsk question ${questionIndex + 1}.`
        );
        fadeTransition(() => {
          setCurrentQuestion(nextQ.trim());
          setQuestionIndex((i) => i + 1);
        });
      } catch {
        Alert.alert('Hata', 'API bağlantısı başarısız.');
      } finally {
        setLoading(false);
      }
    }
  }, [currentAnswer, currentQuestion, qas, questionIndex, rawIdea]);

  const handleReset = () => {
    fadeTransition(() => {
      setPhase('input');
      setRawIdea('');
      setQas([]);
      setCurrentQuestion('');
      setCurrentAnswer('');
      setSpec('');
      setQuestionIndex(0);
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dot} />
          <Text style={styles.title}>NOKTA</Text>
          <Text style={styles.subtitle}>Dot Capture & Enrich · Track A</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── INPUT PHASE ── */}
          {phase === 'input' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>HAM FİKİR</Text>
              <Text style={styles.cardHint}>
                Aklındaki ham fikri yaz. Bir kelime, yarım cümle, dağınık düşünce — olduğu gibi.
              </Text>
              <TextInput
                style={styles.ideaInput}
                value={rawIdea}
                onChangeText={setRawIdea}
                placeholder="örn: Kedi sahipleri için Uber..."
                placeholderTextColor="#3a3a4a"
                multiline
                autoFocus
              />
              <TouchableOpacity
                style={[styles.btn, !rawIdea.trim() && styles.btnDisabled]}
                onPress={handleIdeaSubmit}
                disabled={!rawIdea.trim() || loading}
              >
                {loading
                  ? <ActivityIndicator color="#0a0a0f" size="small" />
                  : <Text style={styles.btnText}>NOKTAYI YAKALA →</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* ── QUESTIONING PHASE ── */}
          {phase === 'questioning' && (
            <View>
              {/* Progress bar */}
              <View style={styles.progressRow}>
                {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      i < questionIndex && styles.progressDotDone,
                      i === questionIndex - 1 && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressLabel}>Soru {questionIndex} / {MAX_QUESTIONS}</Text>

              {/* Idea recap */}
              <View style={styles.ideaRecap}>
                <Text style={styles.ideaRecapLabel}>FİKRİN</Text>
                <Text style={styles.ideaRecapText}>{rawIdea}</Text>
              </View>

              {/* Previous Q&As */}
              {qas.map((qa, i) => (
                <View key={i} style={styles.qaBlock}>
                  <Text style={styles.qaQ}>S{i + 1}: {qa.question}</Text>
                  <Text style={styles.qaA}>↳ {qa.answer}</Text>
                </View>
              ))}

              {/* Current question */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>SORU {questionIndex}</Text>
                <Text style={styles.questionText}>{currentQuestion}</Text>
                <TextInput
                  style={styles.answerInput}
                  value={currentAnswer}
                  onChangeText={setCurrentAnswer}
                  placeholder="Cevabın..."
                  placeholderTextColor="#3a3a4a"
                  multiline
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.btn, !currentAnswer.trim() && styles.btnDisabled]}
                  onPress={handleAnswerSubmit}
                  disabled={!currentAnswer.trim() || loading}
                >
                  {loading
                    ? <ActivityIndicator color="#0a0a0f" size="small" />
                    : <Text style={styles.btnText}>
                        {questionIndex >= MAX_QUESTIONS ? 'SPEC OLUŞTUR →' : 'İLERİ →'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── SPEC PHASE ── */}
          {phase === 'spec' && (
            <View>
              <View style={styles.specHeader}>
                <Text style={styles.specBadge}>✦ SPEC HAZIR</Text>
                <Text style={styles.specTitle}>Ürün Spesifikasyonu</Text>
              </View>
              <View style={styles.specCard}>
                <Text style={styles.specText}>{spec}</Text>
              </View>
              <TouchableOpacity style={styles.btnSecondary} onPress={handleReset}>
                <Text style={styles.btnSecondaryText}>+ YENİ NOKTA</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>

        <Text style={styles.footer}>NOKTA · NAIM Ecosystem · 231118087</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0f' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 64, paddingBottom: 48 },

  header: { alignItems: 'center', marginBottom: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e8d5a3', marginBottom: 14 },
  title: { color: '#e8d5a3', fontSize: 30, fontWeight: '800', letterSpacing: 8 },
  subtitle: { color: '#444', fontSize: 10, letterSpacing: 2, marginTop: 6, textTransform: 'uppercase' },

  card: {
    backgroundColor: '#111118', borderWidth: 1,
    borderColor: '#1e1e2e', borderRadius: 14, padding: 22, marginBottom: 16,
  },
  cardLabel: { color: '#e8d5a3', fontSize: 9, letterSpacing: 4, fontWeight: '700', marginBottom: 10 },
  cardHint: { color: '#444', fontSize: 13, lineHeight: 20, marginBottom: 18 },

  ideaInput: {
    color: '#ddd', fontSize: 17, lineHeight: 26, minHeight: 80,
    textAlignVertical: 'top', borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e', paddingBottom: 14, marginBottom: 22,
  },
  answerInput: {
    color: '#ddd', fontSize: 15, lineHeight: 24, minHeight: 60,
    textAlignVertical: 'top', borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e', paddingBottom: 12, marginBottom: 22,
  },
  questionText: {
    color: '#ccc', fontSize: 16, lineHeight: 26,
    marginBottom: 20, fontStyle: 'italic',
  },

  btn: {
    backgroundColor: '#e8d5a3', borderRadius: 10,
    paddingVertical: 15, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#1a1a24' },
  btnText: { color: '#0a0a0f', fontWeight: '800', letterSpacing: 2, fontSize: 12 },

  btnSecondary: {
    borderWidth: 1, borderColor: '#1e1e2e', borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginTop: 12,
  },
  btnSecondaryText: { color: '#444', fontWeight: '700', letterSpacing: 2, fontSize: 12 },

  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1e1e2e' },
  progressDotDone: { backgroundColor: '#e8d5a3' },
  progressDotActive: { backgroundColor: '#e8d5a3', width: 28, borderRadius: 4 },
  progressLabel: { color: '#333', fontSize: 10, letterSpacing: 2, marginBottom: 20 },

  ideaRecap: {
    backgroundColor: '#0d0d16', borderLeftWidth: 2, borderLeftColor: '#e8d5a3',
    padding: 14, borderRadius: 6, marginBottom: 16,
  },
  ideaRecapLabel: { color: '#e8d5a3', fontSize: 9, letterSpacing: 3, marginBottom: 6, fontWeight: '700' },
  ideaRecapText: { color: '#666', fontSize: 14, lineHeight: 20 },

  qaBlock: {
    marginBottom: 14, paddingLeft: 14,
    borderLeftWidth: 1, borderLeftColor: '#1e1e2e',
  },
  qaQ: { color: '#444', fontSize: 12, marginBottom: 4, lineHeight: 18 },
  qaA: { color: '#666', fontSize: 13, lineHeight: 20 },

  specHeader: { marginBottom: 20 },
  specBadge: { color: '#e8d5a3', fontSize: 10, letterSpacing: 3, fontWeight: '700', marginBottom: 8 },
  specTitle: { color: '#eee', fontSize: 24, fontWeight: '800' },

  specCard: {
    backgroundColor: '#111118', borderWidth: 1,
    borderColor: '#1e1e2e', borderRadius: 14, padding: 22, marginBottom: 16,
  },
  specText: { color: '#bbb', fontSize: 14, lineHeight: 24 },

  footer: { color: '#222', fontSize: 10, textAlign: 'center', marginTop: 40, letterSpacing: 2 },
});
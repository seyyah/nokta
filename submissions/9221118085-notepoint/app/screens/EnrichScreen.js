import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { generateIdeaCard } from '../utils/geminiService';

const DIMENSION_COLORS = {
  Problem:     '#CC3333',
  User:        '#1A73E8',
  Scope:       '#188038',
  Constraints: '#E37400',
};

export default function EnrichScreen({ route, navigation }) {
  const { idea, questions } = route.params;
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function setAnswer(id, text) {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  }

  function allAnswered() {
    return questions.every((q) => (answers[q.id] || '').trim().length > 0);
  }

  async function handleGenerate() {
    if (!allAnswered()) {
      setError('Please answer all 4 questions.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const card = await generateIdeaCard(idea, questions, answers);
      navigation.navigate('Artifact', { card });
    } catch (e) {
      setError('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageHint}>
            Answer briefly — a sentence or two is enough.
          </Text>

          {questions.map((q, i) => {
            const color = DIMENSION_COLORS[q.dimension] || '#555555';
            return (
              <View key={q.id} style={styles.qCard}>
                <View style={styles.qHeader}>
                  <View style={[styles.badge, { backgroundColor: color }]}>
                    <Text style={styles.badgeText}>{q.dimension}</Text>
                  </View>
                  <Text style={styles.qNum}>Q{i + 1}</Text>
                </View>
                <Text style={styles.qText}>{q.question}</Text>
                <TextInput
                  style={[
                    styles.input,
                    (answers[q.id] || '').length > 0 && { borderColor: color },
                  ]}
                  placeholder="Your answer..."
                  placeholderTextColor="#BBBBBB"
                  value={answers[q.id] || ''}
                  onChangeText={(t) => setAnswer(q.id, t)}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            );
          })}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, (!allAnswered() || loading) && styles.btnDisabled]}
            onPress={handleGenerate}
            disabled={!allAnswered() || loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={[styles.btnText, { marginLeft: 10 }]}>Building Idea Card...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Build Idea Card →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>Step 2 of 3</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 20, paddingBottom: 48 },
  pageHint: { fontSize: 14, color: '#777777', marginBottom: 20, lineHeight: 20 },
  qCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 16,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#EEEEEE',
  },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: {
    borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  qNum: { fontSize: 12, color: '#AAAAAA', fontWeight: '600' },
  qText: { fontSize: 15, color: '#222222', lineHeight: 22, marginBottom: 12 },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5, borderColor: '#DDDDDD', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#111111',
    minHeight: 70, lineHeight: 20,
  },
  error: { color: '#CC3333', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: {
    backgroundColor: '#111111',
    borderRadius: 10, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#AAAAAA' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  footer: { textAlign: 'center', color: '#AAAAAA', fontSize: 12, marginTop: 16 },
});

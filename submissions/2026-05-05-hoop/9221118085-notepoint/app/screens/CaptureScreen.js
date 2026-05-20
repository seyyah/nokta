import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { generateQuestions } from '../utils/geminiService';

export default function CaptureScreen({ navigation }) {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleNext() {
    const trimmed = idea.trim();
    if (trimmed.length < 15) {
      setError('Please describe your idea in at least a few words.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await generateQuestions(trimmed);
      navigation.navigate('Enrich', { idea: trimmed, questions: data.questions });
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
          <Text style={styles.label}>YOUR RAW IDEA</Text>
          <Text style={styles.hint}>
            Dump it here — a sentence, a paragraph, a voice transcript. Don't filter yourself.
          </Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="e.g. An app that helps students turn messy lecture notes into flashcards using AI..."
            placeholderTextColor="#AAAAAA"
            value={idea}
            onChangeText={(t) => { setIdea(t); setError(''); }}
            textAlignVertical="top"
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, (loading || idea.trim().length < 15) && styles.btnDisabled]}
            onPress={handleNext}
            disabled={loading || idea.trim().length < 15}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnText}>Generate Questions →</Text>
            }
          </TouchableOpacity>

          <Text style={styles.footer}>
            Step 1 of 3 · Gemini will ask 4 engineering questions
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 20, paddingBottom: 48 },
  label: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: '#555555', marginBottom: 6,
  },
  hint: { fontSize: 14, color: '#777777', lineHeight: 20, marginBottom: 16 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#111111',
    minHeight: 180, lineHeight: 22,
  },
  error: { color: '#CC3333', fontSize: 13, marginTop: 10 },
  btn: {
    backgroundColor: '#111111',
    borderRadius: 10, paddingVertical: 15,
    alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { backgroundColor: '#AAAAAA' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#AAAAAA', fontSize: 12, marginTop: 16 },
});

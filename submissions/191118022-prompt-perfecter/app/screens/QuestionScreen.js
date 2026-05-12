import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { generateQuestions, generatePerfectPrompt } from '../services/openai';

const CATEGORIES_COLORS = {
  'Problem': '#ff6b6b',
  'Hedef Kullanıcı': '#ffd93d',
  'Kapsam': '#6bcb77',
  'Kısıt': '#4d96ff',
};

export default function QuestionScreen({ initialPrompt, onComplete, onBack }) {
  const [phase, setPhase] = useState('loading'); // loading | questions | generating
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [currentQ, setCurrentQ] = useState(0);
  const [loadingText, setLoadingText] = useState('Sorular hazırlanıyor...');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50 }),
    ]).start();
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (phase === 'questions') animateIn();
  }, [currentQ, phase]);

  const loadQuestions = async () => {
    try {
      const result = await generateQuestions(initialPrompt);
      setQuestions(result.questions);
      setPhase('questions');
    } catch (e) {
      Alert.alert('Hata', e.message, [{ text: 'Geri Dön', onPress: onBack }]);
    }
  };

  const handleNext = async () => {
    const current = answers[currentQ]?.trim();
    if (!current || current.length < 3) {
      Alert.alert('Boş Bırakma', 'Lütfen bu soruyu yanıtla, ardından devam edebilirsin.');
      return;
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All questions answered → generate result
      setPhase('generating');
      setLoadingText('Mükemmel prompt hazırlanıyor...');
      try {
        const promptResult = await generatePerfectPrompt(initialPrompt, questions, answers);
        onComplete({ ...promptResult, questions, answers, initialPrompt });
      } catch (e) {
        Alert.alert('Hata', e.message, [{ text: 'Geri Dön', onPress: onBack }]);
      }
    }
  };

  const handleAnswerChange = (text) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = text;
    setAnswers(newAnswers);
  };

  if (phase === 'loading' || phase === 'generating') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c47ff" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!questions.length) return null;

  const q = questions[currentQ];
  const categoryColor = CATEGORIES_COLORS[q.category] || '#6c47ff';
  const progress = (currentQ + 1) / questions.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.progressLabel}>{currentQ + 1} / {questions.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: categoryColor }]} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Context card */}
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Ham Fikrin</Text>
            <Text style={styles.contextText} numberOfLines={2}>{initialPrompt}</Text>
          </View>

          {/* Question card */}
          <Animated.View
            style={[
              styles.questionCard,
              { borderColor: categoryColor + '55' },
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>{q.category}</Text>
            </View>

            <Text style={styles.questionText}>{q.question}</Text>

            <TextInput
              style={styles.answerInput}
              placeholder="Cevabını buraya yaz..."
              placeholderTextColor="#444"
              value={answers[currentQ]}
              onChangeText={handleAnswerChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
          </Animated.View>

          {/* Previous answers */}
          {currentQ > 0 && (
            <View style={styles.prevSection}>
              <Text style={styles.prevLabel}>Önceki Cevapların</Text>
              {questions.slice(0, currentQ).map((pq, i) => (
                <View key={i} style={styles.prevItem}>
                  <Text style={[styles.prevCategory, { color: CATEGORIES_COLORS[pq.category] || '#888' }]}>
                    {pq.category}
                  </Text>
                  <Text style={styles.prevAnswer} numberOfLines={1}>{answers[i]}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: categoryColor }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {currentQ < questions.length - 1 ? `Sonraki Soru →` : '✨ Mükemmelleştir!'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a1a' },
  flex: { flex: 1 },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600' },


  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 35,
  },
  backBtn: { padding: 4 },
  backBtnText: { color: '#888', fontSize: 15 },
  progressLabel: { color: '#666', fontSize: 14 },

  progressBar: {
    height: 3,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    // transition not supported in RN but width change is fast enough
  },

  container: { padding: 20, paddingBottom: 40 },

  contextCard: {
    backgroundColor: '#12121f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1e3a',
    marginBottom: 20,
  },
  contextLabel: { color: '#555', fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  contextText: { color: '#888', fontSize: 13, lineHeight: 18 },

  questionCard: {
    backgroundColor: '#12121f',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  categoryText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 26,
    marginBottom: 18,
  },
  answerInput: {
    backgroundColor: '#0a0a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    padding: 14,
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
  },

  prevSection: { marginBottom: 20 },
  prevLabel: { color: '#444', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  prevItem: {
    backgroundColor: '#0d0d1c',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevCategory: { fontSize: 11, fontWeight: '700', width: 80 },
  prevAnswer: { color: '#666', fontSize: 13, flex: 1 },

  nextBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

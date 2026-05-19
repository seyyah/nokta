import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateEngineeringQuestions } from '../services/aiService';

export default function QuestionsScreen({ navigation, route }) {
  const { rawIdea } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    // Animate each question entry
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const qs = await generateEngineeringQuestions(rawIdea);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentAnswer.trim().length < 3) return;

    const newAnswers = [
      ...answers,
      {
        ...questions[currentStep],
        answer: currentAnswer.trim(),
      },
    ];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions answered, go to spec
      navigation.navigate('Spec', {
        rawIdea,
        answers: newAnswers,
      });
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Mühendislik soruları hazırlanıyor...</Text>
        <Text style={styles.loadingSubtext}>AI fikrinizi analiz ediyor ✨</Text>
      </LinearGradient>
    );
  }

  const q = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a3e', '#0a0a1a']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>Adım 2/3 — Mühendislik Soruları</Text>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#6c5ce7', '#a29bfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Soru {currentStep + 1} / {questions.length}
          </Text>

          {/* Question card */}
          <Animated.View
            style={[
              styles.questionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryEmoji}>{q?.emoji}</Text>
              <Text style={styles.categoryText}>{q?.category}</Text>
            </View>

            <Text style={styles.questionText}>{q?.question}</Text>

            {q?.hint && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>💡 {q.hint}</Text>
              </View>
            )}
          </Animated.View>

          {/* Original idea reminder */}
          <View style={styles.ideaReminder}>
            <Text style={styles.ideaReminderLabel}>Fikrin:</Text>
            <Text style={styles.ideaReminderText} numberOfLines={2}>
              "{rawIdea}"
            </Text>
          </View>

          {/* Answer input */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Cevabınızı yazın..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              maxLength={1000}
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              textAlignVertical="top"
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={currentAnswer.trim().length < 3}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentAnswer.trim().length >= 3
                  ? ['#6c5ce7', '#a29bfe']
                  : ['#333', '#444']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {currentStep < questions.length - 1
                  ? `Sonraki Soru →`
                  : 'Spec Üret ✨'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepActive: {
    backgroundColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 6,
  },
  stepLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'right',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    padding: 24,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    color: '#a29bfe',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  hintBox: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    lineHeight: 18,
  },
  ideaReminder: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ideaReminderLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  ideaReminderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    flex: 1,
    fontStyle: 'italic',
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    minHeight: 120,
    marginBottom: 20,
  },
  input: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

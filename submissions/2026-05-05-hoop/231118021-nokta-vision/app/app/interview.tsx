import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { generateEngineeringQuestions } from '../services/gemini';
import { Ionicons } from '@expo/vector-icons';

export default function InterviewScreen() {
  const { idea } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    async function init() {
      try {
        const qs = await generateEngineeringQuestions(idea as string);
        setQuestions(qs);
        setLoading(false);
        animateIn();
      } catch (error) {
        console.error(error);
        alert('Sorular hazırlanırken bir hata oluştu.');
        router.back();
      }
    }
    init();
  }, [idea]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      animateIn();
    } else {
      router.push({
        pathname: '/result',
        params: { idea, answers: JSON.stringify(newAnswers) }
      });
    }
  };

  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const labels = ['Problem', 'Kullanıcı', 'Kapsam'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGlow} />
        <View style={styles.loadingIconWrap}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
        <Text style={styles.loadingTitle}>Ajanlar İnceliyor</Text>
        <Text style={styles.loadingSubtitle}>Fikrini mühendislik soruları ile zenginleştiriyoruz...</Text>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.25 }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#080812', '#0D0B1E']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowTop} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#AAA" />
            </TouchableOpacity>
            <View style={styles.stepLabels}>
              {labels.map((label, i) => (
                <View key={i} style={[styles.stepChip, i === currentIndex && styles.stepChipActive]}>
                  <Text style={[styles.stepChipText, i === currentIndex && styles.stepChipTextActive]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{currentIndex + 1}/{questions.length}</Text>
          </View>

          {/* Soru */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.questionCard}>
              <View style={styles.questionChip}>
                <Ionicons name="help-circle" size={14} color="#A855F7" />
                <Text style={styles.questionChipText}>Soru {currentIndex + 1}</Text>
              </View>
              <Text style={styles.question}>{questions[currentIndex]}</Text>
            </View>
          </Animated.View>

          {/* Cevap input */}
          <Animated.View style={[styles.inputWrap, { opacity: fadeAnim }]}>
            <TextInput
              style={styles.input}
              placeholder="Düşünceni yaz..."
              placeholderTextColor="rgba(255,255,255,0.18)"
              multiline
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              autoFocus
            />
          </Animated.View>

          {/* Buton */}
          <TouchableOpacity
            style={[styles.button, !currentAnswer.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!currentAnswer.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={currentAnswer.trim() ? ['#8B00FF', '#6000CC'] : ['#1E1E2E', '#1A1A2A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, !currentAnswer.trim() && styles.buttonTextDisabled]}>
                {currentIndex === questions.length - 1 ? '✦ Spec Oluştur' : 'Devam Et'}
              </Text>
              {currentAnswer.trim() && (
                <Ionicons
                  name={currentIndex === questions.length - 1 ? 'sparkles' : 'arrow-forward'}
                  size={18} color="#FFF"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080812' },

  glowTop: {
    position: 'absolute', top: -80, left: '30%', marginLeft: -100,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#6000CC', opacity: 0.15,
  },

  loadingContainer: {
    flex: 1, backgroundColor: '#080812',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  loadingGlow: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: '#6000CC', opacity: 0.1,
  },
  loadingIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(112, 0, 255, 0.15)',
    borderWidth: 1, borderColor: 'rgba(112, 0, 255, 0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  loadingTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  loadingSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingDots: { flexDirection: 'row', gap: 8, marginTop: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A855F7' },

  content: { flex: 1, padding: 20, paddingTop: 56 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepLabels: { flexDirection: 'row', gap: 8, flex: 1 },
  stepChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  stepChipActive: {
    backgroundColor: 'rgba(112, 0, 255, 0.2)',
    borderColor: 'rgba(112, 0, 255, 0.5)',
  },
  stepChipText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },
  stepChipTextActive: { color: '#A855F7' },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  progressTrack: {
    flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#7000FF', borderRadius: 2 },
  progressLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },

  questionCard: {
    backgroundColor: 'rgba(112, 0, 255, 0.07)',
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(112, 0, 255, 0.2)',
  },
  questionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
  },
  questionChipText: { color: '#A855F7', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  question: { color: '#FFF', fontSize: 20, fontWeight: '700', lineHeight: 30 },

  inputWrap: { flex: 1, marginBottom: 16 },
  input: {
    flex: 1, color: '#FFF', fontSize: 16, lineHeight: 26,
    textAlignVertical: 'top', padding: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  button: { borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: {
    height: 60, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  buttonTextDisabled: { color: 'rgba(255,255,255,0.25)' },
});

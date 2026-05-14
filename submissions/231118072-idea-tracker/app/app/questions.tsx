import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ENGINEERING_QUESTIONS, TOTAL_STEPS } from '../constants/questions';

export default function QuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rawIdea: string; productName: string }>();
  const rawIdea = params.rawIdea ?? '';
  const productName = params.productName ?? 'Fikrim';

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const question = ENGINEERING_QUESTIONS[currentStep];
  const progress = (currentStep + 1) / TOTAL_STEPS;
  const canProceed = currentAnswer.trim().length >= 15;

  const animateTransition = (onComplete: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (!canProceed) return;

    const updatedAnswers = { ...answers, [question.key]: currentAnswer.trim() };
    setAnswers(updatedAnswers);

    if (currentStep === TOTAL_STEPS - 1) {
      // Son soru — spec ekranına geç
      router.push({
        pathname: '/spec',
        params: {
          productName,
          rawIdea,
          answersJson: JSON.stringify(updatedAnswers),
        },
      });
      return;
    }

    animateTransition(() => {
      setCurrentStep((s) => s + 1);
      setCurrentAnswer(answers[ENGINEERING_QUESTIONS[currentStep + 1]?.key] ?? '');
    });
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    animateTransition(() => {
      const prevQ = ENGINEERING_QUESTIONS[currentStep - 1];
      setCurrentStep((s) => s - 1);
      setCurrentAnswer(answers[prevQ.key] ?? '');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {currentStep + 1} / {TOTAL_STEPS}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: question.color,
              },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Idea Pill */}
          <View style={styles.ideaPill}>
            <Text style={styles.ideaPillEmoji}>💡</Text>
            <Text style={styles.ideaPillText} numberOfLines={2}>
              {productName}: {rawIdea}
            </Text>
          </View>

          {/* Step Pills */}
          <View style={styles.stepPillsRow}>
            {ENGINEERING_QUESTIONS.map((q, i) => (
              <View
                key={q.id}
                style={[
                  styles.stepPill,
                  i < currentStep && styles.stepPillDone,
                  i === currentStep && { backgroundColor: question.color + '25', borderColor: question.color },
                ]}
              >
                <Text style={[
                  styles.stepPillText,
                  i === currentStep && { color: question.color },
                  i < currentStep && styles.stepPillTextDone,
                ]}>
                  {i < currentStep ? '✓' : i + 1}
                </Text>
              </View>
            ))}
          </View>

          {/* Question Card */}
          <Animated.View
            style={[
              styles.questionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                borderColor: question.color + '40',
              },
            ]}
          >
            <View style={[styles.questionIconBadge, { backgroundColor: question.color + '20' }]}>
              <Text style={styles.questionIcon}>{question.icon}</Text>
            </View>
            <Text style={[styles.questionTitle, { color: question.color }]}>
              {question.title}
            </Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </Animated.View>

          {/* Answer Input */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TextInput
              style={[
                styles.answerInput,
                isFocused && styles.answerInputFocused,
                isFocused && { borderColor: question.color },
              ]}
              placeholder={question.placeholder}
              placeholderTextColor="#444460"
              multiline
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              textAlignVertical="top"
              maxLength={800}
            />
            <View style={styles.inputMeta}>
              <Text style={styles.minHint}>
                {currentAnswer.trim().length < 15
                  ? `En az ${15 - currentAnswer.trim().length} karakter daha`
                  : '✓ Devam edebilirsin'}
              </Text>
              <Text style={styles.charCount}>{currentAnswer.length}/800</Text>
            </View>
          </Animated.View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              { backgroundColor: canProceed ? question.color : '#2A2A4A' },
              canProceed && {
                shadowColor: question.color,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 14,
                elevation: 10,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === TOTAL_STEPS - 1 ? '🎉 Spec\'i Oluştur' : 'Sonraki Soru →'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backBtnText: {
    fontSize: 15,
    color: '#8888AA',
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 14,
    color: '#8888AA',
    fontWeight: '700',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#1E1E35',
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ideaPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  ideaPillEmoji: {
    fontSize: 16,
    marginTop: 1,
  },
  ideaPillText: {
    flex: 1,
    fontSize: 13,
    color: '#8888AA',
    lineHeight: 19,
  },
  stepPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  stepPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillDone: {
    backgroundColor: '#1A2A1A',
    borderColor: '#4ECDC4',
  },
  stepPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555570',
  },
  stepPillTextDone: {
    color: '#4ECDC4',
  },
  questionCard: {
    backgroundColor: '#14142A',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },
  questionIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  questionIcon: {
    fontSize: 24,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#8888AA',
    lineHeight: 21,
  },
  answerInput: {
    backgroundColor: '#16162A',
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 160,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  answerInputFocused: {
    backgroundColor: '#1A1A35',
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  minHint: {
    fontSize: 12,
    color: '#555570',
  },
  charCount: {
    fontSize: 12,
    color: '#444460',
  },
  nextBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

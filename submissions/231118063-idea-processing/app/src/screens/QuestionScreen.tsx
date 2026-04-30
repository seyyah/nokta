import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { GlassContainer } from '../components/GlassContainer';
import { Check, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Questions'>;

const QUESTIONS = [
  {
    id: 'problem',
    title: 'AĞRI NOKTASI (PROBLEM)',
    description: 'Bu fikir hangi spesifik problemi, tam olarak kimin için çözüyor?',
    placeholder: 'Örn: Şehir dışı seyahat edenlerin çiçeklerini sulayacak kimseyi bulamaması...'
  },
  {
    id: 'constraints',
    title: 'KRİTİK KISITLAR (CONSTRAINTS)',
    description: 'Bütçe, zaman, teknoloji veya fiziksel sınırların neler?',
    placeholder: 'Örn: Sadece Bluetooth Low Energy kullanmalı, 1 ayda bitmeli...'
  },
  {
    id: 'success',
    title: 'BAŞARI METRİĞİ (SUCCESS CRITERIA)',
    description: 'Bu projenin başarılı olduğunu rakamsal veya somut olarak nasıl anlarız?',
    placeholder: 'Örn: İlk 3 ayda 1000 aktif kullanıcıya ulaşmak...'
  },
  {
    id: 'persona',
    title: 'HEDEF KİTLE (PERSONA)',
    description: 'Bu ürünü kullanacak ilk 10 kişi kim? Onları nerede buluruz?',
    placeholder: 'Örn: Reddit /r/gardening grubundaki hobi bahçecileri...'
  },
  {
    id: 'mvp',
    title: 'MINIMUM VIABLE PRODUCT (MVP)',
    description: '"Olmazsa olmaz" en temel 3 özellik nedir?',
    placeholder: '1. Çizim, 2. Paylaşım, 3. Kayıt...'
  }
];

export const QuestionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { dot } = route.params;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState('');

  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;
  const currentQuestion = QUESTIONS[currentIdx];

  const handleNext = () => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: currentText };
    setAnswers(updatedAnswers);
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentText(answers[QUESTIONS[currentIdx + 1].id] || '');
    } else {
      navigation.navigate('Spec', { answers: updatedAnswers, dot });
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setCurrentText(answers[QUESTIONS[currentIdx - 1].id] || '');
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepIndicator}>{currentIdx + 1}/{QUESTIONS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          <Text style={styles.questionDesc}>{currentQuestion.description}</Text>
        </View>

        <GlassContainer style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor={Theme.colors.textSecondary}
            multiline
            value={currentText}
            onChangeText={setCurrentText}
            autoFocus
          />
        </GlassContainer>

        <View style={styles.dotPreview}>
          <Text style={styles.dotPreviewLabel}>ANA FİKİR (DOT):</Text>
          <Text style={styles.dotPreviewText} numberOfLines={2}>"{dot}"</Text>
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, !currentText.trim() && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={!currentText.trim()}
        >
          <Text style={styles.nextButtonText}>
            {currentIdx === QUESTIONS.length - 1 ? 'SPECIFICATION ÜRET' : 'SIRADAKİ SORU'}
          </Text>
          {currentIdx === QUESTIONS.length - 1 ? <Check size={20} color="#000" /> : <ArrowRight size={20} color="#000" />}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: Theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  stepIndicator: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  questionSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  questionDesc: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    lineHeight: 24,
  },
  inputBox: {
    minHeight: 200,
    marginBottom: Theme.spacing.xl,
  },
  input: {
    color: Theme.colors.text,
    fontSize: 18,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  dotPreview: {
    marginBottom: 40,
    opacity: 0.6,
  },
  dotPreviewLabel: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dotPreviewText: {
    fontSize: 14,
    color: Theme.colors.text,
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.roundness.md,
    gap: 12,
    marginBottom: 60,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

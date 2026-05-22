import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ai } from '../services/ai';
import { storage } from '../services/storage';

export default function ChatScreen() {
  const { rawIdea } = useLocalSearchParams<{ rawIdea: string }>();
  const router = useRouter();

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [generatingSpec, setGeneratingSpec] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!rawIdea) {
        Alert.alert('Hata', 'Fikir bulunamadı.');
        router.back();
        return;
      }
      try {
        const qList = await ai.generateQuestions(rawIdea);
        setQuestions(qList);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Sorular üretilirken bir sorun oluştu.');
        router.back();
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [rawIdea, router]);

  const handleNext = () => {
    const trimmedVal = inputVal.trim();
    if (trimmedVal.length < 4) {
      Alert.alert('Cevap Çok Kısa', 'Lütfen en az 4 karakterlik açıklayıcı bir cevap yazın.');
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentStep] = trimmedVal;
    setAnswers(updatedAnswers);

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setInputVal(answers[currentStep + 1] || '');
    } else {
      generateFinalSpec(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Save current input value
      const updatedAnswers = [...answers];
      updatedAnswers[currentStep] = inputVal.trim();
      setAnswers(updatedAnswers);

      setCurrentStep(currentStep - 1);
      setInputVal(updatedAnswers[currentStep - 1]);
    } else {
      router.back();
    }
  };

  const generateFinalSpec = async (finalAnswers: string[]) => {
    setGeneratingSpec(true);
    try {
      const rawSpec = await ai.generateSpec(rawIdea!, questions, finalAnswers);
      const savedSpec = await storage.saveSpec(rawSpec);
      
      // Navigate to spec screen and replace this chat in route history
      router.replace({
        pathname: '/spec',
        params: { specData: JSON.stringify(savedSpec) },
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Spesifikasyon üretilirken bir hata oluştu.');
    } finally {
      setGeneratingSpec(false);
    }
  };

  if (loadingQuestions) {
    return (
      <SafeAreaView style={styles.safeLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text style={styles.loadingText}>AI fikir için kritik mühendislik soruları hazırlıyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (generatingSpec) {
    return (
      <SafeAreaView style={styles.safeLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34A853" />
          <Text style={[styles.loadingText, { color: '#202124' }]}>Spesifikasyon Oluşturuluyor...</Text>
          <Text style={styles.loadingSubtext}>Tüm girdileriniz birleştirilip slop-free bir ürün blueprintine dönüştürülüyor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = (currentStep + 1) / 5;

  const categories = [
    { title: 'Problem', icon: 'alert-circle-outline', color: '#EA4335' },
    { title: 'Kullanıcı', icon: 'people-outline', color: '#1A73E8' },
    { title: 'Kapsam', icon: 'grid-outline', color: '#FBBC05' },
    { title: 'Kısıtlar', icon: 'ban-outline', color: '#70757A' },
    { title: 'Gerekçe', icon: 'help-circle-outline', color: '#34A853' },
  ];

  const currentCategory = categories[currentStep];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#202124" />
            </TouchableOpacity>
            <Text style={styles.progressText}>Soru {currentStep + 1} / 5</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.categoryBadge}>
            <Ionicons name={currentCategory.icon as any} size={16} color={currentCategory.color} />
            <Text style={[styles.categoryTitle, { color: currentCategory.color }]}>
              {currentCategory.title}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Cevabınızı buraya detaylıca yazın..."
              placeholderTextColor="#9AA0A6"
              value={inputVal}
              onChangeText={setInputVal}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnSecondary]}
              onPress={handleBack}
            >
              <Text style={styles.navBtnSecondaryText}>
                {currentStep === 0 ? 'İptal' : 'Geri'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary, inputVal.trim().length < 4 && styles.navBtnDisabled]}
              onPress={handleNext}
              disabled={inputVal.trim().length < 4}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentStep === 4 ? 'Spec Oluştur' : 'İleri'}
              </Text>
              {currentStep < 4 && (
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeLoading: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6368',
    marginTop: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#9AA0A6',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    padding: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  placeholder: {
    width: 32,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#F1F3F4',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1A73E8',
  },
  scrollContent: {
    padding: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202124',
    lineHeight: 30,
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADCE0',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    fontSize: 16,
    color: '#202124',
    minHeight: 160,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 6,
  },
  navBtnPrimary: {
    backgroundColor: '#1A73E8',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  navBtnDisabled: {
    backgroundColor: '#DADCE0',
    shadowOpacity: 0,
    elevation: 0,
  },
  navBtnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  navBtnSecondaryText: {
    color: '#5F6368',
    fontSize: 15,
    fontWeight: '700',
  },
});

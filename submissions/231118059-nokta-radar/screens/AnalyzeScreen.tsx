import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, Target, Send, ChevronRight } from 'lucide-react-native';
import RadarBackground from '../components/RadarBackground';

const INTERROGATION_QUESTIONS = [
  "Teknik altyapın nedir?",
  "Rakiplerin kim?",
  "Gelir modelin nedir?"
];

const SCANNING_TOOLTIPS = [
  "Pazar doygunluğu ölçülüyor...",
  "Semantik analiz başlatıldı...",
  "Rakip analizi kontrol ediliyor...",
  "Yapay zeka halüsinasyon riskleri değerlendiriliyor..."
];

type Step = 'PITCH_INPUT' | 'SCANNING' | 'INTERROGATION';

export default function AnalyzeScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('PITCH_INPUT');
  const [pitch, setPitch] = useState('');
  
  // Scanning State
  const [tooltipIndex, setTooltipIndex] = useState(0);

  // Interrogation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  // Handle Scanning Animation and Transition to Interrogation
  useEffect(() => {
    if (step === 'SCANNING') {
      const interval = setInterval(() => {
        setTooltipIndex((prev) => {
          if (prev >= SCANNING_TOOLTIPS.length - 1) {
            clearInterval(interval);
            setStep('INTERROGATION');
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleStartAnalysis = () => {
    if (pitch.trim().length > 5) {
      setStep('SCANNING');
      setTooltipIndex(0);
    }
  };

  const handleAnswerSubmit = () => {
    if (answers[currentQuestionIndex].trim().length < 2) return;

    if (currentQuestionIndex < INTERROGATION_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finalize and Navigate
      router.push({
        pathname: '/result',
        params: { 
          idea: pitch,
          q1: answers[0],
          q2: answers[1],
          q3: answers[2]
        }
      });
      // Reset for next time
      setTimeout(() => {
        setStep('PITCH_INPUT');
        setPitch('');
        setAnswers(['', '', '']);
        setCurrentQuestionIndex(0);
      }, 1000);
    }
  };

  const updateAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = text;
    setAnswers(newAnswers);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <RadarBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {step === 'PITCH_INPUT' && (
          <View style={styles.glassContainer}>
            <View style={styles.headerRow}>
              <Target color="#00E5FF" size={28} />
              <Text style={styles.title}>RADAR ANALİZ</Text>
            </View>
            <Text style={styles.subtitle}>Girişim fikrini detaylıca yaz. Yapay Zekayı ikna etmeye çalış.</Text>
            
            <TextInput
              style={styles.textArea}
              placeholder="Girişim fikrini veya pitch paragrafını buraya yaz..."
              placeholderTextColor="#555"
              multiline
              value={pitch}
              onChangeText={setPitch}
              textAlignVertical="top"
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.actionButton, pitch.trim().length < 5 && styles.actionButtonDisabled]}
              onPress={handleStartAnalysis}
              disabled={pitch.trim().length < 5}
            >
              <Text style={[styles.actionButtonText, pitch.trim().length < 5 && styles.actionButtonTextDisabled]}>ANALİZİ BAŞLAT</Text>
              <ChevronRight color={pitch.trim().length < 5 ? "#444" : "#000"} size={20} />
            </TouchableOpacity>
          </View>
        )}

        {step === 'SCANNING' && (
          <View style={[styles.glassContainer, styles.centerState]}>
            <ActivityIndicator size="large" color="#00E5FF" style={{ transform: [{ scale: 1.5 }] }} />
            <Text style={styles.scanningTitle}>SİSTEM HAZIRLIK YAPIYOR</Text>
            <View style={styles.tooltipBox}>
              <Text style={styles.tooltipText}>{SCANNING_TOOLTIPS[tooltipIndex]}</Text>
            </View>
          </View>
        )}

        {step === 'INTERROGATION' && (
          <View style={styles.glassContainer}>
            <View style={styles.headerRow}>
              <Bot color="#FF003C" size={28} />
              <Text style={[styles.title, { color: '#FF003C' }]}>OTONOM SORGU ({currentQuestionIndex + 1}/{INTERROGATION_QUESTIONS.length})</Text>
            </View>
            
            <View style={styles.questionBox}>
              <Text style={styles.questionText}>"{INTERROGATION_QUESTIONS[currentQuestionIndex]}"</Text>
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Yanıtınızı buraya girin..."
              placeholderTextColor="#555"
              multiline
              value={answers[currentQuestionIndex]}
              onChangeText={updateAnswer}
              textAlignVertical="top"
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF003C' }, answers[currentQuestionIndex].trim().length < 2 && styles.actionButtonDisabled]}
              onPress={handleAnswerSubmit}
              disabled={answers[currentQuestionIndex].trim().length < 2}
            >
              <Text style={[styles.actionButtonText, answers[currentQuestionIndex].trim().length < 2 && styles.actionButtonTextDisabled]}>
                {currentQuestionIndex === INTERROGATION_QUESTIONS.length - 1 ? 'SONUÇLARI GÖR' : 'SONRAKİ SORU'}
              </Text>
              <Send color={answers[currentQuestionIndex].trim().length < 2 ? "#444" : "#000"} size={18} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  glassContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  centerState: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    color: '#E0E0E0',
    fontFamily: 'monospace',
    fontSize: 16,
    padding: 20,
    minHeight: 180,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  actionButtonText: {
    color: '#000',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  actionButtonTextDisabled: {
    color: '#00E5FF',
    opacity: 0.5,
  },
  scanningTitle: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  tooltipBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'transparent',
    borderLeftColor: '#00E5FF',
    borderLeftWidth: 4,
    padding: 15,
    borderRadius: 4,
    width: '100%',
  },
  tooltipText: {
    color: '#A0A0A0',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  questionBox: {
    backgroundColor: 'rgba(255, 0, 60, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF003C',
    padding: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  questionText: {
    color: '#FFA1A1',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
  }
});

import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession, session } from '@/state/sessionStore';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_LABEL: Record<string, string> = {
  problem: 'Problem',
  user: 'Kullanıcı',
  scope: 'Scope',
  constraint: 'Kısıt',
  success: 'Başarı',
};

// Context-aware suggestion generators
const generateMetricSuggestion = (category: string, currentAnswer: string): string => {
  const suggestions: Record<string, string> = {
    problem: '📊 Metrikler:\n- Etkilenen kullanıcı sayısı: [X kişi]\n- Sorunun sıklığı: [günde/hafta Y kez]\n- Ortalama çözüm süresi: [Z dakika]',
    user: '📊 Kullanıcı Metrikleri:\n- Hedef kullanıcı sayısı: [X kişi]\n- Kullanıcı segmenti: [demografik bilgi]\n- Kullanım sıklığı: [günlük/haftalık]',
    scope: '📊 Kapsam Metrikleri:\n- Tahmini süre: [X hafta]\n- Gerekli kaynak: [Y kişi]\n- Bütçe: [Z TL]',
    constraint: '📊 Kısıt Metrikleri:\n- Maksimum yanıt süresi: [X ms]\n- Eşzamanlı kullanıcı kapasitesi: [Y kullanıcı]\n- Veri limiti: [Z GB]',
    success: '📊 Başarı Metrikleri:\n- Hedef kullanıcı memnuniyeti: [%X]\n- Kullanım artışı: [%Y]\n- Hata oranı azalması: [%Z]',
  };
  return suggestions[category] || '📊 Metrikler:\n- Ölçülebilir hedef 1: [değer]\n- Ölçülebilir hedef 2: [değer]';
};

const generateExampleSuggestion = (category: string, currentAnswer: string): string => {
  const suggestions: Record<string, string> = {
    problem: '💡 Örnek Senaryo:\nKullanıcı [X] yapmak istediğinde [Y] problemi ile karşılaşıyor. Bu durum [Z] sonucuna yol açıyor.',
    user: '💡 Kullanıcı Profili Örneği:\n"Ahmet, 28 yaşında bir yazılım geliştirici. Günde ortalama [X] saat bu tür araçları kullanıyor ve [Y] özelliğine ihtiyaç duyuyor."',
    scope: '💡 Kapsam Örneği:\nFaz 1: [Temel özellikler - 2 hafta]\nFaz 2: [İleri özellikler - 3 hafta]\nFaz 3: [Optimizasyon - 1 hafta]',
    constraint: '💡 Kısıt Örneği:\n"Sistem, mobil cihazlarda 3G bağlantıda bile [X] saniye içinde yanıt vermeli. Ayrıca [Y] koşulunda bile çalışmalı."',
    success: '💡 Başarı Örneği:\n"3 ay sonra kullanıcıların %80\'i [X] özelliğini aktif kullanıyor ve memnuniyet skoru [Y]\'den [Z]\'ye yükseldi."',
  };
  return suggestions[category] || '💡 Örnek:\n[Somut bir örnek senaryo buraya...]';
};

const CATEGORY_EMOJI: Record<string, string> = {
  problem: '🎯',
  user: '👥',
  scope: '📐',
  constraint: '⚡',
  success: '🏆',
};

export default function QuestionFlowScreen() {
  const s = useSession();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(s.answers);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const currentQuestion = s.questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] || '';
  const progress = ((currentIndex + 1) / s.questions.length) * 100;
  const isLastQuestion = currentIndex === s.questions.length - 1;
  const canProceed = currentAnswer.trim().length >= 3;

  useEffect(() => {
    // Animate in when question changes
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
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
  }, [currentIndex]);

  const handleNext = () => {
    if (isLastQuestion) {
      // Save answers and navigate to word cloud
      session.set({ answers });
      router.push('/word-cloud');
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    // Allow skipping but mark as incomplete
    if (!isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {s.questions.length}
        </Text>
      </View>

      {s.provider && <StatusBadge provider={s.provider} attempts={s.attempts} />}

      {/* Duplicate Warning */}
      {s.duplicateOf && currentIndex === 0 && (
        <View style={styles.dupWarn}>
          <Text style={styles.dupTitle}>⚠️  Benzer fikir tespit edildi</Text>
          <Text style={styles.dupText}>
            Bu fikir daha önce işlenmiş bir spec ile {'>'}85% benzer. Devam edebilirsin ama orijinallik puanın düşük olacak.
          </Text>
        </View>
      )}

      {/* Question Card */}
      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>
            {CATEGORY_EMOJI[currentQuestion.category] || '💡'}
          </Text>
          <Text style={styles.categoryText}>
            {CATEGORY_LABEL[currentQuestion.category] || currentQuestion.category}
          </Text>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {/* Answer Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Düşüncelerini buraya yaz..."
            placeholderTextColor="#666"
            value={currentAnswer}
            onChangeText={(text) =>
              setAnswers({ ...answers, [currentQuestion.id]: text })
            }
            autoFocus
          />
          <View style={styles.charCounter}>
            <Text
              style={[
                styles.charCountText,
                currentAnswer.length >= 3 && styles.charCountValid,
              ]}
            >
              {currentAnswer.length} karakter
              {currentAnswer.length < 3 && ' (min. 3)'}
            </Text>
          </View>
        </View>

        {/* AI Suggestions (Optional Enhancement) */}
        {currentAnswer.length > 10 && (
          <View style={styles.suggestionsBox}>
            <Text style={styles.suggestionsTitle}>💡 AI Önerileri</Text>
            <Text style={styles.suggestionsText}>
              Cevabını daha detaylandırmak için şunları ekleyebilirsin:
            </Text>
            <View style={styles.suggestionChips}>
              <Pressable 
                style={styles.chip}
                onPress={() => {
                  const suggestion = generateMetricSuggestion(currentQuestion.category, currentAnswer);
                  setAnswers({ ...answers, [currentQuestion.id]: currentAnswer + '\n\n' + suggestion });
                }}
              >
                <Text style={styles.chipText}>Metrikler ekle</Text>
              </Pressable>
              <Pressable 
                style={styles.chip}
                onPress={() => {
                  const suggestion = generateExampleSuggestion(currentQuestion.category, currentAnswer);
                  setAnswers({ ...answers, [currentQuestion.id]: currentAnswer + '\n\n' + suggestion });
                }}
              >
                <Text style={styles.chipText}>Örnek ver</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <Button variant="ghost" onPress={handleBack} style={styles.backButton}>
          ← Geri
        </Button>

        <View style={styles.rightButtons}>
          {!isLastQuestion && (
            <Button variant="ghost" onPress={handleSkip} style={styles.skipButton}>
              Atla
            </Button>
          )}
          <Button
            onPress={handleNext}
            disabled={!canProceed}
            style={[styles.nextButton, canProceed && styles.nextButtonActive]}
          >
            {isLastQuestion ? 'Kelime Bulutu →' : 'Sonraki →'}
          </Button>
        </View>
      </View>

      {/* Question Dots Indicator */}
      <View style={styles.dotsContainer}>
        {s.questions.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === currentIndex && styles.dotActive,
              answers[s.questions[idx].id]?.trim().length >= 3 && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 2,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  dupWarn: {
    backgroundColor: '#3b2a0a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c5e1c',
    marginBottom: 20,
  },
  dupTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  dupText: {
    color: '#d6c89a',
    fontSize: 12,
    lineHeight: 18,
  },
  questionCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 24,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#222',
    lineHeight: 24,
  },
  charCounter: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  charCountText: {
    color: '#666',
    fontSize: 12,
  },
  charCountValid: {
    color: '#00E5FF',
  },
  suggestionsBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  suggestionsTitle: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionsText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
  },
  suggestionChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  rightButtons: {
    flex: 2,
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#333',
  },
  nextButtonActive: {
    backgroundColor: '#00E5FF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#00E5FF',
    width: 24,
  },
  dotCompleted: {
    backgroundColor: '#4ade80',
  },
});

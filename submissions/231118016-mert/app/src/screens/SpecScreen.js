import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ScoreCard from '../components/ScoreCard';
import MissingFields from '../components/MissingFields';
import { callGeminiAPI } from '../utils/geminiApi';
import AvatarWidget from '../components/AvatarWidget';

const SpecScreen = ({ route, navigation }) => {
  const { idea, apiKey, answers, questions, failCount = 0 } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specData, setSpecData] = useState({ score: 0, missingFields: [], specSections: [] });
  const [speaking, setSpeaking] = useState(false);
  const [isRollback, setIsRollback] = useState(false);

  useEffect(() => {
    generateSpecification();
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateSpecification = async () => {
    setLoading(true);
    setError('');
    setIsRollback(false);

    const formattedQnA = questions.map(q => `Q: ${q.desc}\nA: ${answers[q.key] || 'No answer provided'}`).join('\n\n');

    const prompt = `Here is a software idea: "${idea}".
Here are the technical engineering questions asked and the user's answers:
${formattedQnA}

Based on this information, act as an expert technical Product Manager. Please analyze the feasibility and depth of the idea.
Provide:
1. A 'score' between 0 and 100 based on the quality and completeness of the user's answers. (If the answers are very short, vague, or "bilmiyorum", score it below 50).
2. A 'missingFields' array of short string descriptions pointing out what is vague or entirely missing.
3. A 'specSections' array containing the final 1-page Product Specification. Each section needs a 'title' and 'content' (paragraph length).

Return the result STRICTLY as a raw JSON object. Do NOT wrap it in \`\`\`json markdown blocks. Make sure all titles and content are in Turkish.
Example format:
{
  "score": 75,
  "missingFields": ["Monetization strategy", "Security constraints"],
  "specSections": [
    {"title": "Genel Bakış", "content": "Bu uygulama..."},
    {"title": "Hedef Kitle", "content": "..."}
  ]
}`;

    try {
      const responseText = await callGeminiAPI(prompt, apiKey);
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedSpec = JSON.parse(cleanJsonStr);
      
      // FORGE LOOP ROLLBACK LOGIC
      if (generatedSpec.score < 50) {
        const newFailCount = failCount + 1;
        
        if (newFailCount >= 2) {
          // 2. kez başarısız olursa Expert Bridge'e at
          speakText("Görünüşe göre bu fikri tanımlamakta zorlanıyoruz. Seni bir insana, yani Uzman Köprüsü'ne aktarıyorum.");
          setTimeout(() => {
            navigation.replace('ExpertBridgeScreen', { failCount: newFailCount });
          }, 3000);
          return;
        } else {
          // İlk başarısızlıkta Rollback yap
          setSpecData(generatedSpec);
          setIsRollback(true);
          speakText(`Cevapların maalesef yetersiz kaldı. Skorun ${generatedSpec.score}. Lütfen geri dönüp daha detaylı cevaplar ver, aksi takdirde seni bir uzmana aktarmak zorunda kalacağım.`);
          setLoading(false);
          return;
        }
      }

      setSpecData(generatedSpec);
      speakText(`Tebrikler! Fikrin yeterince olgun. Skorun ${generatedSpec.score}. İşte senin için hazırladığım ürün spesifikasyonu.`);
    } catch (err) {
      console.error(err);
      setError('Spec üretilirken bir hata oluştu veya AI geçerli bir format döndüremedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = () => {
    window.speechSynthesis?.cancel();
    // Go back to QuestionsScreen but keep the answers so they can edit
    navigation.navigate('QuestionsScreen', { idea, apiKey });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f3460" />
        <Text style={styles.loadingText}>Spec Sentezleniyor...</Text>
        <Text style={styles.loadingSubText}>AI kalite skorunu hesaplıyor ve PRD oluşturuyor</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generateSpecification}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isRollback) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.avatarWrapper}>
          <AvatarWidget speaking={speaking} width={120} height={120} />
        </View>
        <Text style={[styles.headerTitle, { color: '#ef4444', marginTop: 20 }]}>Rollback (Yetersiz Detay)</Text>
        <Text style={styles.loadingText}>Skorun: {specData.score}/100</Text>
        <Text style={styles.loadingSubText}>Cevapların çok kısa veya yetersiz olduğu için Spec oluşturulamadı.</Text>
        <View style={styles.specContainer}>
          <Text style={styles.specTitleIntro}>Eksik Noktalar:</Text>
          {specData.missingFields?.map((field, i) => (
            <Text key={i} style={{ color: '#ef4444', marginBottom: 4 }}>• {field}</Text>
          ))}
        </View>
        <TouchableOpacity style={[styles.expertButton, { marginTop: 30 }]} onPress={handleRollback}>
          <Text style={styles.expertButtonText}>Sorulara Geri Dön ve Düzelt</Text>
          <Text style={styles.expertButtonSub}>Kalan deneme hakkın: 1 (Sonrasında Uzman Köprüsü)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>AI Spesifikasyonu</Text>
          <Text style={styles.headerSubtitle}>Gemini tarafından üretildi</Text>
        </View>
        <View style={styles.smallAvatarWrapper}>
          <AvatarWidget speaking={speaking} width={60} height={60} />
        </View>
      </View>

      <ScoreCard score={specData.score || 0} />
      <MissingFields fields={specData.missingFields || []} />

      <View style={styles.specContainer}>
        <Text style={styles.specTitleIntro}>Orijinal Fikir:</Text>
        <Text style={styles.specTextIntro}>{idea || 'No idea provided.'}</Text>

        <View style={styles.divider} />

        {(specData.specSections || []).map((section, index) => (
          <View key={index} style={styles.sectionBlock}>
            <Text style={styles.specTitle}>{section.title}</Text>
            <Text style={styles.specText}>{section.content}</Text>
          </View>
        ))}
      </View>
      
      {/* HITL — Uzman İncelemesi Butonu */}
      <TouchableOpacity
        style={styles.expertButton}
        onPress={() => {
          window.speechSynthesis?.cancel();
          navigation.navigate('ExpertScreen', {
            idea,
            score: specData.score || 0,
            specSections: specData.specSections || [],
          });
        }}
      >
        <Text style={styles.expertButtonText}>👨‍⚖️  Uzmana Gönder (HITL)</Text>
        <Text style={styles.expertButtonSub}>Kıdemli danışman spec'ini incelesin</Text>
      </TouchableOpacity>

      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#ef4444',
    backgroundColor: '#1e293b',
  },
  smallAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8a2be2',
    marginTop: 5,
    fontWeight: '600',
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  specContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  specTitleIntro: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  specTextIntro: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  sectionBlock: {
    marginBottom: 15,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f3460',
    marginBottom: 6,
  },
  specText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  expertButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#0f3460',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  expertButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  expertButtonSub: {
    color: '#a0b4d0',
    fontSize: 12,
    marginTop: 2,
  },
});

export default SpecScreen;

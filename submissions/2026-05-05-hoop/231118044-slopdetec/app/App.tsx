import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Linking } from 'react-native';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

type SlopResult = {
  slopScore: number;
  reason: string;
  correctedPitch: string;
};

export default function App() {
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SlopResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expertNotified, setExpertNotified] = useState(false);

  const handleAnalyze = async () => {
    if (!pitch.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setExpertNotified(false);

    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('API Key `.env` dosyasında eksik veya geçersiz. Lütfen EXPO_PUBLIC_GEMINI_API_KEY değerini doldurun.');
      }

      const prompt = `
Sen "Nokta" ekosisteminin acımasız ve analitik "Red-Team (Due Diligence)" ajanısın. 
Görevin, melek yatırımcıların ve fonların önüne gelen startup sunum metinlerini (pitch) analiz etmek ve "Slop" (altı boş, aşırı iddialı, jenerik ve mühendislik gerçekliğinden uzak) olup olmadığını test etmektir. 

Kurallar:
1. Gelen metnin pazar iddialarını, rekabet boşluğunu ve mühendislik/teknik gerçekliğini analiz et.
2. 0 ile 100 arasında bir "slopScore" belirle. (100 = Tamamen çöp/hayal ürünü, 0 = Mükemmel, ayakları yere basan, spesifikasyona hazır).
3. Bu skoru neden verdiğini "reason" alanında acımasız ama yapıcı bir dille açıkla.
4. "Nokta" felsefesine uygun olarak, bu dağınık ve abartılı fikri, ayakları yere basan, kısıtlamaları (constraints) belli olan ve mühendislik iskeletine oturtulmuş, slop-free (yığınsız) bir hale getirip "correctedPitch" alanında sun.
5. JSON formatında çıktı ver.

Pitch:
"${pitch}"
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text) as SlopResult;
      setResult(parsed);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#4caf50'; // Green
    if (score < 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const handleExpertSend = () => {
    if (!result) return;
    const subject = encodeURIComponent('SlopDetec Uzman İncelemesi Talebi');
    const body = encodeURIComponent(`Merhaba Nokta Red-Team Uzmanı,\n\nAşağıdaki startup sunumu için "Human-in-the-Loop" onayınız gerekmektedir.\n\n---\nFİKİR TASLAĞI:\n${pitch}\n\n---\nAI SLOP SKORU: ${result.slopScore}/100\n\nACIMASIZ DEĞERLENDİRME:\n${result.reason}\n\nNOKTA STANDARDI (ÖNERİLEN):\n${result.correctedPitch}\n\n---\nLütfen bu fikri inceleyip yatırım/ön-kuluçka uygunluğu hakkında dönüş yapınız.`);
    
    Linking.openURL(`mailto:uzman@nokta22.com?subject=${subject}&body=${body}`);
    setExpertNotified(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>NOKTA.</Text>
            <Text style={styles.subtitle}>Red-Team / Slop Detector</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Startup Pitch (Fikir Taslağı):</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="Fikrinizi buraya yapıştırın. Örn: Yapay zeka ile dünyayı kurtarıyoruz..."
              placeholderTextColor="#666"
              value={pitch}
              onChangeText={setPitch}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, (pitch.trim() === '' || loading) ? styles.buttonDisabled : null]} 
            onPress={handleAnalyze}
            disabled={pitch.trim() === '' || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Analiz Et (Due Diligence)</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {expertNotified ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Uzmana Gönderildi 📩</Text>
              <Text style={styles.successText}>
                Fikir detayları ve AI analiz sonuçları incelenmek üzere Nokta Red-Team uzmanlarına iletildi. İnceleme tamamlandığında tarafınıza dönüş yapılacaktır.
              </Text>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  setPitch('');
                  setResult(null);
                  setExpertNotified(false);
                }}
              >
                <Text style={styles.resetButtonText}>Yeni Analiz Yap</Text>
              </TouchableOpacity>
            </View>
          ) : (
            result && (
              <View style={styles.resultContainer}>
                <View style={styles.scoreHeader}>
                   <Text style={styles.scoreLabel}>Slop Score:</Text>
                   <Text style={[styles.scoreValue, { color: getScoreColor(result.slopScore) }]}>
                      {result.slopScore}/100
                   </Text>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.resultCardTitle}>Acımasız Değerlendirme (Reason)</Text>
                  <Text style={styles.resultCardText}>{result.reason}</Text>
                </View>

                <View style={[styles.resultCard, { borderColor: '#4caf50' }]}>
                  <Text style={[styles.resultCardTitle, { color: '#4caf50' }]}>Nokta Standardı (Corrected Pitch)</Text>
                  <Text style={styles.resultCardText}>{result.correctedPitch}</Text>
                </View>

                <TouchableOpacity style={styles.expertButton} onPress={handleExpertSend}>
                  <Text style={styles.expertButtonText}>Şüpheli mi? Uzmana Gönder (Red-Team)</Text>
                </TouchableOpacity>
              </View>
            )
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3366',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#0f0f0f',
    color: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#FF3366',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 32,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
    borderLeftWidth: 4,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultCardText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  expertButton: {
    backgroundColor: '#3b82f6', // Blue
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#60a5fa',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  expertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  successCard: {
    marginTop: 32,
    backgroundColor: '#064e3b', // Dark green background
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#059669',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34d399',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#a7f3d0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#022c22',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

export default function App() {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Questions step
  const [answers, setAnswers] = useState(['', '', '']);
  const questions = [
    "1. Ana problem kimin problemi? Sadece üniversite öğrencileri mi?",
    "2. Uygulama içi ödeme sistemi olacak mı, yoksa elden mi teslim?",
    "3. En büyük kısıt (constraint) lojistik mi, yoksa güvenlik mi?"
  ];

  // Spec step
  const [spec, setSpec] = useState('');

  const submitIdea = () => {
    if (!idea) return;
    setLoading(true);
    // Simulate AI thinking
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const submitAnswers = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedSpec = `
# Ürün Spec Dosyası: ${idea.substring(0, 20)}...

## 1. Problem Tanımı
Kullanıcıların belirttiği üzere, hedef kitle öncelikli olarak: ${answers[0] || 'Genel kitle'}.

## 2. Kullanıcı Akışı & Çözüm
Bu platform üzerinden kullanıcılar temel sorunlarını hızlıca çözebilecek. Ödeme yöntemi olarak belirlenen model: ${answers[1] || 'Belirtilmedi'}.

## 3. Kapsam ve Kısıtlar (Scope & Constraints)
Sistemin çalışmasındaki en büyük engel ve kısıt: ${answers[2] || 'Belirtilmedi'}. Bu kısıt etrafında MVP (Minimum Viable Product) geliştirilecektir.

## 4. Sonraki Adımlar
- Tasarım prototiplerinin çıkarılması
- MVP için temel özelliklerin kodlanması
      `;
      setSpec(generatedSpec);
      setStep(3);
    }, 2500);
  };

  const reset = () => {
    setIdea('');
    setAnswers(['', '', '']);
    setSpec('');
    setStep(1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Spec Generator</Text>
        <Text style={styles.headerSubtitle}>Fikrinden Ürün Belgesine</Text>
      </View>

      {/* STEP 1: Idea Input */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Aklındaki fikri kısaca anlat:</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Örn: Kampüs içi ikinci el eşya alım satım uygulaması..."
            value={idea}
            onChangeText={setIdea}
          />
          <TouchableOpacity style={styles.button} onPress={submitIdea} disabled={loading || !idea}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>AI ile Analiz Et</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: Questions */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.label}>AI bu fikri analiz etti. Lütfen aşağıdaki soruları yanıtla:</Text>
          
          {questions.map((q, index) => (
            <View key={index} style={styles.questionBlock}>
              <Text style={styles.questionText}>{q}</Text>
              <TextInput
                style={styles.input}
                placeholder="Cevabın..."
                value={answers[index]}
                onChangeText={(text) => {
                  const newAnswers = [...answers];
                  newAnswers[index] = text;
                  setAnswers(newAnswers);
                }}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={submitAnswers} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Spec Üret</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: Spec View */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.label}>🎉 Tek Sayfa Spec Hazır!</Text>
          <View style={styles.specBox}>
            <Text style={styles.specText}>{spec}</Text>
          </View>
          <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={reset}>
            <Text style={styles.outlineButtonText}>Yeni Fikir Dene</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginTop: 8,
  },
  questionBlock: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F46E5',
    marginTop: 15,
  },
  outlineButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  specBox: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  specText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  }
});

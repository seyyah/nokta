import React, { useState } from 'react';
import { 
  StyleSheet, Text, TextInput, View, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert, Clipboard, 
  Dimensions, KeyboardAvoidingView, Platform, Share // Share modülü eklendi
} from 'react-native';

export default function SpecAgent() {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const [questions, setQuestions] = useState('');
  const [answers, setAnswers] = useState('');
  const [finalSpec, setFinalSpec] = useState('');
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = "AIzaSyBiQsIlPwnLp574Zfz4XFtRbqp-dbOmsfc";
  const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

  // ADIM 1: Analiz ve Soru Üretimi
  const generateQuestions = async () => {
    if (!idea) return Alert.alert("Hata", "Lütfen bir proje fikri girin.");
    setLoading(true);
    try {
      const prompt = `Sen kıdemli bir yazılım mimarısın. Şu ham fikre 4 teknik soru sor (Problem, User, Scope, Constraint): "${idea}"`;
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setQuestions(data.candidates[0].content.parts[0].text);
      setStep(2);
    } catch (e) { Alert.alert("Hata", "Bağlantı hatası oluştu."); }
    finally { setLoading(false); }
  };

  // ADIM 2: Final Spec + Skor + Tech Stack Üretimi
  const generateFinalSpec = async () => {
    if (!answers) return Alert.alert("Hata", "Lütfen soruları cevaplayın.");
    setLoading(true);
    try {
      // Prompt güncellendi: Skor ve Tech Stack talimatı eklendi
      const prompt = `Aşağıdaki verilerle profesyonel bir PRD oluştur. 
      EK OLARAK: Dokümanın en başına [MÜHENDİSLİK PUANI: 0-100] ekle ve en sonuna 'Önerilen Teknoloji Yığını' (Frontend, Backend, DB) tablosu koy. 
      Fikir: ${idea}. Sorular: ${questions}. Cevaplar: ${answers}`;

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setFinalSpec(data.candidates[0].content.parts[0].text);
      setStep(3);
    } catch (e) { Alert.alert("Hata", "Spec oluşturulamadı."); }
    finally { setLoading(false); }
  };

  // ADIM 3: Native Paylaşım Özelliği
  const onShare = async () => {
    try {
      await Share.share({
        message: `NOKTA Spec-Agent Mühendislik Raporu:\n\n${finalSpec}`,
      });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım başarısız oldu.");
    }
  };

  const resetProject = () => {
    setStep(1); setIdea(''); setQuestions(''); setAnswers(''); setFinalSpec('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <Text style={styles.headerTitle}>NOKTA</Text>
        <Text style={styles.headerSubtitle}>Engineering AI Agent v3.0</Text>
      </View>

      {/* Stepper */}
      <View style={styles.stepperContainer}>
        {['Analiz', 'Girdi', 'Rapor'].map((label, i) => (
          <View key={i} style={styles.stepWrapper}>
            <View style={[styles.stepCircle, step > i ? styles.stepActive : styles.stepInactive]}>
              <Text style={[styles.stepNumber, { color: step > i ? '#fff' : '#64748B' }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, step > i && styles.labelActive]}>{label}</Text>
          </View>
        ))}
        <View style={styles.stepLine} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>PROJE FİKRİ</Text>
            <TextInput
              style={styles.input}
              placeholder="Neyi çözmek istiyorsun Utku?"
              placeholderTextColor="#94A3B8"
              multiline
              value={idea}
              onChangeText={setIdea}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={generateQuestions} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>AI Mimarını Çalıştır →</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>MÜHENDİSLİK ANALİZİ</Text>
            <View style={styles.aiMessageBubble}>
              <Text style={styles.aiMessageText}>{questions}</Text>
            </View>
            <TextInput
              style={[styles.input, { minHeight: 180 }]}
              placeholder="Teknik detayları buraya yapıştır..."
              placeholderTextColor="#94A3B8"
              multiline
              value={answers}
              onChangeText={setAnswers}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={generateFinalSpec} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PRD & Tech Stack Üret</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.reportBadge}>
              <Text style={styles.reportBadgeText}>MÜHENDİSLİK RAPORU HAZIR</Text>
            </View>
            <ScrollView style={styles.specContainer} nestedScrollEnabled={true}>
              <Text style={styles.specText}>{finalSpec}</Text>
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.secondaryButton, {backgroundColor: '#10B981'}]} onPress={onShare}>
                <Text style={styles.buttonText}>Paylaş / Gönder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, {backgroundColor: '#64748B'}]} onPress={resetProject}>
                <Text style={styles.buttonText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    paddingTop: 60, paddingBottom: 20, alignItems: 'center', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' 
  },
  headerCircle: {
    position: 'absolute', top: -50, right: -50, width: 150, height: 150,
    borderRadius: 75, backgroundColor: '#E0F2FE', opacity: 0.5
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: 2 },
  headerSubtitle: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold' },
  
  stepperContainer: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 60, 
    paddingVertical: 20, backgroundColor: '#fff' 
  },
  stepWrapper: { alignItems: 'center', zIndex: 2 },
  stepCircle: { 
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, backgroundColor: '#fff'
  },
  stepActive: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  stepInactive: { borderColor: '#CBD5E1', backgroundColor: '#fff' },
  stepNumber: { fontSize: 14, fontWeight: 'bold' },
  stepLabel: { fontSize: 10, marginTop: 4, color: '#94A3B8', fontWeight: 'bold' },
  labelActive: { color: '#007AFF' },
  stepLine: { 
    position: 'absolute', top: 36, left: 60, right: 60, height: 2, 
    backgroundColor: '#E2E8F0', zIndex: 1 
  },

  scrollContent: { padding: 20 },
  card: { 
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 8
  },
  inputLabel: { fontSize: 12, fontWeight: '900', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    backgroundColor: '#F1F5F9', borderRadius: 16, padding: 18, fontSize: 15, color: '#1E293B',
    textAlignVertical: 'top', minHeight: 140, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', lineHeight: 22
  },
  primaryButton: { 
    backgroundColor: '#007AFF', borderRadius: 16, paddingVertical: 18, 
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  aiMessageBubble: { 
    backgroundColor: '#E0F2FE', padding: 18, borderRadius: 20, 
    borderBottomLeftRadius: 4, marginBottom: 20 
  },
  aiMessageText: { color: '#0369A1', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  
  reportBadge: {
    alignSelf: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 4, 
    borderRadius: 20, marginBottom: 15
  },
  reportBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  specContainer: { 
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, 
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, maxHeight: 350
  },
  specText: { fontSize: 13, color: '#334155', lineHeight: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  secondaryButton: { flex: 0.48, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }
});
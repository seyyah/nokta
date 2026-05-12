import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Ekran importu
import HoopCallScreen from './HoopCallScreen';

const genAI = new GoogleGenerativeAI("AIzaSyCGLbBtbdn66BWTPnCqqmV9gaLJ9TIuRD4");

// --- KRİTİK AYARLAR ---
const STREAM_API_KEY = 'jw5pnauppcd7';
// Kendi IPv4 adresinle güncellendi:
const TOKEN_SERVER_URL = 'http://192.168.1.101:8080'; 

export default function App() {
  // --- KULLANICI HESABI ---
  const [user, setUser] = useState({
    id: '231118017',
    name: 'Büşra Nur Yüksel',
    role: 'Software Engineering Student',
    email: 'busra@nokta.edu'
  });

  const [idea, setIdea] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('main'); 

  // --- SLACK / EMAIL ADAPTER ---
  const sendNotification = async (transcript, ideaTitle) => {
    try {
      const webhookURL = 'https://httpbin.org/post'; 
      const payload = {
        text: `🚀 *Yeni HITL Kaydı Bildirimi*\n\n*Proje:* ${ideaTitle}\n*Mentor/Kullanıcı:* ${user.name}\n*Notlar:* ${transcript}\n\n_Nokta HITL Adapter_`
      };

      await fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.log("Adapter Hatası:", error);
    }
  };

  const analyzeIdea = async () => {
    if (!idea) return;
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Sen kıdemli bir sistem mimarısın. Ham fikir: "${idea}" Bu fikri analiz et ve şu 4 başlıkta birer mühendislik sorusu sor: 1. Problem, 2. User, 3. Scope, 4. Constraint. Yanıtı temiz bir liste olarak ver.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      setQuestions(responseText);

      const criticalKeywords = ["risk", "security", "güvenlik", "maliyet", "cost", "ölçeklenebilirlik", "scalability", "tehlike", "performans"];
      const isCritical = criticalKeywords.some(keyword => 
        responseText.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isCritical) {
        setTimeout(() => {
          Alert.alert(
            "Kritik Durum Tespit Edildi",
            "Sistem bu fikirde teknik riskler tespit etti. Uzman görüşü almanız öneriliyor...",
            [{ text: "Mentor'a Bağlan", onPress: () => setCurrentScreen('hoop') }, { text: "Kapat", style: "cancel" }]
          );
        }, 1000);
      }
    } catch (error) {
      setQuestions("⚠️ API Bağlantı Sorunu (Simülasyon Aktif):\n\n1. Problem: Veri toplama yöntemi ölçeklenebilir mi?\n2. User: Hedef kitle bu çözümü tercih eder mi?");
    }
    setLoading(false);
  };

  const appendToSpec = (transcript) => {
    const date = new Date().toLocaleString('tr-TR');
    const hitlSection = `\n\n---\n## 🎥 HITL Notları (Mentor: ${user.name})\n*Kayıt Tarihi: ${date}*\n\n${transcript}\n---`;
    setQuestions(prev => prev + hitlSection);
    sendNotification(transcript, idea || 'Yeni Proje');
    setCurrentScreen('main');
    Alert.alert("Başarılı", "Görüşme notları dökümana eklendi.");
  };

  if (currentScreen === 'hoop') {
    return (
      <HoopCallScreen 
        route={{ 
          params: { ideaId: user.id, ideaTitle: idea || 'Yeni Proje', userInfo: user } 
        }} 
        navigation={{ 
          navigate: () => setCurrentScreen('main'),
          saveTranscript: (text) => appendToSpec(text) 
        }} 
      />
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Nokta: Track A</Text>
          <Text style={styles.userBadge}>👤 {user.name.split(' ')[0]}</Text>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Fikrini buraya yaz..."
          value={idea}
          onChangeText={setIdea}
          multiline
        />
        
        <TouchableOpacity style={styles.button} onPress={analyzeIdea} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Analiz Ediliyor...' : 'Soruları Üret'}</Text>
        </TouchableOpacity>

        <ScrollView style={styles.resultArea} contentContainerStyle={{ paddingBottom: 40 }}>
          {questions !== '' && <Text style={styles.label}>Üretilen Teknik Spec & Sorular:</Text>}
          <Text style={styles.resultText}>{questions}</Text>
          
          {questions !== '' && (
            <TouchableOpacity 
              style={styles.hitlButton} 
              onPress={() => setCurrentScreen('hoop')}
            >
              <Text style={styles.hitlButtonText}>🎥 Mentor ile Görüş (HITL)</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  userBadge: { fontSize: 12, color: '#666', backgroundColor: '#f0f0f0', padding: 5, borderRadius: 5 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, height: 100, fontSize: 16 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  resultArea: { marginTop: 20 },
  resultText: { fontSize: 16, lineHeight: 24, color: '#333' },
  hitlButton: { 
    backgroundColor: '#FF5722', 
    padding: 18, 
    borderRadius: 12, 
    marginTop: 30, 
    flexDirection: 'row', 
    justifyContent: 'center',
    elevation: 4
  },
  hitlButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});



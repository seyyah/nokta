import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google AI Studio'dan aldığın API Anahtarını buraya gir
const API_KEY = "AIzaSyAcT1vvbcJpkRERMbR4y77g0UkUqpLMXQU";
const genAI = new GoogleGenerativeAI(API_KEY);

export default function App() {
  const [pitch, setPitch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzePitch = async () => {
    if (!pitch.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Şu girişim fikrini (pitch) analiz et: "${pitch}". Bana 1 ile 100 arasında bir "Slop Score" (Abartı/Boş laf puanı) ver. 100 çok abartılı ve altı boş demek. Ardından bu puanın nedenini 3 kısa maddede açıkla. Yanıtı sadece şu formatta ver:\nSlop Score: [Puan]\nGerekçe:\n- [Madde 1]\n- [Madde 2]\n- [Madde 3]`;
      
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      setResult(text);
    } catch (error) {
      console.error("GEMINI API HATASI:", error);
      setResult("Bir hata oluştu. API anahtarınızı kontrol edin veya internet bağlantınızdan emin olun.");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pitch Validator 🎯</Text>
      <Text style={styles.subtitle}>Girişim fikrini yaz, AI pazar iddialarını test edip "Slop Score" üretsin.</Text>
      
      <TextInput
        style={styles.input}
        multiline
        placeholder="Örn: Yapay zeka destekli blockchain tabanlı yeni nesil sosyal ağımızla 10 trilyon dolarlık pazarı domine edeceğiz..."
        value={pitch}
        onChangeText={setPitch}
      />

      <TouchableOpacity style={styles.button} onPress={analyzePitch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analiz Et</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 16, fontSize: 16, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', marginBottom: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { marginTop: 24, backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  resultText: { fontSize: 16, color: '#333', lineHeight: 24 }
});
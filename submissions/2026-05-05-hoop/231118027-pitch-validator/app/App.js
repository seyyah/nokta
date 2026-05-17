import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ GITHUB'A PR GÖNDERMEDEN ÖNCE BURAYI BOŞ BIRAKMAYI ("") UNUTMA!
const API_KEY = ""; 
const genAI = new GoogleGenerativeAI(API_KEY);

export default function App() {
  const [pitch, setPitch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false); 

  const analyzePitch = async () => {
    if (!pitch.trim()) return;

    const lowerText = pitch.toLowerCase();

    // 1. UZMAN DESTEĞİ KONTROLÜ
    if (lowerText.includes("uzmana bağlan") || lowerText.includes("insan desteği") || lowerText.includes("uzman desteği")) {
      setIsExpertMode(true);
      setResult("🤖: Talebiniz alındı. Sizi bir uzman danışmana aktarıyorum. Lütfen bekleyiniz...");
      return;
    }

    if (isExpertMode) {
      setResult(`👨‍💼: Mesajınız uzmana iletildi, kısa süre içinde dönüş yapılacak:\n\n"${pitch}"`);
      return;
    }

    // 2. NORMAL AI ANALİZ SÜRECİ
    setLoading(true);
    setResult(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Şu girişimi analiz et: "${pitch}". 1-100 arası Slop Score ver ve 3 maddede nedenini açıkla.`;
      
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      setResult(text);
    } catch (error) {
      // HATAYI GİZLEMİYORUZ, EKRANA VE KONSOLA YAZDIRIYORUZ
      console.error("GEMINI API HATASI:", error);
      setResult(`API Hatası Detayı: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nokta: Pitch Validator 🎯</Text>
      
      {isExpertMode && (
        <View style={styles.expertBadge}>
          <Text style={styles.expertBadgeText}>👨‍💼 Uzman Desteği Aktif</Text>
        </View>
      )}

      <TextInput
        style={[styles.input, isExpertMode && { borderColor: '#4CAF50' }]}
        multiline
        placeholder={isExpertMode ? "Uzmana mesajınızı yazın..." : "Girişim fikrinizi buraya yazın..."}
        value={pitch}
        onChangeText={setPitch}
      />

      <TouchableOpacity 
        style={[styles.button, isExpertMode && { backgroundColor: '#4CAF50' }]} 
        onPress={analyzePitch} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isExpertMode ? "Uzmana Gönder" : "Analiz Et"}</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      {isExpertMode && (
        <TouchableOpacity onPress={() => { setIsExpertMode(false); setResult(null); setPitch(''); }}>
          <Text style={{ color: '#FF3B30', textAlign: 'center', marginTop: 20 }}>Yapay Zekaya Geri Dön</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
  expertBadge: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 8, alignSelf: 'center', marginBottom: 15 },
  expertBadgeText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 16, fontSize: 16, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', marginBottom: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { marginTop: 24, backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  resultText: { fontSize: 16, color: '#333', lineHeight: 24 }
});
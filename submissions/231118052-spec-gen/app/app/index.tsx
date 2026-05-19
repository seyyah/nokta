import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Anahtarını .env dosyasından alıyoruz
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export default function Index() {
    const [step, setStep] = useState(1); // 1: Fikir, 2: Sorular, 3: Spec
    const [idea, setIdea] = useState('');
    const [questions, setQuestions] = useState('');
    const [answers, setAnswers] = useState('');
    const [spec, setSpec] = useState('');
    const [loading, setLoading] = useState(false);

    // Aşama 1: Fikri gönderip AI'dan soru isteme
    // Aşama 1: Fikri gönderip AI'dan soru isteme (MOCK - Sahte Veri)
    const askQuestions = async () => {
        if (!idea.trim()) return Alert.alert("Hata", "Lütfen bir fikir girin.");
        setLoading(true);

        // API yerine 1.5 saniye (1500ms) bekleyip hazır soruları ekrana basıyoruz
        setTimeout(() => {
            setQuestions("1. Bu projenin çözeceği temel problem nedir?\n2. Hedef kullanıcı kitlesi kimdir?\n3. Veritabanı ve yapay zeka (YOLO vs.) mimarisi nasıl olacak?\n4. Donanım (CUDA) veya bütçe kısıtlamalarınız nelerdir?");
            setStep(2);
            setLoading(false);
        }, 1500);
    };

    // Aşama 2: Soruların cevaplarını gönderip Spec oluşturma (MOCK - Sahte Veri)
    const generateSpec = async () => {
        if (!answers.trim()) return Alert.alert("Hata", "Lütfen soruları yanıtlayın.");
        setLoading(true);

        // API yerine 1.5 saniye bekleyip hazır SPEC belgesini ekrana basıyoruz
        setTimeout(() => {
            setSpec("# Software Requirements Specification\n\n## 1. Executive Summary\nBu proje, güvenlik sistemlerindeki videoları analiz etmeyi hedefler.\n\n## 2. System Architecture\nSistem, görüntü işleme için optimize edilmiş sunucularda çalışacak ve tespit edilen anomalileri veritabanında loglayacaktır.\n\n## 3. Constraints\n- GPU (CUDA) gereksinimi yüksektir.\n- Ağ bant genişliği optimize edilmelidir.");
            setStep(3);
            setLoading(false);
        }, 1500);
    };

    // UI Render Fonksiyonları
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>NOKTA - Spec Generator 🚀</Text>

            {/* AŞAMA 1: FİKİR GİRİŞİ */}
            {step === 1 && (
                <View style={styles.card}>
                    <Text style={styles.label}>Ürün Fikrinizi Yazın:</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder="Örn: Kampüs güvenliği için uzun videoları analiz eden yapay zeka sistemi..."
                        value={idea}
                        onChangeText={setIdea}
                    />
                    <TouchableOpacity style={styles.button} onPress={askQuestions} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Fikri Analiz Et</Text>}
                    </TouchableOpacity>
                </View>
            )}

            {/* AŞAMA 2: SORULARI YANITLAMA */}
            {step === 2 && (
                <View style={styles.card}>
                    <Text style={styles.label}>AI Mühendisin Soruları:</Text>
                    <Text style={styles.markdownText}>{questions}</Text>

                    <Text style={styles.label}>Cevaplarınız (Maddeler halinde):</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder="1. Cevap...\n2. Cevap..."
                        value={answers}
                        onChangeText={setAnswers}
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#7f8c8d' }]} onPress={() => setStep(1)}>
                            <Text style={styles.buttonText}>Geri</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: 10 }]} onPress={generateSpec} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Spec Üret</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* AŞAMA 3: FINAL SPEC GÖSTERİMİ */}
            {step === 3 && (
                <View style={styles.card}>
                    <Text style={styles.label}>🎉 Final Specification Document</Text>
                    <Text style={styles.markdownText}>{spec}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => { setStep(1); setIdea(''); setAnswers(''); }}>
                        <Text style={styles.buttonText}>Yeni Fikir Dene</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#f0f2f5', justifyContent: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#34495e', marginTop: 10 },
    textArea: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 12, minHeight: 120, textAlignVertical: 'top', fontSize: 15 },
    button: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    markdownText: { backgroundColor: '#ecf0f1', padding: 15, borderRadius: 8, fontSize: 14, color: '#2c3e50', lineHeight: 22 }
});
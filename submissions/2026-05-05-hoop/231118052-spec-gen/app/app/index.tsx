import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
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
    
    // YENİ STATE: Uzman desteği ekranını kontrol eder
    const [expertModalVisible, setExpertModalVisible] = useState(false);
    const [userMessage, setUserMessage] = useState('');

    // Aşama 1: Fikri gönderip AI'dan soru isteme (MOCK - Sahte Veri)
    const askQuestions = async () => {
        if (!idea.trim()) return Alert.alert("Hata", "Lütfen bir fikir girin.");
        setLoading(true);

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

        setTimeout(() => {
            setSpec("# Software Requirements Specification\n\n## 1. Executive Summary\nBu proje, güvenlik sistemlerindeki videoları analiz etmeyi hedefler.\n\n## 2. System Architecture\nSistem, görüntü işleme için optimize edilmiş sunucularda çalışacak ve tespit edilen anomalileri veritabanında loglayacaktır.\n\n## 3. Constraints\n- GPU (CUDA) gereksinimi yüksektir.\n- Ağ bant genişliği optimize edilmelidir.");
            setStep(3);
            setLoading(false);
        }, 1500);
    };

    // YENİ FONKSİYON: Uzmana mesajı gönder (Simülasyon)
    const sendToExpert = () => {
        if (!userMessage.trim()) return Alert.alert("Uyarı", "Lütfen uzmanlarımıza iletmek istediğiniz notu yazın.");
        
        Alert.alert(
            "✅ Talebiniz Alındı!",
            "Proje fikriniz, AI tarafından üretilen ön raporunuz ve notunuz insan uzmanlarımıza iletilmiştir. En kısa sürede sizinle iletişime geçeceğiz.",
            [{ text: "Tamam", onPress: () => {
                setExpertModalVisible(false);
                setUserMessage('');
            }}]
        );
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
                    
                    {/* YENİ EKLENEN İNSAN DESTEĞİ BUTONU */}
                    <TouchableOpacity style={styles.expertButton} onPress={() => setExpertModalVisible(true)}>
                        <Text style={styles.expertButtonText}>👨‍💻 Gerçek Uzmana Danış (Human Support)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => { setStep(1); setIdea(''); setAnswers(''); }}>
                        <Text style={styles.buttonText}>Yeni Fikir Dene</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* YENİ EKLENEN UZMAN DESTEĞİ MODAL EKRANI */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={expertModalVisible}
                onRequestClose={() => setExpertModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>👨‍💻 İnsan Uzman Desteği</Text>
                        <Text style={styles.modalDesc}>
                            Yapay zekanın ürettiği bu raporda eksikler mi var? Fikrini profesyonel bir yazılım mimarına inceletmek için notunu bırak.
                        </Text>
                        <TextInput
                            style={styles.modalTextArea}
                            multiline
                            placeholder="Örn: Merhaba, sistemin veritabanı seçimi konusunda emin değilim. Firebase yerine PostgreSQL daha mı uygun olur?"
                            value={userMessage}
                            onChangeText={setUserMessage}
                        />
                        <TouchableOpacity style={styles.modalSendButton} onPress={sendToExpert}>
                            <Text style={styles.buttonText}>Talebi Uzmana Gönder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setExpertModalVisible(false)}>
                            <Text style={styles.modalCloseText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    markdownText: { backgroundColor: '#ecf0f1', padding: 15, borderRadius: 8, fontSize: 14, color: '#2c3e50', lineHeight: 22 },
    
    // YENİ STİLLER (Uzman Ekranı İçin)
    expertButton: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#2ecc71' },
    expertButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.25, elevation: 10 },
    modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10, textAlign: 'center' },
    modalDesc: { fontSize: 14, color: '#7f8c8d', marginBottom: 15, textAlign: 'center', lineHeight: 20 },
    modalTextArea: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 15 },
    modalSendButton: { backgroundColor: '#27ae60', padding: 15, borderRadius: 8, alignItems: 'center' },
    modalCloseButton: { marginTop: 15, alignItems: 'center', padding: 10 },
    modalCloseText: { color: '#e74c3c', fontWeight: '600', fontSize: 15 }
});
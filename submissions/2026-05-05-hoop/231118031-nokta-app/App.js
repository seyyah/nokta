import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import NoktaAvatar from './components/NoktaAvatar';
import { fetchAIResponse, detectDomain, transcribeAudio } from './services/cyberAiService';

export default function App() {
    const [inputText, setInputText] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [expertDomain, setExpertDomain] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [recording, setRecording] = useState(null);

    // Sesi zorla ana hoparlöre (medya moduna) geçiren fonksiyon
    const setSpeakerMode = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false, // Kayıt iznini kapatıp cihazı medya moduna zorlar
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.log("Ses modu ayarlanamadı:", error);
        }
    };

    // Yapay zekanın her zaman gür sesle (hoparlörden) konuşmasını garanti eden fonksiyon
    const speakLoudly = async (text) => {
        Speech.stop(); // Varsa önceki konuşmayı kes
        await setSpeakerMode(); // Sistemi zorla hoparlöre geçir
        Speech.speak(text, { language: 'tr-TR' }); // Ve konuş!
    };

    useEffect(() => {
        setSpeakerMode();
        setChatHistory([{ role: 'ai', text: 'Merhaba ben SQ yapay zekasıyım, sana nasıl yardımcı olabilirim?' }]);
    }, []);

    const resetConversation = async () => {
        Speech.stop();
        if (recording) {
            await recording.stopAndUnloadAsync().catch(() => { });
            setRecording(null);
        }
        await setSpeakerMode();
        setExpertDomain(null);
        setInteractionMode(null);
        setInputText('');
        setIsLoading(false);
        setChatHistory([{ role: 'ai', text: 'Merhaba ben SQ yapay zekasıyım, sana nasıl yardımcı olabilirim?' }]);
    };

    const processUserMessage = async (userMsg) => {
        Speech.stop();
        const newHistory = [...chatHistory, { role: 'user', text: userMsg }];
        setChatHistory(newHistory);
        setIsLoading(true);

        if (!expertDomain) {
            const detectedDomain = await detectDomain(userMsg);
            setExpertDomain(detectedDomain);

            const transitionMsg = `Seni ${detectedDomain} uzmanımıza aktarıyorum...`;
            setChatHistory(prev => [...prev, { role: 'ai', text: transitionMsg }]);
            speakLoudly(transitionMsg); // Yeni ses fonksiyonumuzu kullandık

            setTimeout(() => {
                const expertWelcome = `Merhaba ben ${detectedDomain} uzmanıyım. Sorununu çözmek için nasıl ilerlemek istersin?`;
                setChatHistory(prev => [...prev, { role: 'ai', text: expertWelcome, isOptions: true }]);
                speakLoudly(expertWelcome); // Yeni ses fonksiyonumuzu kullandık
                setIsLoading(false);
            }, 5000);

            return;
        }

        const aiResponse = await fetchAIResponse(userMsg, expertDomain);
        setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
        setIsLoading(false);

        if (interactionMode === 'voice') {
            speakLoudly(aiResponse); // Yeni ses fonksiyonumuzu kullandık
        }
    };

    const handleSendText = () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        processUserMessage(text);
    };

    async function toggleRecording() {
        if (recording) {
            // Kaydı durdur
            const currentRecording = recording;
            setRecording(null);

            try {
                await currentRecording.stopAndUnloadAsync();
                const uri = currentRecording.getURI();

                setIsLoading(true);
                const transcribedText = await transcribeAudio(uri);
                if (transcribedText) {
                    processUserMessage(transcribedText);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Kayıt durdurulamadı', err);
                setIsLoading(false);
            }
        } else {
            // Yeni Kayıt Başlat
            try {
                Speech.stop();
                await Audio.requestPermissionsAsync();
                // Mikrofonu açmak için sistemi sadece burada kayıt moduna geçiriyoruz
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    playThroughEarpieceAndroid: false
                });
                const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                setRecording(newRecording);
            } catch (err) {
                console.error('Kayıt başlatılamadı', err);
            }
        }
    }

    const selectMode = (mode) => {
        setInteractionMode(mode);
        setChatHistory(prev => [...prev, { role: 'user', text: mode === 'text' ? 'Mesaj ile' : 'Konuşarak' }]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {expertDomain ? `${expertDomain} Uzmanı` : "SQ Yapay Zekası"}
                    </Text>
                </View>

                <View style={styles.avatarRow}>
                    <NoktaAvatar isExpertMode={!!expertDomain} />
                    {expertDomain && (
                        <TouchableOpacity style={styles.endButton} onPress={resetConversation}>
                            <Text style={styles.endButtonText}>Bitir</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
                    {chatHistory.map((msg, index) => (
                        <View key={index}>
                            <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                                <Text style={styles.messageText}>{msg.text}</Text>
                            </View>

                            {msg.isOptions && !interactionMode && (
                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity style={styles.optionBtn} onPress={() => selectMode('text')}>
                                        <Text style={styles.optionText}>Mesaj ile</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.optionBtn} onPress={() => selectMode('voice')}>
                                        <Text style={styles.optionText}>Konuşarak</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                    {isLoading && <Text style={styles.loadingText}>Yazıyor / Dinliyor...</Text>}
                </ScrollView>

                {expertDomain && interactionMode === 'voice' ? (
                    <View style={styles.voiceArea}>
                        <TouchableOpacity
                            style={[styles.micBtn, recording && styles.micBtnRecording]}
                            onPress={toggleRecording}
                        >
                            <Text style={styles.micBtnText}>
                                {recording ? "Kaydediyor\n(Bitirmek için dokun)" : "Konuşmak için\ndokun"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mesaj yaz..."
                            value={inputText}
                            onChangeText={setInputText}
                            editable={!expertDomain || interactionMode === 'text'}
                            multiline={true}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendText}>
                            <Text style={styles.sendButtonText}>Gönder</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { alignItems: 'center', paddingTop: 10, paddingBottom: 5 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    avatarRow: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    endButton: { position: 'absolute', right: 20, backgroundColor: '#d32f2f', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, zIndex: 10 },
    endButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    chatArea: { flex: 1, paddingHorizontal: 20 },
    messageBubble: { padding: 15, borderRadius: 10, marginBottom: 10, maxWidth: '80%' },
    userBubble: { backgroundColor: '#bbdefb', alignSelf: 'flex-end' },
    aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ddd' },
    messageText: { fontSize: 16, color: '#333' },
    loadingText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginVertical: 10 },
    inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 15, fontSize: 16, marginRight: 10, minHeight: 50, maxHeight: 120 },
    sendButton: { backgroundColor: '#2196f3', borderRadius: 25, paddingHorizontal: 20, height: 50, justifyContent: 'center' },
    sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    optionsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, gap: 10 },
    optionBtn: { backgroundColor: '#4caf50', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
    optionText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    voiceArea: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
    micBtn: { backgroundColor: '#2196f3', width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    micBtnRecording: { backgroundColor: '#f44336' },
    micBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
});
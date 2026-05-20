import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { ExpertAvatar } from '../components/ExpertAvatar';
import { generateExpertReview, generateExpertReply } from '../services/aiService';
import { startRecording, stopRecording, transcribeAudio } from '../services/audioService';

export default function ExpertScreen({ route, navigation }) {
    const { idea, specMarkdown } = route.params;
    const [messages, setMessages] = useState([]);
    const [avatarState, setAvatarState] = useState('idle');
    const [isRecording, setIsRecording] = useState(false);
    const recordingRef = useRef(null);
    const scrollViewRef = useRef(null);

    useEffect(() => {
        const initReview = async () => {
            setAvatarState('thinking');
            try {
                const review = await generateExpertReview(specMarkdown);
                addMessage('expert', review);
                speak(review);
            } catch (e) {
                setAvatarState('error');
                Alert.alert('Hata', e.message);
            }
        };
        initReview();

        return () => {
            Speech.stop();
        };
    }, []);

    const addMessage = (role, text) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role, text }]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const speak = (text) => {
        setAvatarState('speaking');
        // Strip markdown before speaking
        const cleanText = text.replace(/[#*`_]/g, '');
        Speech.speak(cleanText, {
            language: 'tr-TR',
            onDone: () => setAvatarState('idle'),
            onError: () => setAvatarState('idle'),
        });
    };

    const handleMicPressIn = async () => {
        Speech.stop();
        setAvatarState('listening');
        try {
            const rec = await startRecording();
            recordingRef.current = rec;
            setIsRecording(true);
        } catch (e) {
            setAvatarState('idle');
            Alert.alert('Hata', 'Mikrofon izni gerekli.');
        }
    };

    const handleMicPressOut = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        setAvatarState('thinking');
        try {
            const rec = recordingRef.current;
            recordingRef.current = null;
            const uri = await stopRecording(rec);
            
            const text = await transcribeAudio(uri);
            if (!text || !text.trim() || text.includes('[Ses anlaşılamadı]')) {
                setAvatarState('idle');
                return;
            }
            
            // Generate temporary messages array so AI has the latest context
            const userMsg = { id: Date.now().toString(), role: 'user', text };
            setMessages(prev => {
                const newMessages = [...prev, userMsg];
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                return newMessages;
            });
            
            const updatedMessages = [...messages, userMsg];
            const reply = await generateExpertReply(specMarkdown, updatedMessages, text);
            
            setMessages(prev => {
                const newMessages = [...prev, { id: Date.now().toString(), role: 'expert', text: reply }];
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                return newMessages;
            });
            speak(reply);
        } catch (e) {
            setAvatarState('error');
            Alert.alert('Hata', e.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => { Speech.stop(); navigation.goBack(); }}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Canlı Uzman</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.avatarSection}>
                <ExpertAvatar state={avatarState} />
            </View>

            <View style={styles.chatSection}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
                    {messages.map((msg, index) => (
                        <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.expertBubble]}>
                            <Text style={[styles.messageText, msg.role === 'user' && { color: '#fff' }]}>{msg.text}</Text>
                        </View>
                    ))}
                    {avatarState === 'thinking' && (
                        <View style={[styles.messageBubble, styles.expertBubble]}>
                            <Text style={styles.messageText}>Düşünüyor...</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.controls}>
                    <TouchableOpacity 
                        style={[styles.micBtn, isRecording && styles.micBtnRecording]}
                        onPressIn={handleMicPressIn}
                        onPressOut={handleMicPressOut}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="mic" size={32} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.hintText}>{isRecording ? 'Dinliyor...' : 'Konuşmak için basılı tut'}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
    iconBtn: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
    avatarSection: { height: '45%', backgroundColor: 'transparent' },
    chatSection: { flex: 1, paddingHorizontal: SPACING.md },
    chatScroll: { paddingTop: SPACING.md, paddingBottom: 120 },
    messageBubble: { padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, maxWidth: '85%' },
    expertBubble: { backgroundColor: 'rgba(30,30,40,0.85)', alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    userBubble: { backgroundColor: COLORS.accent, alignSelf: 'flex-end' },
    messageText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
    controls: { position: 'absolute', bottom: SPACING.xl, left: 0, right: 0, alignItems: 'center' },
    micBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', ...SHADOWS.accent },
    micBtnRecording: { backgroundColor: COLORS.error, transform: [{ scale: 1.1 }] },
    hintText: { marginTop: SPACING.sm, color: COLORS.textMuted, fontSize: 12 },
});

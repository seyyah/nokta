import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Canvas } from '@react-three/fiber';
import NoktaAvatar from '../components/NoktaAvatar';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';
import { Send, CheckCircle } from 'lucide-react-native';
import brainService from '../services/brainService';
import voiceService from '../services/voiceService';
import { MascotState } from '../types';

export default function EnrichScreen() {
    const router = useRouter();
    const { idea } = useLocalSearchParams<{ idea: string }>();
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [mascotState, setMascotState] = useState<MascotState>('idle');
    const [questionCount, setQuestionCount] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (idea) {
            handleStep(idea);
        }
    }, []);

    const handleStep = async (msg: string) => {
        setMascotState('talking');
        const aiResponse = await brainService.sendMessage(msg);
        setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        setQuestionCount(c => c + 1);
        setMascotState('idle');
        voiceService.speak(aiResponse, () => { });
    };

    const onSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        handleStep(input);
        setInput('');
    };

    const finish = () => {
        router.push('/artifact');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.mascotContainer}>
                <Canvas camera={{ position: [0, 0, 4.5] }}>
                    <ambientLight intensity={1} />
                    <NoktaAvatar state={mascotState} />
                </Canvas>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={{ padding: SPACING.md }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((m, i) => (
                    <View key={i} style={[styles.msgWrapper, m.role === 'ai' ? styles.aiWrapper : styles.userWrapper]}>
                        <View style={[styles.bubble, m.role === 'ai' ? styles.aiBubble : styles.userBubble]}>
                            <Text style={[styles.msgText, m.role === 'ai' ? styles.aiMsg : styles.userMsg]}>{m.text}</Text>
                        </View>
                    </View>
                ))}
                {questionCount >= 3 && (
                    <TouchableOpacity style={styles.finishBtn} onPress={finish}>
                        <CheckCircle color="#ffffff" size={20} />
                        <Text style={styles.finishText}>Spec Dokümanını Oluştur</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.textInput}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Cevabını yaz..."
                    onSubmitEditing={onSend}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
                    <Send color="#ffffff" size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    mascotContainer: { height: 250, backgroundColor: COLORS.surface },
    chatArea: { flex: 1 },
    msgWrapper: { marginVertical: SPACING.xs, flexDirection: 'row' },
    aiWrapper: { justifyContent: 'flex-start' },
    userWrapper: { justifyContent: 'flex-end' },
    bubble: { padding: SPACING.md, borderRadius: ROUNDED.lg, maxWidth: '80%' },
    aiBubble: { backgroundColor: COLORS.surfaceContainer },
    userBubble: { backgroundColor: COLORS.primary },
    msgText: { fontSize: 15 },
    aiMsg: { color: COLORS.onSurface },
    userMsg: { color: '#ffffff' },
    finishBtn: {
        backgroundColor: COLORS.secondary,
        padding: SPACING.md, borderRadius: ROUNDED.lg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: SPACING.base, marginTop: SPACING.md,
    },
    finishText: { color: '#ffffff', fontWeight: 'bold' },
    inputArea: {
        flexDirection: 'row', padding: SPACING.md, borderTopWidth: 1, borderColor: COLORS.outline,
        alignItems: 'center', gap: SPACING.md, backgroundColor: '#ffffff',
    },
    textInput: {
        flex: 1, height: 45, backgroundColor: COLORS.surfaceContainer,
        borderRadius: ROUNDED.full, paddingHorizontal: SPACING.md,
    },
    sendBtn: {
        width: 45, height: 45, borderRadius: 22.5,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    },
});

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Alert,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { generateQuestions } from '../services/aiService';
import { startRecording, stopRecording, transcribeAudio } from '../services/audioService';

export default function HomeScreen({ navigation }) {
    const [idea, setIdea] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingRef, setRecordingRef] = useState(null);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const timerRef = useRef(null);
    const pulseLoop = useRef(null);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (isRecording) {
            pulseLoop.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.35, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            );
            pulseLoop.current.start();
            timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } else {
            if (pulseLoop.current) pulseLoop.current.stop();
            pulseAnim.setValue(1);
            clearInterval(timerRef.current);
            setRecordingSeconds(0);
        }
    }, [isRecording]);

    const handleMicPress = async () => {
        if (isRecording) {
            try {
                const uri = await stopRecording(recordingRef);
                setIsRecording(false);
                setRecordingRef(null);
                const text = await transcribeAudio(uri);
                setIdea(prev => prev ? `${prev}\n${text}` : text);
            } catch (e) {
                setIsRecording(false);
                Alert.alert('Kayıt Hatası', e.message);
            }
        } else {
            try {
                const rec = await startRecording();
                setRecordingRef(rec);
                setIsRecording(true);
            } catch (e) {
                Alert.alert('İzin Gerekli', e.message);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!idea.trim()) {
            Alert.alert('Boş Alan', 'Lütfen analiz etmeden önce fikrinizi yazın.');
            return;
        }
        setIsLoading(true);
        try {
            const questions = await generateQuestions(idea.trim());
            navigation.navigate('Questions', { idea: idea.trim(), questions });
        } catch (e) {
            Alert.alert('AI Hatası', e.message || 'Bir hata oluştu. Tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoIcon}>
                                <Ionicons name="layers" size={22} color={COLORS.accent} />
                            </View>
                            <Text style={styles.logoText}>Spec Architect</Text>
                        </View>
                        <Text style={styles.tagline}>Ham fikrinden profesyonel spec'e</Text>
                    </Animated.View>

                    {/* Input Card */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="bulb-outline" size={18} color={COLORS.accentLight} />
                            <Text style={styles.cardTitle}>Fikrin</Text>
                        </View>

                        <TextInput
                            style={styles.textInput}
                            placeholder={`Fikrini buraya yaz...\n\nÖrnek: "Uzak ekiplerin asenkron iş takibini yapmasına yardımcı olan bir uygulama"`}
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            value={idea}
                            onChangeText={setIdea}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />

                        {/* Voice Row */}
                        <View style={styles.voiceRow}>
                            <View style={styles.voiceLeft}>
                                <Animated.View style={[
                                    styles.micRipple,
                                    isRecording && { transform: [{ scale: pulseAnim }], backgroundColor: COLORS.recordPulse },
                                ]}>
                                    <TouchableOpacity
                                        style={[styles.micButton, isRecording && styles.micButtonActive]}
                                        onPress={handleMicPress}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? COLORS.error : COLORS.textPrimary} />
                                    </TouchableOpacity>
                                </Animated.View>
                                <Text style={[styles.micLabel, isRecording && styles.micLabelActive]}>
                                    {isRecording ? `Kaydediliyor ${formatTime(recordingSeconds)}` : 'Sesle Gir'}
                                </Text>
                            </View>
                            <Text style={styles.charCount}>{idea.length} karakter</Text>
                        </View>
                    </Animated.View>

                    {/* Tip */}
                    <Animated.View style={[styles.tipsCard, { opacity: fadeAnim }]}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.teal} />
                        <Text style={styles.tipsText}>
                            Ne kadar detay verirsen spec o kadar iyi olur. Kimin için ve hangi sorunu çözdüğünü belirt.
                        </Text>
                    </Animated.View>

                    {/* Analyze Button */}
                    <TouchableOpacity
                        style={[styles.analyzeBtn, isLoading && styles.analyzeBtnDisabled]}
                        onPress={handleAnalyze}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        <View style={styles.btnRow}>
                            <Ionicons name={isLoading ? 'hourglass-outline' : 'flash'} size={20} color={COLORS.textOnAccent} />
                            <Text style={styles.analyzeBtnText}>{isLoading ? 'Analiz Ediliyor...' : 'Analiz Et →'}</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.poweredBy}>Gemini AI ile çalışır · Track A</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    header: { alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.xl },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    logoIcon: {
        width: 40, height: 40, borderRadius: RADIUS.md,
        backgroundColor: COLORS.accentGlow, borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    logoText: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: COLORS.textSecondary, letterSpacing: 0.3 },
    card: {
        backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
        padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
        marginBottom: SPACING.md, ...SHADOWS.card,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
    textInput: {
        backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
        padding: SPACING.md, color: COLORS.textPrimary, fontSize: 15,
        lineHeight: 22, minHeight: 150, borderWidth: 1, borderColor: COLORS.borderSubtle,
        marginBottom: SPACING.md,
    },
    voiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    voiceLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    micRipple: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
    micButton: {
        width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.bgElevated,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderSubtle,
    },
    micButtonActive: { backgroundColor: 'rgba(255,94,126,0.15)', borderColor: COLORS.recordActive },
    micLabel: { fontSize: 13, color: COLORS.textSecondary },
    micLabelActive: { color: COLORS.recordActive, fontWeight: '600' },
    charCount: { fontSize: 12, color: COLORS.textMuted },
    tipsCard: {
        flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.tealGlow,
        borderRadius: RADIUS.md, padding: SPACING.md,
        borderWidth: 1, borderColor: 'rgba(0,212,200,0.2)', marginBottom: SPACING.lg, alignItems: 'flex-start',
    },
    tipsText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
    analyzeBtn: {
        backgroundColor: COLORS.accent, borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md + 4, alignItems: 'center',
        ...SHADOWS.accent, marginBottom: SPACING.md,
    },
    analyzeBtnDisabled: { opacity: 0.6 },
    analyzeBtnText: { color: COLORS.textOnAccent, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    poweredBy: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.5 },
});

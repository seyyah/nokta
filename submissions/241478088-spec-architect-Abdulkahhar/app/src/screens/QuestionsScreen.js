import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Animated, Alert,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { generateSpecSheet } from '../services/aiService';

export default function QuestionsScreen({ route, navigation }) {
    const { idea, questions } = route.params;
    const [answers, setAnswers] = useState(questions.map(() => ''));
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    useEffect(() => {
        const answered = answers.filter(a => a.trim().length > 0).length;
        Animated.timing(progressAnim, {
            toValue: answered / questions.length, duration: 400, useNativeDriver: false,
        }).start();
    }, [answers]);

    const handleAnswerChange = (text, index) => {
        const updated = [...answers];
        updated[index] = text;
        setAnswers(updated);
    };

    const isReady = answers.every(a => a.trim().length >= 3);

    const handleGenerate = async () => {
        if (!isReady) {
            Alert.alert('Eksik Cevap', 'Spec oluşturmak için tüm soruları cevaplayın.');
            return;
        }
        setIsGenerating(true);
        try {
            const qa = questions.map((q, i) => ({ question: q, answer: answers[i] }));
            const specMarkdown = await generateSpecSheet(idea, qa);
            navigation.navigate('SpecSheet', { idea, specMarkdown });
        } catch (e) {
            Alert.alert('Oluşturma Hatası', e.message || 'Spec oluşturulamadı. Tekrar deneyin.');
        } finally {
            setIsGenerating(false);
        }
    };

    const answeredCount = answers.filter(a => a.trim().length > 0).length;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                            <View style={styles.headerCenter}>
                                <Text style={styles.headerTitle}>Netleştirme</Text>
                                <Text style={styles.headerStep}>{answeredCount} / {questions.length} cevaplandı</Text>
                            </View>
                            <View style={{ width: 36 }} />
                        </View>

                        {/* Progress */}
                        <View style={styles.progressBar}>
                            <Animated.View style={[styles.progressFill, {
                                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                            }]} />
                        </View>

                        {/* Idea preview */}
                        <View style={styles.ideaCard}>
                            <View style={styles.ideaIconRow}>
                                <Ionicons name="bulb" size={14} color={COLORS.accentLight} />
                                <Text style={styles.ideaLabel}>Fikrin</Text>
                            </View>
                            <Text style={styles.ideaText} numberOfLines={3}>{idea}</Text>
                        </View>

                        <Text style={styles.instruction}>
                            Aşağıdaki soruları yanıtla — AI tüm cevapları birleştirip profesyonel spec üretecek.
                        </Text>

                        {/* Questions */}
                        {questions.map((q, index) => {
                            const answered = answers[index].trim().length > 0;
                            return (
                                <View key={index} style={[
                                    styles.qCard,
                                    activeIndex === index && styles.qCardActive,
                                    answered && styles.qCardAnswered,
                                ]}>
                                    <View style={styles.qHeader}>
                                        <View style={[styles.qNum, answered && styles.qNumAnswered]}>
                                            {answered
                                                ? <Ionicons name="checkmark" size={12} color="#fff" />
                                                : <Text style={styles.qNumText}>{index + 1}</Text>}
                                        </View>
                                        <Text style={styles.qText}>{q}</Text>
                                    </View>
                                    <TextInput
                                        style={styles.answerInput}
                                        placeholder="Cevabın..."
                                        placeholderTextColor={COLORS.textMuted}
                                        multiline
                                        value={answers[index]}
                                        onChangeText={t => handleAnswerChange(t, index)}
                                        onFocus={() => setActiveIndex(index)}
                                        textAlignVertical="top"
                                        editable={!isGenerating}
                                    />
                                </View>
                            );
                        })}

                        {/* Generate Button */}
                        <TouchableOpacity
                            style={[styles.generateBtn, (!isReady || isGenerating) && styles.generateBtnDisabled]}
                            onPress={handleGenerate}
                            disabled={!isReady || isGenerating}
                            activeOpacity={0.85}
                        >
                            <View style={styles.btnRow}>
                                <Ionicons name={isGenerating ? 'hourglass-outline' : 'document-text'} size={20} color="#fff" />
                                <Text style={styles.generateBtnText}>
                                    {isGenerating ? 'Spec Oluşturuluyor...' : 'Spec Sheet Oluştur →'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {!isReady && (
                            <Text style={styles.reminderText}>Spec oluşturmak için tüm sorulara cevap ver</Text>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
    backBtn: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
    headerStep: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    progressBar: { height: 3, backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.full, marginBottom: SPACING.lg, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: RADIUS.full },
    ideaCard: { backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
    ideaIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    ideaLabel: { fontSize: 11, fontWeight: '600', color: COLORS.accentLight, letterSpacing: 0.5 },
    ideaText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
    instruction: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 18, textAlign: 'center' },
    qCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.borderSubtle, marginBottom: SPACING.md },
    qCardActive: { borderColor: COLORS.accent },
    qCardAnswered: { borderColor: COLORS.success, backgroundColor: 'rgba(0,200,150,0.04)' },
    qHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
    qNum: { width: 22, height: 22, borderRadius: RADIUS.full, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    qNumAnswered: { backgroundColor: COLORS.success },
    qNumText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
    qText: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, lineHeight: 20 },
    answerInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: 14, lineHeight: 20, minHeight: 80, borderWidth: 1, borderColor: COLORS.borderSubtle },
    generateBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, paddingVertical: SPACING.md + 4, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.accent },
    generateBtnDisabled: { opacity: 0.4 },
    generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    reminderText: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.sm },
});

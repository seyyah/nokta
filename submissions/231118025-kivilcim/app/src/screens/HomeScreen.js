import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import FlameRoad from '../components/FlameRoad';
import SlopMetre from '../components/SlopMetre';
import { analyzeSlopScore, analyzeProblemSolution } from '../services/aiService';

export default function HomeScreen({ navigation }) {
    const [ideaText, setIdeaText] = useState('');
    const [slopData, setSlopData] = useState({ score: 0, type: 'vague', reason: '' });
    const [slopVisible, setSlopVisible] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const debounceTimer = useRef(null);

    // Debounce slop analysis — runs while typing
    const handleTextChange = useCallback((text) => {
        setIdeaText(text);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (text.trim().length < 10) {
            setSlopVisible(false);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                setAnalyzing(true);
                setSlopVisible(true);
                const result = await analyzeSlopScore(text);
                setSlopData(result);
            } catch (e) {
                console.warn('Slop analysis error:', e);
            } finally {
                setAnalyzing(false);
            }
        }, 800);
    }, []);

    // Full analysis on submit
    const handleSubmit = async () => {
        if (!ideaText.trim() || loading) return;

        setLoading(true);
        setFeedback(null);

        try {
            // Step 1: Problem vs Solution check
            const psResult = await analyzeProblemSolution(ideaText);

            if (psResult.type === 'solution') {
                setFeedback({
                    type: 'solution',
                    message: psResult.feedback,
                });
                setLoading(false);
                return;
            }

            // Step 2: Check if idea is concrete enough
            const slopResult = await analyzeSlopScore(ideaText);
            setSlopData(slopResult);
            setSlopVisible(true);

            if (slopResult.score < 30) {
                setFeedback({
                    type: 'vague',
                    message: slopResult.reason,
                });
                setLoading(false);
                return;
            }

            // Step 3: Idea is good enough — proceed to flow
            navigation.navigate('Flow', {
                idea: ideaText,
                initialScore: slopResult.score,
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: 'Bağlantı hatası. Lütfen tekrar dene. (' + error.message + ')',
            });
        } finally {
            setLoading(false);
        }
    };

    const getFeedbackStyle = () => {
        if (!feedback) return {};
        switch (feedback.type) {
            case 'solution': return { borderColor: Colors.warning, backgroundColor: 'rgba(255, 183, 77, 0.08)' };
            case 'vague': return { borderColor: Colors.danger, backgroundColor: 'rgba(255, 82, 82, 0.08)' };
            case 'error': return { borderColor: Colors.danger, backgroundColor: 'rgba(255, 82, 82, 0.08)' };
            default: return {};
        }
    };

    const getFeedbackIcon = () => {
        if (!feedback) return '';
        switch (feedback.type) {
            case 'solution': return '🔄';
            case 'vague': return '🌫️';
            case 'error': return '⚠️';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            <FlameRoad score={slopData.score} currentStep={1} totalSteps={7} />

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Text style={styles.heroIcon}>✨</Text>
                        <Text style={styles.heroTitle}>Kıvılcım</Text>
                        <Text style={styles.heroSubtitle}>
                            Fikrini yaz. Biz ya ateşe dönüştüreceğiz, ya dürüstçe söndüreceğiz.
                        </Text>
                    </View>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={ideaText}
                            onChangeText={handleTextChange}
                            placeholder="Fikrini veya problemi anlat..."
                            placeholderTextColor={Colors.textMuted}
                            multiline
                            maxLength={2000}
                            textAlignVertical="top"
                        />
                        <View style={styles.charCount}>
                            {analyzing && <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />}
                            <Text style={styles.charText}>{ideaText.length}/2000</Text>
                        </View>
                    </View>

                    {/* Slop Metre */}
                    <SlopMetre
                        score={slopData.score}
                        type={slopData.type}
                        reason={slopData.reason}
                        visible={slopVisible}
                    />

                    {/* AI Feedback */}
                    {feedback && (
                        <View style={[styles.feedbackContainer, getFeedbackStyle()]}>
                            <Text style={styles.feedbackIcon}>{getFeedbackIcon()}</Text>
                            <Text style={styles.feedbackText}>{feedback.message}</Text>
                        </View>
                    )}

                    {/* Tips */}
                    <View style={styles.tips}>
                        <Text style={styles.tipTitle}>💡 İpuçları</Text>
                        <Text style={styles.tipText}>• Çözüm değil, problemi anlat</Text>
                        <Text style={styles.tipText}>• Kim bu problemi yaşıyor?</Text>
                        <Text style={styles.tipText}>• Bugün bu sorunu nasıl çözüyorlar?</Text>
                        <Text style={styles.tipText}>• Buzzword yerine düz cümle kullan</Text>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.submitButton, (!ideaText.trim() || loading) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!ideaText.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.text} />
                        ) : (
                            <Text style={styles.submitText}>🔍 Analiz Et</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    hero: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 30,
    },
    heroIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginHorizontal: 20,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 16,
        padding: 16,
        color: Colors.text,
        fontSize: 16,
        minHeight: 140,
        maxHeight: 220,
        lineHeight: 24,
    },
    charCount: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
        paddingRight: 4,
    },
    charText: {
        color: Colors.textMuted,
        fontSize: 12,
    },
    feedbackContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginHorizontal: 20,
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    feedbackIcon: {
        fontSize: 18,
        marginTop: 1,
    },
    feedbackText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    tips: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 14,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    tipTitle: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },
    tipText: {
        color: Colors.textMuted,
        fontSize: 13,
        lineHeight: 20,
    },
    bottomBar: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
        backgroundColor: Colors.backgroundLight,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: Colors.surfaceLight,
    },
    submitText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
});

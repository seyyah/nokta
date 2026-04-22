import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../src/theme/colors';
import FlameRoad from '../src/components/FlameRoad';
import ChatBubble from '../src/components/ChatBubble';
import InputBar from '../src/components/InputBar';
import {
    getConstraintQuestions, generateAdaptiveQuestion, detectBlindSpots,
} from '../src/services/aiService';

const PHASES = { CONSTRAINTS: 'constraints', QUESTIONS: 'questions', BLIND_SPOTS: 'blindSpots', READY: 'ready' };

export default function FlowScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const idea = params.idea as string;
    const initialScore = Number(params.initialScore) || 20;

    const [phase, setPhase] = useState(PHASES.CONSTRAINTS);
    const [messages, setMessages] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [constraints, setConstraints] = useState('');
    const [loading, setLoading] = useState(false);
    const [flameScore, setFlameScore] = useState(initialScore);
    const [currentStep, setCurrentStep] = useState(2);
    const flatListRef = useRef<any>(null);
    const [evolutionEntries, setEvolutionEntries] = useState<any[]>([
        { label: 'Başlangıç', text: (idea || '').substring(0, 80) + ((idea || '').length > 80 ? '...' : ''), color: Colors.flameSpark },
    ]);

    useEffect(() => { startConstraintsPhase(); }, []);

    const addMessage = (msg, isAI = true) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), text: msg, isAI }]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const startConstraintsPhase = async () => {
        setLoading(true);
        try {
            const constraintQ = await getConstraintQuestions(idea);
            addMessage(constraintQ, true);
        } catch (e) {
            addMessage('Kısıt sorularını yüklerken hata oluştu. Kısıtlarını yaz.', true);
        }
        setLoading(false);
    };

    const handleConstraintAnswer = async (text) => {
        addMessage(text, false);
        setConstraints(text);
        setFlameScore(prev => Math.min(prev + 10, 30));
        setCurrentStep(3);
        setEvolutionEntries(prev => [...prev, { label: 'Kısıtlar', text: text.substring(0, 60) + '...', color: Colors.flameEmber }]);
        setPhase(PHASES.QUESTIONS);
        await askNextQuestion(text, []);
    };

    const askNextQuestion = async (constText, prevAnswers) => {
        setLoading(true);
        try {
            const result = await generateAdaptiveQuestion(idea, constText || constraints, prevAnswers);
            if (result.status === 'done') {
                setPhase(PHASES.BLIND_SPOTS);
                addMessage('✅ Tüm boyutlar kapsandı. Blind spot kontrolü...', true);
                await checkBlindSpots(prevAnswers);
                return;
            }
            const tag = result.isFollowUp ? '📌 Takip' : `🔍 ${result.dimension}`;
            addMessage(`${tag}\n\n${result.question}`, true);
        } catch (e) {
            addMessage('Soru üretilirken hata oluştu. Detaylandırmaya devam et.', true);
        }
        setLoading(false);
    };

    const handleQuestionAnswer = async (text) => {
        addMessage(text, false);
        const newAnswer = { question: messages.filter(m => m.isAI).slice(-1)[0]?.text || '', answer: text };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        setFlameScore(Math.min(20 + newAnswers.length * 10, 60));
        await askNextQuestion(constraints, newAnswers);
    };

    const checkBlindSpots = async (prevAnswers) => {
        setLoading(true);
        try {
            const allAnswers = prevAnswers.length > 0 ? prevAnswers : answers;
            const result = await detectBlindSpots(idea, allAnswers);
            if (result.blindSpots && result.blindSpots.length > 0) {
                setEvolutionEntries(prev => [...prev, { label: 'Blind Spot', text: `${result.blindSpots.length} eksik boyut`, color: Colors.warning }]);
                for (const spot of result.blindSpots) {
                    addMessage(`🕳️ Blind Spot: ${spot.topic}\n\n${spot.why}\n\n${spot.question}`, true);
                }
                setPhase(PHASES.BLIND_SPOTS);
            } else {
                addMessage('✅ Kritik blind spot yok. Spec üretmeye hazırsın!', true);
                setPhase(PHASES.READY);
                setFlameScore(65);
                setCurrentStep(4);
            }
        } catch (e) {
            addMessage('Blind spot kontrolünde hata. Spec üretebilirsin.', true);
            setPhase(PHASES.READY);
        }
        setLoading(false);
    };

    const handleBlindSpotAnswer = async (text) => {
        addMessage(text, false);
        setAnswers(prev => [...prev, { question: messages.filter(m => m.isAI).slice(-1)[0]?.text || '', answer: text }]);
        setFlameScore(65);
        setCurrentStep(4);
        setPhase(PHASES.READY);
        addMessage('✅ Blind spot tamamlandı. Spec üretmeye hazırsın!', true);
    };

    const handleSend = async (text) => {
        switch (phase) {
            case PHASES.CONSTRAINTS: await handleConstraintAnswer(text); break;
            case PHASES.QUESTIONS: await handleQuestionAnswer(text); break;
            case PHASES.BLIND_SPOTS: await handleBlindSpotAnswer(text); break;
        }
    };

    const handleGoToSpec = () => {
        setEvolutionEntries(prev => [...prev, { label: 'Sorular Tamam', text: `${answers.length} soru cevaplandı`, color: Colors.success }]);
        router.push({
            pathname: '/result',
            params: {
                idea, constraints,
                answers: JSON.stringify(answers),
                evolutionEntries: JSON.stringify(evolutionEntries),
                flameScore,
            },
        });
    };

    const handleGoBack = () => {
        if (phase === PHASES.BLIND_SPOTS || phase === PHASES.READY) {
            setPhase(PHASES.QUESTIONS);
            addMessage('🔄 Sorulara dönüyorum.', true);
        } else if (phase === PHASES.QUESTIONS && answers.length > 0) {
            const removed = answers[answers.length - 1];
            setAnswers(prev => prev.slice(0, -1));
            addMessage(`🔄 Son cevap geri alındı: "${removed.answer.substring(0, 40)}..."`, true);
            setEvolutionEntries(prev => [...prev, { label: 'Geri Dönüş', text: 'Cevap güncellendi', color: Colors.secondary }]);
        }
    };

    const getPlaceholder = () => {
        switch (phase) {
            case PHASES.CONSTRAINTS: return 'Kısıtlarını yaz...';
            case PHASES.QUESTIONS: return 'Cevabını yaz...';
            case PHASES.BLIND_SPOTS: return 'Blind spot cevabını yaz...';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            <FlameRoad score={flameScore} currentStep={currentStep} totalSteps={7} />
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack} disabled={phase === PHASES.CONSTRAINTS}>
                    <Text style={[styles.backText, phase === PHASES.CONSTRAINTS && styles.disabledText]}>← Geri</Text>
                </TouchableOpacity>
                <View style={styles.phaseBadge}>
                    <Text style={styles.phaseText}>
                        {phase === PHASES.CONSTRAINTS ? '⚙️ Kısıtlar' :
                            phase === PHASES.QUESTIONS ? '🔍 Sorular' :
                                phase === PHASES.BLIND_SPOTS ? '🕳️ Blind Spot' : '✅ Hazır'}
                    </Text>
                </View>
                {phase === PHASES.READY && (
                    <TouchableOpacity style={styles.specButton} onPress={handleGoToSpec}>
                        <Text style={styles.specButtonText}>Spec Üret →</Text>
                    </TouchableOpacity>
                )}
            </View>
            <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ChatBubble message={item.text} isAI={item.isAI} />}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Colors.primary} size="small" />
                        <Text style={styles.loadingText}>Kıvılcım düşünüyor...</Text>
                    </View>
                )}
                {phase !== PHASES.READY ? (
                    <InputBar onSend={handleSend} placeholder={getPlaceholder()} loading={loading} disabled={loading} />
                ) : (
                    <View style={styles.readyBar}>
                        <TouchableOpacity style={styles.readyButton} onPress={handleGoToSpec}>
                            <Text style={styles.readyButtonText}>📄 Spec Oluştur</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    backButton: { padding: 6 },
    backText: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
    disabledText: { color: Colors.textMuted },
    phaseBadge: { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
    phaseText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
    specButton: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    specButtonText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
    chatContainer: { flex: 1 },
    messageList: { paddingVertical: 12 },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 8 },
    loadingText: { color: Colors.textMuted, fontSize: 13 },
    readyBar: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder, backgroundColor: Colors.backgroundLight },
    readyButton: { backgroundColor: Colors.success, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    readyButtonText: { color: Colors.background, fontSize: 16, fontWeight: '800' },
});

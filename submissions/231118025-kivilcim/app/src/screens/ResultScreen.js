import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Clipboard,
    Alert,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../theme/colors';
import FlameRoad from '../components/FlameRoad';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ScopeCard from '../components/ScopeCard';
import RedTeamCard from '../components/RedTeamCard';
import EvolutionMap from '../components/EvolutionMap';
import KivilcimCard from '../components/KivilcimCard';
import InputBar from '../components/InputBar';
import {
    generateSpec,
    applyScopeKnife,
    runRedTeam,
    evaluateKillSwitch,
} from '../services/aiService';

const TABS = ['📄 Spec', '🔪 Scope', '⚔️ Red Team', '❓ So What?', '🚀 Adımlar', '📍 Evrim', '🏆 Kart'];

export default function ResultScreen({ route, navigation }) {
    const { idea, constraints, answers, evolutionEntries: initialEvolution, flameScore: initialFlame } = route.params;
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPhase, setCurrentPhase] = useState('spec'); // spec, scope, redteam, sowhat, final

    // Data states
    const [specData, setSpecData] = useState({ spec: '', confidenceScores: {} });
    const [scopeData, setScopeData] = useState({ mvp: [], later: [], coreQuestion: '' });
    const [redTeamData, setRedTeamData] = useState({ attacks: [] });
    const [defenses, setDefenses] = useState([]);
    const [killSwitchData, setKillSwitchData] = useState(null);
    const [soWhatAnswer, setSoWhatAnswer] = useState('');
    const [flameScore, setFlameScore] = useState(initialFlame || 65);
    const [isDead, setIsDead] = useState(false);
    const [evolutionEntries, setEvolutionEntries] = useState(initialEvolution || []);

    useEffect(() => {
        runPipeline();
    }, []);

    const runPipeline = async () => {
        try {
            // Step 1: Generate Spec
            setCurrentPhase('spec');
            const spec = await generateSpec(idea, constraints, answers);
            setSpecData(spec);
            setFlameScore(70);
            setEvolutionEntries(prev => [...prev, {
                label: 'Spec Üretildi',
                text: 'Güven skorları hesaplandı',
                color: Colors.flameBlaze,
            }]);

            // Step 2: Scope Knife
            setCurrentPhase('scope');
            const scope = await applyScopeKnife(spec.spec);
            setScopeData(scope);

            // Step 3: Red Team
            setCurrentPhase('redteam');
            const redTeam = await runRedTeam(spec.spec);
            setRedTeamData(redTeam);
            setFlameScore(75);

            setLoading(false);
            setCurrentPhase('sowhat');
        } catch (error) {
            console.error('Pipeline error:', error);
            setLoading(false);
            Alert.alert('Hata', 'Analiz sırasında bir hata oluştu: ' + error.message);
        }
    };

    const handleDefend = (index, defense) => {
        const newDefenses = [...defenses];
        newDefenses[index] = defense;
        setDefenses(newDefenses);
    };

    const handleSoWhatSubmit = async (answer) => {
        setSoWhatAnswer(answer);
        setLoading(true);

        try {
            const result = await evaluateKillSwitch(
                specData.spec,
                redTeamData.attacks,
                defenses
            );
            setKillSwitchData(result);
            setFlameScore(result.score);
            setIsDead(!result.viable);
            setCurrentPhase('final');

            setEvolutionEntries(prev => [...prev, {
                label: result.viable ? 'Ateş Yandı' : 'Söndü',
                text: `Nokta Skoru: ${result.score}/100`,
                color: result.viable ? Colors.flameVolcano : Colors.flameDead,
            }]);
        } catch (e) {
            Alert.alert('Hata', 'Değerlendirme sırasında hata: ' + e.message);
        }
        setLoading(false);
    };

    const handleCopySpec = () => {
        Clipboard.setString(specData.spec);
        Alert.alert('✅ Kopyalandı', 'Spec panoya kopyalandı.');
    };

    const handleRestart = () => {
        navigation.popToTop();
    };

    const handleGoBackToQuestions = () => {
        navigation.goBack();
    };

    const confidenceIcons = {
        problem: '📋',
        user: '👥',
        solution: '💡',
        technical: '🏗️',
        revenue: '💰',
        competition: '🏆',
    };

    const confidenceLabels = {
        problem: 'Problem Tanımı',
        user: 'Hedef Kullanıcı',
        solution: 'Çözüm',
        technical: 'Teknik Kapsam',
        revenue: 'Gelir Modeli',
        competition: 'Rekabet',
    };

    const markdownStyles = {
        body: { color: Colors.text, fontSize: 14, lineHeight: 22 },
        heading1: { color: Colors.text, fontSize: 22, fontWeight: '800', marginVertical: 10 },
        heading2: { color: Colors.primaryLight, fontSize: 18, fontWeight: '700', marginVertical: 8 },
        heading3: { color: Colors.secondary, fontSize: 16, fontWeight: '600', marginVertical: 6 },
        paragraph: { color: Colors.text, marginVertical: 4 },
        listItem: { color: Colors.text },
        bullet_list: { marginVertical: 4 },
        strong: { color: Colors.text, fontWeight: '700' },
        em: { color: Colors.textSecondary, fontStyle: 'italic' },
        code_inline: { backgroundColor: Colors.surfaceLight, color: Colors.secondary, paddingHorizontal: 4, borderRadius: 4 },
        fence: { backgroundColor: Colors.surfaceLight, borderRadius: 8, padding: 12, marginVertical: 8 },
        code_block: { color: Colors.secondary, fontSize: 13 },
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Spec
                return (
                    <ScrollView style={styles.tabContent}>
                        {loading && currentPhase === 'spec' ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Spec üretiliyor...</Text>
                            </View>
                        ) : (
                            <>
                                {/* Confidence Scores */}
                                <Text style={styles.sectionTitle}>Güven Skorları</Text>
                                {Object.entries(specData.confidenceScores).map(([key, score]) => (
                                    <ConfidenceBadge
                                        key={key}
                                        label={confidenceLabels[key] || key}
                                        score={score}
                                        icon={confidenceIcons[key] || '📊'}
                                    />
                                ))}

                                {/* Spec Content */}
                                <View style={styles.specContainer}>
                                    <Markdown style={markdownStyles}>{specData.spec}</Markdown>
                                </View>

                                <TouchableOpacity style={styles.copyButton} onPress={handleCopySpec}>
                                    <Text style={styles.copyButtonText}>📋 Spec'i Kopyala</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                );

            case 1: // Scope Knife
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>🔪 Kapsam Bıçağı</Text>
                        <ScopeCard
                            mvp={scopeData.mvp}
                            later={scopeData.later}
                            coreQuestion={scopeData.coreQuestion}
                        />
                    </ScrollView>
                );

            case 2: // Red Team
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>⚔️ Red Team — Stres Testi</Text>
                        <Text style={styles.sectionDesc}>Fikrini 3 perspektiften saldırıyoruz. Savun.</Text>
                        {redTeamData.attacks.map((attack, i) => (
                            <RedTeamCard
                                key={i}
                                attack={attack}
                                index={i}
                                onDefend={handleDefend}
                            />
                        ))}
                    </ScrollView>
                );

            case 3: // So What?
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sectionTitle}>❓ "So What?" Testi</Text>
                        <View style={styles.soWhatBox}>
                            <Text style={styles.soWhatQuestion}>
                                Bu yarın var olsa, birinin hayatı gerçekten değişir mi?
                            </Text>
                            <Text style={styles.soWhatDesc}>
                                Bu soruyu AI cevaplayamaz — sadece sen dürüstçe cevaplayabilirsin.
                            </Text>
                        </View>
                        {soWhatAnswer ? (
                            <View style={styles.soWhatAnswer}>
                                <Text style={styles.soWhatAnswerLabel}>Senin cevabın:</Text>
                                <Text style={styles.soWhatAnswerText}>{soWhatAnswer}</Text>
                            </View>
                        ) : (
                            <InputBar
                                onSend={handleSoWhatSubmit}
                                placeholder="Dürüstçe cevapla..."
                                loading={loading}
                                multiline
                            />
                        )}
                    </ScrollView>
                );

            case 4: // Adımlar
                return (
                    <ScrollView style={styles.tabContent}>
                        {killSwitchData ? (
                            <>
                                {killSwitchData.viable ? (
                                    <>
                                        <Text style={styles.sectionTitle}>🚀 İlk 3 Somut Adım</Text>
                                        {killSwitchData.nextSteps?.map((step, i) => (
                                            <View key={i} style={styles.stepCard}>
                                                <Text style={styles.stepNumber}>{i + 1}</Text>
                                                <Text style={styles.stepText}>{step}</Text>
                                            </View>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.sectionTitle}>💨 Kıvılcım Söndü</Text>
                                        <View style={styles.deadBox}>
                                            <Text style={styles.deadIcon}>🪦</Text>
                                            <Text style={styles.deadText}>{killSwitchData.reasoning}</Text>
                                            {killSwitchData.pivot && (
                                                <View style={styles.pivotBox}>
                                                    <Text style={styles.pivotLabel}>🔄 Pivot Önerisi:</Text>
                                                    <Text style={styles.pivotText}>{killSwitchData.pivot}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                                <View style={styles.noktaScore}>
                                    <Text style={styles.noktaLabel}>Nokta Skoru</Text>
                                    <Text style={[styles.noktaValue, { color: killSwitchData.viable ? Colors.success : Colors.danger }]}>
                                        {killSwitchData.score}/100
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.waitBox}>
                                <Text style={styles.waitText}>
                                    ⏳ Önce "So What?" sorusunu cevapla. Ardından sonuçlar burada görünecek.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                );

            case 5: // Evrim
                return (
                    <ScrollView style={styles.tabContent}>
                        <EvolutionMap entries={evolutionEntries} />
                    </ScrollView>
                );

            case 6: // Kart
                return (
                    <ScrollView style={styles.tabContent}>
                        <KivilcimCard
                            ideaName={idea.substring(0, 40)}
                            problem={specData.spec.match(/## Problem\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            solution={specData.spec.match(/## Çözüm\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            targetUser={specData.spec.match(/## Hedef Kullanıcı\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            score={killSwitchData?.score || flameScore}
                            mvpSummary={scopeData.coreQuestion}
                            isDead={isDead}
                        />
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <FlameRoad score={flameScore} isDead={isDead} currentStep={currentPhase === 'final' ? 7 : 5} totalSteps={7} />

            {/* Back + Restart */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleGoBackToQuestions}>
                    <Text style={styles.backText}>← Sorulara Dön</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRestart}>
                    <Text style={styles.restartText}>🔄 Baştan Başla</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.tab, activeTab === i && styles.tabActive]}
                        onPress={() => setActiveTab(i)}
                    >
                        <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Tab Content */}
            <View style={styles.contentArea}>
                {renderTabContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    backText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    restartText: {
        color: Colors.textMuted,
        fontSize: 14,
    },
    tabBar: {
        maxHeight: 44,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginLeft: 4,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    tabText: {
        color: Colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    tabTextActive: {
        color: Colors.text,
    },
    contentArea: {
        flex: 1,
    },
    tabContent: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
    },
    sectionDesc: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginBottom: 14,
    },
    specContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        marginTop: 14,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    copyButton: {
        backgroundColor: Colors.surface,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    copyButtonText: {
        color: Colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    loadingBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    loadingText: {
        color: Colors.textMuted,
        fontSize: 14,
    },
    soWhatBox: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderWidth: 1,
        borderColor: Colors.aiBubbleBorder,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    soWhatQuestion: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 26,
    },
    soWhatDesc: {
        color: Colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
    },
    soWhatAnswer: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    soWhatAnswerLabel: {
        color: Colors.success,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    soWhatAnswerText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    stepNumber: {
        color: Colors.primary,
        fontSize: 20,
        fontWeight: '800',
        width: 28,
    },
    stepText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    deadBox: {
        backgroundColor: 'rgba(255, 82, 82, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.2)',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    deadIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    deadText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 14,
    },
    pivotBox: {
        backgroundColor: 'rgba(0, 217, 255, 0.08)',
        borderRadius: 10,
        padding: 12,
        width: '100%',
    },
    pivotLabel: {
        color: Colors.secondary,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 4,
    },
    pivotText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    noktaScore: {
        alignItems: 'center',
        marginTop: 20,
        padding: 20,
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    noktaLabel: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    noktaValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    waitBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    waitText: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 40,
    },
});

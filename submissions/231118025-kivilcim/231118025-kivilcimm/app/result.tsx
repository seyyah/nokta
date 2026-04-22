import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../src/theme/colors';
import FlameRoad from '../src/components/FlameRoad';
import ConfidenceBadge from '../src/components/ConfidenceBadge';
import ScopeCard from '../src/components/ScopeCard';
import RedTeamCard from '../src/components/RedTeamCard';
import EvolutionMap from '../src/components/EvolutionMap';
import KivilcimCard from '../src/components/KivilcimCard';
import InputBar from '../src/components/InputBar';
import { generateSpec, applyScopeKnife, runRedTeam, evaluateKillSwitch } from '../src/services/aiService';

const TABS = ['📄 Spec', '🔪 Scope', '⚔️ Red Team', '❓ So What?', '🚀 Adımlar', '📍 Evrim', '🏆 Kart'];

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const idea = params.idea as string;
    const constraints = params.constraints as string;
    const answers = JSON.parse((params.answers as string) || '[]');
    const initialEvolution = JSON.parse((params.evolutionEntries as string) || '[]');
    const initialFlame = Number(params.flameScore) || 65;

    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPhase, setCurrentPhase] = useState('spec');
    const [specData, setSpecData] = useState<any>({ spec: '', confidenceScores: {} });
    const [scopeData, setScopeData] = useState<any>({ mvp: [], later: [], coreQuestion: '' });
    const [redTeamData, setRedTeamData] = useState<any>({ attacks: [] });
    const [defenses, setDefenses] = useState<any[]>([]);
    const [killSwitchData, setKillSwitchData] = useState<any>(null);
    const [soWhatAnswer, setSoWhatAnswer] = useState('');
    const [flameScore, setFlameScore] = useState(initialFlame);
    const [isDead, setIsDead] = useState(false);
    const [evolutionEntries, setEvolutionEntries] = useState<any[]>(initialEvolution);

    useEffect(() => { runPipeline(); }, []);

    const runPipeline = async () => {
        try {
            setCurrentPhase('spec');
            const spec = await generateSpec(idea, constraints, answers);
            setSpecData(spec);
            setFlameScore(70);
            setEvolutionEntries(prev => [...prev, { label: 'Spec Üretildi', text: 'Güven skorları hesaplandı', color: Colors.flameBlaze }]);

            setCurrentPhase('scope');
            const scope = await applyScopeKnife(spec.spec);
            setScopeData(scope);

            setCurrentPhase('redteam');
            const redTeam = await runRedTeam(spec.spec);
            setRedTeamData(redTeam);
            setFlameScore(75);

            setLoading(false);
            setCurrentPhase('sowhat');
        } catch (error) {
            setLoading(false);
            Alert.alert('Hata', 'Analiz hatası: ' + error.message);
        }
    };

    const handleDefend = (index, defense) => {
        const d = [...defenses]; d[index] = defense; setDefenses(d);
    };

    const handleSoWhatSubmit = async (answer) => {
        setSoWhatAnswer(answer);
        setLoading(true);
        try {
            const result = await evaluateKillSwitch(specData.spec, redTeamData.attacks, defenses);
            setKillSwitchData(result);
            setFlameScore(result.score);
            setIsDead(!result.viable);
            setCurrentPhase('final');
            setEvolutionEntries(prev => [...prev, {
                label: result.viable ? 'Ateş Yandı' : 'Söndü',
                text: `Nokta Skoru: ${result.score}/100`,
                color: result.viable ? Colors.flameVolcano : Colors.flameDead,
            }]);
        } catch (e) { Alert.alert('Hata', 'Değerlendirme hatası: ' + e.message); }
        setLoading(false);
    };

    const handleCopySpec = async () => {
        await Clipboard.setStringAsync(specData.spec);
        Alert.alert('✅', 'Spec kopyalandı.');
    };

    const ci = { problem: '📋', user: '👥', solution: '💡', technical: '🏗️', revenue: '💰', competition: '🏆' };
    const cl = { problem: 'Problem', user: 'Hedef Kullanıcı', solution: 'Çözüm', technical: 'Teknik', revenue: 'Gelir Modeli', competition: 'Rekabet' };

    const mdStyles: any = {
        body: { color: Colors.text, fontSize: 14, lineHeight: 22 },
        heading1: { color: Colors.text, fontSize: 22, fontWeight: '800' as const, marginVertical: 10 },
        heading2: { color: Colors.primaryLight, fontSize: 18, fontWeight: '700' as const, marginVertical: 8 },
        heading3: { color: Colors.secondary, fontSize: 16, fontWeight: '600' as const, marginVertical: 6 },
        paragraph: { color: Colors.text, marginVertical: 4 },
        strong: { color: Colors.text, fontWeight: '700' as const },
        em: { color: Colors.textSecondary, fontStyle: 'italic' as const },
        code_inline: { backgroundColor: Colors.surfaceLight, color: Colors.secondary, paddingHorizontal: 4, borderRadius: 4 },
    };

    const renderTab = () => {
        switch (activeTab) {
            case 0:
                return (
                    <ScrollView style={styles.tabContent}>
                        {loading && currentPhase === 'spec' ? (
                            <View style={styles.loadingBox}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Spec üretiliyor...</Text></View>
                        ) : (
                            <>
                                <Text style={styles.sTitle}>Güven Skorları</Text>
                                {Object.entries(specData.confidenceScores).map(([k, v]) => (
                                    <ConfidenceBadge key={k} label={cl[k] || k} score={v} icon={ci[k] || '📊'} />
                                ))}
                                <View style={styles.specBox}><Markdown style={mdStyles}>{specData.spec}</Markdown></View>
                                <TouchableOpacity style={styles.copyBtn} onPress={handleCopySpec}><Text style={styles.copyBtnText}>📋 Kopyala</Text></TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                );
            case 1:
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sTitle}>🔪 Kapsam Bıçağı</Text>
                        <ScopeCard mvp={scopeData.mvp} later={scopeData.later} coreQuestion={scopeData.coreQuestion} />
                    </ScrollView>
                );
            case 2:
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sTitle}>⚔️ Red Team</Text>
                        <Text style={styles.sDesc}>Savun veya kabul et.</Text>
                        {redTeamData.attacks.map((a, i) => <RedTeamCard key={i} attack={a} index={i} onDefend={handleDefend} />)}
                    </ScrollView>
                );
            case 3:
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.sTitle}>❓ "So What?" Testi</Text>
                        <View style={styles.soWhatBox}>
                            <Text style={styles.soWhatQ}>Bu yarın var olsa, birinin hayatı gerçekten değişir mi?</Text>
                            <Text style={styles.soWhatD}>Bunu sadece sen cevaplayabilirsin.</Text>
                        </View>
                        {soWhatAnswer ? (
                            <View style={styles.soWhatA}><Text style={styles.soWhatAL}>Cevabın:</Text><Text style={styles.soWhatAT}>{soWhatAnswer}</Text></View>
                        ) : (
                            <InputBar onSend={handleSoWhatSubmit} placeholder="Dürüstçe cevapla..." loading={loading} multiline />
                        )}
                    </ScrollView>
                );
            case 4:
                return (
                    <ScrollView style={styles.tabContent}>
                        {killSwitchData ? (
                            <>
                                {killSwitchData.viable ? (
                                    <>
                                        <Text style={styles.sTitle}>🚀 İlk 3 Adım</Text>
                                        {killSwitchData.nextSteps?.map((s, i) => (
                                            <View key={i} style={styles.stepCard}><Text style={styles.stepNum}>{i + 1}</Text><Text style={styles.stepTxt}>{s}</Text></View>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.sTitle}>💨 Söndü</Text>
                                        <View style={styles.deadBox}>
                                            <Text style={styles.deadIcon}>🪦</Text>
                                            <Text style={styles.deadText}>{killSwitchData.reasoning}</Text>
                                            {killSwitchData.pivot && (
                                                <View style={styles.pivotBox}><Text style={styles.pivotL}>🔄 Pivot:</Text><Text style={styles.pivotT}>{killSwitchData.pivot}</Text></View>
                                            )}
                                        </View>
                                    </>
                                )}
                                <View style={styles.noktaBox}>
                                    <Text style={styles.noktaL}>Nokta Skoru</Text>
                                    <Text style={[styles.noktaV, { color: killSwitchData.viable ? Colors.success : Colors.danger }]}>{killSwitchData.score}/100</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.waitBox}><Text style={styles.waitText}>⏳ Önce "So What?" sorusunu cevapla.</Text></View>
                        )}
                    </ScrollView>
                );
            case 5:
                return <ScrollView style={styles.tabContent}><EvolutionMap entries={evolutionEntries} /></ScrollView>;
            case 6:
                return (
                    <ScrollView style={styles.tabContent}>
                        <KivilcimCard
                            ideaName={idea?.substring(0, 40)}
                            problem={specData.spec.match(/## Problem\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            solution={specData.spec.match(/## Çözüm\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            targetUser={specData.spec.match(/## Hedef Kullanıcı\n([\s\S]*?)(?=\n##)/)?.[1]?.trim() || ''}
                            score={killSwitchData?.score || flameScore}
                            mvpSummary={scopeData.coreQuestion}
                            isDead={isDead}
                        />
                    </ScrollView>
                );
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <FlameRoad score={flameScore} isDead={isDead} currentStep={currentPhase === 'final' ? 7 : 5} totalSteps={7} />
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Sorulara</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/')}><Text style={styles.restartText}>🔄 Baştan</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
                {TABS.map((t, i) => (
                    <TouchableOpacity key={i} style={[styles.tab, activeTab === i && styles.tabOn]} onPress={() => setActiveTab(i)}>
                        <Text style={[styles.tabText, activeTab === i && styles.tabTextOn]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.contentArea}>{renderTab()}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    backText: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
    restartText: { color: Colors.textMuted, fontSize: 14 },
    tabBar: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    tab: { paddingHorizontal: 14, paddingVertical: 10, marginLeft: 4 },
    tabOn: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
    tabText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
    tabTextOn: { color: Colors.text },
    contentArea: { flex: 1 },
    tabContent: { flex: 1, padding: 16 },
    sTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    sDesc: { color: Colors.textSecondary, fontSize: 13, marginBottom: 14 },
    specBox: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginTop: 14, borderWidth: 1, borderColor: Colors.surfaceBorder },
    copyBtn: { backgroundColor: Colors.surface, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
    copyBtnText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    loadingText: { color: Colors.textMuted, fontSize: 14 },
    soWhatBox: { backgroundColor: 'rgba(108, 99, 255, 0.1)', borderWidth: 1, borderColor: Colors.aiBubbleBorder, borderRadius: 14, padding: 20, marginBottom: 16, alignItems: 'center' },
    soWhatQ: { color: Colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10, lineHeight: 26 },
    soWhatD: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
    soWhatA: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.surfaceBorder },
    soWhatAL: { color: Colors.success, fontSize: 12, fontWeight: '700', marginBottom: 4 },
    soWhatAT: { color: Colors.text, fontSize: 14, lineHeight: 20 },
    stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder },
    stepNum: { color: Colors.primary, fontSize: 20, fontWeight: '800', width: 28 },
    stepTxt: { color: Colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
    deadBox: { backgroundColor: 'rgba(255, 82, 82, 0.08)', borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.2)', borderRadius: 14, padding: 20, alignItems: 'center' },
    deadIcon: { fontSize: 40, marginBottom: 12 },
    deadText: { color: Colors.text, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 14 },
    pivotBox: { backgroundColor: 'rgba(0, 217, 255, 0.08)', borderRadius: 10, padding: 12, width: '100%' },
    pivotL: { color: Colors.secondary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
    pivotT: { color: Colors.text, fontSize: 14, lineHeight: 20 },
    noktaBox: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.surfaceBorder },
    noktaL: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    noktaV: { fontSize: 36, fontWeight: '800' },
    waitBox: { alignItems: 'center', paddingVertical: 60 },
    waitText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});

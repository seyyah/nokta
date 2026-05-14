import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';
import { ShieldAlert, Users, Share2, ArrowRight } from 'lucide-react-native';
import { ConfidenceScore, RiskBadge } from '../components/Shared';
import escalationService from '../services/escalationService';
import { NoktaArtifact } from '../types';

export default function ArtifactScreen() {
    const router = useRouter();
    const [artifact, setArtifact] = useState<NoktaArtifact | null>(null);

    useEffect(() => {
        // Mock generation of artifact from brainstorm
        const mockArtifact: NoktaArtifact = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Yapay Zeka Destekli Tarım Robotu',
            dot: 'Tarla için robot asistan',
            spec: `### Proje Anayasası\n\n**Problem:** Çiftçilerin iş gücü eksikliği.\n**Çözüm:** Otonom, güneş enerjili çapalama robotu.\n**Kapsam:** MVP aşamasında sadece mobil uygulama ile kontrol ve temel çapalama.\n**Kısıtlar:** 10saat batarya ömrü, engebeli arazi uyumu.`,
            confidenceScore: Math.floor(Math.random() * 50) + 30, // Mock score < 65 often
            timestamp: Date.now(),
            riskMode: 'HOTL',
            escalationStatus: 'pending'
        };

        if (mockArtifact.confidenceScore < 40) mockArtifact.riskMode = 'HITL';
        else if (mockArtifact.confidenceScore < 65) mockArtifact.riskMode = 'HOTL';
        else mockArtifact.riskMode = 'HOOTL';

        setArtifact(mockArtifact);
        escalationService.saveArtifact(mockArtifact);
    }, []);

    const handleEscalate = () => {
        if (artifact) {
            router.push({ pathname: '/escalation', params: { artifactId: artifact.id, score: artifact.confidenceScore } });
        }
    };

    if (!artifact) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg }}>
            <View style={styles.header}>
                <Text style={styles.title}>{artifact.title}</Text>
                <RiskBadge mode={artifact.riskMode} />
            </View>

            <ConfidenceScore score={artifact.confidenceScore} />

            <View style={styles.specCard}>
                <Text style={styles.specText}>{artifact.spec}</Text>
            </View>

            {artifact.confidenceScore < 65 ? (
                <View style={styles.warningBox}>
                    <ShieldAlert color={COLORS.error} size={24} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.warningTitle}>Güven Filtresi Uyarısı</Text>
                        <Text style={styles.warningMsg}>Bu fikir henüz "slop-free" standartlarına ulaşmadı. Uzman desteği önerilir.</Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.successMsg}>Tebrikler! Fikriniz yüksek güven seviyesinde.</Text>
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ message: artifact.spec })}>
                    <Share2 color={COLORS.onSurface} size={20} />
                    <Text style={styles.shareText}>Paylaş</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.escalateBtn, artifact.confidenceScore >= 65 && styles.secondaryBtn]}
                    onPress={handleEscalate}
                >
                    <Text style={styles.escalateText}>Uzman Desteği Al</Text>
                    <Users color="#ffffff" size={20} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '900', flex: 1 },
    specCard: {
        backgroundColor: COLORS.surfaceContainer, borderRadius: ROUNDED.lg,
        padding: SPACING.md, marginVertical: SPACING.md
    },
    specText: { fontSize: 16, lineHeight: 24, color: COLORS.onSurface },
    warningBox: {
        flexDirection: 'row', gap: SPACING.md, padding: SPACING.md,
        backgroundColor: '#fee2e2', borderRadius: ROUNDED.lg, borderLeftWidth: 4, borderLeftColor: COLORS.error,
    },
    warningTitle: { fontWeight: 'bold', color: COLORS.error },
    warningMsg: { color: '#991b1b', fontSize: 13 },
    successMsg: { color: COLORS.secondary, textAlign: 'center', fontWeight: 'bold', marginVertical: SPACING.md },
    footer: { gap: SPACING.md, marginTop: SPACING.xl },
    shareBtn: {
        height: 50, borderRadius: ROUNDED.lg, borderWidth: 1, borderColor: COLORS.outline,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.base,
    },
    shareText: { fontWeight: 'bold' },
    escalateBtn: {
        height: 55, borderRadius: ROUNDED.lg, backgroundColor: COLORS.error,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.base,
    },
    secondaryBtn: { backgroundColor: COLORS.primary },
    escalateText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});

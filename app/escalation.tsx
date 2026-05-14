import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';
import { MessageSquare, Video, ChevronRight } from 'lucide-react-native';
import { ExpertCategory } from '../types';
import escalationService from '../services/escalationService';

const CATEGORIES: ExpertCategory[] = ['Hukuk', 'Sağlık', 'Finans', 'Teknik', 'Eğitim'];

export default function EscalationScreen() {
    const router = useRouter();
    const { artifactId, score } = useLocalSearchParams<{ artifactId: string, score: string }>();
    const [selectedCat, setSelectedCat] = useState<ExpertCategory | null>(null);

    const startEscalation = async (channel: 'Mesaj' | 'Video') => {
        if (!selectedCat) return;

        await escalationService.createEscalation({
            id: Math.random().toString(),
            artifactId: artifactId || '',
            category: selectedCat,
            channel: channel === 'Video' ? 'Video Görüşme' : 'Mesaj',
            timestamp: Date.now(),
            status: 'active'
        });

        if (channel === 'Video') {
            router.push('/video-call');
        } else {
            alert('Talebiniz alındı! Uzmanımız size en kısa sürede mesaj yoluyla ulaşacak.');
            router.replace('/');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg }}>
            <Text style={styles.title}>Uzman Kategorisi Seçin</Text>
            <Text style={styles.subtitle}>Fikrinizi en iyi değerlendirecek disiplini belirleyin.</Text>

            <View style={styles.grid}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catCard, selectedCat === cat && styles.selectedCat]}
                        onPress={() => setSelectedCat(cat)}
                    >
                        <Text style={[styles.catText, selectedCat === cat && styles.selectedCatText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.title}>İletişim Kanalı</Text>

            <View style={styles.channels}>
                <TouchableOpacity
                    style={[styles.channelBtn, !selectedCat && styles.disabled]}
                    disabled={!selectedCat}
                    onPress={() => startEscalation('Mesaj')}
                >
                    <View style={styles.channelIcon}><MessageSquare color={COLORS.primary} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.channelTitle}>Anlık Mesajlaşma</Text>
                        <Text style={styles.channelSubtitle}>Uzman ile yazışarak ilerleyin.</Text>
                    </View>
                    <ChevronRight color={COLORS.outline} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.channelBtn, !selectedCat && styles.disabled]}
                    disabled={!selectedCat}
                    onPress={() => startEscalation('Video')}
                >
                    <View style={styles.channelIcon}><Video color={COLORS.secondary} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.channelTitle}>Görüntülü Görüşme</Text>
                        <Text style={styles.channelSubtitle}>20 dakikalık derinlemesine seans.</Text>
                    </View>
                    <ChevronRight color={COLORS.outline} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    title: { fontSize: 20, fontWeight: '900', color: COLORS.onBackground, marginTop: SPACING.lg },
    subtitle: { fontSize: 14, color: '#64748b', marginBottom: SPACING.md },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    catCard: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: ROUNDED.lg, borderWidth: 1, borderColor: COLORS.outline,
        minWidth: '30%', alignItems: 'center',
    },
    selectedCat: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { fontWeight: '600', color: COLORS.onSurface },
    selectedCatText: { color: '#ffffff' },
    channels: { gap: SPACING.md, marginTop: SPACING.md },
    channelBtn: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: ROUNDED.xl,
        borderWidth: 1, borderColor: COLORS.outline,
    },
    channelIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
    channelTitle: { fontWeight: 'bold', fontSize: 16 },
    channelSubtitle: { fontSize: 12, color: '#64748b' },
    disabled: { opacity: 0.4 },
});

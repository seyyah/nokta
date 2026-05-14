import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';
import escalationService from '../services/escalationService';
import { NoktaArtifact } from '../types';
import { Calendar, ChevronRight } from 'lucide-react-native';

export default function HistoryScreen() {
    const [artifacts, setArtifacts] = useState<NoktaArtifact[]>([]);

    useEffect(() => {
        escalationService.getArtifacts().then(setArtifacts);
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={artifacts}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: SPACING.md }}
                ListEmptyComponent={() => (
                    <View style={styles.empty}><Text style={styles.emptyText}>Henüz kayıtlı bir fikir yok.</Text></View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.iconBox}><Calendar color={COLORS.primary} size={20} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString('tr-TR')}</Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.score}>%{item.confidenceScore}</Text>
                        </View>
                        <ChevronRight color={COLORS.outline} size={20} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    card: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
        backgroundColor: COLORS.surface, borderRadius: ROUNDED.lg,
        borderWidth: 1, borderColor: COLORS.outline, marginBottom: SPACING.md,
        gap: SPACING.md,
    },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
    title: { fontWeight: 'bold', fontSize: 16, color: COLORS.onSurface },
    date: { fontSize: 12, color: '#64748b' },
    scoreBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: COLORS.primaryContainer },
    score: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
    empty: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#64748b' },
});

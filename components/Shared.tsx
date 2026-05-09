import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, ROUNDED } from '../constants/theme';

export function ConfidenceScore({ score }: { score: number }) {
    const color = score < 40 ? COLORS.hitl : score < 65 ? COLORS.hotl : COLORS.hootl;
    return (
        <View style={[styles.scoreBadge, { borderColor: color }]}>
            <Text style={[styles.scoreText, { color }]}>Güven Skoru: %{score}</Text>
        </View>
    );
}

export function RiskBadge({ mode }: { mode: 'HITL' | 'HOTL' | 'HOOTL' }) {
    const colors = {
        HITL: { bg: '#fee2e2', text: COLORS.hitl },
        HOTL: { bg: '#fef3c7', text: COLORS.hotl },
        HOOTL: { bg: '#ccfbf1', text: COLORS.hootl },
    };
    return (
        <View style={[styles.badge, { backgroundColor: colors[mode].bg }]}>
            <Text style={[styles.badgeText, { color: colors[mode].text }]}>{mode}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreBadge: {
        borderWidth: 2,
        borderRadius: ROUNDED.lg,
        padding: SPACING.md,
        alignItems: 'center',
        marginVertical: SPACING.md,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: ROUNDED.md,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function ConfidenceBadge({ label, score, icon = '📋' }) {
    const getColor = () => {
        if (score >= 70) return Colors.success;
        if (score >= 40) return Colors.warning;
        return Colors.danger;
    };

    const getIcon = () => {
        if (score >= 70) return '✅';
        if (score >= 40) return '⚠️';
        return '❌';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.scoreContainer}>
                <View style={styles.barBg}>
                    <View style={[styles.bar, { width: `${score}%`, backgroundColor: getColor() }]} />
                </View>
                <Text style={[styles.score, { color: getColor() }]}>{getIcon()} {score}%</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.surface,
        borderRadius: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
    },
    label: {
        color: Colors.text,
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 120,
    },
    barBg: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 2,
    },
    score: {
        fontSize: 12,
        fontWeight: '700',
        minWidth: 50,
        textAlign: 'right',
    },
});

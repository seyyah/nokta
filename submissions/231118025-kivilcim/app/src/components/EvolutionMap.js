import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

export default function EvolutionMap({ entries = [] }) {
    if (entries.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📍 Evrim Haritası</Text>
            <View style={styles.timeline}>
                {entries.map((entry, i) => (
                    <View key={i} style={styles.entry}>
                        <View style={styles.dotColumn}>
                            <View style={[styles.dot, { backgroundColor: entry.color || Colors.primary }]} />
                            {i < entries.length - 1 && <View style={styles.line} />}
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.entryLabel}>{entry.label}</Text>
                            <Text style={styles.entryText}>{entry.text}</Text>
                            {entry.change && (
                                <Text style={styles.changeText}>
                                    {entry.oldValue} → {entry.newValue}
                                </Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 14,
    },
    timeline: {
        gap: 0,
    },
    entry: {
        flexDirection: 'row',
        minHeight: 48,
    },
    dotColumn: {
        width: 24,
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: Colors.surfaceBorder,
        marginVertical: 2,
    },
    content: {
        flex: 1,
        paddingLeft: 10,
        paddingBottom: 14,
    },
    entryLabel: {
        color: Colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    entryText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 19,
    },
    changeText: {
        color: Colors.secondary,
        fontSize: 12,
        marginTop: 2,
        fontStyle: 'italic',
    },
});

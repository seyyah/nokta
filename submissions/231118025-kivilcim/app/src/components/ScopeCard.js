import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function ScopeCard({ mvp = [], later = [], coreQuestion = '' }) {
    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🟢 MVP — Şart</Text>
                {mvp.map((item, i) => (
                    <View key={i} style={styles.item}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.itemText}>{item}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔵 Sonra — İlk Versiyona Şart Değil</Text>
                {later.map((item, i) => (
                    <View key={i} style={styles.item}>
                        <Text style={styles.bulletLater}>○</Text>
                        <Text style={styles.itemTextLater}>{item}</Text>
                    </View>
                ))}
            </View>
            {coreQuestion ? (
                <View style={styles.coreQuestion}>
                    <Text style={styles.coreIcon}>🎯</Text>
                    <Text style={styles.coreText}>{coreQuestion}</Text>
                </View>
            ) : null}
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
    section: {
        gap: 6,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingLeft: 4,
    },
    bullet: {
        color: Colors.success,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    bulletLater: {
        color: Colors.secondary,
        fontSize: 14,
        marginTop: 2,
    },
    itemText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    itemTextLater: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.surfaceBorder,
        marginVertical: 14,
    },
    coreQuestion: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 14,
        padding: 12,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.aiBubbleBorder,
    },
    coreIcon: {
        fontSize: 16,
        marginTop: 1,
    },
    coreText: {
        color: Colors.primaryLight,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
        fontWeight: '500',
        fontStyle: 'italic',
    },
});

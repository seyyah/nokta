import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Colors } from '../theme/colors';
import { getFlameStage } from './FlameRoad';

export default function KivilcimCard({ ideaName = '', problem = '', solution = '', targetUser = '', score = 0, mvpSummary = '', isDead = false }) {
    const flame = getFlameStage(score, isDead);

    const handleShare = async () => {
        const cardText = `🔥 Kıvılcım Kartı\n\n📌 ${ideaName}\n\n❓ Problem: ${problem}\n💡 Çözüm: ${solution}\n👥 Hedef: ${targetUser}\n📊 Nokta Skoru: ${score}/100 ${flame.icon}\n🎯 MVP: ${mvpSummary}`;
        try {
            await Share.share({ message: cardText });
        } catch (e) { }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.flame}>{flame.icon}</Text>
                <View style={styles.scoreCircle}>
                    <Text style={[styles.scoreText, { color: flame.color }]}>{score}</Text>
                    <Text style={styles.scoreLabel}>Nokta Skoru</Text>
                </View>
            </View>

            <Text style={styles.ideaName}>{ideaName || 'İsimsiz Fikir'}</Text>

            <View style={styles.field}>
                <Text style={styles.fieldLabel}>❓ Problem</Text>
                <Text style={styles.fieldValue}>{problem || '—'}</Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.fieldLabel}>💡 Çözüm</Text>
                <Text style={styles.fieldValue}>{solution || '—'}</Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.fieldLabel}>👥 Hedef Kullanıcı</Text>
                <Text style={styles.fieldValue}>{targetUser || '—'}</Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.fieldLabel}>🎯 MVP</Text>
                <Text style={styles.fieldValue}>{mvpSummary || '—'}</Text>
            </View>

            <View style={styles.flameStatus}>
                <Text style={[styles.statusText, { color: flame.color }]}>{flame.label}</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareText}>📤 Paylaş</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundLight,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    flame: {
        fontSize: 40,
    },
    scoreCircle: {
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 32,
        fontWeight: '800',
    },
    scoreLabel: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ideaName: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 16,
    },
    field: {
        marginBottom: 10,
    },
    fieldLabel: {
        color: Colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    fieldValue: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 19,
    },
    flameStatus: {
        alignItems: 'center',
        marginVertical: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '700',
    },
    shareButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareText: {
        color: Colors.text,
        fontWeight: '700',
        fontSize: 15,
    },
});

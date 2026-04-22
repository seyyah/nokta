import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';

const FLAME_STAGES = [
    { icon: '✨', label: 'Kıvılcım', color: Colors.flameSpark, minScore: 0 },
    { icon: '🔸', label: 'Kor', color: Colors.flameEmber, minScore: 20 },
    { icon: '🔥', label: 'Alev', color: Colors.flameBlaze, minScore: 40 },
    { icon: '🔥🔥', label: 'Ateş', color: Colors.flameFire, minScore: 65 },
    { icon: '🌋', label: 'Yanardağ', color: Colors.flameVolcano, minScore: 85 },
];

const DEAD_STAGE = { icon: '💨', label: 'Söndü', color: Colors.flameDead };

export function getFlameStage(score, isDead = false) {
    if (isDead) return DEAD_STAGE;
    for (let i = FLAME_STAGES.length - 1; i >= 0; i--) {
        if (score >= FLAME_STAGES[i].minScore) return FLAME_STAGES[i];
    }
    return FLAME_STAGES[0];
}

export default function FlameRoad({ score = 0, isDead = false, currentStep = 0, totalSteps = 7 }) {
    const stage = getFlameStage(score, isDead);

    return (
        <View style={styles.container}>
            <View style={styles.flameRow}>
                <Text style={[styles.flameIcon, { textShadowColor: stage.color }]}>{stage.icon}</Text>
                <View style={styles.info}>
                    <Text style={[styles.label, { color: stage.color }]}>{stage.label}</Text>
                    <View style={styles.progressTrack}>
                        {FLAME_STAGES.map((s, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progressDot,
                                    {
                                        backgroundColor: score >= s.minScore && !isDead ? s.color : Colors.surfaceBorder,
                                        width: score >= s.minScore && !isDead ? 10 : 6,
                                        height: score >= s.minScore && !isDead ? 10 : 6,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </View>
            <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>{currentStep}/{totalSteps}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    flameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flameIcon: {
        fontSize: 28,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    info: {
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    progressTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    progressDot: {
        borderRadius: 5,
    },
    stepIndicator: {
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stepText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
});

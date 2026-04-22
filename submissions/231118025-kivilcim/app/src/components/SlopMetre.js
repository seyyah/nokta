import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme/colors';

export default function SlopMetre({ score = 0, type = 'vague', reason = '', visible = false }) {
    const animatedWidth = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: score,
            duration: 600,
            useNativeDriver: false,
        }).start();
    }, [score]);

    useEffect(() => {
        Animated.timing(animatedOpacity, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const getColor = () => {
        if (score < 30) return Colors.danger;
        if (score < 60) return Colors.warning;
        return Colors.success;
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'vague': return '🌫️ Belirsiz';
            case 'buzzword': return '📢 Buzzword';
            case 'concrete': return '🎯 Somut';
            default: return '⏳ Analiz...';
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'vague': return Colors.danger;
            case 'buzzword': return Colors.warning;
            case 'concrete': return Colors.success;
            default: return Colors.textMuted;
        }
    };

    const barWidth = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={[styles.container, { opacity: animatedOpacity }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Slop Metre</Text>
                <Text style={[styles.typeLabel, { color: getTypeColor() }]}>{getTypeLabel()}</Text>
                <Text style={[styles.score, { color: getColor() }]}>{score}/100</Text>
            </View>
            <View style={styles.barContainer}>
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            width: barWidth,
                            backgroundColor: getColor(),
                        },
                    ]}
                />
            </View>
            {reason ? <Text style={styles.reason}>{reason}</Text> : null}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        color: Colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    score: {
        fontSize: 14,
        fontWeight: '700',
    },
    barContainer: {
        height: 6,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 3,
    },
    reason: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 8,
        lineHeight: 16,
    },
});

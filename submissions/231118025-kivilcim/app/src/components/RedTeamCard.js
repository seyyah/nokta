import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function RedTeamCard({ attack, index, onDefend }) {
    const [defense, setDefense] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (defense.trim()) {
            setSubmitted(true);
            onDefend(index, defense.trim());
        }
    };

    const severityColor = {
        low: Colors.warning,
        medium: Colors.warningDark,
        high: Colors.danger,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>{attack.icon}</Text>
                <View style={styles.headerInfo}>
                    <Text style={styles.perspective}>
                        {attack.perspective === 'competitor' ? 'Rakip Perspektifi' :
                            attack.perspective === 'technical' ? 'Teknik Risk' : 'Piyasa Şüphecisi'}
                    </Text>
                    <View style={[styles.severityBadge, { backgroundColor: severityColor[attack.severity] + '30' }]}>
                        <Text style={[styles.severityText, { color: severityColor[attack.severity] }]}>
                            {attack.severity === 'high' ? 'Yüksek Risk' : attack.severity === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
                        </Text>
                    </View>
                </View>
            </View>
            <Text style={styles.attackText}>{attack.attack}</Text>
            {submitted ? (
                <View style={styles.defenseBox}>
                    <Text style={styles.defenseLabel}>🛡️ Savunman:</Text>
                    <Text style={styles.defenseText}>{defense}</Text>
                </View>
            ) : (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={defense}
                        onChangeText={setDefense}
                        placeholder="Savunmanı yaz..."
                        placeholderTextColor={Colors.textMuted}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.defendButton, !defense.trim() && styles.defendButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!defense.trim()}
                    >
                        <Text style={styles.defendButtonText}>Savun</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    icon: {
        fontSize: 22,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    perspective: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    severityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    attackText: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    defenseBox: {
        backgroundColor: 'rgba(0, 230, 118, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.2)',
        borderRadius: 10,
        padding: 12,
    },
    defenseLabel: {
        color: Colors.success,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    defenseText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        backgroundColor: Colors.surfaceLight,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 10,
        padding: 12,
        color: Colors.text,
        fontSize: 14,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    defendButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    defendButtonDisabled: {
        backgroundColor: Colors.surfaceLight,
    },
    defendButtonText: {
        color: Colors.text,
        fontWeight: '700',
        fontSize: 14,
    },
});

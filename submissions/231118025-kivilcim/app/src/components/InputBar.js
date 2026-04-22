import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';

export default function InputBar({ onSend, placeholder = 'Mesajını yaz...', disabled = false, loading = false, multiline = false }) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !disabled && !loading) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                multiline={multiline}
                maxLength={2000}
                editable={!disabled && !loading}
            />
            <TouchableOpacity
                style={[styles.sendButton, (!text.trim() || disabled || loading) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!text.trim() || disabled || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                    <Text style={styles.sendIcon}>➤</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.backgroundLight,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: Colors.text,
        fontSize: 15,
        maxHeight: 120,
    },
    multilineInput: {
        minHeight: 44,
        borderRadius: 16,
        paddingTop: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.surfaceLight,
    },
    sendIcon: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function ChatBubble({ message, isAI = true, timestamp = null }) {
    return (
        <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
            <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
                {isAI && <Text style={styles.aiLabel}>🤖 Kıvılcım</Text>}
                <Text style={[styles.message, isAI ? styles.aiText : styles.userText]}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        marginHorizontal: 16,
    },
    aiContainer: {
        alignItems: 'flex-start',
        marginRight: 40,
    },
    userContainer: {
        alignItems: 'flex-end',
        marginLeft: 40,
    },
    bubble: {
        borderRadius: 16,
        padding: 14,
        maxWidth: '100%',
    },
    aiBubble: {
        backgroundColor: Colors.aiBubble,
        borderWidth: 1,
        borderColor: Colors.aiBubbleBorder,
        borderTopLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: Colors.userBubble,
        borderWidth: 1,
        borderColor: Colors.userBubbleBorder,
        borderTopRightRadius: 4,
    },
    aiLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
    },
    aiText: {
        color: Colors.text,
    },
    userText: {
        color: Colors.secondary,
    },
});

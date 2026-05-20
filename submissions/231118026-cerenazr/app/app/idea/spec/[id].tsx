import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { useAppStore } from '../../../src/store';
import { captureScreen, writeFile, shareFile } from '../../../src/services/capture';

export default function SpecScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const idea = useAppStore((state) => state.ideas.find((i) => i.id === id));

    if (!idea) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Idea not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AuditWidget
                deps={{
                    captureScreen,
                    captureRef: async () => '',
                    writeFile,
                    writeFileBinary: async () => '',
                    shareFile,
                    storage: {
                        getAll: async () => [],
                        save: async () => { },
                        delete: async () => { },
                    },
                    currentScreen: 'SpecCard',
                    reporterId: 'user123',
                    BugIcon: null,
                }}
                appName="Nokta"
            />

            <View style={styles.header}>
                <Link href={`/idea/${id}`} asChild>
                    <TouchableOpacity>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                </Link>
                <Text style={styles.title}>Product Spec</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. IDENTITY</Text>
                    <Text style={styles.sectionText}>
                        {idea.title} — A solution that matures the idea from spark to structured product
                        specification.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. NON-GOALS</Text>
                    <Text style={styles.sectionText}>• Not a replacement for formal engineering specs</Text>
                    <Text style={styles.sectionText}>• Not a project management tool</Text>
                    <Text style={styles.sectionText}>• Does not include implementation</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. DATA CONTRACTS</Text>
                    <View style={styles.codeBlock}>
                        <Text style={styles.code}>{`interface Idea {
  id: string;
  title: string;
  spark: string;
  status: 'dot' | 'line' | 'paragraph' | 'page';
  createdAt: Date;
  messages: Message[];
}`}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. OBJECTIVE FUNCTION</Text>
                    <Text style={styles.sectionText}>
                        Maximize clarity and structure of idea from initial spark to fully matured spec through
                        guided LLM questioning.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. RATCHET RULE</Text>
                    <Text style={styles.sectionText}>
                        Quality score must never decrease. Each idea maturation stage is irreversible.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Messages in Conversation</Text>
                    {(idea.messages || []).length === 0 ? (
                        <Text style={styles.sectionText}>No messages yet.</Text>
                    ) : (
                        (idea.messages || []).map((msg, idx) => (
                            <View key={idx} style={styles.message}>
                                <Text style={styles.messageSender}>{msg.role.toUpperCase()}:</Text>
                                <Text style={styles.messageContent}>{msg.content}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        fontSize: 14,
        color: '#ff6b6b',
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
        marginBottom: 4,
    },
    codeBlock: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b6b',
    },
    code: {
        fontSize: 11,
        color: '#333',
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    message: {
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
    },
    messageSender: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginBottom: 4,
    },
    messageContent: {
        fontSize: 13,
        color: '#333',
        lineHeight: 18,
    },
});

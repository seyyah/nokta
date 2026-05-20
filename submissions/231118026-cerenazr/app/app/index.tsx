import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { useAppStore } from '../src/store';
import { captureScreen, writeFile, shareFile } from '../src/services/capture';

export default function IdeaListScreen() {
    const ideas = useAppStore((state) => state.ideas);
    const addIdea = useAppStore((state) => state.addIdea);

    const handleAddIdea = () => {
        addIdea({
            id: Math.random().toString(),
            title: 'New Idea',
            spark: 'Initial spark',
            status: 'dot',
            createdAt: new Date(),
            messages: [],
        });
    };

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
                    currentScreen: 'IdeaList',
                    reporterId: 'user123',
                    BugIcon: null,
                }}
                appName="Nokta"
            />

            <View style={styles.header}>
                <Text style={styles.title}>Nokta Ideas</Text>
                <TouchableOpacity style={styles.fab} onPress={handleAddIdea}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={ideas}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => {
                    const statusColors: Record<string, { bg: string; text: string }> = {
                        dot: { bg: '#ffe0e0', text: '#ff6b6b' },
                        line: { bg: '#fff5e0', text: '#ff9800' },
                        paragraph: { bg: '#e0f2f1', text: '#00897b' },
                        page: { bg: '#e8f5e9', text: '#388e3c' },
                    };
                    const colors = statusColors[item.status] || statusColors.dot;
                    return (
                        <Link href={`/idea/${item.id}`} asChild>
                            <TouchableOpacity style={styles.card}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSpark}>{item.spark}</Text>
                                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                                    <Text style={[styles.badgeText, { color: colors.text }]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No ideas yet. Tap + to start.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 110,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    fabText: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        margin: 12,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b6b',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardSpark: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ffe0e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b6b',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

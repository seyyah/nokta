import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { useAppStore } from '../../src/store';
import { captureScreen, writeFile, shareFile } from '../../src/services/capture';

export default function IdeaChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const idea = useAppStore((state) => state.ideas.find((i) => i.id === id));
    const addMessage = useAppStore((state) => state.addMessage);
    const [input, setInput] = useState('');
    const [inputHeight, setInputHeight] = useState(40);

    if (!idea) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Idea not found</Text>
            </SafeAreaView>
        );
    }

    const handleSendMessage = () => {
        if (input.trim()) {
            addMessage(id!, { role: 'user', content: input, timestamp: new Date() });
            setInput('');

            // Simulate agent response
            setTimeout(() => {
                addMessage(id!, {
                    role: 'agent',
                    content:
                        'That\'s a great point! Let me ask: What problem does this solve?',
                    timestamp: new Date(),
                });
            }, 1000);
        }
    };

    const handleInputSizeChange = (contentSize: any) => {
        const newHeight = Math.min(Math.max(contentSize.height, 40), 200);
        setInputHeight(newHeight);
    };

    const messages = idea.messages || [];

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
                    currentScreen: 'IdeaChat',
                    reporterId: 'user123',
                    BugIcon: null,
                }}
                appName="Nokta"
            />

            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                </Link>
                <Text style={styles.title}>{idea.title}</Text>
                <Link href={`/idea/spec/${idea.id}`} asChild>
                    <TouchableOpacity style={styles.specButton}>
                        <Text style={styles.specButtonText}>View Spec</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageBubble,
                            item.role === 'user' ? styles.userBubble : styles.agentBubble,
                        ]}
                    >
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timestamp}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                )}
                ListHeaderComponent={
                    <View style={styles.intro}>
                        <Text style={styles.introText}>
                            Spark: {idea.spark}
                        </Text>
                        <Text style={styles.introMeta}>Status: {idea.status.toUpperCase()}</Text>
                    </View>
                }
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { height: Math.max(40, inputHeight) }]}
                    placeholder="Add your thoughts..."
                    value={input}
                    onChangeText={setInput}
                    onContentSizeChange={(e) => handleInputSizeChange(e.nativeEvent.contentSize)}
                    multiline
                    scrollEnabled={inputHeight >= 200}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!input.trim()}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
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
        flex: 1,
        marginLeft: 8,
    },
    specButton: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    specButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    intro: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    introMeta: {
        fontSize: 12,
        color: '#999',
    },
    messageBubble: {
        marginHorizontal: 12,
        marginVertical: 6,
        padding: 12,
        borderRadius: 8,
        maxWidth: '85%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#ff6b6b',
    },
    agentBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    messageText: {
        fontSize: 14,
        color: '#333',
    },
    timestamp: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
});

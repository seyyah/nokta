import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, TextInput, KeyboardAvoidingView, Platform,
    Animated, Modal, ScrollView
} from 'react-native';
import { Send, LogOut, Video, Settings, Key, User, MessageCircle } from 'lucide-react-native';
import NoktaMascot from '../components/NoktaMascot';
import Brain from '../services/Brain';
import Voice from '../services/Voice';

export default function ConsultationScreen() {
    const [mode, setMode] = useState('ia'); // 'ia' or 'human'
    const [messages, setMessages] = useState([
        { id: '1', role: 'ai', text: 'Merhaba! Ben Nokta. İhtiyacın olan uzmanlığı birlikte kurgulayalım. Fikrini buraya fırlatabilirsin!' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const flatListRef = useRef();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);

        setIsTyping(true);
        try {
            const reply = await Brain.sendMessage(userMsg);
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString() + '_ai', role: 'ai', text: reply }]);
            Voice.speak(reply);
        } catch (err) {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: 'err', role: 'ai', text: 'Bağlantı hatası: Lütfen Ayarlar\'dan API anahtarınızı kontrol edin.' }]);
        }
    };

    const switchToHuman = () => {
        setMode('human');
        setMessages(prev => [...prev, {
            id: 'expert_sys',
            role: 'system',
            text: 'Mühendislik Uzmanımıza bağlanılıyor... Lütfen bekleyin.'
        }]);

        // Smooth fade for transition
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();
    };

    const renderMessage = ({ item }) => {
        if (item.role === 'system') {
            return (
                <View style={styles.systemMsg}>
                    <Text style={styles.systemText}>{item.text}</Text>
                </View>
            );
        }
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageContainer, isUser ? styles.userMsg : styles.aiMsg]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
                        <Settings size={22} color="#64748b" />
                    </TouchableOpacity>
                    <View style={styles.modeBadges}>
                        <View style={[styles.badge, mode === 'ia' ? styles.activeBadge : null]}>
                            <Text style={[styles.badgeText, mode === 'ia' ? styles.activeBadgeText : null]}>NOKTA AI</Text>
                        </View>
                        <View style={[styles.badge, mode === 'human' ? styles.activeBadgeGreen : null]}>
                            <Text style={[styles.badgeText, mode === 'human' ? styles.activeBadgeText : null]}>EXPERT</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => {/* Logout */ }} style={styles.iconBtn}>
                        <LogOut size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.mascotArea, { opacity: fadeAnim }]}>
                    {mode === 'ia' ? (
                        <NoktaMascot isThinking={isTyping} />
                    ) : (
                        <View style={styles.expertContainer}>
                            <View style={styles.videoBox}>
                                <View style={styles.remoteVideo}>
                                    <View style={styles.expertAvatar}>
                                        <User size={60} color="#0044cc" />
                                        <View style={styles.onlineDot} />
                                    </View>
                                    <Text style={styles.expertName}>Uzm. Engin Nokta</Text>
                                    <Text style={styles.expertRole}>Kıdemli Yazılım Mimarı</Text>
                                </View>
                                <View style={styles.localVideo}>
                                    <View style={styles.localUserPlaceholder} />
                                    <Text style={styles.localUserText}>Siz</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setMode('ia')} style={styles.endCallBtn}>
                                <Text style={styles.endCallText}>Görüşmeyi Sonlandır</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

                {mode === 'ia' && (
                    <TouchableOpacity onPress={switchToHuman} style={styles.expertBtn}>
                        <Video size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.expertBtnText}>Uzmana Bağlan</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.chatArea}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            </View>

            <View style={styles.footer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder={mode === 'ia' ? "Fikrini buraya fırlat..." : "Uzmana mesaj yazın..."}
                        placeholderTextColor="#94a3b8"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Settings Modal */}
            <Modal visible={showSettings} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ayarlar</Text>
                            <TouchableOpacity onPress={() => setShowSettings(false)}>
                                <Text style={styles.closeBtn}>Kapat</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.settingItem}>
                            <Text style={styles.label}>Groq API Anahtarı</Text>
                            <View style={styles.inputRow}>
                                <Key size={18} color="#64748b" style={{ marginRight: 10 }} />
                                <TextInput
                                    style={styles.modalInput}
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    placeholder="gsk_..."
                                    secureTextEntry
                                />
                            </View>
                            <TouchableOpacity style={styles.saveBtn} onPress={() => {
                                Brain.setApiKey(apiKey);
                                setShowSettings(false);
                            }}>
                                <Text style={styles.saveBtnText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fff',
        zIndex: 10
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10
    },
    iconBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f8fafc' },
    modeBadges: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 20, padding: 4 },
    badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
    activeBadge: { backgroundColor: '#0044cc' },
    activeBadgeGreen: { backgroundColor: '#10b981' },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    activeBadgeText: { color: '#fff' },
    mascotArea: { height: 400, alignItems: 'center', justifyContent: 'center' },
    expertContainer: { width: '100%', height: 400, alignItems: 'center', justifyContent: 'center', padding: 20 },
    videoBox: { 
        width: '100%', height: 300, backgroundColor: '#0f172a', borderRadius: 24, 
        overflow: 'hidden', position: 'relative', elevation: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
    },
    remoteVideo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    localVideo: { 
        position: 'absolute', right: 15, bottom: 15, width: 80, height: 110, 
        backgroundColor: '#334155', borderRadius: 12, borderWidth: 2, borderColor: '#475569',
        justifyContent: 'flex-end', padding: 8
    },
    localUserPlaceholder: { flex: 1 },
    localUserText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
    expertAvatar: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#eef2ff',
        alignItems: 'center', justifyContent: 'center', marginBottom: 15,
        borderWidth: 3, borderColor: '#0044cc'
    },
    onlineDot: {
        position: 'absolute', bottom: 5, right: 5, width: 20, height: 20,
        borderRadius: 10, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#fff'
    },
    expertName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    expertRole: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    endCallBtn: {
        marginTop: 20, backgroundColor: '#ef4444', paddingHorizontal: 25, paddingVertical: 12,
        borderRadius: 25, elevation: 5
    },
    endCallText: { color: 'white', fontWeight: 'bold' },
    expertBtn: {
        position: 'absolute', bottom: 20, right: 20,
        backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 30, flexDirection: 'row', alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2
    },
    expertBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    chatArea: { flex: 1 },
    chatContent: { padding: 20 },
    messageContainer: { padding: 16, borderRadius: 20, marginBottom: 12, maxWidth: '85%' },
    userMsg: {
        alignSelf: 'flex-end', backgroundColor: '#0044cc',
        borderBottomRightRadius: 4, elevation: 2
    },
    aiMsg: {
        alignSelf: 'flex-start', backgroundColor: '#f8fafc',
        borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9'
    },
    systemMsg: { alignSelf: 'center', marginVertical: 20, opacity: 0.7 },
    systemText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
    userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
    aiText: { color: '#1e293b', fontSize: 15, lineHeight: 22 },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    inputContainer: {
        flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 30,
        paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0'
    },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1e293b' },
    sendBtn: { backgroundColor: '#0044cc', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { color: '#0044cc', fontWeight: 'bold' },
    settingItem: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
        borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0'
    },
    modalInput: { flex: 1, paddingVertical: 12 },
    saveBtn: { backgroundColor: '#0044cc', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: 'white', fontWeight: 'bold' }
});

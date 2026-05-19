/**
 * ChatScreen.tsx
 * Gemini destekli sohbet ekranı.
 * Özellikler:
 *  - Gemini 2.0 Flash ile gerçek AI sohbeti
 *  - Knowledge base'den öncelikli cevap
 *  - HITL tetiklendiğinde 'uzman bekleniyor' baloncuğu
 *  - 3 saniyede bir polling → admin cevabı gelince güncellenir
 *  - Radar teması, glassmorphism UI
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Send, Bot, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import ChatBubble, { Message, MessageRole } from '../components/ChatBubble';
import RadarBackground from '../components/RadarBackground';
import { sendMessage, ChatMessage } from '../services/geminiService';
import { getItemById } from '../services/hitlService';
import { HITL_POLL_INTERVAL_MS } from '../constants/config';

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'ai',
  content: '⚡ Nokta Radar AI aktif.\n\nFikrin var mı? Analiz edelim. Pazar araştırması, slop tespiti, rakip analizi — sor.',
  timestamp: new Date(),
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Conversation history for Gemini (role/parts format)
  const geminiHistory = useRef<ChatMessage[]>([]);

  // Aktif HITL item'larını takip et: { messageId -> hitlItemId }
  const pendingHitls = useRef<Map<string, string>>(new Map());

  // HITL polling
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pendingHitls.current.size === 0) return;

      for (const [messageId, hitlItemId] of pendingHitls.current.entries()) {
        try {
          const hitlItem = await getItemById(hitlItemId);
          if (hitlItem?.status === 'answered' && hitlItem.answer) {
            // Mesajı güncelle: hitl_pending → hitl_answered
            setMessages(prev =>
              prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, role: 'hitl_answered' as MessageRole, expertAnswer: hitlItem.answer }
                  : msg
              )
            );
            pendingHitls.current.delete(messageId);
          }
        } catch {
          // Polling hatası sessizce atla
        }
      }
    }, HITL_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsgId = generateId();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    scrollToBottom();

    try {
      // Bağlam özeti: son 3 mesajı al
      const contextSummary = messages
        .slice(-3)
        .map(m => `${m.role === 'user' ? 'Kullanıcı' : 'AI'}: ${m.content.slice(0, 100)}`)
        .join('\n');

      const result = await sendMessage(
        text,
        userMsgId,
        geminiHistory.current,
        contextSummary
      );

      let aiMsg: Message;
      const aiMsgId = generateId();

      if (result.type === 'hitl') {
        aiMsg = {
          id: aiMsgId,
          role: 'hitl_pending',
          content: result.text,
          timestamp: new Date(),
          hitlId: result.hitlItem?.id,
        };
        if (result.hitlItem) {
          pendingHitls.current.set(aiMsgId, result.hitlItem.id);
        }
      } else if (result.type === 'knowledge') {
        aiMsg = {
          id: aiMsgId,
          role: 'knowledge',
          content: result.text,
          timestamp: new Date(),
          knowledgeSource: true,
        };
      } else {
        aiMsg = {
          id: aiMsgId,
          role: 'ai',
          content: result.text,
          timestamp: new Date(),
        };
      }

      // Gemini history güncelle
      geminiHistory.current = [
        ...geminiHistory.current,
        { role: 'user', parts: [{ text }] },
        ...(result.type === 'direct' ? [{ role: 'model' as const, parts: [{ text: result.text }] }] : []),
      ];
      // Son 20 mesaj tut (bağlam penceresi)
      if (geminiHistory.current.length > 20) {
        geminiHistory.current = geminiHistory.current.slice(-20);
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        content: `⚠️ Hata: ${err?.message || 'Bilinmeyen hata'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // pendingHitls size'ı reactive olarak takip et — mesaj listesi değişince güncelle
  useEffect(() => {
    setPendingCount(pendingHitls.current.size);
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <RadarBackground />

      {/* HITL Banner + Admin Butonu */}
      <View style={styles.topBar}>
        {pendingCount > 0 && (
          <View style={styles.hitlBanner}>
            <ShieldAlert color="#FF9800" size={16} />
            <Text style={styles.hitlBannerText}>
              {pendingCount} soru uzman incelemesinde
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push('/admin' as any)}
        >
          <ShieldCheck color="#333" size={18} />
        </TouchableOpacity>
      </View>

      {/* Mesaj Listesi */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing Indicator */}
      {loading && (
        <View style={styles.typingIndicator}>
          <Bot color="#00E5FF" size={16} />
          <ActivityIndicator color="#00E5FF" size="small" style={{ marginLeft: 8 }} />
          <Text style={styles.typingText}>Radar analiz yapıyor...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Fikrin veya sorun nedir?"
          placeholderTextColor="#444"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Send color={!input.trim() || loading ? '#333' : '#000'} size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,10,10,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingRight: 12,
    paddingVertical: 4,
    minHeight: 36,
    zIndex: 10,
  },
  adminBtn: {
    padding: 8,
    borderRadius: 8,
  },
  hitlBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hitlBannerText: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageList: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 255, 0.1)',
  },
  typingText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.7,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 20,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
});

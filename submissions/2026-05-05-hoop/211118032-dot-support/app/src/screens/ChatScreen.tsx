import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Message } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { MockMascotService } from '../services/mockMascotService';
import { EscalationService } from '../services/escalationService';

function makeId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function buildWelcomeMessage(): Message {
  return {
    id: 'welcome',
    text: 'Merhaba! Ben Nokta. Fikrini veya problemini benimle paylaşabilirsin. Eğer konun uzman desteği gerektiriyorsa seni doğru kişiye yönlendiririm. 😊',
    sender: 'mascot',
    timestamp: new Date().toISOString(),
  };
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(() => [buildWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expertSuggestion, setExpertSuggestion] = useState<{
    keyword: string;
    mentorType: string;
  } | null>(null);
  const [creatingEscalation, setCreatingEscalation] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setInput(text);
    setCharCount(text.length);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([buildWelcomeMessage()]);
    setExpertSuggestion(null);
    setInput('');
    setCharCount(0);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    if (trimmed.toLowerCase() === 'temizle') {
      clearChat();
      return;
    }

    const userMsg: Message = {
      id: makeId(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setCharCount(0);
    setIsTyping(true);
    setExpertSuggestion(null);
    scrollToBottom();

    await new Promise<void>((r) => setTimeout(r, 1200 + Math.random() * 800));

    const response = MockMascotService.generateResponse(trimmed);
    const mascotMsg: Message = {
      id: makeId(),
      text: response,
      sender: 'mascot',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, mascotMsg]);
    setIsTyping(false);
    scrollToBottom();

    if (MockMascotService.shouldSuggestExpert(trimmed)) {
      const keyword = MockMascotService.getDetectedKeyword(trimmed);
      if (keyword) {
        const mentorType = MockMascotService.getMentorTypeForKeyword(keyword);
        setTimeout(() => {
          setExpertSuggestion({ keyword, mentorType });
          scrollToBottom();
        }, 400);
      }
    }
  }, [input, isTyping, scrollToBottom]);

  const handleRequestExpert = useCallback(async () => {
    if (!expertSuggestion || creatingEscalation) return;
    setCreatingEscalation(true);

    try {
      const kw = expertSuggestion.keyword;
      const topic = `${kw.charAt(0).toUpperCase()}${kw.slice(1)} konusunda destek talebi`;
      await EscalationService.createEscalation(topic, expertSuggestion.mentorType);

      setExpertSuggestion(null);

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          text: '✅ Uzman desteği talebiniz oluşturuldu! Birkaç saniye içinde bir mentor sizi kabul edecek. "Talepler" sekmesinden durumu takip edebilirsiniz.',
          sender: 'mascot',
          timestamp: new Date().toISOString(),
        },
      ]);
      scrollToBottom();
    } finally {
      setCreatingEscalation(false);
    }
  }, [expertSuggestion, creatingEscalation, scrollToBottom]);

  const handleClearChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <MessageBubble message={item} />,
    [],
  );

  const showCharCount = charCount > 400;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.topBar}>
        <View style={styles.mascotIndicator}>
          <View style={styles.mascotDot} />
          <Text style={styles.mascotLabel}>Nokta • Çevrimiçi</Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.clearHint}>"temizle" yaz veya</Text>
          <TouchableOpacity onPress={handleClearChat} style={styles.clearBtn} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>🗑️ Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {isTyping && <TypingIndicator />}
            {expertSuggestion && !isTyping && (
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionIcon}>🎯</Text>
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionTitle}>Uzman Desteği Önerilir</Text>
                    <Text style={styles.suggestionDesc}>
                      Bu konu uzman desteği gerektirebilir.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.expertBtn,
                    creatingEscalation && styles.expertBtnDisabled,
                  ]}
                  onPress={handleRequestExpert}
                  disabled={creatingEscalation}
                  activeOpacity={0.85}
                >
                  <Text style={styles.expertBtnText}>
                    {creatingEscalation ? 'Oluşturuluyor...' : '⚡ Uzman Desteği Al'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
      />

      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={handleChangeText}
            placeholder="Bir şeyler yaz..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          {showCharCount && (
            <Text style={[styles.charCount, charCount > 480 && styles.charCountWarning]}>
              {500 - charCount}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.85}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mascotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mascotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  mascotLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  clearHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  clearBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  suggestionCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  suggestionIcon: {
    fontSize: FontSize.xl,
  },
  suggestionText: {
    flex: 1,
    gap: 3,
  },
  suggestionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  suggestionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  expertBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  expertBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  expertBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingRight: 44,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: 10,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  charCountWarning: {
    color: Colors.error,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});

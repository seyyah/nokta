import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../theme/colors';
import { askAiQuestion } from '../../api/analyzer';
import { AnalysisResult } from '../../types';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  pitch: string;
  analysisResult: AnalysisResult;
}

export function ChatModal({ visible, onClose, pitch, analysisResult }: Props) {
  const { themeMode, accentColor } = useTheme();
  const colors = getColors(themeMode, accentColor);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Bu pitch analizi hakkında sormak istediğin bir şey var mı? "Kırmızı bayraklar neler?" veya "Bu pazar tahmini gerçekçi mi?" gibi sorular sorabilirsin.',
      isAi: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await askAiQuestion(pitch, currentInput, analysisResult);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, isAi: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.', 
        isAi: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, pitch, analysisResult]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.bgCardBorder }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>AI Analiz Sohbeti</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isAi 
                    ? [styles.aiBubble, { backgroundColor: colors.bgCard }] 
                    : [styles.userBubble, { backgroundColor: colors.primary }]
                ]}
              >
                <Text style={[styles.messageText, { color: msg.isAi ? colors.textPrimary : colors.white }]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.bgCard }]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={[styles.inputContainer, { borderTopColor: colors.bgCardBorder, backgroundColor: colors.bg }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.bgCard }]}
                placeholder="Sorunu buraya yaz..."
                placeholderTextColor={colors.textDim}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  messageList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

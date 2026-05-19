import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { askGroq, Message } from '../services/groqService';
import { SendHorizontal } from 'lucide-react-native';

export default function Interview() {
  const { initialIdea } = useLocalSearchParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (initialIdea) {
      const initialMessage: Message = { role: 'user', content: initialIdea as string };
      setMessages([initialMessage]);
      processGroqMessage([initialMessage]);
    }
  }, [initialIdea]);

  const processGroqMessage = async (currentMessages: Message[]) => {
    setLoading(true);
    try {
      const groqResponse = await askGroq(currentMessages);
      
      const newAssistantMessage: Message = { role: 'assistant', content: groqResponse };
      
      // Check if it's the final specification
      if (groqResponse.includes('# SPECIFICATION')) {
        router.push({ pathname: '/artifact', params: { spec: groqResponse } });
      } else {
        setMessages([...currentMessages, newAssistantMessage]);
      }
    } catch (error: any) {
      setMessages([...currentMessages, { role: 'assistant', content: error.message || 'Baş Mimar ile iletişim kurulurken bir hata oluştu.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newUserMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, newUserMessage];
    
    setMessages(newMessages);
    setInput('');
    processGroqMessage(newMessages);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3b82f6" size="small" />
          <Text style={styles.loadingText}>Mimar analiz ediyor...</Text>
        </View>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Baş Mimar'a cevap ver..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <SendHorizontal color="#fff" size={24} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: '#1e3a8a',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#161616',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#e5e5e5',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#888',
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#222',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#161616',
    color: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#1e3a8a',
    opacity: 0.5,
  },
});

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, View } from '@/components/Themed';
import { ChatBubble } from '@/components/ChatBubble';
import Colors from '@/constants/Colors';

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'user';
};

const QUESTIONS = [
  'Harika bir fikir! Peki bu çözüm tam olarak hangi gerçek acı noktasına (Problem) dokunuyor?',
  'Anladım. Peki bu çözümü tam olarak kim kullanacak? Hedef kitlemiz (User) kim?',
  'Son olarak, bu ürünün Minimum Uygulanabilir Ürün (MVP) sınırları nerede bitiyor? (Scope)',
];

export default function ChatScreen() {
  const { initialSpark } = useLocalSearchParams<{ initialSpark: string }>();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (initialSpark && messages.length === 0) {
      const initialMessages: Message[] = [
        { id: '1', text: initialSpark, sender: 'user' },
      ];
      setMessages(initialMessages);
      
      // AI response after 1 second
      setIsTyping(true);
      setTimeout(() => {
        const aiMsg: Message = { 
          id: '2', 
          text: QUESTIONS[0], 
          sender: 'ai' 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1000);
    }
  }, [initialSpark]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!userInput.trim() || isTyping) return;

    const currentText = userInput.trim();
    const userMsg: Message = { id: Date.now().toString(), text: currentText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    // Store answer for current step
    const updatedAnswers = [...answers, currentText];
    setAnswers(updatedAnswers);
    
    setUserInput('');

    if (step < QUESTIONS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      
      setIsTyping(true);
      setTimeout(() => {
        const aiMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          text: QUESTIONS[nextStep], 
          sender: 'ai' 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        const aiMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          text: 'Harika! Yanıtlarını derleyip mühendislik spesifikasyon dosyanı (Spec) arka planda hazırlıyorum...', 
          sender: 'ai' 
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);

        // Journey completion: wait 2.5 seconds then navigate
        setTimeout(() => {
          console.log('Navigating to spec with answers:', updatedAnswers);
          router.replace({
            pathname: '/spec',
            params: { 
              summary: initialSpark || '',
              problem: updatedAnswers[0] || '',
              user: updatedAnswers[1] || '',
              scope: updatedAnswers[2] || ''
            }
          });
        }, 2500);
      }, 2000);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: '#ffffff' }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble text={item.text} sender={item.sender} />
          )}
          contentContainerStyle={[
            styles.chatContent, 
            { paddingTop: insets.top + 20, paddingBottom: 20, backgroundColor: '#ffffff' }
          ]}
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.typingContainer, { backgroundColor: '#f8fafc' }]}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.typingText}>Nokta AI yazıyor...</Text>
              </View>
            ) : null
          }
        />

        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Fikrini geliştir..."
              placeholderTextColor="#94a3b8"
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={handleSend}
              editable={!isTyping}
              multiline={false}
              selectionColor={Colors.light.primary}
              keyboardType="default"
              returnKeyType="send"
              enablesReturnKeyAutomatically
              keyboardAppearance="light"
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!userInput.trim() || isTyping) && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!userInput.trim() || isTyping}
            >
              <LinearGradient
                colors={userInput.trim() && !isTyping ? [Colors.light.primary, Colors.light.secondary] : ['#f1f5f9', '#e2e8f0']}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={18} color={userInput.trim() && !isTyping ? "#fff" : "#94a3b8"} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
  },
  inputWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 40, // More rounded (pill)
    padding: 6,
    paddingLeft: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#1e293b',
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === 'ios' ? 0 : 10,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  typingText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});

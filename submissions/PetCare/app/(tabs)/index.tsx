import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: string;
  sender: 'user' | 'ai' | 'vet';
  text: string;
  timestamp: Date;
};

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Merhaba! Ben PetCare AI Asistanı. Evcil hayvanınızın sağlığı ve bakımıyla ilgili sorularınızı yanıtlamak için buradayım. Uzmanlık gerektiren durumlarda sorunuzu otomatik olarak uzman veterinerlerimize ileteceğim. Size nasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // AI yanıtını simüle et
    setTimeout(() => {
      let aiResponseText = '';
      let requiresVet = false;

      const lowerInput = newUserMsg.text.toLowerCase();
      if (lowerInput.includes('kan') || lowerInput.includes('kus') || lowerInput.includes('acil') || lowerInput.includes('hasta')) {
        aiResponseText = "Bu durum ciddi görünüyor ve uzman bir tıbbi değerlendirme gerektiriyor. Kendi başıma yanıt vermem doğru olmaz. Sorunuzu hemen anlaşmalı olduğumuz Uzman Veteriner Hekime iletiyorum...";
        requiresVet = true;
      } else {
        aiResponseText = "Evcil hayvanınızın bu durumu genellikle normal kabul edilir, ancak düzenli takip önemlidir. Kaliteli mama kullanımı ve stresten uzak bir ortam sağlamak iyi gelecektir. Başka bir sorunuz var mı?";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      // Gerekirse Veteriner yanıtını simüle et
      if (requiresVet) {
        setIsTyping(true); // Uzman veteriner yanıtlıyor efekti
        setTimeout(() => {
          const vetMsg: Message = {
            id: (Date.now() + 2).toString(),
            sender: 'vet',
            text: "Merhaba, ben Vet. Hekim Ayşe. AI asistanımızın ilettiği belirtiler acil müdahale gerektirebilir. Lütfen en yakın veteriner kliniğine gidin. O zamana kadar hayvanınızı sıcak tutun ve zorla bir şey yedirmeye çalışmayın.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, vetMsg]);
          setIsTyping(false);
        }, 4000); // 4 saniye sonra uzman cevabı gelir
      }
    }, 1500); // 1.5 saniye sonra AI cevabı gelir
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="sparkles" size={20} color="#0984e3" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI & Vet Asistanı</Text>
            <Text style={styles.headerSubtitle}>7/24 Kesintisiz Destek</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isVet = msg.sender === 'vet';

            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageWrapper, 
                  isUser ? styles.messageWrapperUser : styles.messageWrapperBot
                ]}
              >
                {!isUser && (
                  <View style={[styles.avatar, isVet ? styles.vetAvatar : styles.aiAvatar]}>
                    <Ionicons name={isVet ? "medical" : "sparkles"} size={16} color="#fff" />
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : isVet ? styles.vetBubble : styles.aiBubble
                ]}>
                  {!isUser && (
                    <Text style={[styles.senderName, isVet ? styles.vetNameText : styles.aiNameText]}>
                      {isVet ? 'Uzman Veteriner' : 'AI Asistan'}
                    </Text>
                  )}
                  <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
          
          {isTyping && (
             <View style={[styles.messageWrapper, styles.messageWrapperBot]}>
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Text style={[styles.messageText, styles.botText, { fontStyle: 'italic' }]}>
                    Yanıt yazılıyor...
                  </Text>
                </View>
             </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Evcil hayvanınızın durumunu yazın..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#b2bec3"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eceff1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#00b894',
    fontWeight: '500',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatar: {
    backgroundColor: '#0984e3',
  },
  vetAvatar: {
    backgroundColor: '#00b894',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#0984e3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  vetBubble: {
    backgroundColor: '#e8f8f5',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#00b894',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiNameText: {
    color: '#0984e3',
  },
  vetNameText: {
    color: '#00b894',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#2d3436',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eceff1',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 120,
    fontSize: 15,
    color: '#2d3436',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0984e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#b2bec3',
  },
});

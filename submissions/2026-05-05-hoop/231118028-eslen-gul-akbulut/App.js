import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { 
  StreamVideoClient, 
  StreamVideo, 
  Call, 
  StreamCall,
  CallContent
} from '@stream-io/video-react-native-sdk';
import { MessageCircle, Video, User, X, Send, Mic, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Configuration ---
const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || 'rrvqhuxd9yt6';
const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || 'http://192.168.1.106:8787';

// --- Mascot Component ---
const Mascot = ({ expression }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  const getMascotColor = () => {
    switch (expression) {
      case 'happy': return '#4ade80';
      case 'thinking': return '#60a5fa';
      case 'angry': return '#f87171';
      default: return '#e8d5a3';
    }
  };

  return (
    <Animated.View style={[styles.mascotContainer, { transform: [{ translateY }] }]}>
      <View style={[styles.mascotBody, { borderColor: getMascotColor() }]}>
        <View style={styles.mascotEyes}>
          <View style={styles.mascotEye} />
          <View style={styles.mascotEye} />
        </View>
        <View style={[styles.mascotMouth, expression === 'angry' && styles.mascotMouthAngry]} />
      </View>
      <View style={styles.mascotShadow} />
    </Animated.View>
  );
};

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'mascot', text: 'Merhaba! Ben Nokta Maskot. Fikrini birlikte netleştirebiliriz; uzman gerektiğinde seni mentora bağlarım.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [expression, setExpression] = useState('happy');
  const [call, setCall] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Stream Client
  useEffect(() => {
    const initClient = async () => {
      try {
        const userId = `user_${Math.floor(Math.random() * 1000)}`;
        const response = await fetch(`${TOKEN_SERVER_URL}/token?user_id=${userId}`);
        const { token } = await response.json();

        const videoClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: { id: userId, name: 'Eslen' },
          token,
        });
        setClient(videoClient);
      } catch (error) {
        console.error('Stream Client Init Error:', error);
      }
    };
    initClient();
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setExpression('thinking');

    // Simulate AI response
    setTimeout(() => {
      let reply = "Harika bir fikir! Bunu biraz daha detaylandırabilir misin?";
      if (inputText.toLowerCase().includes('mentor') || inputText.toLowerCase().includes('uzman')) {
        reply = "Seni bir mentora bağlamamı ister misin? Alttaki butona basarak görüşmeyi başlatabilirsin.";
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'mascot', text: reply }]);
      setExpression('happy');
    }, 1500);
  };

  const startMentorCall = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const callId = `call_${Date.now()}`;
      const newCall = client.call('default', callId);
      await newCall.join({ create: true });
      setCall(newCall);
    } catch (error) {
      console.error('Call Error:', error);
      alert('Görüşme başlatılamadı. Sunucuyu kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  if (call) {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <SafeAreaView style={styles.callContainer}>
            <CallContent onHangupCallHandler={() => setCall(null)} />
          </SafeAreaView>
        </StreamCall>
      </StreamVideo>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>NOKTA HOOP</Text>
            <Text style={styles.headerSubtitle}>Expert Support Platform</Text>
          </View>
          <TouchableOpacity onPress={() => setMessages([messages[0]])}>
            <RefreshCw size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.chatScroll}>
          <Mascot expression={expression} />
          
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageWrapper, 
                msg.role === 'user' ? styles.userWrapper : styles.mascotWrapper
              ]}
            >
              <View style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.mascotBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.mascotText
                ]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.mentorBtn} onPress={startMentorCall}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Video size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.mentorBtnText}>UZMAN İSTE</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Fikrini buraya yaz..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Send size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0f' },
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e'
  },
  headerTitle: { color: '#e8d5a3', fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  headerSubtitle: { color: '#666', fontSize: 10, letterSpacing: 1 },
  
  chatScroll: { padding: 20, paddingBottom: 100 },
  
  mascotContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  mascotBody: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, backgroundColor: '#111118',
    justifyContent: 'center', alignItems: 'center'
  },
  mascotEyes: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  mascotEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  mascotMouth: { width: 30, height: 15, borderBottomWidth: 3, borderBottomColor: '#fff', borderRadius: 15 },
  mascotMouthAngry: { borderBottomWidth: 0, borderTopWidth: 3, borderTopColor: '#f87171', marginTop: 10 },
  mascotShadow: { width: 60, height: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, marginTop: 10 },

  messageWrapper: { marginBottom: 15, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end' },
  mascotWrapper: { alignSelf: 'flex-start' },
  
  messageBubble: { padding: 15, borderRadius: 20 },
  userBubble: { backgroundColor: '#e8d5a3', borderBottomRightRadius: 2 },
  mascotBubble: { backgroundColor: '#1e1e2e', borderBottomLeftRadius: 2 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#000', fontWeight: '500' },
  mascotText: { color: '#ddd' },

  footer: { padding: 20, backgroundColor: '#0a0a0f', borderTopWidth: 1, borderTopColor: '#1e1e2e' },
  mentorBtn: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10
  },
  mentorBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: '#1e1e2e',
    borderRadius: 25, paddingHorizontal: 20,
    paddingVertical: 12, color: '#fff', fontSize: 15
  },
  sendBtn: {
    width: 50, height: 50, backgroundColor: '#e8d5a3',
    borderRadius: 25, justifyContent: 'center', alignItems: 'center'
  },
  
  callContainer: { flex: 1, backgroundColor: '#000' }
});

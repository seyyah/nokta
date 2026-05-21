import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NoktaMascot2D from '../components/NoktaMascot2D';
import { Voice } from '../utils/Voice';
import { generateResponse } from '../utils/Brain';

const { width } = Dimensions.get('window');

export default function AssistantScreen({ route, navigation }) {
  const mode = route?.params?.mode || 'ai';
  const isExpert = mode === 'expert';

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: isExpert 
        ? 'Sistem Uzman Mentor bağlantısı için hazırlandı. 🌀' 
        : 'Selam! Ben Nokta. Fikirlerini geliştirmek için buradayım. Bana her şeyi sorabilirsin!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(!isExpert);
  const [mascotState, setMascotState] = useState(isExpert ? 'love' : 'idle');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (isExpert) {
      // Expert connection sequence
      const timer = setTimeout(() => {
        const expertMsg = 'Merhaba, ben Nokta Uzman Mentoru. idea.md dökümanını ve ağını inceledim. Stratejik detayları konuşmaya hazır mısın?';
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: expertMsg, 
          isExpert: true 
        }]);
        setIsConnected(true);
        
        Voice.speak(expertMsg, 
          () => setMascotState('speaking'),
          () => setMascotState('love')
        );
      }, 2000);
      return () => {
        clearTimeout(timer);
        Voice.stop();
      };
    } else {
      // Initial greeting for AI
      Voice.speak(messages[0].content,
        () => setMascotState('speaking'),
        () => setMascotState('idle')
      );
      return () => Voice.stop();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    Voice.stop();

    if (isExpert) {
      // Mock Expert Response
      setTimeout(() => {
        const expertResponse = currentInput.length > 30 
          ? "Bu teknik detay projenin MVP aşaması için kritik. Mimaride buna odaklanalım." 
          : "Anlıyorum, bu noktayı biraz daha açabilir miyiz? Pazar potansiyeli için bu çok değerli.";
        
        setMessages(prev => [...prev, { role: 'assistant', content: expertResponse, isExpert: true }]);
        Voice.speak(expertResponse,
          () => setMascotState('speaking'),
          () => setMascotState('love')
        );
      }, 1200);
    } else {
      // AI Brain Response
      setMascotState('idle'); // stop talking while thinking
      const responseText = await generateResponse(currentInput, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      
      Voice.speak(responseText,
        () => setMascotState('speaking'),
        () => setMascotState('idle')
      );
    }
  };

  const themeColors = isExpert 
    ? { bg: '#0f172a', bubble: '#1e293b', accent: '#1a6bff', text: '#e2e8f0' }
    : { bg: '#09090b', bubble: '#27272a', accent: '#a855f7', text: '#ffffff' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isExpert ? '#1e293b' : '#27272a' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
           <Text style={styles.headerTitle}>{isExpert ? 'HOOP: Uzman Mentor' : 'Nokta AI Asistan'}</Text>
           <View style={styles.statusBadge}>
              <View style={[styles.statusDot, isConnected && styles.onlineDot]} />
              <Text style={styles.statusText}>{isConnected ? 'Çevrimiçi' : 'Bağlanıyor...'}</Text>
           </View>
        </View>
      </View>

      {/* Mascot Area - Fixed at top so it doesn't get covered */}
      <View style={styles.mascotArea}>
        {isExpert && (
           <LinearGradient
            colors={['transparent', 'rgba(26, 107, 255, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <NoktaMascot2D state={mascotState} />
        <View style={[styles.expertBadge, { backgroundColor: isExpert ? 'rgba(26, 107, 255, 0.2)' : 'rgba(168, 85, 247, 0.2)' }]}>
          <Text style={[styles.expertBadgeText, { color: isExpert ? '#38bdf8' : '#a855f7' }]}>
            {isExpert ? 'PROFESSIONAL VERIFICATION' : 'CREATIVE IDEATION MODE'}
          </Text>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatArea}
        contentContainerStyle={{ padding: 20 }}
      >
        {messages.map((msg, index) => (
          <View key={index} style={[
            styles.messageBubble, 
            msg.role === 'user' ? [styles.userBubble, { backgroundColor: themeColors.accent }] : [styles.assistantBubble, { backgroundColor: themeColors.bubble }],
            msg.isSystem && styles.systemBubble
          ]}>
            {msg.isExpert && <Text style={[styles.expertLabel, { color: themeColors.accent }]}>UZMAN MENTOR</Text>}
            <Text style={[styles.messageText, { color: themeColors.text }]}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.inputContainer, { backgroundColor: themeColors.bg, borderTopColor: isExpert ? '#1e293b' : '#27272a' }]}>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.bubble, borderColor: isExpert ? '#334155' : '#3f3f46' }]}
            placeholder={isConnected ? "Bir şeyler yaz..." : "Lütfen bekleyin..."}
            placeholderTextColor="#64748b"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            editable={isConnected}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: themeColors.accent }, !isConnected && styles.disabledButton]} 
            onPress={handleSend}
            disabled={!isConnected}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20, 
    borderBottomWidth: 1 
  },
  backButton: { padding: 5 },
  titleContainer: { marginLeft: 15 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#64748b', marginRight: 6 },
  onlineDot: { backgroundColor: '#10b981' },
  statusText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  mascotArea: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15,
    height: 160
  },
  expertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: -5
  },
  expertBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1
  },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '85%', padding: 15, borderRadius: 20, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  systemBubble: { alignSelf: 'center', backgroundColor: 'transparent', opacity: 0.6 },
  expertLabel: { fontSize: 10, fontWeight: '900', marginBottom: 5, letterSpacing: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, 
    borderTopWidth: 1 
  },
  input: { 
    flex: 1, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    color: 'white', 
    fontSize: 16, 
    height: 50,
    borderWidth: 1
  },
  sendButton: { 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 10 
  },
  disabledButton: { opacity: 0.3 }
});


import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

import NoktaAvatar from '../src/NoktaAvatar';
import Brain from '../src/Brain';

export default function App() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chat, setChat] = useState<{role: string, text: string}[]>([]);

  // Speech Recognition Events
  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript || "");
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech recognition error:", event.error, event.message);
    setIsListening(false);
  });

  const toggleListening = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
    } else {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        alert("Mikrofon izni gerekli!");
        return;
      }
      setTranscript("");
      ExpoSpeechRecognitionModule.start({ lang: "tr-TR" });
    }
  };

  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleSend(transcript);
    }
  }, [isListening]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setChat(prev => [...prev, { role: 'user', text }]);
    setTranscript("");
    
    try {
      setIsSpeaking(true);
      const response = await Brain.sendMessage(text, () => setIsSpeaking(false));
      setChat(prev => [...prev, { role: 'nokta', text: response }]);
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
      setChat(prev => [...prev, { role: 'nokta', text: "Hata oluştu. API anahtarını kontrol edin." }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nokta - Sağlık Asistanın</Text>
          <Text style={styles.headerSubtitle}>Psikolojik Destek ve İlk Yardım</Text>
        </View>
        <TouchableOpacity 
          style={styles.expertButton}
          onPress={() => router.push('/expert')}
        >
          <Text style={styles.expertButtonText}>👨‍⚕️ Uzmana Bağlan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <NoktaAvatar isSpeaking={isSpeaking} />
      </View>

      <ScrollView style={styles.chatContainer} contentContainerStyle={{ padding: 20 }}>
        {chat.map((msg, idx) => (
          <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.messageUser : styles.messageNokta]}>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.messageTextUser : styles.messageTextNokta]}>
              {msg.text}
            </Text>
          </View>
        ))}
        {transcript ? (
          <View style={[styles.messageBubble, styles.messageUser, { opacity: 0.7 }]}>
            <Text style={styles.messageTextUser}>{transcript}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.micButton, isListening && styles.micButtonActive]} 
          onPress={toggleListening}
        >
          <Text style={{ fontSize: 28 }}>{isListening ? "🛑" : "🎤"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a6bff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  expertButton: {
    backgroundColor: '#ebf3ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cce0ff',
  },
  expertButtonText: {
    color: '#1a6bff',
    fontWeight: '600',
    fontSize: 12,
  },
  avatarContainer: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  messageUser: {
    backgroundColor: '#1a6bff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageNokta: {
    backgroundColor: '#f0f2f5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextNokta: {
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 20,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1a6bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  micButtonActive: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  }
});

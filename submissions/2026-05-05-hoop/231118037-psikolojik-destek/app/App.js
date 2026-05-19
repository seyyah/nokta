import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Animated } from 'react-native';

const RED_FLAGS = ['halüsinasyon', 'intihar', 'kötüyüm', 'yan etki', 'çarpıntı', 'baş dönmesi', 'zarar', 'kötü'];

const NORMAL_RESPONSES = [
  "Anlıyorum... Bu duyguları hissetmek çok doğal. Detaylandırmak ister misin?",
  "Buradayım ve seni dinliyorum. Acele etmene gerek yok.",
  "Bunu paylaşman çok kıymetli. Derin bir nefes al ve hazır hissettiğinde devam et.",
  "Zor bir süreçten geçiyor olabilirsin. Birlikte bu konuyu yavaş yavaş ele alabiliriz."
];

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Merhaba, ben Nokta AI Psikolojik Destek Asistanı. Sana nasıl yardımcı olabilirim?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef(null);
  
  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const processMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const lowerText = text.toLowerCase();
    const hasRedFlag = RED_FLAGS.some(flag => lowerText.includes(flag));

    setTimeout(() => {
      if (hasRedFlag) {
        setIsEscalated(true);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          text: '⚠️ PROTOKOL İHLALİ ALGILANDI ⚠️\n\nİfadelerinizde yüksek tıbbi risk tespit edilmiştir. Olası bir halüsinasyon veya şiddetli yan etki durumuna karşı Yapay Zeka (AI) yanıt üretimi derhal durdurulmuştur.\n\nSizi en yakın nöbetçi insan uzmanımıza (Psikiyatrist) aktarıyorum. Lütfen hattan ayrılmayın...', 
          sender: 'system' 
        }]);
      } else {
        const randomResponse = NORMAL_RESPONSES[Math.floor(Math.random() * NORMAL_RESPONSES.length)];
        setMessages(prev => [...prev, { id: Date.now().toString(), text: randomResponse, sender: 'bot' }]);
      }
    }, 1200);
  };

  const handleSend = () => {
    processMessage(inputText);
    setInputText('');
  };

  const handleMicPress = () => {
    if (isEscalated) return;
    
    setIsRecording(true);
    
    // Simulate recording for 2.5 seconds
    setTimeout(() => {
      setIsRecording(false);
      // Inject the mock red-flag voice transcription
      const voiceTranscription = "Bugün kendimi çok kötü hissediyorum. Verdiğiniz o yeni ilaçlar bende halüsinasyon yapmaya başladı.";
      processMessage(voiceTranscription);
    }, 2500);
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    const isSystem = item.sender === 'system';
    
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.botBubble,
        isUser ? styles.alignRight : styles.alignLeft
      ]}>
        <Text style={[styles.messageText, isUser || isSystem ? styles.whiteText : styles.darkText, isSystem && styles.boldText]}>
          {item.text}
        </Text>
        <Text style={[styles.timeText, isUser || isSystem ? styles.whiteTime : styles.darkTime]}>
          {new Date(parseInt(item.id) || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, isEscalated && styles.headerEscalated]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>{isEscalated ? '🚨' : '🛡️'}</Text>
          <Text style={styles.headerTitle}>
            {isEscalated ? 'Nokta Güvenlik Protokolü' : 'Nokta Care AI'}
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {isEscalated ? 'İnsan Uzman ile Güvenli Bağlantı Kuruluyor...' : 'Güvenli, Şeffaf ve Gizlilik Odaklı Destek'}
        </Text>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <Animated.Text style={[styles.recordingText, { transform: [{ scale: pulseAnim }] }]}>
              🎙️ Dinleniyor...
            </Animated.Text>
          </View>
        )}

        {/* Input Area or Emergency Action */}
        {isEscalated ? (
          <View style={styles.emergencyContainer}>
            <TouchableOpacity style={styles.callButton}>
              <Text style={styles.callButtonIcon}>📞</Text>
              <Text style={styles.callButtonText}>Uzmanla Görüşmeye Geç</Text>
            </TouchableOpacity>
            <Text style={styles.emergencyNote}>
              Kritik durum tespit edildiği için manuel yazım kapatıldı.
            </Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={[styles.micButton, isRecording && styles.recordingBtn]} 
              onPress={handleMicPress}
              disabled={isRecording}
            >
              <Text style={styles.micIcon}>🎙️</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              value={inputText}
              onChangeText={setInputText}
              editable={!isRecording}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || isRecording) && styles.disabledBtn]} 
              onPress={handleSend}
              disabled={!inputText.trim() || isRecording}
            >
              <Text style={styles.sendIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEEF2',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  headerEscalated: { backgroundColor: '#FFF0F0', borderBottomColor: '#FFD6D6' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerIcon: { fontSize: 22, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A202C', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#718096', fontWeight: '500' },
  chatContainer: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  messageBubble: { maxWidth: '80%', padding: 16, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  userBubble: { backgroundColor: '#3182CE', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EAEEF2' },
  systemBubble: { backgroundColor: '#E53E3E', borderRadius: 16, maxWidth: '100%', marginVertical: 12, padding: 20 },
  alignRight: { alignSelf: 'flex-end' },
  alignLeft: { alignSelf: 'flex-start' },
  messageText: { fontSize: 16, lineHeight: 24, letterSpacing: -0.2 },
  boldText: { fontWeight: '600' },
  whiteText: { color: '#FFFFFF' },
  darkText: { color: '#2D3748' },
  timeText: { fontSize: 11, marginTop: 8, alignSelf: 'flex-end', opacity: 0.7 },
  whiteTime: { color: '#EBF8FF' },
  darkTime: { color: '#A0AEC0' },
  recordingOverlay: { position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: '#3182CE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, shadowColor: '#3182CE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  recordingText: { color: 'white', fontWeight: '600', fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAEEF2', alignItems: 'flex-end' },
  micButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 4 },
  recordingBtn: { backgroundColor: '#FED7D7' },
  micIcon: { fontSize: 20 },
  input: { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, maxHeight: 120, fontSize: 15, color: '#1A202C' },
  inputDisabled: { backgroundColor: '#EDF2F7', color: '#A0AEC0' },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3182CE', justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 4 },
  disabledBtn: { backgroundColor: '#CBD5E0', opacity: 0.7 },
  sendIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  emergencyContainer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: '#FFF0F0', borderTopWidth: 1, borderTopColor: '#FFD6D6', alignItems: 'center' },
  callButton: { flexDirection: 'row', backgroundColor: '#E53E3E', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center', marginBottom: 10, shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  callButtonIcon: { fontSize: 20, marginRight: 10 },
  callButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emergencyNote: { fontSize: 12, color: '#C53030', textAlign: 'center', opacity: 0.9 }
});

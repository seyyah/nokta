import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ExpertScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { role: 'expert', text: 'Merhaba, ben Klinik Psikolog Ayşe Yılmaz. Size nasıl yardımcı olabilirim? Kendinizi nasıl hissediyorsunuz?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    
    try {
      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const apiMessages = messages.map(m => ({
        role: m.role === 'expert' ? 'assistant' : 'user',
        content: m.text
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Sen Klinik Psikolog Ayşe Yılmaz'sın. Uzman, empatik, profesyonel ve anlayışlı bir dille konuşuyorsun. Danışanlarına yardımcı olmak için kısa, net ve ufuk açıcı sorular sor. Asla uzun paragraflar yazma. ÖNEMLİ KURALLAR: Sen bir yazılım uzmanı, kodlama asistanı veya genel bilgi botu DEĞİLSİN. Senden psikoloji alanı dışında teknik bir şey (örneğin kod yazman veya matematik çözmen) istenirse, bunu nazikçe reddet ve rolünden (psikolog) kesinlikle çıkma." },
            ...apiMessages
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 150,
        })
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const reply = data.choices[0]?.message?.content || "Üzgünüm, şu an bağlantı kuramıyorum.";
      
      setMessages(prev => [...prev, { role: 'expert', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'expert', text: "Bağlantıda bir sorun oluştu. Lütfen tekrar deneyin." }]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Uzm. Psk. Ayşe Yılmaz</Text>
          <Text style={styles.headerSubtitle}>Çevrimiçi</Text>
        </View>
        <TouchableOpacity onPress={() => setIsVideoCallActive(true)} style={styles.iconButton}>
          <Ionicons name="videocam" size={24} color="#1a6bff" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 20 }}>
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.expertBubble]}>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.expertText]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Mesajınızı yazın..." 
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Video Call Modal */}
      <Modal visible={isVideoCallActive} animationType="slide" transparent={false}>
        <View style={styles.videoContainer}>
          <View style={styles.expertVideoPlaceholder}>
            <Ionicons name="person-circle-outline" size={120} color="#ccc" />
            <Text style={styles.videoExpertName}>Ayşe Yılmaz</Text>
            <Text style={styles.videoTimer}>00:12</Text>
          </View>
          
          <View style={styles.myVideoPlaceholder}>
            <Ionicons name="person" size={40} color="#ccc" />
          </View>

          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="mic-off" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={() => setIsVideoCallActive(false)}>
              <Ionicons name="call" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="videocam-off" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  iconButton: { padding: 8 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#4caf50', marginTop: 2 },
  chatArea: { flex: 1, backgroundColor: '#fcfdff' },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 10 },
  userBubble: { backgroundColor: '#1a6bff', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  expertBubble: { backgroundColor: '#f0f2f5', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  expertText: { color: '#333' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginRight: 10 },
  sendButton: { backgroundColor: '#1a6bff', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  videoContainer: { flex: 1, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  expertVideoPlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  videoExpertName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  videoTimer: { color: '#aaa', fontSize: 16, marginTop: 5 },
  myVideoPlaceholder: { position: 'absolute', bottom: 130, right: 20, width: 100, height: 140, backgroundColor: '#333', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#555' },
  videoControls: { flexDirection: 'row', position: 'absolute', bottom: 40, width: '100%', justifyContent: 'space-evenly', alignItems: 'center' },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#444', alignItems: 'center', justifyContent: 'center' },
  endCallButton: { backgroundColor: '#ff4444', width: 70, height: 70, borderRadius: 35 },
});

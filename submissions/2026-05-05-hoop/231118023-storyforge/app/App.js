import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stories, setStories] = useState([]);
  const [currentStoryId, setCurrentStoryId] = useState(null);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hoopVisible, setHoopVisible] = useState(false);
  const [hoopStatus, setHoopStatus] = useState('idle');
  const [currentExpertAdvice, setCurrentExpertAdvice] = useState('');

  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [tempSpecContent, setTempSpecContent] = useState('');

  const currentStory = stories.find(s => s.id === currentStoryId);

  const updateCurrentStory = (updater) => {
    setStories(prev => prev.map(s => s.id === currentStoryId ? { ...s, ...updater(s) } : s));
  };

  const createNewStory = () => {
    const newId = Date.now();
    const newStory = {
      id: newId,
      title: 'İsimsiz Hikaye',
      currentStep: 0,
      spec: { idea: '', protagonist: '', antagonist: '', setting: '', twist: '', hoopAdvice: '', fullSpec: '' },
      messages: [{ role: 'ai', text: "Merhaba Yazar! Ben Nokta AI. Aklındaki ham hikaye veya senaryo fikrini kısaca benimle paylaşır mısın? Sana doğru soruları sorarak profesyonel bir Senaryo İskeleti çıkaracağım." }]
    };
    setStories([newStory, ...stories]);
    setCurrentStoryId(newId);
    setActiveTab('chat');
  };

  const selectStory = (id) => {
    setCurrentStoryId(id);
    setActiveTab('chat');
    setIsEditingSpec(false);
  };

  const deleteStory = (id) => {
    setStories(prev => prev.filter(s => s.id !== id));
    if (currentStoryId === id) {
      setCurrentStoryId(null);
      setActiveTab('home');
    }
  };

  const askGroq = async (prompt) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: 'Sen yaratıcı bir senaryo danışmanısın. Cevapların kısa, hedefe yönelik ve Türkçe olmalı. Sadece sorulan soruyu cevapla, ekstra giriş veya sonuç cümleleri kurma.' }, { role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('API Error Response:', data);
        return `API Hatası: ${data.error?.message || 'Bilinmeyen hata'}`;
      }
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Network or Parse Error:', error);
      return `Bağlantı Hatası: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentStory) return;
    if (!GROQ_API_KEY || GROQ_API_KEY === 'buraya_api_keyinizi_yaziniz') {
      alert('Lütfen app/.env dosyasına EXPO_PUBLIC_GROQ_API_KEY ekleyin ve projeyi yeniden başlatın.');
      return;
    }

    const userMessage = { role: 'user', text: inputText };
    const currentInput = inputText;

    updateCurrentStory(s => ({
      messages: [...s.messages, userMessage]
    }));

    setInputText('');
    setIsTyping(true);

    await processAiResponse(currentInput, currentStory);
    setIsTyping(false);
  };

  const processAiResponse = async (text, storyBeforeUpdate) => {
    let nextSpec = { ...storyBeforeUpdate.spec };
    let aiResponse = "";
    let nextStep = storyBeforeUpdate.currentStep;
    let nextTitle = storyBeforeUpdate.title;

    if (nextStep === 0) {
      nextSpec.idea = text;
      // Ilk kelimelerden baslik uret
      nextTitle = text.split(' ').slice(0, 3).join(' ') + '...';
      const prompt = `Kullanıcının hikaye fikri: "${text}". Bu fikre dayanarak, ana karakterin (Protagonist) bu olaydaki içsel motivasyonunu sorgulayan yaratıcı, tek cümlelik bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 1;
    }
    else if (nextStep === 1) {
      nextSpec.protagonist = text;
      const prompt = `Fikir: "${nextSpec.idea}". Ana karakter motivasyonu: "${text}". Şimdi bu hikayedeki kötü adamı (Antagonist) veya ana karakterin karşısındaki en büyük engeli sorgulayan tek cümlelik yaratıcı bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 2;
    }
    else if (nextStep === 2) {
      nextSpec.antagonist = text;
      const prompt = `Fikir: "${nextSpec.idea}". Kötü Adam/Engel: "${text}". Şimdi hikayenin geçtiği evreni, mekanı veya atmosferi (Setting) sorgulayan tek cümlelik yaratıcı bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 3;
    }
    else if (nextStep === 3) {
      nextSpec.setting = text;
      const prompt = `Fikir: "${nextSpec.idea}". Atmosfer: "${text}". Son olarak, hikayenin sonunda okuyucuyu/izleyiciyi şaşırtacak bir ters köşe (Twist) veya dramatik bir dönüş için tek cümlelik bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 4;
    }
    else if (nextStep === 4) {
      nextSpec.twist = text;
      aiResponse = "Harika! Verdiğin tüm detayları harmanlıyorum ve Senaryo İskeleti (Story Spec) dokümanını oluşturuyorum. Lütfen biraz bekle...";

      // Update state before heavy generation so UI updates quickly
      updateCurrentStory(s => ({
        spec: nextSpec,
        currentStep: 5,
        messages: [...s.messages, { role: 'ai', text: aiResponse }]
      }));

      const specPrompt = `Sen profesyonel bir senaryo yazarısın. Aşağıdaki dağınık notları alıp profesyonel bir "Story Spec" (Hikaye Dokümanı) oluştur.
      Notlar:
      - Ana Fikir: ${nextSpec.idea}
      - Ana Karakter: ${nextSpec.protagonist}
      - Çatışma/Engel: ${nextSpec.antagonist}
      - Evren/Mekan: ${nextSpec.setting}
      - Ters Köşe: ${nextSpec.twist}
      Lütfen bu bilgileri akıcı, heyecan verici bir dille, alt başlıklar kullanarak özetle.`;

      const generatedSpec = await askGroq(specPrompt);
      nextSpec.fullSpec = generatedSpec;

      const finalMsg = "Mükemmel! Senin için profesyonel bir Senaryo İskeleti oluşturdum. Yukarıdan 'Doküman (Spec)' sekmesine geçerek okuyabilirsin.\n\nEğer kurguyu yazarken teknik bir konuda takılırsan aşağıdaki 'Hoop Uzman' butonuna basarak gerçek bir uzmandan teknik danışmanlık alabilirsin.";

      updateCurrentStory(s => ({
        spec: nextSpec,
        messages: [...s.messages, { role: 'ai', text: finalMsg }]
      }));
      return;
    }
    else if (nextStep >= 5) {
      aiResponse = "Harika fikir! İsteğin doğrultusunda senaryo kurgusunu güncelliyorum...";

      updateCurrentStory(s => ({
        messages: [...s.messages, { role: 'ai', text: aiResponse }]
      }));

      const updatePrompt = `Aşağıda daha önce oluşturulan senaryo dokümanı bulunuyor:
      "${nextSpec.fullSpec}"
      
      Yazar (kullanıcı) senden şu değişikliği yapmanı istiyor: "${text}"
      
      Lütfen yazarın isteğini dikkate alarak dokümanın GÜNCELLENMİŞ halini yaz. Başka hiçbir şey söyleme, sadece güncel doküman metnini ver.`;

      const updatedSpecText = await askGroq(updatePrompt);
      nextSpec.fullSpec = updatedSpecText;

      updateCurrentStory(s => ({
        spec: nextSpec,
        messages: [...s.messages, { role: 'ai', text: "Kurguyu başarıyla güncelledim! 'Doküman' sekmesinden yeni haline göz atabilirsin." }]
      }));
      return;
    }

    updateCurrentStory(s => ({
      title: nextTitle,
      spec: nextSpec,
      currentStep: nextStep,
      messages: [...s.messages, { role: 'ai', text: aiResponse }]
    }));
  };

  const startHoopCall = async () => {
    setHoopVisible(true);
    setHoopStatus('calling');
    
    const expertPrompt = `Aşağıdaki hikaye dokümanını incele:
    "${currentStory.spec.fullSpec}"
    
    Sen çok yetenekli bir kurgu editörü ve sektör uzmanısın. Bu hikayeye bak, zayıf veya mantıksız olabilecek bir noktayı bul ve yazara doğrudan tavsiye niteliğinde, çok net ve kısa bir eleştiri yap (en fazla 2 cümle olsun).`;
    
    const advice = await askGroq(expertPrompt);
    setCurrentExpertAdvice(advice);
    setHoopStatus('talking');
  };

  const finishHoopCall = async () => {
    setHoopVisible(false);
    if (!currentStory) return;

    setIsTyping(true);

    const expertAdvice = "Uzman Notu: " + currentExpertAdvice;

    const updatePrompt = `Aşağıda daha önce yazdığın hikaye dokümanı var:
    "${currentStory.spec.fullSpec}"
    
    Bir insan uzman bu hikaye için şu tavsiyeyi verdi: "${expertAdvice}"
    Lütfen bu uzman tavsiyesini hikayeye mantıklı bir şekilde yedirerek dokümanın GÜNCELLENMİŞ halini yaz. Başka hiçbir şey söyleme, sadece yeni dokümanı ver.`;

    const updatedSpec = await askGroq(updatePrompt);

    updateCurrentStory(s => ({
      spec: { ...s.spec, hoopAdvice: expertAdvice, fullSpec: updatedSpec },
      messages: [...s.messages, { role: 'ai', text: "Görüşmen bitti. Uzmanın verdiği tavsiyeyi dinledim ve Story Spec dokümanını bu yeni bilgiye göre güncelledim (Writeback). Doküman sekmesinden kontrol edebilirsin!" }]
    }));

    setIsTyping(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'home' && styles.activeTab]} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Hikayelerim</Text>
        </TouchableOpacity>
        {currentStory && (
          <>
            <TouchableOpacity style={[styles.tab, activeTab === 'chat' && styles.activeTab]} onPress={() => setActiveTab('chat')}>
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Sohbet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'spec' && styles.activeTab]} onPress={() => setActiveTab('spec')}>
              <Text style={[styles.tabText, activeTab === 'spec' && styles.activeTabText]}>Doküman</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          <TouchableOpacity style={styles.newStoryButton} onPress={createNewStory}>
            <Text style={styles.newStoryButtonText}>+ Yeni Hikaye Fikri Oluştur</Text>
          </TouchableOpacity>

          <Text style={styles.listTitle}>Mevcut Hikayeleriniz</Text>
          {stories.length === 0 ? (
            <Text style={styles.emptyText}>Henüz bir hikaye oluşturmadınız.</Text>
          ) : (
            stories.map(s => (
              <View key={s.id} style={styles.storyCardContainer}>
                <TouchableOpacity style={styles.storyCard} onPress={() => selectStory(s.id)}>
                  <Text style={styles.storyCardTitle}>{s.title}</Text>
                  <Text style={styles.storyCardSub}>İlerleme Durumu: %{Math.min(100, s.currentStep * 20)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStory(s.id)}>
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && currentStory && (
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 15 }}>
            {currentStory.messages.map((msg, index) => (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.text}</Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            )}
            {currentStory.currentStep === 5 && (
              <TouchableOpacity style={styles.hoopButton} onPress={startHoopCall}>
                <Text style={styles.hoopButtonText}>Teknik Uzman Bağla</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı buraya yazın..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isTyping}>
              <Text style={styles.sendButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* SPEC TAB */}
      {activeTab === 'spec' && currentStory && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={[styles.specTitle, { marginBottom: 0, flex: 1 }]}>{currentStory.title}</Text>
            {currentStory.spec.fullSpec && !isEditingSpec && (
              <TouchableOpacity onPress={() => { setTempSpecContent(currentStory.spec.fullSpec); setIsEditingSpec(true); }} style={styles.editSpecButton}>
                <Text style={styles.editSpecButtonText}>Kurguyu Düzenle</Text>
              </TouchableOpacity>
            )}
            {isEditingSpec && (
              <TouchableOpacity onPress={() => {
                updateCurrentStory(s => ({ spec: { ...s.spec, fullSpec: tempSpecContent } }));
                setIsEditingSpec(false);
              }} style={styles.saveSpecButton}>
                <Text style={styles.saveSpecButtonText}>Kaydet</Text>
              </TouchableOpacity>
            )}
          </View>

          {currentStory.spec.fullSpec ? (
            <View style={styles.specSection}>
              {isEditingSpec ? (
                <TextInput
                  style={[styles.sectionContent, styles.specEditInput]}
                  multiline
                  value={tempSpecContent}
                  onChangeText={setTempSpecContent}
                />
              ) : (
                <Text style={styles.sectionContent}>{currentStory.spec.fullSpec}</Text>
              )}
            </View>
          ) : (
            <View style={styles.specSection}>
              <Text style={styles.sectionContent}>Sohbetteki 4 soruyu cevapladığınızda, profesyonel dokümanınız yapay zeka tarafından bu alanda oluşturulacaktır...</Text>
            </View>
          )}

          {currentStory.spec.hoopAdvice ? (
            <View style={[styles.specSection, styles.hoopSection]}>
              <Text style={[styles.sectionTitle, { color: '#d97706' }]}>Uzman Tavsiyesi</Text>
              <Text style={styles.sectionContent}>{currentStory.spec.hoopAdvice}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* HOOP MODAL */}
      <Modal visible={hoopVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {hoopStatus === 'calling' ? (
            <View style={styles.callingContainer}>
              <ActivityIndicator size="large" color="#f43f5e" />
              <Text style={styles.callingText}>Sektör Uzmanına Bağlanılıyor...</Text>
            </View>
          ) : (
            <View style={styles.talkingContainer}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoText}>UZMAN KAMERASI (SİMÜLASYON)</Text>
                <Text style={styles.expertQuote}>
                  "{currentExpertAdvice}"
                </Text>
              </View>
              <TouchableOpacity style={styles.endCallButton} onPress={finishHoopCall}>
                <Text style={styles.endCallButtonText}>Görüşmeyi Bitir & Spec'e Ekle (Writeback)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#3b82f6' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 14 },
  activeTabText: { color: '#3b82f6' },
  content: { flex: 1 },
  newStoryButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  newStoryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  emptyText: { color: '#888', fontStyle: 'italic' },
  storyCardContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  storyCard: { flex: 1, backgroundColor: '#1e293b', padding: 15, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  storyCardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  storyCardSub: { color: '#94a3b8', fontSize: 14 },
  deleteButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 10, marginLeft: 10, justifyContent: 'center' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  editSpecButton: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 8 },
  editSpecButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  saveSpecButton: { backgroundColor: '#10b981', padding: 10, borderRadius: 8 },
  saveSpecButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  specEditInput: { backgroundColor: '#0f172a', padding: 10, borderRadius: 5, textAlignVertical: 'top' },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '85%', padding: 15, borderRadius: 20, marginBottom: 15 },
  aiBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: '#e2e8f0' },
  userText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: '#1e1e1e', borderTopWidth: 1, borderTopColor: '#333', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#2d2d2d', color: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, minHeight: 45, maxHeight: 100, marginRight: 10 },
  sendButton: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  hoopButton: { backgroundColor: '#f43f5e', padding: 15, borderRadius: 15, alignItems: 'center', marginVertical: 20 },
  hoopButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  specTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  specSection: { backgroundColor: '#1e293b', padding: 15, borderRadius: 10, marginBottom: 15 },
  hoopSection: { backgroundColor: '#451a03', borderColor: '#d97706', borderWidth: 1 },
  sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  sectionContent: { color: '#fff', fontSize: 16, lineHeight: 24 },
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  callingContainer: { alignItems: 'center' },
  callingText: { color: '#fff', marginTop: 20, fontSize: 18 },
  talkingContainer: { flex: 1, padding: 20 },
  videoPlaceholder: { flex: 1, backgroundColor: '#1f2937', borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 20, marginBottom: 20, marginTop: 40 },
  videoText: { color: '#ef4444', fontWeight: 'bold', fontSize: 20, marginBottom: 20 },
  expertQuote: { color: '#fff', fontSize: 18, textAlign: 'center', fontStyle: 'italic', lineHeight: 28 },
  endCallButton: { backgroundColor: '#ef4444', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 40 },
  endCallButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

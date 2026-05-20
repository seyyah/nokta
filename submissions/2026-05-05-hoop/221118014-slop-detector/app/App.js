import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ActivityIndicator, ScrollView, SafeAreaView, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [pitch, setPitch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const flatListRef = useRef(null);

  const fallbackMockAI = (text) => {
    const lowerPitch = text.toLowerCase();
    let score = 20; // Base slop score
    const slopWords = [
      'ai', 'yapay zeka', 'revolutionary', 'devrimsel', 'disrupt', 'sarsıyoruz', 
      'billion', 'milyar', 'unicorn', 'guaranteed', 'garantili', 'passive income', 
      'pasif gelir', 'crypto', 'kripto', 'web3', 'synergy', 'sinerji', 
      'game-changer', 'oyun değiştirici', 'ezber bozan'
    ];
    
    let foundWords = [];
    slopWords.forEach(word => {
      if (lowerPitch.includes(word)) {
        score += 15;
        foundWords.push(word);
      }
    });

    if (score > 100) score = 100;

    let explanation = "";
    if (score < 30) {
      explanation = "Görünüşe göre ayakları yere basan, abartıdan uzak ve gerçekçi bir metin. İddialar ölçülü.";
    } else if (score < 60) {
      explanation = `Metin genel olarak mantıklı ancak bazı pazar iddiaları iddialı olabilir. Tespit edilen şüpheli ifadeler: ${foundWords.join(', ')}. Biraz daha somut veri eklemekte fayda var.`;
    } else {
      explanation = `DİKKAT! Bu metin yoğun miktarda "slop" (şişirme) içeriyor. Sektör buzzword'leri (${foundWords.join(', ')}) kullanılarak altı boş vaatlerde bulunulmuş. Pazar iddiaları gerçeklikten uzak veya desteksiz.`;
    }

    return { score, explanation };
  };

  const openChat = () => {
    setShowChatModal(true);
    if (chatMessages.length === 0) {
      setChatMessages([
        { id: '1', role: 'model', text: 'Merhaba! Ben Nokta Ventures\'tan Kıdemli Yatırım Uzmanı Can. Pitch veya proje özetinle ilgili nasıl yardımcı olabilirim? Projeni dinlemeye hazırım.' }
      ]);
    }
  };

  const closeChat = () => {
    setShowChatModal(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsgText = chatInput.trim();
    const newUserMsg = { id: Date.now().toString(), role: 'user', text: userMsgText };
    
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    if (!apiKey.trim()) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          id: Date.now().toString() + 'm', 
          role: 'model', 
          text: 'Şu anda API anahtarın olmadığı için sana yapay zeka beynimle cevap veremiyorum, ama projen kulağa ilginç geliyor. Daha fazla detay verebilir misin? (Offline Mod)' 
        }]);
        setIsChatLoading(false);
      }, 1000);
      return;
    }

    try {
      const systemPrompt = `Sen tecrübeli, profesyonel ama sıcakkanlı bir melek yatırımcı/analistsin. Karşındaki kişi sana startup veya proje fikirlerinden bahsediyor. 
      Görevin onlarla insan gibi, doğal bir dille sohbet etmek. Onlara yapıcı eleştiriler yap, sorular sor. 
      KESİNLİKLE bir yapay zeka veya bot olduğunu belli etme, "Ben bir yapay zekayım" gibi cümleler KULLANMA. İnsani tepkiler ver. 
      Eğer kullanıcı projeyle ilgili abartılı buzzwordler kullanırsa (slop), onları tatlı sert bir dille uyar.
      Bağlam için, kullanıcının sisteme ilk girdiği pitch metni şuydu (eğer boş değilse): "${pitch}"`;

      const history = chatMessages.slice(1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const contents = [...history, { role: 'user', parts: [{ text: userMsgText }] }];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API Hatası");
      }

      const aiText = data.candidates[0].content.parts[0].text;
      
      setChatMessages(prev => [...prev, { 
        id: Date.now().toString() + 'm', 
        role: 'model', 
        text: aiText 
      }]);

    } catch (error) {
      console.warn("Chat API Hatası:", error.message);
      setChatMessages(prev => [...prev, { 
        id: Date.now().toString() + 'e', 
        role: 'model', 
        text: 'Bağlantımda ufak bir sorun oluştu (API Hatası). Birazdan tekrar dener misin?' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const analyzePitch = async () => {
    if (!pitch.trim()) return;
    
    Keyboard.dismiss();
    setIsAnalyzing(true);
    setResult(null);
    setUsedFallback(false);

    if (!apiKey.trim()) {
      // No API key provided, go straight to fallback
      setTimeout(() => {
        setResult(fallbackMockAI(pitch));
        setUsedFallback(true);
        setIsAnalyzing(false);
      }, 1500);
      return;
    }

    const prompt = `Sen acımasız ve son derece analitik bir VC/Melek Yatırımcı analistisin. Sana bir startup/proje sunumu (pitch) vereceğim. 
    Görevin bu metindeki pazar iddialarını test etmek, gerçekçi olmayan, altı boş, sadece "buzzword" (slop) kullanılarak yazılmış abartılı ifadeleri bulmak.
    
    Bana SADECE geçerli bir JSON objesi döndür. JSON formatı şu şekilde olmalı:
    {
      "score": <0 ile 100 arasında bir sayı. Abartı ve buzzword ne kadar çoksa skor o kadar yüksek (100 = Tamamen çöp/slop, 0 = Çok gerçekçi ve ayakları yere basıyor)>,
      "explanation": "<Skorun gerekçesini, hangi kelimelerin/iddiaların altı boş olduğunu anlatan 2-3 cümlelik sert ve analitik bir Türkçe açıklama>"
    }

    Metin: "${pitch}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API Hatası");
      }

      const aiText = data.candidates[0].content.parts[0].text;
      const parsedResult = JSON.parse(aiText);

      setResult({
        score: parsedResult.score,
        explanation: parsedResult.explanation
      });
    } catch (error) {
      console.warn("API Hatası alındı, Backup (Mock) sisteme geçiliyor:", error.message);
      // Fallback
      setResult(fallbackMockAI(pitch));
      setUsedFallback(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 30) return '#4ade80'; // Green
    if (score < 60) return '#facc15'; // Yellow
    return '#f87171'; // Red
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Slop Detector</Text>
          <Text style={styles.subtitle}>AI Destekli Due Diligence</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Gemini API Key (Opsiyonel):</Text>
          <TextInput
            style={styles.inputSmall}
            placeholder="Buraya girin (Boş bırakırsanız offline çalışır)"
            placeholderTextColor="#64748b"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
          />

          <Text style={styles.label}>Pitch veya Proje Özeti:</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Örn: Yapay zeka destekli devrimsel web3 uygulamamız ile milyar dolarlık pazar hacmini sarsıyoruz..."
            placeholderTextColor="#64748b"
            value={pitch}
            onChangeText={setPitch}
          />
          
          <TouchableOpacity 
            style={[styles.button, (!pitch.trim() || isAnalyzing) && styles.buttonDisabled]} 
            onPress={analyzePitch}
            disabled={!pitch.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Yapay Zeka ile Test Et</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>VEYA</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={[styles.buttonSecondary, (!pitch.trim() && !chatMessages.length) && styles.buttonDisabledSecondary]} 
            onPress={openChat}
          >
            <Text style={styles.buttonTextSecondary}>Uzman ile Sohbet Et</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[styles.card, styles.resultCard]}>
            <Text style={styles.resultTitle}>Analiz Sonucu</Text>
            
            {usedFallback && (
              <View style={styles.fallbackWarning}>
                <Text style={styles.fallbackText}>⚠️ API yoğunluğu sebebiyle Offline Backup Sistemi kullanıldı.</Text>
              </View>
            )}

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Slop Skoru:</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.score) }]}>
                %{result.score}
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${result.score}%`, backgroundColor: getScoreColor(result.score) }
                ]} 
              />
            </View>

            <Text style={styles.explanationTitle}>Gerekçe:</Text>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>
        )}

      </ScrollView>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeChat}
      >
        <View style={styles.modalContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>Uzman Yatırımcı Can</Text>
            <Text style={styles.chatHeaderSubtitle}>Çevrimiçi</Text>
            <TouchableOpacity style={styles.closeChatButton} onPress={closeChat}>
              <Text style={styles.closeChatText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          
          <KeyboardAvoidingView 
            style={styles.chatBody} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatListContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => (
                <View style={[
                  styles.chatBubbleContainer, 
                  item.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleModel
                ]}>
                  <Text style={[
                    styles.chatBubbleText, 
                    item.role === 'user' ? styles.chatBubbleTextUser : styles.chatBubbleTextModel
                  ]}>
                    {item.text}
                  </Text>
                </View>
              )}
            />
            
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Mesaj yazın..."
                placeholderTextColor="#64748b"
                value={chatInput}
                onChangeText={setChatInput}
                multiline
              />
              <TouchableOpacity 
                style={[styles.chatSendBtn, (!chatInput.trim() || isChatLoading) && styles.chatSendBtnDisabled]}
                onPress={sendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
              >
                {isChatLoading ? (
                  <ActivityIndicator color="#0f172a" size="small" />
                ) : (
                  <Text style={styles.chatSendText}>Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#38bdf8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputSmall: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    color: '#f8fafc',
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    color: '#f8fafc',
    padding: 16,
    paddingTop: 16,
    minHeight: 120,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  buttonDisabledSecondary: {
    borderColor: '#475569',
    opacity: 0.5,
  },
  buttonTextSecondary: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  chatHeader: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chatHeaderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  chatHeaderSubtitle: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeChatButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 24 : 16,
    padding: 8,
  },
  closeChatText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
  chatBody: {
    flex: 1,
  },
  chatListContent: {
    padding: 16,
    gap: 12,
  },
  chatBubbleContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#38bdf8',
    borderBottomRightRadius: 4,
  },
  chatBubbleModel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    color: '#0f172a',
    fontWeight: '500',
  },
  chatBubbleTextModel: {
    color: '#f8fafc',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chatSendBtn: {
    backgroundColor: '#38bdf8',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatSendBtnDisabled: {
    backgroundColor: '#475569',
  },
  chatSendText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  resultTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  fallbackText: {
    color: '#fef08a',
    fontSize: 13,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  explanationTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
});

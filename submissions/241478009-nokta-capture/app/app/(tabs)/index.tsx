import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const API_KEY = "AIzaSyBMJceHdeWPp_QYtB88CPdqGJ9owmIUlQE";

const SYSTEM_PROMPT = `Sen Nokta kuluçka ekosisteminin Baş Sistem Mimarı'sın. Açık, net ve tavizsiz bir mühendissin. Kurumsal nezaket kurallarına veya kullanıcıyı övmeye zaman ayırma. Lafı dolandırma. Kullanıcı bir fikir girdiğinde: 1. Fikrin ne yapmaya çalıştığını anladığını gösteren tek bir rasyonel cümle kur. 2. Anında fikrin patlama ihtimali olan en zayıf noktasına (darboğaz, sunucu maliyeti, veri kaynağı, pazar sürtünmesi veya mimari hata) odaklan. 3. Kullanıcıya SADECE BİR TANE zorlayıcı, teknik ve gerçekçi soru sor. Amacın fikri aşağılamak değil, uçuk/hayalperest kısımları acımadan kesip atarak onu kodlanabilir ve ayağı yere basan bir MVP (Minimum Viable Product) sınırlarına çekmek.`;

type ChatMessage = {
  id: string;
  sender: 'user' | 'system';
  text: string;
};

type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ResultData = {
  spec_markdown: string;
  anti_slop_score: number;
  risk_radar: {
    teknik_risk: number;
    pazar_riski: number;
    operasyonel_risk: number;
    veri_riski: number;
  };
};

type HistoryItem = {
  id: string;
  title: string;
  data: ResultData;
};

export default function StateMachineSkeleton() {
  const [currentState, setCurrentState] = useState(0);

  // State 0
  const [captureInput, setCaptureInput] = useState('');

  // State 1
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // State 2
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('@nokta_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Geçmiş fikirler yüklenemedi:", e);
      }
    };
    loadHistory();
  }, []);

  const fetchNextQuestion = async (currentMessages: LLMMessage[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: currentMessages,
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || response.statusText);
      }
      const aiText = data.choices?.[0]?.message?.content || 'Bir hata oluştu.';

      const newMessages: LLMMessage[] = [...currentMessages, { role: 'assistant', content: aiText }];
      setMessages(newMessages);
      setChatLog(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: aiText }]);
      setQuestionCount(prev => prev + 1);
    } catch (error: any) {
      console.error(error);
      setChatLog(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: `API REDDETTİ: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinalSynthesis = async (currentMessages: LLMMessage[]) => {
    setIsLoading(true);
    try {
      const synthesisPrompt = `Sorgu aşaması bitti. Artık soru sorma. Tüm konuşmayı analiz et ve Nokta felsefesine (slop-free, yatırımcıya hazır Tradeable Artifact) uygun TEK SAYFALIK BİR MÜHENDİSLİK SPEC'i üret. Grafik için belirlediğin risk puanlarını (Risk Radar) raporun içinde acımasızca analiz et.

DİKKAT: JSON İÇİNDE KESİNLİKLE "[İçerik]", "[Buraya yazın]" GİBİ YER TUTUCULAR (PLACEHOLDER) KULLANMA! Bu alanları, kullanıcının girdiği fikir ve verdiği cevaplardan sentezlediğin GERÇEK, DETAYLI VE TEKNİK cümlelerle doldur.

KESİNLİKLE SADECE JSON formatında çıktı ver. Başında veya sonunda markdown işaretleri (\`\`\`json) OLMASIN. Saf JSON Yapısı KESİNLİKLE şu şekilde olmalı:
{
"spec_markdown": "### 1. Problem ve Pazar Zıtlığı\\nGerçek analiz buraya...\\n\\n### 2. Kapsam ve Kısıtlar (Scope & Constraints)\\nGerçek analiz buraya...\\n\\n### 3. Risk Radar Analizi\\nGerçek analiz buraya...\\n\\n### 4. Geliştirme Çıktısı (MVP)\\nGerçek analiz buraya...",
"anti_slop_score": [0-100 arası sayı],
"risk_radar": { "teknik_risk": [0-100], "pazar_riski": [0-100], "operasyonel_risk": [0-100], "veri_riski": [0-100] }
}`;

      const finalMessages: LLMMessage[] = [...currentMessages, { role: 'system', content: synthesisPrompt }];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: finalMessages,
          response_format: { type: 'json_object' },
          temperature: 0.5,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || response.statusText);
      }
      const aiText = data.choices?.[0]?.message?.content || '{}';

      try {
        const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setResultData(parsed);
        setCurrentState(2);

        // Save to History
        const titleText = captureInput.trim().substring(0, 35) + (captureInput.length > 35 ? '...' : '');
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          title: titleText || 'İsimsiz Fikir',
          data: parsed,
        };

        setHistory(prevHistory => {
          const updatedHistory = [newItem, ...prevHistory];
          AsyncStorage.setItem('@nokta_history', JSON.stringify(updatedHistory)).catch(console.error);
          return updatedHistory;
        });

      } catch (e) {
        console.error("JSON Parse Error:", e, aiText);
        setChatLog(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: 'Sonuç sentezlenirken hata oluştu.' }]);
      }
    } catch (error: any) {
      console.error(error);
      setChatLog(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: `API REDDETTİ: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!captureInput.trim()) return;

    setCurrentState(1);
    setChatLog([]);
    setQuestionCount(0);

    const initialMessages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Kullanıcı fikri: ${captureInput}` }
    ];
    setMessages(initialMessages);

    await fetchNextQuestion(initialMessages);
  };

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    setChatInput('');

    setChatLog(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);

    const newMessages: LLMMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    // 3. soruya cevap verdiyse senteze geç, yoksa yeni soru sor
    if (questionCount < 3) {
      await fetchNextQuestion(newMessages);
    } else {
      await fetchFinalSynthesis(newMessages);
    }
  };

  const resetState = () => {
    setCurrentState(0);
    setCaptureInput('');
    setChatLog([]);
    setMessages([]);
    setQuestionCount(0);
    setResultData(null);
  };

  const renderChatItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.chatBubble, isUser ? styles.userBubble : styles.sysBubble]}>
        <Text style={[styles.chatText, isUser ? styles.userText : styles.sysText]}>{item.text}</Text>
      </View>
    );
  };

  const radarData = resultData?.risk_radar || { teknik_risk: 0, pazar_riski: 0, operasyonel_risk: 0, veri_riski: 0 };

  return (
    <View style={styles.container}>

      {/* Modal - History */}
      <Modal visible={showHistory} animationType="fade" transparent={true} onRequestClose={() => setShowHistory(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Geçmiş Fikirler</Text>
            {history.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#0077b6', marginVertical: 20 }}>Henüz kaydedilmiş bir fikir yok.</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => {
                      setResultData(item.data);
                      setCurrentState(2);
                      setShowHistory(false);
                    }}
                  >
                    <Text style={styles.historyItemText}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowHistory(false)}>
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Durum 0 (Capture) */}
      {currentState === 0 && (
        <View style={styles.stateContainer}>
          {history.length > 0 && (
            <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
              <Text style={styles.historyButtonText}>Geçmiş Fikirler</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Fikrinizi Anlatın</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Mühendislik sınırlarına çekilecek fikrinizi yazın..."
            placeholderTextColor="#A0A0A0"
            value={captureInput}
            onChangeText={setCaptureInput}
          />
          <TouchableOpacity style={styles.button} onPress={handleStartAnalysis}>
            <Text style={styles.buttonText}>Mimara Gönder</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Durum 1 (Interrogation) */}
      {currentState === 1 && (
        <KeyboardAvoidingView
          style={[styles.stateContainer, styles.chatContainer]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Text style={styles.title}>Baş Sistem Mimarı</Text>

          <FlatList
            ref={flatListRef}
            data={chatLog}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0077b6" />
              <Text style={styles.loadingText}>Analiz Ediliyor...</Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Savunmanızı yazın..."
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.buttonText}>Yanıtla</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      {/* Durum 2 (Result) */}
      {currentState === 2 && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultTitle}>Sentez Raporu</Text>
          <Text style={styles.scoreText}>Anti-Slop Skoru: {resultData?.anti_slop_score ?? 0}</Text>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Risk Radar (Simüle)</Text>
            {/* @ts-expect-error - react-native-chart-kit tip tanımlamaları güncel React sürümleriyle uyumsuzluk yapıyor */}
            <BarChart
              data={{
                labels: ['Teknik', 'Pazar', 'Operasyon', 'Veri'],
                datasets: [{ data: [radarData.teknik_risk, radarData.pazar_riski, radarData.operasyonel_risk, radarData.veri_riski] }]
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars={true}
              fromZero={true}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 119, 182, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 119, 182, ${opacity})`,
                decimalPlaces: 0,
                barPercentage: 0.6,
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.markdownBox}>
            <Text style={[styles.markdownText, { fontWeight: 'bold', marginBottom: 10 }]}>Mühendislik Spec'i</Text>
            <Text style={styles.markdownText}>
              {resultData?.spec_markdown || "Rapor mevcut değil."}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={resetState}
          >
            <Text style={styles.buttonText}>Yeni Fikir Dene</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    width: '100%',
  },
  stateContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 40,
  },
  chatContainer: {
    marginTop: 40,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0077b6',
    letterSpacing: -0.5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  input: {
    width: '100%',
    minHeight: 120,
    borderColor: '#caf0f8',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#0077b6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#0077b6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Chat Stilleri
  chatList: {
    width: '100%',
    flex: 1,
    marginBottom: 16,
  },
  chatListContent: {
    paddingBottom: 20,
  },
  chatBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#0077b6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  sysBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#caf0f8',
  },
  chatText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  sysText: {
    color: '#0077b6',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  chatInput: {
    flex: 1,
    borderColor: '#caf0f8',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    fontSize: 16,
    color: '#0077b6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: '#00b4d8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Yükleme Göstergesi Stilleri
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#0077b6',
    fontSize: 14,
    fontWeight: '500',
  },

  // Durum 2 (Result) Stilleri
  scoreText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00b4d8',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: -1,
  },
  chartContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#caf0f8',
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0077b6',
  },
  chart: {
    borderRadius: 16,
  },
  markdownBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#caf0f8',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  markdownText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#0077b6',
    fontFamily: 'monospace',
  },
  backButton: {
    marginTop: 10,
  },

  // History Styles
  historyButton: {
    position: 'absolute',
    top: 20,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#caf0f8',
    borderRadius: 16,
    zIndex: 10,
  },
  historyButtonText: {
    color: '#0077b6',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 15,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#caf0f8',
  },
  historyItemText: {
    fontSize: 15,
    color: '#0077b6',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#00b4d8',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  }
});
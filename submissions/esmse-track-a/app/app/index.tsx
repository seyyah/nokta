import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MindSynapse() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Fikir, 2: 5 Soru, 3: Harita

  const [mainNode, setMainNode] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(['', '', '', '', '']);

  const [nodes, setNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ADIM 1: Fikri alıp AI'dan 5 spesifik soru istemek
  const askContextualQuestion = async () => {
    if (!mainNode.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Anahtarı bulunamadı.");

      const prompt = `Kullanıcı şu fikri/projeyi sundu: "${mainNode}". 
Bu fikri geliştirmek ve sağlam bir zihin haritası oluşturmak için kullanıcıya sorman gereken EN KRİTİK 5 soruyu üret. 
Çıktı SADECE 5 elemanlı düz bir JSON dizisi (Array) olsun. Başka hiçbir kelime yazma.
Örnek: ["Hedef kitlen kim?", "Gelir modelin nedir?", "En büyük rakibin kim?", "Pazara giriş stratejin ne?", "Teknik altyapın nasıl olacak?"]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      let parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        if (parsed.questions) parsed = parsed.questions;
        else parsed = Object.values(parsed);
      }

      if (Array.isArray(parsed) && parsed.length >= 5) {
        setAiQuestions(parsed.slice(0, 5));
        setUserAnswers(['', '', '', '', '']);
        setStep(2);
      } else {
        throw new Error("Yapay zeka geçerli bir 5'li soru formatı üretemedi.");
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.toLowerCase().includes('quota') || e.message?.toLowerCase().includes('expired')) {
        setErrorMsg("API Anahtarınızın süresi dolmuş veya kotası aşılmış.");
      } else {
        setErrorMsg("Soru üretilirken hata: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserAnswer = (index: number, text: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = text;
    setUserAnswers(newAnswers);
  };

  // ADIM 2: Kullanıcının cevaplarına göre haritayı (Sinir Ağını) üretmek
  const generateMindMap = async () => {
    if (userAnswers.some(ans => !ans.trim())) {
      setErrorMsg("Lütfen tüm soruları cevaplayın.");
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Anahtarı bulunamadı.");

      let contextStr = `Kullanıcı fikri: "${mainNode}".\n\nSorduğum Sorular ve Kullanıcı Cevapları:\n`;
      aiQuestions.forEach((q, i) => {
        contextStr += `Soru ${i + 1}: ${q}\nCevap ${i + 1}: ${userAnswers[i]}\n\n`;
      });

      const prompt = `${contextStr}
Lütfen SADECE bu bağlama ve kullanıcının cevaplarına GÖRE fikri çok daha ileri taşıyan, profesyonel 5 farklı alt dal/perspektif (node) üret. 
Çıktı SADECE 5 elemanlı düz bir JSON dizisi (Array) olsun. Başka hiçbir açıklama yazma.
Örnek: ["Maliyet Optimizasyonu", "Güvenlik Protokolü", "Hedef Kitle X", "Yazılım Mimarisi", "Dağıtım Kanalı"]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      let parsedNodes = JSON.parse(cleaned);

      if (!Array.isArray(parsedNodes)) {
        if (parsedNodes.nodes) parsedNodes = parsedNodes.nodes;
        else parsedNodes = Object.values(parsedNodes);
      }

      if (Array.isArray(parsedNodes) && parsedNodes.length >= 5) {
        setNodes(parsedNodes.slice(0, 5));
        setStep(3);
      } else {
        throw new Error("Yapay zeka geçerli bir 5'li harita formatı üretemedi.");
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.toLowerCase().includes('quota') || e.message?.toLowerCase().includes('expired')) {
        setErrorMsg("API Anahtarınızın süresi dolmuş veya kotası aşılmış.");
      } else {
        setErrorMsg("Harita üretilirken hata: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSynapse = () => {
    const center = { x: width / 2, y: height / 2.5 };
    const radius = 130;

    return (
      <View style={StyleSheet.absoluteFillObject}>
        {/* Merkez Node */}
        <View style={[styles.node, styles.mainNodeStyle, { left: center.x - 60, top: center.y - 60 }]}>
          <Text style={styles.mainNodeText}>{mainNode}</Text>
        </View>

        {/* Alt Nodelar */}
        {nodes.map((node, i) => {
          const angle = (2 * Math.PI / nodes.length) * i - (Math.PI / 2);
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);

          return (
            <React.Fragment key={i}>
              {/* Çizgi Simulasyonu */}
              <View style={[styles.line, {
                left: (center.x + x) / 2 - radius / 2,
                top: (center.y + y) / 2,
                width: radius,
                height: 2,
                transform: [{ rotate: `${angle * (180 / Math.PI)}deg` }]
              }]} />

              <View style={[styles.node, styles.subNode, { left: x - 45, top: y - 45 }]}>
                <Text style={styles.nodeText} numberOfLines={3} ellipsizeMode='tail'>{node}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const resetAll = () => {
    setStep(1);
    setMainNode('');
    setAiQuestions([]);
    setUserAnswers(['', '', '', '', '']);
    setNodes([]);
    setErrorMsg('');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingText}>
            {step === 1 ? "Soru Sentezleniyor..." : "Sinir Ağı Kuruluyor..."}
          </Text>
        </View>
      ) : (
        <>
          {/* Hata Mesajı */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => setErrorMsg('')}>
                <Text style={styles.resetBtnText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ADIM 1: Kök Fikir Girişi */}
          {step === 1 && !errorMsg && (
            <View style={styles.inputContainer}>
              <Text style={styles.title}>NOKTA: ZİHİN BAŞLATICISI</Text>
              <TextInput
                style={styles.input}
                placeholder="Aklındaki kök fikri yaz (Örn: Yürüyen Uçak)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={mainNode}
                onChangeText={setMainNode}
              />
              <TouchableOpacity style={styles.button} onPress={askContextualQuestion}>
                <Text style={styles.buttonText}>FİKRİ SORGULA</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ADIM 2: AI'ın 5 Sorusu ve Kullanıcı Cevapları */}
          {step === 2 && !errorMsg && (
            <View style={[styles.inputContainer, { padding: 20, maxHeight: height * 0.85 }]}>
              <Text style={styles.title}>BAĞLAMI DETAYLANDIR</Text>
              <ScrollView style={{ width: '100%', marginBottom: 15 }} showsVerticalScrollIndicator={false}>
                {aiQuestions.map((q, i) => (
                  <View key={i} style={styles.qaBlock}>
                    <Text style={styles.aiQuestionText}>{i + 1}. {q}</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="Cevabınız..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={userAnswers[i]}
                      onChangeText={(t) => updateUserAnswer(i, t)}
                      multiline={true}
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.button} onPress={generateMindMap}>
                <Text style={styles.buttonText}>AĞI (MIND MAP) ÜRET</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ADIM 3: Sinir Ağının Çizilmesi */}
          {step === 3 && nodes.length > 0 && !errorMsg && (
            <>
              {renderSynapse()}
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>SİNİR AĞI BAŞARIYLA KURULDU</Text>
                <TouchableOpacity style={styles.button} onPress={resetAll}>
                  <Text style={styles.buttonText}>YENİ FİKİR YAKALA</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D8B4FE',
    marginTop: 20,
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'red',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 15,
  },
  resetBtn: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 35, 0.8)',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  title: {
    color: '#E9D5FF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 3,
  },
  qaBlock: {
    width: '100%',
    marginBottom: 20,
  },
  aiQuestionText: {
    color: '#E9D5FF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#9333EA',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 50,
  },
  inputSmall: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#C084FC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#9333EA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#A855F7',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 14,
  },
  node: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    zIndex: 2,
  },
  mainNodeStyle: {
    width: 120,
    height: 120,
    backgroundColor: '#4C1D95',
    borderWidth: 2,
    borderColor: '#C084FC',
    shadowColor: '#C084FC',
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  subNode: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(46, 16, 101, 0.8)',
    borderWidth: 1,
    borderColor: '#9333EA',
  },
  nodeText: {
    color: '#F3E8FF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  mainNodeText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#9333EA',
    zIndex: 1,
    shadowColor: '#D8B4FE',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignItems: 'center',
  },
  resultTitle: {
    color: '#E9D5FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 2,
  }
});

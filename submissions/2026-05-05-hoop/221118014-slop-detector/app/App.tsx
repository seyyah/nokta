import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';

// Import AuditWidget and types
import { AuditWidget } from '@xtatistix/mobile-audit';
import type { AuditWidgetDeps, AuditStorage, AuditNote } from '@xtatistix/mobile-audit';

// Storage paths
const PITCHES_FILE = `${FileSystem.documentDirectory}user_pitches.json`;
const CONFIG_FILE = `${FileSystem.documentDirectory}app_config.json`;
const AUDIT_NOTES_FILE = `${FileSystem.documentDirectory}audit_notes.json`;

// Types
type Screen = 'onboarding' | 'pitch-list' | 'pitch-detail';

interface PitchResult {
  score: number;
  explanation: string;
  highlightedSentence?: string; // Sentence that is most slop
}

interface PitchItem {
  id: string;
  text: string;
  result: PitchResult;
  timestamp: string;
  usedFallback: boolean;
  expertRequested?: boolean;
  expertEmail?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [apiKey, setApiKey] = useState('');
  const [pitches, setPitches] = useState<PitchItem[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<PitchItem | null>(null);
  
  // Input states
  const [pitchInput, setPitchInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Expert Form states
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [expertEmail, setExpertEmail] = useState('');
  const [isSubmittingExpert, setIsSubmittingExpert] = useState(false);

  // Root view ref for captureRef (needed by AuditWidget)
  const viewRef = useRef<View>(null);

  // Load saved config and pitches on startup
  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Load API Key & config
        const configInfo = await FileSystem.getInfoAsync(CONFIG_FILE);
        if (configInfo.exists) {
          const configContent = await FileSystem.readAsStringAsync(CONFIG_FILE);
          const config = JSON.parse(configContent);
          if (config.apiKey) setApiKey(config.apiKey);
        }

        // Load Pitches
        const pitchesInfo = await FileSystem.getInfoAsync(PITCHES_FILE);
        if (pitchesInfo.exists) {
          const pitchesContent = await FileSystem.readAsStringAsync(PITCHES_FILE);
          setPitches(JSON.parse(pitchesContent));
        }
      } catch (e) {
        console.warn('Failed to load application data', e);
      }
    };
    loadAppData();
  }, []);

  // Save Config
  const saveConfig = async (key: string) => {
    try {
      await FileSystem.writeAsStringAsync(CONFIG_FILE, JSON.stringify({ apiKey: key }));
    } catch (e) {
      console.warn('Failed to save config', e);
    }
  };

  // Save Pitches
  const savePitches = async (newPitches: PitchItem[]) => {
    try {
      await FileSystem.writeAsStringAsync(PITCHES_FILE, JSON.stringify(newPitches));
      setPitches(newPitches);
    } catch (e) {
      console.warn('Failed to save pitches list', e);
    }
  };

  // Offline Fallback scoring logic
  const fallbackMockAI = (text: string): PitchResult => {
    const lowerPitch = text.toLowerCase();
    let score = 20; // Base slop score
    const slopWords = [
      'ai', 'yapay zeka', 'revolutionary', 'devrimsel', 'disrupt', 'sarsıyoruz', 
      'billion', 'milyar', 'unicorn', 'guaranteed', 'garantili', 'passive income', 
      'pasif gelir', 'crypto', 'kripto', 'web3', 'synergy', 'sinerji', 
      'game-changer', 'oyun değiştirici', 'ezber bozan'
    ];
    
    const foundWords: string[] = [];
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

  // Challenger Bonus: Extract most slop sentence
  const getMostSlopSentence = (text: string): string => {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length <= 1) return text;

    const slopWords = [
      'ai', 'yapay zeka', 'revolutionary', 'devrimsel', 'disrupt', 'sarsıyoruz', 
      'billion', 'milyar', 'unicorn', 'guaranteed', 'garantili', 'passive income', 
      'pasif gelir', 'crypto', 'kripto', 'web3', 'synergy', 'sinerji', 
      'game-changer', 'oyun değiştirici', 'ezber bozan'
    ];

    let maxScore = -1;
    let mostSlop = '';

    sentences.forEach(s => {
      let score = 0;
      const lower = s.toLowerCase();
      slopWords.forEach(w => {
        if (lower.includes(w)) {
          score += 1;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        mostSlop = s;
      }
    });

    return mostSlop;
  };

  // Analyze Pitch
  const analyzePitch = async () => {
    if (!pitchInput.trim()) return;
    
    Keyboard.dismiss();
    setIsAnalyzing(true);

    const pitchText = pitchInput.trim();
    let resultData: PitchResult;
    let usedFallbackVal = false;

    if (!apiKey.trim()) {
      // Offline fallback
      await new Promise(resolve => setTimeout(resolve, 1200));
      resultData = fallbackMockAI(pitchText);
      usedFallbackVal = true;
    } else {
      const prompt = `Sen acımasız ve son derece analitik bir VC/Melek Yatırımcı analistisin. Sana bir startup/proje sunumu (pitch) vereceğim. 
      Görevin bu metindeki pazar iddialarını test etmek, gerçekçi olmayan, altı boş, sadece "buzzword" (slop) kullanılarak yazılmış abartılı ifadeleri bulmak.
      
      Bana SADECE geçerli bir JSON objesi döndür. JSON formatı şu şekilde olmalı:
      {
        "score": <0 ile 100 arasında bir sayı. Abartı ve buzzword ne kadar çoksa skor o kadar yüksek (100 = Tamamen çöp/slop, 0 = Çok gerçekçi ve ayakları yere basıyor)>,
        "explanation": "<Skorun gerekçesini, hangi kelimelerin/iddiaların altı boş olduğunu anlatan 2-3 cümlelik sert ve analitik bir Türkçe açıklama>"
      }

      Metin: "${pitchText}"`;

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

        resultData = {
          score: parsedResult.score,
          explanation: parsedResult.explanation,
        };
      } catch (error: any) {
        console.warn("API Hatası alındı, Backup (Mock) sisteme geçiliyor:", error.message);
        resultData = fallbackMockAI(pitchText);
        usedFallbackVal = true;
      }
    }

    const newPitchItem: PitchItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: pitchText,
      result: {
        ...resultData,
        highlightedSentence: getMostSlopSentence(pitchText),
      },
      timestamp: new Date().toISOString(),
      usedFallback: usedFallbackVal,
    };

    const updatedPitches = [newPitchItem, ...pitches];
    await savePitches(updatedPitches);
    
    setPitchInput('');
    setIsAnalyzing(false);
    setSelectedPitch(newPitchItem);
    setCurrentScreen('pitch-detail');
  };

  // Submit expert request
  const submitExpertRequest = () => {
    if (!expertEmail.trim() || !expertEmail.includes('@')) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    Keyboard.dismiss();
    setIsSubmittingExpert(true);

    setTimeout(async () => {
      setIsSubmittingExpert(false);
      setShowExpertForm(false);
      
      if (selectedPitch) {
        const updated = pitches.map(p => {
          if (p.id === selectedPitch.id) {
            return { ...p, expertRequested: true, expertEmail };
          }
          return p;
        });
        await savePitches(updated);
        setSelectedPitch({ ...selectedPitch, expertRequested: true, expertEmail });
      }

      setExpertEmail('');
      Alert.alert(
        'Talep Alındı',
        'Pitch metniniz uzmanlarımıza iletildi. En kısa sürede girdiğiniz e-posta adresi üzerinden size detaylı bir değerlendirme raporu ileteceğiz.'
      );
    }, 1500);
  };

  // Helper colors
  const getScoreColor = (score: number) => {
    if (score < 30) return '#4ade80'; // Green
    if (score < 60) return '#facc15'; // Yellow
    return '#f87171'; // Red
  };

  // Audit Widget Dependencies implementation
  const auditDeps: AuditWidgetDeps = {
    captureScreen: async () => {
      return await captureScreen({
        format: 'jpg',
        quality: 0.8,
      });
    },
    captureRef: async (ref: React.RefObject<any>) => {
      return await captureRef(ref, {
        format: 'jpg',
        quality: 0.8,
      });
    },
    writeFile: async (filename: string, content: string) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: async (uri: string) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        console.warn('[AuditWidget] Sharing is not available');
      }
    },
    storage: {
      loadNotes: async (): Promise<AuditNote[]> => {
        try {
          const info = await FileSystem.getInfoAsync(AUDIT_NOTES_FILE);
          if (info.exists) {
            const content = await FileSystem.readAsStringAsync(AUDIT_NOTES_FILE);
            return JSON.parse(content);
          }
        } catch (e) {
          console.warn('Failed to load notes', e);
        }
        return [];
      },
      saveNotes: async (notes: AuditNote[]): Promise<void> => {
        try {
          await FileSystem.writeAsStringAsync(AUDIT_NOTES_FILE, JSON.stringify(notes));
        } catch (e) {
          console.warn('Failed to save notes', e);
        }
      },
    },
    currentScreen: currentScreen,
    reporterId: 'Student-221118014',
    BugIcon: (
      <View style={styles.bugIconInner}>
        <Text style={styles.bugIconEmoji}>🐞</Text>
      </View>
    ),
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      {/* Root view for screenshot captures */}
      <View ref={viewRef} style={styles.innerRoot} collapsable={false}>
        
        {/* Onboarding Screen */}
        {currentScreen === 'onboarding' && (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Slop Detector</Text>
              <Text style={styles.subtitle}>Due Diligence AI Assistant</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.welcomeText}>
                Startup sunumlarındaki (pitch) şişirme ve temelsiz pazar iddialarını analiz etmeye hazır mısınız?
              </Text>
              <Text style={styles.welcomeSubtext}>
                Bu uygulama, metinlerinizdeki abartıları tespit ederek bir "Slop Score" oluşturur.
              </Text>

              <Text style={styles.label}>Gemini API Key (Opsiyonel):</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="AIzaSy... (Boş bırakırsanız offline çalışır)"
                placeholderTextColor="#64748b"
                value={apiKey}
                onChangeText={(text) => {
                  setApiKey(text);
                  saveConfig(text);
                }}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentScreen('pitch-list')}
              >
                <Text style={styles.buttonText}>Başlayalım</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Pitch List Screen */}
        {currentScreen === 'pitch-list' && (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Analiz Paneli</Text>
              <Text style={styles.subtitle}>Yeni bir pitch ekleyin veya geçmişi inceleyin</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Yeni Proje / Pitch Özeti:</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Örn: Yapay zeka destekli devrimsel web3 uygulamamız ile milyar dolarlık pazar hacmini sarsıyoruz..."
                placeholderTextColor="#64748b"
                value={pitchInput}
                onChangeText={setPitchInput}
              />
              
              <TouchableOpacity 
                style={[styles.button, (!pitchInput.trim() || isAnalyzing) && styles.buttonDisabled]} 
                onPress={analyzePitch}
                disabled={!pitchInput.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.buttonText}>Yapay Zeka ile Analiz Et</Text>
                )}
              </TouchableOpacity>
            </View>

            {pitches.length > 0 ? (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Analiz Geçmişi</Text>
                {pitches.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyCard}
                    onPress={() => {
                      setSelectedPitch(item);
                      setCurrentScreen('pitch-detail');
                    }}
                  >
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate} numberOfLines={1}>
                        {new Date(item.timestamp).toLocaleDateString('tr-TR')} {new Date(item.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={[styles.historyScore, { color: getScoreColor(item.result.score) }]}>
                        %{item.result.score} Slop
                      </Text>
                    </View>
                    <Text style={styles.historyText} numberOfLines={2}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz yapılmış bir analiz bulunmuyor.</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={() => setCurrentScreen('onboarding')}
            >
              <Text style={styles.buttonTextSecondary}>Ayarlar'a Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Pitch Detail Screen */}
        {currentScreen === 'pitch-detail' && selectedPitch && (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Analiz Sonucu</Text>
              <Text style={styles.subtitle}>Pitch detayları ve VC yapay zeka raporu</Text>
            </View>

            {selectedPitch.usedFallback && (
              <View style={styles.fallbackAlertCard}>
                <View style={styles.fallbackAlertHeader}>
                  <Text style={styles.fallbackAlertEmoji}>⚠️</Text>
                  <Text style={styles.fallbackAlertTitle}>Offline Yedekleme Aktif</Text>
                </View>
                <Text style={styles.fallbackAlertDesc}>
                  Herhangi bir API Anahtarı girilmediği veya limit aşımı gerçekleştiği için yerel buzzword filtreleme algoritmaları kullanılarak analiz yapılmıştır.
                </Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.label}>Analiz Edilen Metin:</Text>
              <View style={styles.pitchTextContainer}>
                <Text style={styles.pitchTextDetail}>{selectedPitch.text}</Text>
              </View>

              {selectedPitch.result.highlightedSentence && selectedPitch.result.highlightedSentence !== selectedPitch.text && (
                <View style={styles.highlightedSentenceCard}>
                  <Text style={styles.highlightedSentenceTitle}>🎯 En Abartılı Cümle (Slop Vurgulayıcı):</Text>
                  <Text style={styles.highlightedSentenceText}>"{selectedPitch.result.highlightedSentence}"</Text>
                </View>
              )}

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Slop Skoru:</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(selectedPitch.result.score) }]}>
                  %{selectedPitch.result.score}
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${selectedPitch.result.score}%`, backgroundColor: getScoreColor(selectedPitch.result.score) }
                  ]} 
                />
              </View>

              <Text style={styles.explanationTitle}>Gerekçe ve VC Görüşü:</Text>
              <Text style={styles.explanationText}>{selectedPitch.result.explanation}</Text>
            </View>

            {/* Expert Request Section */}
            <View style={styles.card}>
              <Text style={styles.label}>İkinci Görüş (Uzman İncelemesi):</Text>
              
              {selectedPitch.expertRequested ? (
                <View style={styles.expertRequestedContainer}>
                  <Text style={styles.expertRequestedText}>
                    ✅ Uzman incelemesi talep edildi. Rapor {selectedPitch.expertEmail} adresine gönderilecektir.
                  </Text>
                </View>
              ) : (
                <>
                  {!showExpertForm ? (
                    <TouchableOpacity 
                      style={styles.buttonSecondary}
                      onPress={() => setShowExpertForm(true)}
                    >
                      <Text style={styles.buttonTextSecondary}>İnsan VC Analisti İncelemesi İste</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.expertForm}>
                      <Text style={styles.labelSmall}>E-Posta Adresiniz:</Text>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="ornek@sirket.com"
                        placeholderTextColor="#64748b"
                        value={expertEmail}
                        onChangeText={setExpertEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <View style={styles.expertButtonsRow}>
                        <TouchableOpacity 
                          style={[styles.expertSubmitBtn, isSubmittingExpert && styles.buttonDisabledSecondary]} 
                          onPress={submitExpertRequest}
                          disabled={isSubmittingExpert}
                        >
                          {isSubmittingExpert ? (
                            <ActivityIndicator color="#0f172a" />
                          ) : (
                            <Text style={styles.expertSubmitText}>Talep Gönder</Text>
                          )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.expertCancelBtn} 
                          onPress={() => setShowExpertForm(false)}
                          disabled={isSubmittingExpert}
                        >
                          <Text style={styles.expertCancelText}>İptal</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => setCurrentScreen('pitch-list')}
            >
              <Text style={styles.buttonText}>Panele Geri Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

      </View>

      {/* Mount the drop-in AuditWidget */}
      <AuditWidget deps={auditDeps} appName="Slop Detector" />

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
  innerRoot: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 120, // space for FAB
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelSmall: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputSmall: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 12,
    color: '#f8fafc',
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 12,
    color: '#f8fafc',
    padding: 16,
    minHeight: 120,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.7,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginTop: 10,
  },
  buttonTextSecondary: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingLeft: 4,
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyDate: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  historyScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  pitchTextContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  pitchTextDetail: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 22,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  explanationTitle: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  explanationText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
  fallbackAlertCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  fallbackAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fallbackAlertEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  fallbackAlertTitle: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fallbackAlertDesc: {
    color: '#fef08a',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    paddingLeft: 26,
  },
  highlightedSentenceCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 16,
  },
  highlightedSentenceTitle: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  highlightedSentenceText: {
    color: '#fee2e2',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  expertRequestedContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    padding: 12,
    borderRadius: 12,
  },
  expertRequestedText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  expertForm: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
  },
  expertButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  expertSubmitBtn: {
    flex: 2,
    backgroundColor: '#38bdf8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  expertSubmitText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  expertCancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  expertCancelText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabledSecondary: {
    borderColor: '#475569',
    opacity: 0.5,
  },
  bugIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bugIconEmoji: {
    fontSize: 22,
  },
});

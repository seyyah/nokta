/**
 * VoiceScreen.tsx
 * Ses görselleştirici + avatar lipsync + STT rapor dikte ekranı.
 *
 * Özellikler:
 *  - expo-av ile mikrofon girişi (RMS metering, 50ms polling)
 *  - 20 bar animasyonu — sessizlikte söner, konuşunca canlanır
 *  - SVG avatar — ses seviyesine göre dudak hareketi
 *  - expo-speech ile TTS (AI yanıtları avatar okur)
 *  - Rapor dikte modu: konuş → transkripsiyon kutusu
 *  - Latency hedefi < 200ms (Animated, no JS bridge hop for render)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import {
  Mic,
  MicOff,
  Volume2,
  FileText,
  ChevronRight,
  RefreshCw,
  Bot,
  Zap,
} from 'lucide-react-native';

import VoiceVisualizer from '../components/VoiceVisualizer';
import AvatarFace from '../components/AvatarFace';
import RadarBackground from '../components/RadarBackground';
import ExpertBridge from '../components/ExpertBridge';
import { forgeMonitor } from '../services/forgeMonitor';

type Mode = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

// Demo AI yanıtları (avatar bu metinleri seslendirir)
const DEMO_AI_RESPONSES = [
  'Fikrin analiz edildi. Pazar doygunluğu orta seviyede. Rakip farkınlaştırması net değil — bunu güçlendir.',
  'Slop skoru yüksek. Jargon fazla, somut metrik yok. Tekrar yaz: bir cümle, bir sayı, bir hedef.',
  'Güçlü taraf: teknik ekip solid. Zayıf taraf: go-to-market belirsiz. Kim satacak, nasıl?',
  'Bu soruyu beyan değil soru olarak sor. Müşterine "Bu problemi çözmek için ne kadar ödersin?" de.',
  'Radar analizi tamamlandı. İki kritik risk tespit edildi: regülasyon ve dağıtım kanalı. Devam et mi?',
];

export default function VoiceScreen() {
  const [mode, setMode] = useState<Mode>('IDLE');
  const [audioLevel, setAudioLevel] = useState(0);       // 0–1 normalize
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [reportText, setReportText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [forgeMode, setForgeMode] = useState(false);

  const recordingRef    = useRef<Audio.Recording | null>(null);
  const meteringInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawLevelRef     = useRef(0);

  // Smooth audio level
  const smoothLevel = useRef(0);

  // Mikrofon başlat
  const startListening = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('İzin Gerekli', 'Mikrofon erişimi olmadan bu özellik çalışmaz.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // TTS duruyorsa durdur
      await Speech.stop();
      setIsSpeaking(false);

      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        },
        undefined,
        50 // 50ms polling
      );
      recordingRef.current = recording;
      setMode('LISTENING');

      // Oturum zamanlayıcı
      sessionTimer.current = setInterval(() => {
        setSessionTime(t => t + 1);
      }, 1000);

      // Metering polling
      meteringInterval.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            // dBFS → 0-1: -60dBFS baseline
            const normalized = Math.max(0, (status.metering + 60) / 60);
            const clamped = Math.min(1, normalized * 1.4);

            // Exponential smoothing
            smoothLevel.current = smoothLevel.current * 0.6 + clamped * 0.4;
            setAudioLevel(smoothLevel.current);
          }
        } catch {
          // sessizce atla
        }
      }, 50);

    } catch (err: any) {
      console.warn('[VoiceScreen] startListening error:', err);
      setMode('IDLE');
    }
  };

  // Mikrofon durdur
  const stopListening = async () => {
    // Zamanlayıcıları temizle
    if (meteringInterval.current) {
      clearInterval(meteringInterval.current);
      meteringInterval.current = null;
    }
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }

    // Audio level sıfırla
    setAudioLevel(0);
    smoothLevel.current = 0;

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;

        if (uri) {
          setMode('PROCESSING');
          // Simüle edilmiş transkripsiyon (gerçek STT için Whisper API bağlanır)
          await processRecording(uri);
        } else {
          setMode('IDLE');
        }
      } catch {
        recordingRef.current = null;
        setMode('IDLE');
      }
    } else {
      setMode('IDLE');
    }
  };

  // Kayıt işleme — demo modda simüle transkripsiyon
  const processRecording = async (uri: string) => {
    // Gerçek bir uygulamada burada Whisper API çağrısı olur.
    // Demo için 1.5s sonra sabit metin döndürür.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const demoTranscripts = [
      'Uygulamanın ana akışında kritik bir UX sorunu fark ettim. Kullanıcı onboarding ekranında progress indicator yok — kullanıcı nerede olduğunu bilemiyor.',
      'Chat ekranında mesaj gönderme butonu klavye ile örtüşüyor. KeyboardAvoidingView offset değeri yanlış hesaplanmış.',
      'Radar analiz sonuç ekranında gauge bileşeni SVG path hesaplaması hatalı. Yüzde 100 değerinde path kapanmıyor.',
    ];

    const tText = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
    setTranscript(tText);

    // Rapor metnine ekle
    if (forgeMode) {
      setReportText(prev =>
        prev
          ? `${prev}\n\n> **Dikte [${new Date().toLocaleTimeString('tr-TR')}]:** ${tText}`
          : `> **Dikte [${new Date().toLocaleTimeString('tr-TR')}]:** ${tText}`
      );
    }

    // AI yanıtı simüle et
    const response = DEMO_AI_RESPONSES[Math.floor(Math.random() * DEMO_AI_RESPONSES.length)];
    setAiResponse(response);
    setMode('SPEAKING');

    // Avatar konuşsun
    await speakText(response);
    setMode('IDLE');
  };

  // TTS — expo-speech
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: 'tr-TR',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();
        },
      });
    });
  };

  // TTS konuşurken ses seviyesi simülasyonu (avatar için)
  useEffect(() => {
    if (!isSpeaking) return;

    const interval = setInterval(() => {
      // TTS konuşması sırasında sahte audio level üret
      const simLevel = 0.3 + Math.random() * 0.5;
      setAudioLevel(prev => prev * 0.5 + simLevel * 0.5);
    }, 80);

    return () => {
      clearInterval(interval);
      setAudioLevel(0);
    };
  }, [isSpeaking]);

  const handleMicToggle = () => {
    if (mode === 'LISTENING') {
      stopListening();
    } else if (mode === 'IDLE') {
      startListening();
    }
  };

  const clearSession = () => {
    setTranscript('');
    setAiResponse('');
    setReportText('');
    setSessionTime(0);
    setMode('IDLE');
  };

  // Forge döngüsü: Başarısız cycle simüle et
  const simulateForgeFailure = () => {
    const cycleId = `cycle-voice-${Date.now().toString(36)}`;
    forgeMonitor.recordCycle({
      cycleId,
      result: 'ROLLBACK',
      screen: 'VoiceScreen',
      hypothesis: 'STT transkripsiyon kalitesi — voice rapor pipeline testi',
    });
    Alert.alert(
      '🔄 ROLLBACK Kaydedildi',
      `Cycle ID: ${cycleId}\nArdışık başarısız: ${forgeMonitor.getConsecutiveFailures()}`,
    );
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isListening = mode === 'LISTENING';
  const isAvatarAnimated = isListening || isSpeaking;

  return (
    <View style={styles.container}>
      <RadarBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Mic color="#00E5FF" size={20} />
            <Text style={styles.headerTitle}>VOICE LAB</Text>
          </View>
          <View style={styles.headerRight}>
            {mode !== 'IDLE' && (
              <View style={styles.sessionBadge}>
                <View style={[styles.dot, { backgroundColor: isListening ? '#FF003C' : '#00E5FF' }]} />
                <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Avatar Bölümü */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <AvatarFace
              audioLevel={audioLevel}
              isListening={isAvatarAnimated}
              style={styles.avatar}
            />

            {/* Durum etiketi */}
            <View style={styles.statusBadge}>
              {mode === 'IDLE' && (
                <Text style={styles.statusText}>⚪ Hazır</Text>
              )}
              {mode === 'LISTENING' && (
                <Text style={[styles.statusText, { color: '#FF003C' }]}>🔴 Dinliyor</Text>
              )}
              {mode === 'PROCESSING' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#00E5FF" />
                  <Text style={styles.statusText}>⚡ Analiz ediliyor</Text>
                </View>
              )}
              {mode === 'SPEAKING' && (
                <Text style={[styles.statusText, { color: '#00FF88' }]}>💬 Avatar konuşuyor</Text>
              )}
            </View>
          </View>

          {/* Sesli Görselleştirici */}
          <View style={styles.vizContainer}>
            <VoiceVisualizer
              isListening={isListening || isSpeaking}
              color={isSpeaking ? '#00FF88' : '#00E5FF'}
              barWidth={5}
              maxBarHeight={70}
            />
          </View>
        </View>

        {/* Mikrofon Kontrol */}
        <View style={styles.micControl}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive,
              (mode === 'PROCESSING' || mode === 'SPEAKING') && styles.micButtonDisabled,
            ]}
            onPress={handleMicToggle}
            disabled={mode === 'PROCESSING' || mode === 'SPEAKING'}
            activeOpacity={0.8}
          >
            {isListening ? (
              <MicOff color="#FF003C" size={28} />
            ) : (
              <Mic color={mode === 'IDLE' ? '#00E5FF' : '#555'} size={28} />
            )}
          </TouchableOpacity>

          <Text style={styles.micHint}>
            {mode === 'IDLE' && 'Mikrofona dokunarak konuşmaya başla'}
            {mode === 'LISTENING' && 'Konuşuyorsun — durdurmak için dokun'}
            {mode === 'PROCESSING' && 'Analiz ediliyor, lütfen bekle...'}
            {mode === 'SPEAKING' && 'Avatar yanıtlıyor...'}
          </Text>
        </View>

        {/* Transkripsiyon Paneli */}
        {transcript !== '' && (
          <View style={styles.transcriptPanel}>
            <View style={styles.panelHeader}>
              <FileText color="#00E5FF" size={16} />
              <Text style={styles.panelTitle}>Transkripsiyon</Text>
            </View>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}

        {/* AI Yanıt Paneli */}
        {aiResponse !== '' && (
          <View style={styles.aiPanel}>
            <View style={styles.panelHeader}>
              <Bot color="#00FF88" size={16} />
              <Text style={[styles.panelTitle, { color: '#00FF88' }]}>Avatar Yanıtı</Text>
              <TouchableOpacity
                onPress={() => speakText(aiResponse)}
                style={styles.replayBtn}
              >
                <Volume2 color="#00FF88" size={14} />
                <Text style={styles.replayText}>Tekrar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.aiText}>{aiResponse}</Text>
          </View>
        )}

        {/* Forge Rapor Modu */}
        <View style={styles.forgeSection}>
          <TouchableOpacity
            style={[styles.forgeModeBtn, forgeMode && styles.forgeModeBtnActive]}
            onPress={() => setForgeMode(f => !f)}
          >
            <Zap color={forgeMode ? '#000' : '#FF9800'} size={16} />
            <Text style={[styles.forgeModeBtnText, forgeMode && { color: '#000' }]}>
              {forgeMode ? 'FORGE Modu Aktif' : 'FORGE Rapor Modu'}
            </Text>
          </TouchableOpacity>

          {forgeMode && (
            <>
              <View style={styles.reportContainer}>
                <Text style={styles.reportLabel}>Dikte Raporu (Markdown)</Text>
                <TextInput
                  style={styles.reportInput}
                  value={reportText}
                  onChangeText={setReportText}
                  multiline
                  placeholder="Konuşunca buraya transkripsiyon düşer..."
                  placeholderTextColor="#333"
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.forgeActions}>
                <TouchableOpacity
                  style={styles.forgeActionBtn}
                  onPress={simulateForgeFailure}
                >
                  <Text style={styles.forgeActionText}>🔄 Cycle ROLLBACK Ekle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.forgeActionBtn, { borderColor: '#00FF88' }]}
                  onPress={() => {
                    forgeMonitor.recordCycle({
                      cycleId: `cycle-voice-${Date.now().toString(36)}`,
                      result: 'SUCCESS',
                      screen: 'VoiceScreen',
                      hypothesis: 'Voice rapor pipeline doğrulandı',
                    });
                    Alert.alert('✅ SUCCESS', 'Cycle başarılı olarak kaydedildi.');
                  }}
                >
                  <Text style={[styles.forgeActionText, { color: '#00FF88' }]}>✅ Cycle SUCCESS Ekle</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Expert Bridge */}
        <View style={styles.bridgeSection}>
          <Text style={styles.bridgeSectionTitle}>Expert Köprüsü</Text>
          <ExpertBridge
            cycleId={`voice-session-${Date.now().toString(36)}`}
            onBridgeStarted={(url) => {
              console.log('[ExpertBridge] Görüşme başladı:', url);
            }}
            onBridgeEnded={() => {
              console.log('[ExpertBridge] Görüşme bitti');
            }}
          />
        </View>

        {/* Temizle */}
        {(transcript || aiResponse || reportText) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSession}>
            <RefreshCw color="#444" size={14} />
            <Text style={styles.clearBtnText}>Oturumu Temizle</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#222',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sessionTime: {
    color: '#aaa',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    // shadow
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1a1a2a',
  },
  statusText: {
    color: '#aaa',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  vizContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a2a',
    width: '100%',
    alignItems: 'center',
  },
  micControl: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: 'rgba(255, 0, 60, 0.15)',
    borderColor: '#FF003C',
    shadowColor: '#FF003C',
  },
  micButtonDisabled: {
    opacity: 0.4,
  },
  micHint: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
  },
  transcriptPanel: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  panelTitle: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    flex: 1,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replayText: {
    color: '#00FF88',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  transcriptText: {
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  aiPanel: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  aiText: {
    color: '#aae',
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  forgeSection: {
    gap: 10,
    marginBottom: 16,
  },
  forgeModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  forgeModeBtnActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  forgeModeBtnText: {
    color: '#FF9800',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reportContainer: {
    gap: 6,
  },
  reportLabel: {
    color: '#555',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reportInput: {
    backgroundColor: '#0a0a14',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 10,
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: 13,
    padding: 14,
    minHeight: 120,
    lineHeight: 20,
  },
  forgeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  forgeActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  forgeActionText: {
    color: '#FF6B00',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bridgeSection: {
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a2a',
  },
  bridgeSectionTitle: {
    color: '#444',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#444',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

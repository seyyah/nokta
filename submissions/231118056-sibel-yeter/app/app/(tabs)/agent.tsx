import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ForgeHeuristicsService, ForgeCycle } from '../../services/ForgeHeuristicsService';

// Predefined initial cycles matching FORGE.md
const INITIAL_CYCLES: ForgeCycle[] = [
  {
    id: '1',
    startTime: '2026-05-18T19:00:00',
    endTime: '2026-05-18T19:15:00',
    reportName: 'bug-report-onboarding.md',
    hypothesis: 'Fikir ekleme formunda başlık/açıklama alanları boş gönderilebiliyordu. Guard koşulu ile boş gönderim engellenmeli.',
    result: 'SUCCESS',
    changedFiles: 'app/(tabs)/ideas.tsx',
    testResult: 'Passed (Boş veri koruması doğrulandı)',
    commitHash: 'b8d8f9a',
    kg: 10,
    humanTouchPoints: 0,
  },
  {
    id: '2',
    startTime: '2026-05-18T19:15:00',
    endTime: '2026-05-18T19:30:00',
    reportName: 'bug-report-routing.md',
    hypothesis: 'Detay ekranında geri dönüş butonu, geçmiş olmadığında hata veriyordu. Default yönlendirme (/ideas) entegre edilmeli.',
    result: 'SUCCESS',
    changedFiles: 'app/ideas/[id].tsx',
    testResult: 'Passed (Geri butonu güvenli yönlendiriyor)',
    commitHash: '4e9a3b2',
    kg: 15,
    humanTouchPoints: 0,
  },
  {
    id: '3',
    startTime: '2026-05-18T19:30:00',
    endTime: '2026-05-18T19:45:00',
    reportName: 'bug-report-sync.md',
    hypothesis: 'Agent panelinde bağlantı durum göstergesi eksikti. Çevrimiçi durumunu dinamik gösteren visual component eklenmeli.',
    result: 'SUCCESS',
    changedFiles: 'app/(tabs)/agent.tsx',
    testResult: 'Passed (Görsel gösterge canlı çalışıyor)',
    commitHash: 'e7f2c1b',
    kg: 20,
    humanTouchPoints: 0,
  },
  {
    id: '4',
    startTime: '2026-05-18T19:45:00',
    endTime: '2026-05-18T20:00:00',
    reportName: 'bug-report-lottie.md',
    hypothesis: 'Karşılama ekranına dinamik Lottie animasyon kutusu yüklemek için lottie-react-native paketini entegre etmek.',
    result: 'ROLLBACK',
    changedFiles: 'app/(tabs)/index.tsx, package.json',
    testResult: 'Failed (Native kütüphane eksikliğinden uygulama dondu. Stabil sürüme geri dönüldü.)',
    commitHash: 'None (Rolled back)',
    kg: 15,
    humanTouchPoints: 0,
  },
  {
    id: '5',
    startTime: '2026-06-11T22:30:00',
    endTime: '2026-06-11T22:45:00',
    reportName: 'voice-report-avatar.md',
    hypothesis: '3D Avatar sahnesinin eklenmesi ve farklı personas seçimiyle TTS seslendirmelerinin yapılması.',
    result: 'SUCCESS',
    changedFiles: 'app/(tabs)/avatar.tsx, app/(tabs)/_layout.tsx',
    testResult: 'Passed (3D avatar render edildi, TTS personas çalışıyor)',
    commitHash: 'c5a2e1d',
    kg: 25,
    humanTouchPoints: 0,
  },
  {
    id: '6',
    startTime: '2026-06-11T22:50:00',
    endTime: '2026-06-11T23:05:00',
    reportName: 'voice-report-mic.md',
    hypothesis: 'expo-av mikrofon metering verilerinin okunarak arayüzdeki OpenAI ses barlarına ve model lipsync blendshape\'lerine bağlanması.',
    result: 'ROLLBACK',
    changedFiles: 'app/(tabs)/avatar.tsx',
    testResult: 'Failed (Donanımsal yetkilendirme asenkron hatası nedeniyle mikrofon başlatılamadı)',
    commitHash: 'None (Rolled back)',
    kg: 15,
    humanTouchPoints: 0,
  },
  {
    id: '7',
    startTime: '2026-06-11T23:10:00',
    endTime: '2026-06-11T23:25:00',
    reportName: 'voice-report-stuck.md',
    hypothesis: 'Mikrofon yetkilendirme hatasını çözmek için asenkron kilit mekanizmasının yeniden kurgulanması.',
    result: 'ROLLBACK',
    changedFiles: 'app/(tabs)/avatar.tsx',
    testResult: 'Failed (Uygulama ses başlatırken donmaya devam etti - STUCK tespitiyle Uzman Çağrısı açıldı)',
    commitHash: 'None (Rolled back)',
    kg: 15,
    humanTouchPoints: 1,
  },
  {
    id: '8',
    startTime: '2026-06-11T23:30:00',
    endTime: '2026-06-11T23:45:00',
    reportName: 'voice-report-bridge.md',
    hypothesis: 'BRIDGE.md uzman tavsiyesine göre mikrofon izni verilmediğinde sessizce mock-generator moduna geçiş yapılması.',
    result: 'SUCCESS',
    changedFiles: 'app/(tabs)/avatar.tsx',
    testResult: 'Passed (Mikrofon hatası handle edildi, mock lipsync devrede)',
    commitHash: 'c8b4f2a',
    kg: 25,
    humanTouchPoints: 0,
  },
];

const REPORTS_LIST = [
  { label: 'voice-report-mic.md (Mikrofon Sorunu)', value: 'voice-report-mic.md' },
  { label: 'voice-report-avatar.md (Avatar Sorunu)', value: 'voice-report-avatar.md' },
  { label: 'bug-report-lottie.md (Lottie Çökmesi)', value: 'bug-report-lottie.md' },
  { label: 'bug-report-onboarding.md (Onboarding Hatası)', value: 'bug-report-onboarding.md' },
];

export default function AgentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State Management
  const [cycles, setCycles] = useState<ForgeCycle[]>(INITIAL_CYCLES);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState(REPORTS_LIST[0].value);
  const [selectedOutcome, setSelectedOutcome] = useState<'SUCCESS' | 'FAIL' | 'ROLLBACK'>('FAIL');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [stuckTopic, setStuckTopic] = useState<string | null>(null);

  // WebRTC Jitsi Expert Call States
  const [expertCallVisible, setExpertCallVisible] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState('');
  const [savedSummaries, setSavedSummaries] = useState<string[]>([
    'C7 stuck sonrası mikrofon izni asenkron kontrol edildi ve mock veri fall-back mekanizması kuruldu.',
  ]);

  const steps = ['READ', 'LOCATE', 'HYPOTHESIZE', 'REPAIR', 'TEST', 'VERIFY', 'COMMIT'];
  const logScrollRef = useRef<ScrollView>(null);

  // Auto-scroll simulation logs
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [simLogs]);

  // Run stuck heuristics whenever cycles update
  useEffect(() => {
    // Check if any topic in current cycles list is stuck
    const stuckList = ForgeHeuristicsService.getStuckTopics(cycles);
    if (stuckList.length > 0) {
      setStuckTopic(stuckList[0]);
    } else {
      setStuckTopic(null);
    }
  }, [cycles]);

  // Simulate a single step of the Forge Loop
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const startForgeSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);
    setSimLogs([]);
    
    addLog(`Döngü başlatıldı: Rapor okunuyor... (${selectedReport})`);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveStep(currentStep);
        const stepName = steps[currentStep];
        
        switch (stepName) {
          case 'LOCATE':
            addLog(`LOCATE: Hata dosyası tespit ediliyor...`);
            break;
          case 'HYPOTHESIZE':
            addLog(`HYPOTHESIZE: Çözüm hipotezi oluşturuluyor...`);
            break;
          case 'REPAIR':
            addLog(`REPAIR: Geçici kod yaması uygulanıyor...`);
            break;
          case 'TEST':
            addLog(`TEST: Birim ve entegrasyon testleri koşturuluyor...`);
            break;
          case 'VERIFY':
            addLog(`VERIFY: Test sonuçları denetleniyor...`);
            break;
          case 'COMMIT':
            addLog(`Döngü sonlandırılıyor. Karar: ${selectedOutcome}`);
            break;
        }
      } else {
        clearInterval(interval);
        finalizeSimulation();
      }
    }, 1200); // Fast but readable step duration
  };

  const finalizeSimulation = () => {
    const newId = String(cycles.length + 1);
    const dateNow = new Date();
    const startTimeStr = new Date(dateNow.getTime() - 15 * 60000).toISOString().slice(0, 19); // 15 mins ago
    const endTimeStr = dateNow.toISOString().slice(0, 19);

    const isSuccess = selectedOutcome === 'SUCCESS';
    const topic = ForgeHeuristicsService.extractTopic(selectedReport);

    const newCycle: ForgeCycle = {
      id: newId,
      startTime: startTimeStr,
      endTime: endTimeStr,
      reportName: selectedReport,
      hypothesis: `Simüle edilen ${topic} onarımı. Çözüm doğrulanıyor.`,
      result: selectedOutcome === 'SUCCESS' ? 'SUCCESS' : selectedOutcome === 'ROLLBACK' ? 'ROLLBACK' : 'FAIL',
      changedFiles: topic === 'mic' ? 'app/(tabs)/avatar.tsx' : topic === 'lottie' ? 'package.json, index.tsx' : 'app/(tabs)/ideas.tsx',
      testResult: isSuccess ? 'Passed (Tüm testler doğrulandı)' : 'Failed (Mock hata fırlatıldı, kararsız yapı)',
      commitHash: isSuccess ? Math.random().toString(16).slice(2, 9) : 'None (Rolled back)',
      kg: isSuccess ? 25 : 15,
      humanTouchPoints: 0,
    };

    const updatedCycles = [...cycles, newCycle];
    setCycles(updatedCycles);
    setIsSimulating(false);
    setActiveStep(null);

    addLog(`Döngü tamamlandı! Sonuç kaydedildi.`);

    // Run heuristics directly to display stuck alert
    const isStuckNow = ForgeHeuristicsService.isTopicStuck(updatedCycles, topic);
    if (isStuckNow) {
      addLog(`⚠️ HEURISTIC UYARISI: '${topic}' konusu üst üste alınan FAIL/ROLLBACK durumları sebebiyle STUCK (TIKANDI) olarak işaretlendi!`);
      setStuckTopic(topic);
    }
  };

  // Resolve Stuck via Expert Bridge
  const handleConnectExpert = () => {
    setExpertCallVisible(true);
  };

  const handleHangUpCall = () => {
    setExpertCallVisible(false);
    setShowSummaryForm(true);
  };

  const saveMeetingSummary = () => {
    if (!meetingSummary.trim()) {
      Alert.alert('Hata', 'Lütfen görüşme özeti yazın.');
      return;
    }

    setSavedSummaries((prev) => [...prev, meetingSummary]);
    setShowSummaryForm(false);
    
    // Auto-create a recovery cycle (SUCCESS) to show loop completion
    const newId = String(cycles.length + 1);
    const dateNow = new Date();
    const startTimeStr = new Date(dateNow.getTime() - 10 * 60000).toISOString().slice(0, 19);
    const endTimeStr = dateNow.toISOString().slice(0, 19);

    const recoveryCycle: ForgeCycle = {
      id: newId,
      startTime: startTimeStr,
      endTime: endTimeStr,
      reportName: `voice-report-bridge-${newId}.md`,
      hypothesis: `WebRTC Expert Köprüsü üzerinden alınan '${meetingSummary}' tavsiyesiyle stuck çözülüyor.`,
      result: 'SUCCESS',
      changedFiles: stuckTopic === 'mic' ? 'app/(tabs)/avatar.tsx' : 'app/(tabs)/ideas.tsx',
      testResult: 'Passed (Uzman düzeltmesiyle kilit açıldı, testler başarılı)',
      commitHash: Math.random().toString(16).slice(2, 9),
      kg: 30,
      humanTouchPoints: 1, // Expert call
    };

    setCycles((prev) => [...prev, recoveryCycle]);
    setMeetingSummary('');
    setStuckTopic(null); // Clear stuck state
    Alert.alert('Başarılı', 'Görüşme özeti kaydedildi ve STUCK döngüsü başarıyla çözüldü!');
  };

  // Get color configurations for outcomes
  const getOutcomeColor = (result: string) => {
    switch (result) {
      case 'SUCCESS':
        return { bg: '#e6fffa', text: '#319795' };
      case 'FAIL':
      case 'ROLLBACK':
        return { bg: '#fff5f5', text: '#e53e3e' };
      case 'STUCK':
        return { bg: '#fffaf0', text: '#dd6b20' };
      default:
        return { bg: '#edf2f7', text: '#4a5568' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Stuck Topic Banner Alert */}
        {stuckTopic && (
          <View style={styles.stuckBanner}>
            <View style={styles.stuckBannerHeader}>
              <Ionicons name="warning" size={24} color="#fff" />
              <Text style={styles.stuckBannerTitle}>TIKANMA (STUCK) TESPİT EDİLDİ!</Text>
            </View>
            <Text style={styles.stuckBannerDesc}>
              '{stuckTopic}' konusu üst üste 2 kez başarısız sonuçlandığı için sistem kilitlendi. Çözüm için otonom olarak Uzman WebRTC Köprüsü aktif edildi.
            </Text>
            <TouchableOpacity style={styles.stuckBannerBtn} onPress={handleConnectExpert}>
              <Ionicons name="call" size={18} color="#dc2626" />
              <Text style={styles.stuckBannerBtnText}>Uzmana Bağlan (Jitsi Meet)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Forge Simulation Controls */}
        <View style={[styles.controlBox, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
          <Text style={[styles.boxTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Otonom Forge Simülatörü</Text>
          
          <Text style={styles.label}>1. Denetim Raporu Seç:</Text>
          <View style={styles.selectorRow}>
            {REPORTS_LIST.map((rep) => (
              <TouchableOpacity
                key={rep.value}
                style={[
                  styles.selectorBadge,
                  selectedReport === rep.value && styles.selectorBadgeActive,
                  { borderColor: isDark ? '#2d3748' : '#e2e8f0' }
                ]}
                onPress={() => setSelectedReport(rep.value)}>
                <Text style={[
                  styles.selectorText,
                  selectedReport === rep.value && styles.selectorTextActive,
                  { color: selectedReport === rep.value ? '#fff' : isDark ? '#94a3b8' : '#64748b' }
                ]}>
                  {rep.value.replace('bug-report-', '').replace('voice-report-', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>2. Döngü Çıktısı Simüle Et:</Text>
          <View style={styles.outcomeRow}>
            {['SUCCESS', 'FAIL', 'ROLLBACK'].map((out) => (
              <TouchableOpacity
                key={out}
                style={[
                  styles.outcomeBadge,
                  selectedOutcome === out && {
                    backgroundColor: out === 'SUCCESS' ? '#319795' : '#e53e3e',
                    borderColor: out === 'SUCCESS' ? '#319795' : '#e53e3e',
                  },
                  { borderColor: isDark ? '#2d3748' : '#e2e8f0' }
                ]}
                onPress={() => setSelectedOutcome(out as any)}>
                <Text style={[
                  styles.outcomeText,
                  selectedOutcome === out && { color: '#fff' },
                  { color: isDark ? '#cbd5e1' : '#475569' }
                ]}>
                  {out}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.simulateBtn, isSimulating && styles.simulateBtnDisabled]}
            onPress={startForgeSimulation}
            disabled={isSimulating}>
            {isSimulating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.simulateBtnText}>Forge Döngüsünü Koştur</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Stepper progress & Logs Console */}
        {(isSimulating || simLogs.length > 0) && (
          <View style={[styles.consoleBox, { backgroundColor: '#111419' }]}>
            <Text style={styles.consoleTitle}>Forge Engine Konsol Çıktısı</Text>
            
            {/* Steps Stepper */}
            <View style={styles.stepperContainer}>
              {steps.map((st, i) => {
                const isActive = activeStep === i;
                const isPassed = activeStep !== null && i < activeStep;
                return (
                  <View key={st} style={styles.stepIndicator}>
                    <View style={[
                      styles.stepCircle,
                      isActive && styles.stepCircleActive,
                      isPassed && styles.stepCirclePassed,
                    ]}>
                      <Text style={[
                        styles.stepNum,
                        (isActive || isPassed) && { color: '#fff' }
                      ]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[
                      styles.stepLabelText,
                      isActive && styles.stepLabelTextActive
                    ]}>
                      {st}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Console logs */}
            <ScrollView
              ref={logScrollRef}
              style={styles.logsView}
              contentContainerStyle={{ paddingVertical: 4 }}>
              {simLogs.map((log, idx) => (
                <Text key={idx} style={styles.logLine}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Expert summariesBridge */}
        {savedSummaries.length > 0 && (
          <View style={[styles.summaryBox, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="git-branch" size={18} color="#a855f7" />
              <Text style={[styles.summaryTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
                Uzman Karar Günlüğü (BRIDGE.md)
              </Text>
            </View>
            {savedSummaries.map((s, idx) => (
              <View key={idx} style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.summaryItemText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Ledger table list */}
        <View style={styles.ledgerSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#1e293b' }]}>
            Forge Ledger Defteri (FORGE.md)
          </Text>

          {cycles.slice().reverse().map((c) => {
            const outColors = getOutcomeColor(c.result);
            return (
              <View key={c.id} style={[styles.ledgerCard, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
                <View style={styles.ledgerCardHeader}>
                  <View style={styles.ledgerHeaderLeft}>
                    <View style={styles.cycleBadge}>
                      <Text style={styles.cycleBadgeText}>Cycle C{c.id}</Text>
                    </View>
                    <Text style={[styles.reportLabel, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                      {c.reportName}
                    </Text>
                  </View>
                  <View style={[styles.outcomeResultBadge, { backgroundColor: outColors.bg }]}>
                    <Text style={[styles.outcomeResultText, { color: outColors.text }]}>
                      {c.result}
                    </Text>
                  </View>
                </View>

                <View style={styles.ledgerCardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoTitle}>Hipotez:</Text>
                    <Text style={[styles.infoVal, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                      {c.hypothesis}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoTitle}>Değişen Dosyalar:</Text>
                    <Text style={[styles.infoVal, styles.monoText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      {c.changedFiles}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoTitle}>Test Sonucu:</Text>
                    <Text style={[styles.infoVal, { color: c.result === 'SUCCESS' ? '#319795' : '#e53e3e' }]}>
                      {c.testResult}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoTitle}>Başlangıç / Bitiş:</Text>
                    <Text style={[styles.infoVal, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      {c.startTime.replace('T', ' ')} / {c.endTime.replace('T', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* WebRTC Expert Call Jitsi WebView Modal */}
      <Modal visible={expertCallVisible} animationType="slide" onRequestClose={handleHangUpCall}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.livePulse} />
              <Text style={styles.liveLabel}>UZMAN WEBRTC KÖPRÜSÜ (JITSI)</Text>
            </View>
            <TouchableOpacity style={styles.hangUpBtn} onPress={handleHangUpCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.hangUpText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: 'https://meet.jit.si/nokta-expert-call-231118056#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","desktop","chat","hangup"]' }}
            style={{ flex: 1 }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Post Meeting Summary Form Modal */}
      <Modal visible={showSummaryForm} animationType="fade" transparent={true}>
        <View style={styles.popupBg}>
          <View style={[styles.popupCard, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <Text style={[styles.popupTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
              Görüşme Sonrası Özeti (BRIDGE.md)
            </Text>
            <Text style={styles.popupDesc}>
              Uzmanın çözüm önerisini özetleyin. Bu bilgi recovery döngüsü için girdi olarak kullanılacaktır.
            </Text>
            <TextInput
              style={[
                styles.popupInput,
                { color: isDark ? '#fff' : '#0f172a', borderColor: isDark ? '#2d3748' : '#e2e8f0' }
              ]}
              placeholder="Örn: Mikrofon izin kontrolü sonrası sessiz mockup moduna geçilmesi tavsiye edildi."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              multiline
              numberOfLines={4}
              value={meetingSummary}
              onChangeText={setMeetingSummary}
            />
            <View style={styles.popupBtnRow}>
              <TouchableOpacity
                style={[styles.popupBtn, { backgroundColor: '#edf2f7' }]}
                onPress={() => setShowSummaryForm(false)}>
                <Text style={{ color: '#4a5568', fontWeight: 'bold' }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupBtn, { backgroundColor: '#a855f7' }]}
                onPress={saveMeetingSummary}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kaydet ve Stuck Çöz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stuckBanner: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stuckBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stuckBannerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  stuckBannerDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  stuckBannerBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  stuckBannerBtnText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  controlBox: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  selectorBadgeActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  selectorText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  selectorTextActive: {
    color: '#fff',
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  outcomeBadge: {
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  outcomeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  simulateBtn: {
    backgroundColor: '#e53e3e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  simulateBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  simulateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  consoleBox: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  consoleTitle: {
    color: '#38bdf8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    paddingBottom: 10,
  },
  stepIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#38bdf8',
  },
  stepCirclePassed: {
    backgroundColor: '#10b981',
  },
  stepNum: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  stepLabelText: {
    fontSize: 7,
    color: '#64748b',
    fontWeight: 'bold',
  },
  stepLabelTextActive: {
    color: '#38bdf8',
  },
  logsView: {
    height: 120,
  },
  logLine: {
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 16,
  },
  summaryBox: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryItemText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  ledgerSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ledgerCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  ledgerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  ledgerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cycleBadge: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cycleBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  reportLabel: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  outcomeResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outcomeResultText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  ledgerCardBody: {
    gap: 8,
  },
  infoRow: {
    gap: 2,
  },
  infoTitle: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  infoVal: {
    fontSize: 11,
    lineHeight: 15,
  },
  monoText: {
    fontFamily: 'monospace',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  modalHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveLabel: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  hangUpBtn: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  hangUpText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  popupBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popupCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  popupDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  popupInput: {
    borderWidth: 1,
    borderRadius: 12,
    height: 80,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  popupBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  popupBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

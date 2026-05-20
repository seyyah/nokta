import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Animated, Dimensions, Alert, Modal, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Forge cycle states
type CycleStatus = 'idle' | 'running' | 'success' | 'rollback' | 'stuck';

interface ForgeCycle {
  id: number;
  report: string;
  hypothesis: string;
  status: CycleStatus;
  startTime: string;
  duration?: string;
  failCount: number;
  logs: string[];
}

const INITIAL_CYCLES: ForgeCycle[] = [
  {
    id: 1,
    report: 'audit-report-1-search-flow.md',
    hypothesis: 'Nereden/Nereye input placeholder kontrastı yetersiz → #94A3B8 → #CBD5E1 güncellemesi',
    status: 'success',
    startTime: '2026-05-28 09:15',
    duration: '12dk',
    failCount: 0,
    logs: ['READ: index.tsx okundu', 'LOCATE: styles.input satır 373', 'REPAIR: renk güncellendi', 'VERIFY: ✓ kontrast oranı 4.5:1 geçti', 'COMMIT: [FORGE: Anasayfa] Input contrast fix — 1kg'],
  },
  {
    id: 2,
    report: 'audit-report-2-seat-modal.md',
    hypothesis: 'Koltuk numaraları 12px → minimum 14px, kontrast arttırma',
    status: 'rollback',
    startTime: '2026-05-28 09:45',
    duration: '18dk',
    failCount: 1,
    logs: ['READ: index.tsx seat styles okundu', 'HYPOTHESIZE: fontSize 12→14', 'REPAIR: seatText fontSize değiştirildi', 'TEST: modal overflow yaratıyor', 'ROLLBACK: değişiklikler geri alındı', '❌ Hipotez başarısız: layout kırılıyor'],
  },
  {
    id: 3,
    report: 'audit-report-2-seat-modal.md',
    hypothesis: 'Koltuk layout → flexWrap eklenerek fontSize 14 güvenli hale getirme',
    status: 'success',
    startTime: '2026-05-28 10:15',
    duration: '14dk',
    failCount: 0,
    logs: ['READ: seat layout analiz edildi', 'LOCATE: seatsContainer style', 'REPAIR: flexWrap + fontSize 14', 'VERIFY: ✓ overflow yok, kontrast 4.8:1', 'COMMIT: [FORGE: KoltukSeçim] Seat font fix — 2kg'],
  },
  {
    id: 4,
    report: 'audit-report-3-profile.md',
    hypothesis: 'Geçmiş yolculuklar listesi — AsyncStorage\'dan çekme + UI render',
    status: 'success',
    startTime: '2026-05-28 11:00',
    duration: '19dk',
    failCount: 0,
    logs: ['READ: profile.tsx tüm yapı', 'LOCATE: boş state ekranı', 'REPAIR: trip history bileşeni eklendi', 'VERIFY: ✓ 3 mock kayıt görünüyor', 'COMMIT: [FORGE: Profil] Trip history added — 3kg'],
  },
];

// Heuristic: stuck if 2+ consecutive FAIL/ROLLBACK on same report
function detectStuck(cycles: ForgeCycle[]): boolean {
  if (cycles.length < 2) return false;
  const last2 = cycles.slice(-2);
  return last2.every(c => c.status === 'rollback') && last2[0].report === last2[1].report;
}

// Jitsi Meet WebView bridge
function buildJitsiHTML(roomName: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background: #0F172A; font-family: sans-serif; color: white; }
.container { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; padding:20px; }
.icon { font-size: 64px; margin-bottom: 20px; }
.title { font-size: 22px; font-weight: 800; margin-bottom: 10px; text-align:center; }
.subtitle { font-size: 14px; color: #94A3B8; text-align:center; margin-bottom: 30px; }
.room-badge {
  background: rgba(99,102,241,0.2);
  border: 1px solid rgba(99,102,241,0.5);
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 13px;
  color: #A5B4FC;
  margin-bottom: 24px;
  font-family: monospace;
}
.btn {
  background: #4F46E5;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 12px;
  width: 100%;
}
.btn-outline {
  background: transparent;
  color: #94A3B8;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 14px 32px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
}
.features { display:flex; gap:12px; margin-top:20px; flex-wrap:wrap; justify-content:center; }
.feat { background: #1E293B; border-radius:10px; padding:8px 14px; font-size:12px; color:#64748B; }
</style>
</head>
<body>
<div class="container">
  <div class="icon">🎥</div>
  <div class="title">Uzman Köprüsü</div>
  <div class="subtitle">Forge döngüsü çıkmaza girdi.<br>Uzmanla görüntülü görüşme başlatılıyor.</div>
  <div class="room-badge">📡 Oda: ${roomName}</div>
  <button class="btn" onclick="openJitsi()">Jitsi ile Bağlan</button>
  <button class="btn-outline" onclick="copyRoom()">Oda Linkini Kopyala</button>
  <div class="features">
    <span class="feat">🎥 Video</span>
    <span class="feat">🎙️ Ses</span>
    <span class="feat">🖥️ Ekran Paylaşımı</span>
    <span class="feat">💬 Chat</span>
  </div>
</div>
<script>
function openJitsi() {
  const url = 'https://meet.jit.si/${roomName}';
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'openURL', url}));
}
function copyRoom() {
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'copyRoom', room:'${roomName}'}));
}
</script>
</body>
</html>`;
}

export default function BridgeScreen() {
  const [cycles, setCycles] = useState<ForgeCycle[]>(INITIAL_CYCLES);
  const [isRunning, setIsRunning] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertRoomName] = useState(`nexbus-expert-${Date.now().toString(36)}`);
  const [bridgeLog, setBridgeLog] = useState<string[]>([]);
  const [stuckDetected, setStuckDetected] = useState(false);
  const [activeTab, setActiveTab] = useState<'forge' | 'bridge'>('forge');

  const webViewRef = useRef<WebView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stuckAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Check stuck on every cycles update
  useEffect(() => {
    const stuck = detectStuck(cycles);
    if (stuck && !stuckDetected) {
      setStuckDetected(true);
      triggerStuckProtocol();
    }
  }, [cycles]);

  const triggerStuckProtocol = () => {
    setBridgeLog(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString('tr-TR')}] 🚨 STUCK TESPİT EDİLDİ`,
      `[${new Date().toLocaleTimeString('tr-TR')}] Agent 2 üst üste ROLLBACK üretti`,
      `[${new Date().toLocaleTimeString('tr-TR')}] Heuristik: aynı raporda ≥2 başarısız cycle`,
      `[${new Date().toLocaleTimeString('tr-TR')}] → Uzman köprüsü tetikleniyor...`,
    ]);
    Animated.loop(
      Animated.sequence([
        Animated.timing(stuckAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(stuckAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => setShowExpertModal(true), 1500);
  };

  const simulateNewCycle = () => {
    if (isRunning) return;
    setIsRunning(true);

    Animated.timing(progressAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    Animated.timing(progressAnim, { toValue: 1, duration: 15000, useNativeDriver: false }).start();

    const newId = cycles.length + 1;
    const isStuckTest = cycles.filter(c => c.status === 'rollback').length === 1;

    const newCycle: ForgeCycle = {
      id: newId,
      report: 'audit-report-2-seat-modal.md', // same as prev rollback — triggers stuck
      hypothesis: isStuckTest
        ? 'Koltuk seçim ekranında border-radius → 0 deneme (farklı hipotez)'
        : `Yeni rapor cycle #${newId}`,
      status: 'running',
      startTime: new Date().toLocaleString('tr-TR'),
      failCount: 0,
      logs: [],
    };

    setCycles(prev => [...prev, newCycle]);

    const steps = [
      { log: 'READ: ilgili dosyalar taranıyor...', delay: 1000 },
      { log: 'LOCATE: sorunlu alan tespit edildi', delay: 3000 },
      { log: 'HYPOTHESIZE: hipotez oluşturuluyor...', delay: 5000 },
      { log: 'REPAIR: kod değişikliği uygulanıyor', delay: 8000 },
      { log: 'TEST: birim testler çalıştırılıyor...', delay: 11000 },
      { log: isStuckTest ? '❌ TEST BAŞARISIZ: layout overflow' : '✓ TEST BAŞARILI', delay: 13000 },
    ];

    steps.forEach(({ log, delay }) => {
      setTimeout(() => {
        setCycles(prev => prev.map(c =>
          c.id === newId ? { ...c, logs: [...c.logs, log] } : c
        ));
      }, delay);
    });

    setTimeout(() => {
      const finalStatus: CycleStatus = isStuckTest ? 'rollback' : 'success';
      setCycles(prev => prev.map(c =>
        c.id === newId
          ? { ...c, status: finalStatus, duration: '15dk', failCount: isStuckTest ? 1 : 0 }
          : c
      ));
      setIsRunning(false);
      progressAnim.setValue(0);
    }, 14500);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'openURL') {
        Linking.openURL(data.url).catch(() =>
          Alert.alert('Jitsi', `Oda: ${data.url}\n\nTarayıcıda açılıyor...`)
        );
        setBridgeLog(prev => [...prev,
          `[${new Date().toLocaleTimeString('tr-TR')}] 🔗 Jitsi oturumu açıldı: ${data.url}`,
          `[${new Date().toLocaleTimeString('tr-TR')}] 🎥 Video + Ses + Ekran Paylaşımı aktif`,
        ]);
      }
      if (data.type === 'copyRoom') {
        Alert.alert('Oda Linki', `https://meet.jit.si/${data.room}`);
      }
    } catch (_) {}
  };

  const statusColor = (s: CycleStatus) => {
    switch (s) {
      case 'success': return '#10B981';
      case 'rollback': return '#EF4444';
      case 'running': return '#F59E0B';
      case 'stuck': return '#EF4444';
      default: return '#64748B';
    }
  };

  const statusIcon = (s: CycleStatus) => {
    switch (s) {
      case 'success': return 'checkmark-circle';
      case 'rollback': return 'close-circle';
      case 'running': return 'time';
      case 'stuck': return 'warning';
      default: return 'ellipse-outline';
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });
  const stuckOpacity = stuckAnim;

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forge' && styles.tabActive]}
          onPress={() => setActiveTab('forge')}
        >
          <Ionicons name="flash" size={16} color={activeTab === 'forge' ? '#F59E0B' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'forge' && styles.tabTextActive]}>Forge Döngüsü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bridge' && styles.tabActiveBridge]}
          onPress={() => setActiveTab('bridge')}
        >
          <Ionicons name="videocam" size={16} color={activeTab === 'bridge' ? '#6366F1' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'bridge' && styles.tabTextBridge]}>Uzman Köprüsü</Text>
          {stuckDetected && <View style={styles.alertDot} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'forge' ? (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
          {/* Stats bar */}
          <View style={styles.statsRow}>
            {[
              { label: 'Başarılı', value: cycles.filter(c => c.status === 'success').length, color: '#10B981' },
              { label: 'Rollback', value: cycles.filter(c => c.status === 'rollback').length, color: '#EF4444' },
              { label: 'Toplam', value: cycles.length, color: '#3B82F6' },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Stuck alert */}
          {stuckDetected && (
            <Animated.View style={[styles.stuckAlert, { opacity: stuckOpacity }]}>
              <Ionicons name="warning" size={20} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <Text style={styles.stuckTitle}>STUCK TESPİT EDİLDİ</Text>
                <Text style={styles.stuckSubtitle}>2 üst üste ROLLBACK — Uzman köprüsü tetiklendi</Text>
              </View>
              <TouchableOpacity
                style={styles.stuckBtn}
                onPress={() => { setActiveTab('bridge'); setShowExpertModal(true); }}
              >
                <Text style={styles.stuckBtnText}>Bağlan</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Running progress */}
          {isRunning && (
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Forge döngüsü çalışıyor... (15dk limit)</Text>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
            </View>
          )}

          {/* Cycle list */}
          {[...cycles].reverse().map((cycle) => (
            <View key={cycle.id} style={styles.cycleCard}>
              <View style={styles.cycleHeader}>
                <View style={styles.cycleLeft}>
                  <Ionicons name={statusIcon(cycle.status)} size={20} color={statusColor(cycle.status)} />
                  <Text style={styles.cycleId}>Cycle #{cycle.id}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusColor(cycle.status) + '25' }]}>
                    <Text style={[styles.statusPillText, { color: statusColor(cycle.status) }]}>
                      {cycle.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {cycle.duration && <Text style={styles.cycleDuration}>{cycle.duration}</Text>}
              </View>

              <Text style={styles.cycleReport}>📄 {cycle.report}</Text>
              <Text style={styles.cycleHypothesis}>💡 {cycle.hypothesis}</Text>

              {cycle.logs.length > 0 && (
                <View style={styles.logsContainer}>
                  {cycle.logs.map((log, i) => (
                    <Text key={i} style={[
                      styles.logLine,
                      log.includes('✓') && { color: '#10B981' },
                      log.includes('❌') && { color: '#EF4444' },
                      log.includes('COMMIT') && { color: '#F59E0B' },
                      log.includes('ROLLBACK') && { color: '#EF4444' },
                    ]}>
                      {log}
                    </Text>
                  ))}
                </View>
              )}

              {cycle.status === 'running' && (
                <View style={styles.spinnerRow}>
                  <Ionicons name="sync" size={14} color="#F59E0B" />
                  <Text style={styles.runningText}>İşleniyor...</Text>
                </View>
              )}
            </View>
          ))}

          {/* Run new cycle button */}
          <TouchableOpacity
            style={[styles.newCycleBtn, isRunning && { opacity: 0.5 }]}
            onPress={simulateNewCycle}
            disabled={isRunning}
          >
            <Ionicons name="play-circle" size={22} color="#FFF" />
            <Text style={styles.newCycleBtnText}>
              {isRunning ? 'Çalışıyor...' : 'Yeni Forge Cycle Başlat'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* BRIDGE TAB */
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ html: buildJitsiHTML(expertRoomName) }}
            style={styles.bridgeWebView}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleWebViewMessage}
            originWhitelist={['*']}
          />

          {/* Bridge log */}
          {bridgeLog.length > 0 && (
            <View style={styles.bridgeLogContainer}>
              <Text style={styles.bridgeLogTitle}>📡 Bridge Log</Text>
              <ScrollView style={{ maxHeight: 100 }}>
                {bridgeLog.map((line, i) => (
                  <Text key={i} style={styles.bridgeLogLine}>{line}</Text>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Manual trigger */}
          <TouchableOpacity
            style={styles.expertTriggerBtn}
            onPress={() => setShowExpertModal(true)}
          >
            <Ionicons name="videocam" size={18} color="#FFF" />
            <Text style={styles.expertTriggerText}>Uzmana Bağlan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expert call modal */}
      <Modal visible={showExpertModal} transparent animationType="fade">
        <View style={styles.expertModalOverlay}>
          <View style={styles.expertModalContent}>
            <View style={styles.expertModalIcon}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={styles.expertModalTitle}>Forge Çıkmaza Girdi!</Text>
            <Text style={styles.expertModalBody}>
              Agent aynı raporda 2 cycle üst üste ROLLBACK üretti.{'\n\n'}
              Uzmanla görüntülü köprü açılıyor:{'\n'}
              ✅ Video · ✅ Ses · ✅ Ekran Paylaşımı
            </Text>
            <View style={styles.roomBadge}>
              <Ionicons name="key-outline" size={14} color="#A5B4FC" />
              <Text style={styles.roomText}>{expertRoomName}</Text>
            </View>
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => {
                setShowExpertModal(false);
                setActiveTab('bridge');
                setBridgeLog(prev => [...prev,
                  `[${new Date().toLocaleTimeString('tr-TR')}] ✅ Uzman oturumu başlatıldı`,
                  `[${new Date().toLocaleTimeString('tr-TR')}] 🖥️ Ekran paylaşımı aktif`,
                ]);
                Linking.openURL(`https://meet.jit.si/${expertRoomName}`).catch(() => {});
              }}
            >
              <Ionicons name="videocam" size={18} color="#FFF" />
              <Text style={styles.joinBtnText}>Görüşmeyi Başlat (Jitsi)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => setShowExpertModal(false)}
            >
              <Text style={styles.dismissText}>Daha Sonra</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080B14' },
  header: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, position: 'relative',
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#F59E0B' },
  tabActiveBridge: { borderBottomWidth: 2, borderBottomColor: '#6366F1' },
  tabText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#F59E0B' },
  tabTextBridge: { color: '#6366F1' },
  alertDot: {
    position: 'absolute', top: 10, right: 20,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 12, marginTop: 2 },
  stuckAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', marginBottom: 16,
  },
  stuckTitle: { color: '#EF4444', fontWeight: '800', fontSize: 14 },
  stuckSubtitle: { color: '#94A3B8', fontSize: 12 },
  stuckBtn: {
    backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  stuckBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  progressCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 14, marginBottom: 16,
  },
  progressLabel: { color: '#F59E0B', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#334155', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },
  cycleCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cycleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cycleId: { color: '#F1F5F9', fontWeight: '800', fontSize: 15 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  cycleDuration: { color: '#64748B', fontSize: 12 },
  cycleReport: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  cycleHypothesis: { color: '#CBD5E1', fontSize: 13, lineHeight: 20, marginBottom: 8 },
  logsContainer: {
    backgroundColor: '#0F172A', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  logLine: { color: '#64748B', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
  spinnerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  runningText: { color: '#F59E0B', fontSize: 12 },
  newCycleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#4F46E5', borderRadius: 16, paddingVertical: 18, marginTop: 8,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  newCycleBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  bridgeWebView: { flex: 1 },
  bridgeLogContainer: {
    backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B',
    padding: 12,
  },
  bridgeLogTitle: { color: '#6366F1', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  bridgeLogLine: { color: '#64748B', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
  expertTriggerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6366F1', margin: 16, borderRadius: 14, paddingVertical: 16,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  expertTriggerText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  expertModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  expertModalContent: {
    backgroundColor: '#1E293B', borderRadius: 28, padding: 28, width: '100%',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center',
  },
  expertModalIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239,68,68,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  expertModalTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  expertModalBody: { color: '#94A3B8', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  roomBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
  },
  roomText: { color: '#A5B4FC', fontSize: 12, fontFamily: 'monospace' },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28,
    marginBottom: 12, width: '100%', justifyContent: 'center',
  },
  joinBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  dismissBtn: { paddingVertical: 10 },
  dismissText: { color: '#64748B', fontSize: 14 },
});

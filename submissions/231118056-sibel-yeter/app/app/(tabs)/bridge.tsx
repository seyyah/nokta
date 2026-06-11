import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ─── Jitsi room HTML (embedded in iframe / WebView) ───────────────────────────
const buildJitsiHtml = (roomName: string, displayName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expert Bridge — ${roomName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; background: #0d0f14; font-family: sans-serif; }
    #jitsi-container { width: 100%; height: 100%; }
    #status {
      position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
      background: rgba(168,85,247,0.15); border: 1px solid #a855f7;
      color: #c4b5fd; font-size: 12px; padding: 6px 14px; border-radius: 20px;
      backdrop-filter: blur(8px); z-index: 999; white-space: nowrap;
    }
  </style>
  <script src='https://meet.jit.si/external_api.js'></script>
</head>
<body>
  <div id="status">Bağlanıyor... 🔗</div>
  <div id="jitsi-container"></div>
  <script>
    const domain = 'meet.jit.si';
    const options = {
      roomName: '${roomName}',
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup', 'chat',
          'raisehand', 'videoquality', 'tileview', 'help'
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        DEFAULT_BACKGROUND: '#0d0f14',
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      userInfo: {
        displayName: '${displayName}',
      },
    };

    try {
      const api = new JitsiMeetExternalAPI(domain, options);

      api.addEventListener('videoConferenceJoined', () => {
        document.getElementById('status').textContent = '🟢 Bağlı — Oda: ${roomName}';
        const msg = JSON.stringify({ type: 'joined', room: '${roomName}' });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else window.parent.postMessage(msg, '*');
      });

      api.addEventListener('videoConferenceLeft', () => {
        document.getElementById('status').textContent = '🔴 Görüşme Bitti';
        const msg = JSON.stringify({ type: 'left', room: '${roomName}' });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else window.parent.postMessage(msg, '*');
      });

      api.addEventListener('participantJoined', (participant) => {
        const msg = JSON.stringify({ type: 'participantJoined', id: participant.id });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else window.parent.postMessage(msg, '*');
      });

      // Auto start screen sharing option (desktop only)
      api.addEventListener('readyToClose', () => {
        const msg = JSON.stringify({ type: 'readyToClose' });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else window.parent.postMessage(msg, '*');
      });
    } catch (e) {
      document.getElementById('status').textContent = '❌ Jitsi yüklenemedi: ' + e.message;
    }
  </script>
</body>
</html>
`;

// ─── BRIDGE.md log appender ────────────────────────────────────────────────────
function buildBridgeEntry(params: {
  roomName: string;
  startISO: string;
  endISO: string;
  stuckTopic: string;
  summary: string;
  participants: number;
}): string {
  const dur = Math.round(
    (new Date(params.endISO).getTime() - new Date(params.startISO).getTime()) / 1000
  );
  return `
---
## Expert Bridge Log — ${params.startISO.slice(0, 10)}

| Alan       | Değer                        |
|------------|------------------------------|
| Oda ID     | \`${params.roomName}\`         |
| Başlangıç  | ${params.startISO}           |
| Bitiş      | ${params.endISO}             |
| Süre       | ${dur}s                      |
| Katılımcı  | ${params.participants}       |
| STUCK Konu | \`${params.stuckTopic}\`      |

### Görüşme Özeti
${params.summary}

### Sonraki Cycle için Context
> Bu görüşmede belirlenen çözüm önerisi bir sonraki Forge cycle'ına hipotez olarak feed edilecek.
> Konu: **${params.stuckTopic}**
`;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BridgeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams<{ stuckTopic?: string; auto?: string }>();

  const stuckTopic = params.stuckTopic || 'genel';
  const isAutoTriggered = params.auto === 'true';

  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [summary, setSummary] = useState('');
  const [logSaved, setLogSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startTimeRef = useRef<string>('');
  const endTimeRef = useRef<string>('');
  const roomName = useRef(`nokta-expert-${Date.now()}`).current;
  const displayName = 'Sibel (Nokta Agent)';

  const jitsiHtml = buildJitsiHtml(roomName, displayName);

  // ── Web iframe ref ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'joined') {
          setCallActive(true);
          setParticipants((p) => p + 1);
          startTimeRef.current = new Date().toISOString();
        } else if (data.type === 'left' || data.type === 'readyToClose') {
          setCallActive(false);
          setCallEnded(true);
          endTimeRef.current = new Date().toISOString();
        } else if (data.type === 'participantJoined') {
          setParticipants((p) => p + 1);
        }
      } catch (_) {}
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSaveLog = () => {
    if (!summary.trim()) {
      Alert.alert('Özet Gerekli', 'Lütfen görüşme özetini girin.');
      return;
    }

    setIsLoading(true);
    const entry = buildBridgeEntry({
      roomName,
      startISO: startTimeRef.current || new Date().toISOString(),
      endISO: endTimeRef.current || new Date().toISOString(),
      stuckTopic,
      summary,
      participants,
    });

    // In a real app, write to BRIDGE.md via FileSystem API
    // For web demo, we console.log and copy to clipboard
    console.log('=== BRIDGE.md ENTRY ===\n', entry);
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(entry).catch(() => {});
    }

    setTimeout(() => {
      setLogSaved(true);
      setIsLoading(false);
      Alert.alert(
        'BRIDGE.md Güncellendi',
        `Log kaydedildi. Sonraki Forge cycle'ı "${stuckTopic}" konusunda bu özetle başlayacak.`,
        [{ text: 'Forge\'a Dön', onPress: () => router.push('/agent') }]
      );
    }, 800);
  };

  const handleManualStart = () => {
    setCallActive(true);
    startTimeRef.current = new Date().toISOString();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0f14' : '#f1f5f9' }]}>
      
      {/* Header Banner */}
      {isAutoTriggered && !callEnded && (
        <View style={styles.stuckBanner}>
          <Ionicons name="warning" size={16} color="#fbbf24" />
          <Text style={styles.stuckText}>
            STUCK TESPİT EDİLDİ — Konu: <Text style={{ fontWeight: 'bold' }}>{stuckTopic}</Text>
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Ionicons name="videocam" size={22} color="#a855f7" />
          </View>
          <View>
            <Text style={[styles.title, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              Uzman Köprüsü
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#64748b' : '#94a3b8' }]}>
              WebRTC · Jitsi Meet · Ekran Paylaşımı
            </Text>
          </View>
        </View>

        {/* Room Info Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
          <Text style={[styles.cardLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Oda ID</Text>
          <Text style={[styles.codeText, { color: '#a855f7' }]}>{roomName}</Text>
          <View style={styles.infoRow}>
            <View style={[styles.badge, { backgroundColor: callActive ? '#14532d' : isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.dot, { backgroundColor: callActive ? '#4ade80' : '#64748b' }]} />
              <Text style={[styles.badgeText, { color: callActive ? '#4ade80' : '#64748b' }]}>
                {callActive ? 'CANLI' : callEnded ? 'BİTTİ' : 'HAZIR'}
              </Text>
            </View>
            {participants > 0 && (
              <View style={[styles.badge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', marginLeft: 8 }]}>
                <Ionicons name="people" size={12} color="#94a3b8" />
                <Text style={[styles.badgeText, { color: '#94a3b8', marginLeft: 4 }]}>
                  {participants} katılımcı
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.hint, { color: isDark ? '#475569' : '#94a3b8' }]}>
            💡 Sınıf arkadaşına aşağıdaki oda adını paylaş: meet.jit.si/{roomName}
          </Text>
        </View>

        {/* Jitsi Video Frame */}
        <View style={[styles.videoBox, { borderColor: isDark ? '#2d3748' : '#e2e8f0' }]}>
          {Platform.OS === 'web' ? (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore — iframe is valid on web
            <iframe
              id="jitsi-iframe"
              srcDoc={jitsiHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#0d0f14',
                borderRadius: 12,
              }}
              allow="camera; microphone; display-capture; autoplay; fullscreen"
            />
          ) : (
            // Native: open Jitsi in system browser (WebView has camera restrictions)
            <View style={styles.nativeCallBox}>
              <Ionicons name="videocam" size={48} color="#a855f7" />
              <Text style={[styles.nativeCallText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                Native görüşme için
              </Text>
              <TouchableOpacity
                style={styles.openBrowserBtn}
                onPress={() => {
                  const { Linking } = require('react-native');
                  Linking.openURL(`https://meet.jit.si/${roomName}`);
                  handleManualStart();
                }}>
                <Ionicons name="open-outline" size={16} color="#fff" />
                <Text style={styles.openBrowserText}>Tarayıcıda Aç</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions */}
        {!callEnded && (
          <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              🎯 Demo Kontrol Listesi
            </Text>
            {[
              'Kameran ve mikrofonuna izin ver',
              'Sınıf arkadaşını oda linkiyle davet et',
              'Masaüstünü paylaş (🖥️ Desktop butonu)',
              'En az 60 saniye görüşme yap',
              'STUCK konusunu uzmanla tartış',
            ].map((item, i) => (
              <View key={i} style={styles.checkRow}>
                <View style={styles.checkNum}>
                  <Text style={styles.checkNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.checkText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary Panel (shown after call ends) */}
        {(callEnded || callActive) && !logSaved && (
          <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              📝 Görüşme Özeti → BRIDGE.md
            </Text>
            <Text style={[styles.cardDesc, { color: isDark ? '#64748b' : '#94a3b8' }]}>
              Görüşmede ne konuşuldu? Çözüm önerisi neydi? Bu metin bir sonraki Forge cycle'ına context olarak eklenecek.
            </Text>
            <TextInput
              style={[
                styles.summaryInput,
                {
                  backgroundColor: isDark ? '#0f1115' : '#f8fafc',
                  color: isDark ? '#e2e8f0' : '#0f172a',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                },
              ]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Görüşme özetini buraya yaz..."
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSaveLog}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>BRIDGE.md'ye Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Log saved confirmation */}
        {logSaved && (
          <View style={[styles.card, styles.successCard]}>
            <Ionicons name="checkmark-circle" size={32} color="#4ade80" />
            <Text style={styles.successText}>BRIDGE.md güncellendi!</Text>
            <Text style={styles.successSub}>
              Sonraki Forge cycle'ı "{stuckTopic}" konusundaki çözüm önerisiyle başlayacak.
            </Text>
            <TouchableOpacity
              style={styles.forgeBtn}
              onPress={() => router.push('/agent')}>
              <Ionicons name="hardware-chip-outline" size={16} color="#fff" />
              <Text style={styles.forgeBtnText}>Forge Agent'a Dön</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },

  stuckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#451a03',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#92400e',
  },
  stuckText: { color: '#fbbf24', fontSize: 13 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  codeText: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  hint: { fontSize: 11, lineHeight: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  cardDesc: { fontSize: 12, lineHeight: 18, marginBottom: 12 },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  checkNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(168,85,247,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkNumText: { fontSize: 10, color: '#a855f7', fontWeight: '700' },
  checkText: { flex: 1, fontSize: 13, lineHeight: 20 },

  videoBox: {
    width: '100%',
    height: 480,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#0d0f14',
  },
  nativeCallBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  nativeCallText: { fontSize: 14 },
  openBrowserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#a855f7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  openBrowserText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  summaryInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    minHeight: 120,
    marginBottom: 12,
    lineHeight: 20,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  successCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(20,83,45,0.3)',
    borderWidth: 1,
    borderColor: '#166534',
  },
  successText: { color: '#4ade80', fontSize: 18, fontWeight: '700', marginTop: 8 },
  successSub: { color: '#86efac', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  forgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  forgeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

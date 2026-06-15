import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, Alert, ScrollView, Platform, Linking,
} from 'react-native';
import { AuditWidget, AuditReport } from '../audit/AuditWidget';

// Lazy load WebView only on native
let WebView: any = null;
if (Platform.OS !== 'web') {
  try { WebView = require('react-native-webview').WebView; } catch (_) {}
}

interface Props {
  onBack: () => void;
  onBridgeSaved: (summary: string) => void;
  autoTriggered?: boolean;
}

export const ExpertCallScreen: React.FC<Props> = ({ onBack, onBridgeSaved, autoTriggered = false }) => {
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState('forge-audit-231118066');
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const jitsiUrl = useMemo(
    () => `https://meet.jit.si/${roomName}#config.startWithVideoMuted=false&config.startWithAudioMuted=false&userInfo.displayName=231118066-Alperen`,
    [roomName]
  );

  const startCall = () => {
    if (Platform.OS === 'web') {
      // Web'de yeni sekmede aç
      if (typeof window !== 'undefined') {
        window.open(jitsiUrl, '_blank');
      }
      setShowSummary(true);
    } else {
      setInCall(true);
    }
  };

  // Summary screen
  if (showSummary) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setShowSummary(false)}>
            <Text style={s.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={s.title}>📝 Görüşme Özeti</Text>
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.label}>BRIDGE.md'ye eklenecek özet:</Text>
          <TextInput
            style={s.summaryInput}
            multiline
            placeholder="Uzmanla görüşme özeti..."
            placeholderTextColor="#444"
            value={summary}
            onChangeText={setSummary}
            autoFocus
          />
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => {
              if (!summary.trim()) { Alert.alert('Özet boş olamaz'); return; }
              onBridgeSaved(summary);
              Alert.alert('✅ BRIDGE.md güncellendi');
              onBack();
            }}
          >
            <Text style={s.saveBtnTxt}>💾 BRIDGE.md'ye Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // In-call screen (native only)
  if (inCall && Platform.OS !== 'web' && WebView) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.callHeader}>
          <Text style={s.callTitle}>📞 {roomName}</Text>
          <TouchableOpacity
            style={s.endBtn}
            onPress={() => { setInCall(false); setShowSummary(true); }}
          >
            <Text style={s.endBtnTxt}>📵 Bitir</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: jitsiUrl }}
          style={{ flex: 1 }}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
        />
      </SafeAreaView>
    );
  }

  // Idle screen
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>← Geri</Text></TouchableOpacity>
        <Text style={s.title}>📞 Uzmana Bağlan</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {autoTriggered && (
          <View style={s.alertCard}>
            <Text style={s.alertTxt}>⚠️ 2 ardışık FAIL/ROLLBACK — uzman önerilir.</Text>
          </View>
        )}

        <Text style={s.label}>Jitsi Oda Adı</Text>
        <TextInput
          style={s.input}
          value={roomName}
          onChangeText={setRoomName}
          autoCapitalize="none"
          placeholderTextColor="#444"
        />
        <Text style={s.hint}>
          Arkadaşına şu linki gönder:{'\n'}
          <Text style={s.hintLink}>meet.jit.si/{roomName}</Text>
        </Text>

        <TouchableOpacity style={s.callBtn} onPress={startCall}>
          <Text style={s.callBtnTxt}>📞 Görüşmeyi Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.copyBtn}
          onPress={() => Linking.openURL(jitsiUrl)}
        >
          <Text style={s.copyBtnTxt}>🔗 Jitsi Linkini Aç</Text>
        </TouchableOpacity>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Gereksinimler</Text>
          <Text style={s.infoTxt}>✅ Ekran paylaşımı{'\n'}✅ Ses{'\n'}✅ Video{'\n'}📝 Görüşme sonrası özet BRIDGE.md'ye kaydedilir</Text>
        </View>
      </ScrollView>
      <AuditWidget screenName="Uzman Görüşmesi" onReport={(r: AuditReport) => console.log('audit', r.id)} />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a14' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  callHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#1a1a2e' },
  back: { color: '#7b8cde', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#fff' },
  callTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  alertCard: { backgroundColor: '#4a1010', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#ef5350' },
  alertTxt: { color: '#ef9a9a', fontSize: 14 },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333' },
  summaryInput: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333', minHeight: 160, textAlignVertical: 'top' },
  hint: { color: '#555', fontSize: 12, lineHeight: 20 },
  hintLink: { color: '#7b8cde' },
  callBtn: { backgroundColor: '#1b5e20', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#4caf50' },
  callBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  copyBtn: { backgroundColor: '#1a1a2e', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  copyBtnTxt: { color: '#7b8cde', fontSize: 15, fontWeight: '600' },
  endBtn: { backgroundColor: '#b71c1c', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  endBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  saveBtn: { backgroundColor: '#1a237e', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoCard: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#333' },
  infoTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  infoTxt: { color: '#aaa', fontSize: 13, lineHeight: 24 },
});

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function BridgeScreen() {
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  const [reloadSeed, setReloadSeed] = useState(0);

  const room = useMemo(() => `NoktaExpertBridge-${new Date().getTime()}`, []);
  const uri = useMemo(() => {
    return `https://meet.jit.si/${room}#config.startWithAudioMuted=${mutedAudio ? 'true' : 'false'}&config.startWithVideoMuted=${mutedVideo ? 'true' : 'false'}&interfaceConfig.DISPLAY_WELCOME_PAGE=false`;
  }, [room, mutedAudio, mutedVideo, reloadSeed]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0f" />
      <View style={styles.header}>
        <Text style={styles.title}>Uzman Köprüsü</Text>
        <Text style={styles.subtitle}>Jitsi destekli canlı görüşme kanalı</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setMutedAudio((prev) => !prev)}>
          <Text style={styles.toggleText}>{mutedAudio ? 'Ses Aç' : 'Ses Kapat'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setMutedVideo((prev) => !prev)}>
          <Text style={styles.toggleText}>{mutedVideo ? 'Kamera Aç' : 'Kamera Kapat'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setReloadSeed((count) => count + 1)}>
          <Text style={styles.toggleText}>Yeniden Bağlan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.webviewWrapper}>
        <WebView source={{ uri }} style={styles.webview} startInLoadingState />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ekran paylaşımı ve kamera kontrolü Jitsi arayüzünden yönetilebilir.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090d' },
  header: { padding: 20 },
  title: { color: '#f5f0e8', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#a8a8b3', fontSize: 13 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  toggleButton: { backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#222', paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  toggleText: { color: '#f5f0e8', fontWeight: '700' },
  webviewWrapper: { flex: 1, marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  webview: { flex: 1 },
  footer: { padding: 18 },
  footerText: { color: '#888', fontSize: 13, lineHeight: 20 },
});

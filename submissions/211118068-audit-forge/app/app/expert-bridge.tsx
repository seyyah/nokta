import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';

const ROOM = 'nokta-211118068-expert-bridge';

export default function ExpertBridgeScreen() {
  const meetUrl = useMemo(
    () =>
      `https://meet.jit.si/${ROOM}#config.startWithAudioMuted=false&config.startWithVideoMuted=false`,
    []
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Uzman Köprüsü',
          headerBackTitle: 'Geri',
        }}
      />
      <Text style={styles.hint}>
        Video + ses + ekran paylaşımı (Jitsi). STUCK sonrası uzmanla bağlan.
      </Text>
      <WebView
        source={{ uri: meetUrl }}
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
      />
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>Görüşmeyi kapat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  hint: { color: '#CBD5E1', padding: 12, fontSize: 13 },
  webview: { flex: 1 },
  closeBtn: {
    backgroundColor: '#2563EB',
    margin: 12,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: '#FFF', fontWeight: '700' },
});

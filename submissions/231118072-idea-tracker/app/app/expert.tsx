import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

const ROOM_URL = 'https://meet.jit.si/nokta-nokta-expert-call-231118072';

export default function ExpertCallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // For native: WebView needs permissions
  // In iOS and Android WebView, Jitsi uses standard WebRTC APIs which are built in.

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backText}>🚪 Aramayı Kapat</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Uzman Destek Köprüsü</Text>
        <Text style={styles.statusBadge}>🟢 CANLI BAĞLANTI</Text>
      </View>

      {/* WebRTC Video Call Area */}
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          // Web platform uses standard iframe
          <iframe
            src={ROOM_URL}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
          />
        ) : (
          // Native uses react-native-webview
          <WebView
            source={{ uri: ROOM_URL }}
            style={{ flex: 1, borderRadius: 16 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            // Request permissions for Android WebView
            originWhitelist={['*']}
            mixedContentMode="always"
          />
        )}

        {loading && Platform.OS !== 'web' && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loaderText}>Görüntülü Köprü Kuruluyor...</Text>
          </View>
        )}
      </View>

      {/* Info panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          ⚡ **Görüntü + Ses + Ekran Paylaşımı** etkinleştirildi.
        </Text>
        <Text style={styles.infoSubtext}>
          Geliştirici veya kodlama ajanı tıkandığında (2 kez üst üste hata alındığında) bu köprü otomatik olarak tetiklenir.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusBadge: {
    backgroundColor: '#1A2E1A',
    borderColor: '#2ECC7140',
    borderWidth: 1,
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#16162A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#6C63FF30',
    overflow: 'hidden',
    position: 'relative',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#8888AA',
    fontSize: 14,
    fontWeight: '500',
  },
  infoPanel: {
    backgroundColor: '#16162A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    padding: 14,
    marginTop: 16,
    gap: 6,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoSubtext: {
    color: '#8888AA',
    fontSize: 11,
    lineHeight: 16,
  },
});

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, PermissionsAndroid, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ExpertCallScreen({ navigation }) {
  // Request Android native permissions for Camera & Audio
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
        } catch (err) {
          console.warn('Android permissions request failed:', err);
        }
      }
    }
    requestPermissions();
  }, []);

  // Jitsi URL using a free community Jitsi instance (meet.ffmuc.net) which does NOT require moderator login!
  const jitsiRoomUrl = 
    'https://meet.ffmuc.net/nokta-expert-bridge-231118004#config.prejoinPageEnabled=false&config.disableDeepLinking=true&interfaceConfig.MOBILE_APP_PROMO=false&config.startWithVideoMuted=true&config.startWithAudioMuted=true';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Back Button and External Browser Link */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uzman Köprüsü</Text>
        <TouchableOpacity 
          style={styles.browserButton} 
          onPress={() => Linking.openURL(jitsiRoomUrl)}
        >
          <Text style={styles.browserButtonText}>🌐 Tarayıcıda Aç</Text>
        </TouchableOpacity>
      </View>

      {/* WebRTC Video Call WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: jitsiRoomUrl }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // WebView permission handler for Android (resolves "configuring devices" block)
          onPermissionRequest={(request) => {
            request.grant(request.resources);
          }}
          // We set a custom userAgent so Jitsi doesn't prompt to download the native app
          userAgent={
            Platform.OS === 'ios'
              ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
              : 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Mobile Safari/537.36'
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080814',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#080814',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  browserButton: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  browserButtonText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '700',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});

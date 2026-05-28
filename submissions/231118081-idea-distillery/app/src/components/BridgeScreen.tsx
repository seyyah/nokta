import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  postBridgeTranscript,
  type BridgeStatus,
} from '../services/bridge';
import { palette, shadows } from '../theme';

type BridgeScreenProps = {
  fallbackStatus: BridgeStatus | null;
  onBack: () => void;
};

const FALLBACK_ROOM_NAME = 'nokta-231118081-manual-bridge';
const FALLBACK_ROOM_URL = `https://meet.jit.si/${FALLBACK_ROOM_NAME}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

export function BridgeScreen({ fallbackStatus, onBack }: BridgeScreenProps) {
  const roomUrl = fallbackStatus?.roomUrl || FALLBACK_ROOM_URL;
  const roomName = fallbackStatus?.roomName || FALLBACK_ROOM_NAME;
  const [recap, setRecap] = useState('');
  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const nextContext = useMemo(
    () =>
      recap
        ? `Expert bridge recap for ${roomName}: ${recap}`
        : `Expert bridge opened for ${roomName}. Awaiting recap.`,
    [recap, roomName],
  );

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setMessage(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript.trim() ?? '';

    if (transcript) {
      setRecap(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setMessage(event.message || 'Bridge recap dictation failed.');
  });

  useEffect(() => () => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const toggleRecapDictation = async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permission.granted) {
      setMessage('Microphone or speech permission was denied.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      addsPunctuation: true,
      continuous: false,
      interimResults: true,
      lang: 'tr-TR',
    });
  };

  const saveRecap = async () => {
    if (!recap.trim()) {
      setMessage('Add a bridge recap before saving.');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await postBridgeTranscript({
        nextCycleContext: nextContext,
        summary: recap.trim(),
      });
      setMessage('BRIDGE.md updated on the forge server.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bridge recap could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>Expert Bridge</Text>
          <Text style={styles.roomName}>{roomName}</Text>
        </View>
      </View>

      <View style={styles.webFrame}>
        <WebView
          allowsInlineMediaPlayback
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
          source={{ uri: roomUrl }}
          style={styles.webView}
        />
      </View>

      <ScrollView contentContainerStyle={styles.panel}>
        <Text style={styles.title}>Bridge recap</Text>
        <Text style={styles.helperText}>
          After the expert call, dictate the resolution. The server writes it to BRIDGE.md and feeds it into the next forge prompt.
        </Text>
        <View style={styles.recapBox}>
          <Text style={recap ? styles.recapText : styles.recapPlaceholder}>
            {recap || 'No recap dictated yet.'}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => void toggleRecapDictation()}
            style={[styles.primaryAction, listening ? styles.stopAction : null]}
          >
            <Text style={styles.primaryActionText}>
              {listening ? 'Stop Recap' : 'Dictate Recap'}
            </Text>
          </Pressable>
          <Pressable
            disabled={saving}
            onPress={() => void saveRecap()}
            style={[styles.secondaryAction, saving ? styles.disabledAction : null]}
          >
            {saving ? (
              <ActivityIndicator color={palette.ink} size="small" />
            ) : (
              <Text style={styles.secondaryActionText}>Save BRIDGE.md</Text>
            )}
          </Pressable>
        </View>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  backButton: {
    backgroundColor: palette.surface,
    borderColor: palette.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  disabledAction: {
    opacity: 0.5,
  },
  eyebrow: {
    color: palette.blue,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    textAlign: 'right',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  helperText: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  messageText: {
    color: palette.success,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    marginTop: 10,
  },
  panel: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 16,
    ...shadows,
  },
  primaryAction: {
    backgroundColor: palette.blue,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  recapBox: {
    backgroundColor: palette.background,
    borderColor: palette.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 78,
    padding: 12,
  },
  recapPlaceholder: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 20,
  },
  recapText: {
    color: palette.ink,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    lineHeight: 20,
  },
  roomName: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    marginTop: 2,
    textAlign: 'right',
  },
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 8,
    minWidth: 128,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  stopAction: {
    backgroundColor: palette.rust,
  },
  title: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
  },
  webFrame: {
    backgroundColor: palette.ink,
    flex: 1,
    minHeight: 360,
  },
  webView: {
    flex: 1,
  },
});

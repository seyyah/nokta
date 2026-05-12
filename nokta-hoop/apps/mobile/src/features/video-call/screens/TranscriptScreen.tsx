import type { CallTranscript } from '@nokta-hoop/hoop-call';
import { formatOffset } from '@nokta-hoop/hoop-call';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getTranscriptExportUrl,
  type TranscriptExportFormat,
} from '../../../services/transcript';
import type { TranscriptFetchStatus } from '../types';

type TranscriptScreenProps = {
  callId: string;
  transcript: CallTranscript | null;
  status: TranscriptFetchStatus;
  message: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onNewCall: () => void;
  onBack: () => void;
};

export function TranscriptScreen({
  callId,
  transcript,
  status,
  message,
  refreshing,
  onRefresh,
  onNewCall,
  onBack,
}: TranscriptScreenProps) {
  const isWaiting = status === 'processing' || refreshing;
  const hasTranscriptLines = Boolean(transcript && transcript.items.length > 0);
  const title =
    status === 'ready' && transcript
      ? hasTranscriptLines
        ? `${transcript.items.length} transkript satırı`
        : 'Konuşma bulunamadı'
      : isWaiting
        ? 'Transkript yükleniyor'
      : 'Transkript';

  const exportTranscript = async (format: TranscriptExportFormat) => {
    if (!transcript) {
      return;
    }

    try {
      const url = getTranscriptExportUrl({
        callType: transcript.callType,
        callId: transcript.callId,
        language: transcript.language,
        format,
      });
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Dışa aktarma başarısız',
        error instanceof Error ? error.message : 'Transkript dışa aktarılamadı.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Geri</Text>
        </Pressable>
        <Text style={styles.roomText}>{callId}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentBody}
        showsVerticalScrollIndicator={false}
      >
        {transcript ? (
          <>
            <View style={styles.exportPanel}>
              <Text style={styles.exportTitle}>Transkripti indir</Text>
              <View style={styles.exportActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void exportTranscript('md')}
                  style={({ pressed }) => [
                    styles.exportButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <Text style={styles.exportButtonText}>MD</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void exportTranscript('txt')}
                  style={({ pressed }) => [
                    styles.exportButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <Text style={styles.exportButtonText}>TXT</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void exportTranscript('json')}
                  style={({ pressed }) => [
                    styles.exportButton,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  <Text style={styles.exportButtonText}>JSON</Text>
                </Pressable>
              </View>
            </View>

            {hasTranscriptLines ? (
              transcript.items.map((item) => (
                <View key={item.id} style={styles.line}>
                  <View style={styles.lineMeta}>
                    <Text style={styles.time}>{formatOffset(item.startedAtMs)}</Text>
                    <Text style={styles.speaker}>{item.speakerLabel}</Text>
                  </View>
                  <Text style={styles.text}>{item.text}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Konuşma algılanmadı</Text>
                <Text style={styles.emptyMessage}>
                  Stream transcript dosyasını döndürdü, ancak görüşmede
                  yazıya çevrilecek konuşma satırı bulunamadı. Görüşme
                  tamamlandı kabul edilir.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            {isWaiting ? (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator color="#7dd3fc" size="large" />
              </View>
            ) : null}
            <Text style={styles.emptyTitle}>
              {isWaiting
                ? 'Transkript hazırlanıyor'
                : status === 'failed'
                  ? 'Transkript alınamadı'
                  : 'Transkript bekleniyor'}
            </Text>
            <Text style={styles.emptyMessage}>
              {message ??
                (isWaiting
                  ? 'Stream oturum transkriptini işliyor. Lütfen bu ekranda bekleyin.'
                  : 'Stream işlemeyi bitirince transkript burada görünecek.')}
            </Text>
            {isWaiting ? (
              <Text style={styles.waitHint}>Oturum bittikten sonra bu işlem biraz sürebilir.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          disabled={refreshing}
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.secondaryButton,
            refreshing ? styles.disabledButton : null,
            pressed && !refreshing ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            {refreshing ? 'Kontrol ediliyor...' : 'Yenile'}
          </Text>
        </Pressable>
        <Pressable
          disabled={refreshing}
          onPress={onNewCall}
          style={({ pressed }) => [
            styles.primaryButton,
            refreshing ? styles.disabledButton : null,
            pressed && !refreshing ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>Yeni oturum</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 5,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#7dd3fc',
    fontSize: 15,
    fontWeight: '900',
  },
  roomText: {
    color: '#8ca3b8',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#f8fafc',
    fontSize: 25,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  contentBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  line: {
    borderRadius: 8,
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
    padding: 12,
    gap: 8,
  },
  exportPanel: {
    borderRadius: 8,
    backgroundColor: '#102235',
    borderWidth: 1,
    borderColor: '#1f4768',
    padding: 12,
    gap: 10,
  },
  exportTitle: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '900',
  },
  exportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#0f3d5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  lineMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  time: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '900',
  },
  speaker: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'right',
  },
  text: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 8,
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  loadingIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#102235',
    borderWidth: 1,
    borderColor: '#1f4768',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyMessage: {
    color: '#b6c5d4',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  waitHint: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#13243a',
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#13243a',
    borderWidth: 1,
    borderColor: '#295071',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButtonText: {
    color: '#bae6fd',
    fontSize: 15,
    fontWeight: '900',
  },
});

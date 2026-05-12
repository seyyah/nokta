import type {
  EscalationRequest,
  MentorSessionMessage,
} from '@nokta-hoop/hoop-core';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ParticipantView,
  StreamCall,
  StreamVideo,
  useCallStateHooks,
  type StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import type { Call } from '@stream-io/video-client';

import { useCallEndedEffect } from '../../video-call/useCallEndedEffect';

type MentorLiveScreenProps = {
  call: Call;
  client: StreamVideoClient;
  escalation: EscalationRequest;
  leaving: boolean;
  messages: MentorSessionMessage[];
  statusText: string | null;
  onCallEnded: () => Promise<void>;
  onEnd: () => Promise<void>;
  onRefreshMessages: () => Promise<void>;
};

export function MentorLiveScreen({
  call,
  client,
  escalation,
  leaving,
  messages,
  statusText,
  onCallEnded,
  onEnd,
  onRefreshMessages,
}: MentorLiveScreenProps) {
  const callEnded = useCallEndedEffect({
    call,
    disabled: leaving,
    onCallEnded,
  });

  const endSession = async () => {
    callEnded.markHandled();
    await onEnd();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>mentor live</Text>
            <Text style={styles.title}>{escalation.requester.name}</Text>
            <Text numberOfLines={2} style={styles.topic}>
              {escalation.topic}
            </Text>
          </View>

          <View style={styles.videoWrap}>
            <MentorLocalVideo leaving={leaving} statusText={statusText} />
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Kullanıcı mesajları</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void onRefreshMessages()}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                <Text style={styles.refreshButtonText}>Yenile</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.messages}
              contentContainerStyle={styles.messagesBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.messageCard}>
                <Text style={styles.messageRole}>İlk soru</Text>
                <Text style={styles.messageText}>{escalation.question}</Text>
              </View>
              {messages.length === 0 ? (
                <Text style={styles.emptyText}>
                  Kullanıcı ek mesaj yazarsa burada görünecek.
                </Text>
              ) : null}
              {messages.map((message) => (
                <View key={message.id} style={styles.messageCard}>
                  <Text style={styles.messageRole}>{message.author.name}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={leaving}
              onPress={() => void endSession()}
              style={({ pressed }) => [
                styles.endButton,
                leaving ? styles.disabledButton : null,
                pressed && !leaving ? styles.buttonPressed : null,
              ]}
            >
              {leaving ? <ActivityIndicator color="#ffffff" /> : null}
              <Text style={styles.endButtonText}>
                {leaving ? 'Oturum bitiyor...' : 'Oturumu bitir'}
              </Text>
            </Pressable>
          </View>
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
}

function MentorLocalVideo({
  leaving,
  statusText,
}: {
  leaving: boolean;
  statusText: string | null;
}) {
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  return (
    <View style={styles.videoSurface}>
      {localParticipant ? (
        <ParticipantView
          participant={localParticipant}
          isVisible
          objectFit="cover"
          style={styles.participant}
          trackType="videoTrack"
        />
      ) : (
        <View style={styles.waiting}>
          <ActivityIndicator color="#ffffff" />
          <Text style={styles.waitingText}>Kamera hazırlanıyor...</Text>
        </View>
      )}

      {leaving || statusText ? (
        <View style={styles.statusOverlay}>
          {leaving ? <ActivityIndicator color="#ffffff" /> : null}
          <Text style={styles.statusText}>{statusText ?? 'Oturum kapanıyor...'}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 4,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '900',
  },
  topic: {
    color: '#b6c5d4',
    fontSize: 13,
    fontWeight: '800',
  },
  videoWrap: {
    height: 360,
    paddingHorizontal: 18,
  },
  videoSurface: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
  },
  participant: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#0e1c2e',
  },
  waiting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  waitingText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '900',
  },
  statusOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(7, 89, 133, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  panel: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  panelTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  refreshButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#13243a',
    borderWidth: 1,
    borderColor: '#295071',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  refreshButtonText: {
    color: '#bae6fd',
    fontSize: 12,
    fontWeight: '900',
  },
  messages: {
    flex: 1,
  },
  messagesBody: {
    gap: 8,
    paddingBottom: 12,
  },
  messageCard: {
    borderRadius: 8,
    backgroundColor: '#0e1c2e',
    borderWidth: 1,
    borderColor: '#1f3b54',
    padding: 12,
    gap: 5,
  },
  messageRole: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  messageText: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    color: '#8ca3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  actions: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  endButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
});

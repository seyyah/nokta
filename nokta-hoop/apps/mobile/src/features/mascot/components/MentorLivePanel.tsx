import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  ParticipantView,
  StreamCall,
  StreamVideo,
  useCallStateHooks,
  type StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import type { Call } from '@stream-io/video-client';

import { useCallEndedEffect } from '../../video-call/useCallEndedEffect';

type MentorLivePanelProps = {
  call: Call;
  client: StreamVideoClient;
  leaving: boolean;
  statusText: string | null;
  onCallEnded: () => Promise<void>;
};

export function MentorLivePanel({
  call,
  client,
  leaving,
  statusText,
  onCallEnded,
}: MentorLivePanelProps) {
  useCallEndedEffect({
    call,
    disabled: leaving,
    onCallEnded,
  });

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <View style={styles.panel}>
          <MentorVideoSurface leaving={leaving} statusText={statusText} />
        </View>
      </StreamCall>
    </StreamVideo>
  );
}

function MentorVideoSurface({
  leaving,
  statusText,
}: {
  leaving: boolean;
  statusText: string | null;
}) {
  const { useRemoteParticipants } = useCallStateHooks();
  const remoteParticipants = useRemoteParticipants();
  const mentor = remoteParticipants[0];

  return (
    <View style={styles.videoSurface}>
      {mentor ? (
        <ParticipantView
          participant={mentor}
          isVisible
          objectFit="cover"
          style={styles.participant}
          trackType="videoTrack"
        />
      ) : (
        <View style={styles.waiting}>
          <ActivityIndicator color="#ffffff" />
          <Text style={styles.waitingText}>Mentor bağlanıyor...</Text>
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
  panel: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#07111f',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  videoSurface: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#07111f',
  },
  participant: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#07111f',
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
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
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
    textAlign: 'center',
  },
});

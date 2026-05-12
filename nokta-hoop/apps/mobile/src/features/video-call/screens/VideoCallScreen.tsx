import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StreamCall,
  StreamVideo,
  type StreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import { type Call } from '@stream-io/video-client';

import { EqualParticipantsGrid } from '../components/EqualParticipantsGrid';
import { VideoCallControls } from '../components/VideoCallControls';
import { useCallEndedEffect } from '../useCallEndedEffect';

type VideoCallScreenProps = {
  call: Call;
  client: StreamVideoClient;
  leaving: boolean;
  statusText: string | null;
  onCallEnded: () => Promise<void>;
  onLeave: () => Promise<void>;
};

export function VideoCallScreen({
  call,
  client,
  leaving,
  statusText,
  onCallEnded,
  onLeave,
}: VideoCallScreenProps) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const callEnded = useCallEndedEffect({
    call,
    disabled: leaving,
    onCallEnded,
  });

  useEffect(() => {
    if (!controlsVisible || leaving) {
      return;
    }

    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);

    return () => clearTimeout(timeout);
  }, [controlsVisible, leaving]);

  const handleLeavePress = async () => {
    callEnded.markHandled();
    await onLeave();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <Pressable
            disabled={leaving}
            style={styles.callSurface}
            onPress={() => setControlsVisible((visible) => !visible)}
          >
            <EqualParticipantsGrid />

            {leaving || statusText ? (
              <View pointerEvents="none" style={styles.statusOverlay}>
                {leaving ? <ActivityIndicator color="#e0f2fe" /> : null}
                <Text style={styles.statusText}>
                  {statusText ?? 'Ending call...'}
                </Text>
              </View>
            ) : null}

            {controlsVisible && !leaving ? (
              <VideoCallControls onHangupCallHandler={handleLeavePress} />
            ) : null}
          </Pressable>
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  callSurface: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  statusOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 14,
    zIndex: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(7, 89, 133, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});

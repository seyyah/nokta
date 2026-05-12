import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ReactionsButton,
  ToggleAudioPublishingButton,
  ToggleCameraFaceButton,
  ToggleVideoPublishingButton,
} from '@stream-io/video-react-native-sdk';

type VideoCallControlsProps = {
  onHangupCallHandler: () => Promise<void> | void;
};

export function VideoCallControls({
  onHangupCallHandler,
}: VideoCallControlsProps) {
  return (
    <View style={styles.container}>
      <ToggleVideoPublishingButton />
      <ToggleAudioPublishingButton />
      <ToggleCameraFaceButton />
      <ReactionsButton />
      <Pressable
        accessibilityLabel="Görüşmeyi bitir"
        accessibilityRole="button"
        onPress={() => void onHangupCallHandler()}
        style={({ pressed }) => [
          styles.endButton,
          pressed ? styles.endButtonPressed : null,
        ]}
      >
        <Text style={styles.endButtonText}>Bitir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: '#075985',
    borderWidth: 1,
    borderColor: '#38bdf8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  endButton: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 12,
  },
  endButtonPressed: {
    opacity: 0.8,
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});

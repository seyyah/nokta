import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceVisualizerProps {
  onLevelChange?: (level: number) => void;
}

const normalizeMetering = (db: number): number => {
  // Metering in expo-av typically ranges from -160 (silence) to 0 (maximum volume)
  const clampedDb = Math.max(-160, Math.min(0, db));
  const linear = (clampedDb + 160) / 160; // Scale linearly from 0 to 1

  // Enhance speaking voice range (-45 dB to -10 dB) for a more responsive UI
  if (linear < 0.6) {
    // Noise floor or quiet ambient sound
    return Math.max(0, (linear / 0.6) * 0.05);
  } else {
    // Dynamic speaking levels scaled up smoothly to full range (0.05 to 1.0)
    return 0.05 + ((linear - 0.6) / 0.4) * 0.95;
  }
};

export default function VoiceVisualizer({ onLevelChange }: VoiceVisualizerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const voiceLevel = useRef(new Animated.Value(0)).current;

  // Set up 5 animated bars scaling dynamically with voice intensity
  const barScales = [
    voiceLevel.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }),
    voiceLevel.interpolate({ inputRange: [0, 1], outputRange: [1, 5.0] }),
    voiceLevel.interpolate({ inputRange: [0, 1], outputRange: [1, 7.5] }), // Tallest center bar
    voiceLevel.interpolate({ inputRange: [0, 1], outputRange: [1, 5.0] }),
    voiceLevel.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }),
  ];

  const startRecording = async () => {
    if (isStartingRef.current || recordingRef.current) {
      return;
    }
    isStartingRef.current = true;

    try {
      // 1. Request microphone permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        isStartingRef.current = false;
        return;
      }
      setHasPermission(true);

      // 2. Set the audio mode for recording on both iOS & Android
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 3. Initialize, configure and start the recorder with metering enabled in one atomic call
      const { recording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        },
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            const normalized = normalizeMetering(status.metering);

            // Invoke client level change callback for external components (e.g. avatar lipsync)
            if (onLevelChange) {
              onLevelChange(normalized);
            }

            // Buttery-smooth spring transition on the UI thread
            Animated.spring(voiceLevel, {
              toValue: normalized,
              useNativeDriver: true,
              tension: 80,
              friction: 8,
            }).start();
          }
        },
        80
      );

      recordingRef.current = recording;
    } catch (error) {
      console.error('[VoiceVisualizer] Failed to start recording:', error);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording || status.canRecord) {
          await recordingRef.current.stopAndUnloadAsync();
        }
        recordingRef.current = null;
      }
    } catch (error) {
      console.error('[VoiceVisualizer] Failed to stop/unload recording:', error);
    } finally {
      // Reset voice visualizer level smoothly back to silence
      Animated.spring(voiceLevel, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
      if (onLevelChange) {
        onLevelChange(0);
      }
    }
  };

  useEffect(() => {
    let isActive = true;

    const init = async () => {
      if (isActive) {
        await startRecording();
      }
    };

    init();

    return () => {
      isActive = false;
      stopRecording();
    };
  }, []);

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Microphone permission is required to visualize your voice in real-time.
        </Text>
        <Pressable style={styles.permissionButton} onPress={startRecording}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.visualizerContainer}>
        {barScales.map((scale, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                transform: [{ scaleY: scale }],
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.statusText}>Listening</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#0e0e12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#1f1f2e',
    minWidth: 280,
    minHeight: 200,
    marginVertical: 20,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    gap: 12,
  },
  bar: {
    width: 8,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#00f2fe',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  statusText: {
    color: '#65657b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
  permissionContainer: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#0e0e12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1f1f2e',
    maxWidth: 320,
    marginVertical: 20,
  },
  permissionText: {
    color: '#8b8b9f',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#00f2fe',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  permissionButtonText: {
    color: '#0e0e12',
    fontSize: 14,
    fontWeight: '700',
  },
});

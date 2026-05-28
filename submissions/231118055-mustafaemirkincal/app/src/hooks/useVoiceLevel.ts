import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

function normalizeMetering(metering: number | undefined) {
  if (typeof metering !== 'number' || Number.isNaN(metering)) {
    return 0;
  }

  const clamped = Math.max(-160, Math.min(0, metering));
  return Math.min(1, Math.max(0, (clamped + 160) / 160));
}

export function useVoiceLevel() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);

  const stop = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (!recording) {
      setListening(false);
      setLevel(0);
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // ignore stop races
    } finally {
      setListening(false);
      setLevel(0);
    }
  }, []);

  const start = useCallback(async () => {
    if (listening) {
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    recording.setOnRecordingStatusUpdate((status) => {
      if (status?.isRecording) {
        setLevel(normalizeMetering(status.metering));
      }
    });

    await recording.prepareToRecordAsync(RECORDING_OPTIONS);
    await recording.startAsync();
    recordingRef.current = recording;
    setListening(true);
  }, [listening]);

  useEffect(() => {
    return () => {
      stop().catch(() => {});
    };
  }, [stop]);

  return {
    listening,
    level,
    start,
    stop,
  };
}

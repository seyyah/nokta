import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export const BAR_COUNT = 24;
const POLL_MS = 48;

function normalizeMetering(metering: number | undefined): number {
  const db = metering ?? -160;
  return Math.max(0, Math.min(1, (db + 55) / 55));
}

export function useVoiceMeter() {
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(async () => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    const rec = recordingRef.current;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        /* already stopped */
      }
      recordingRef.current = null;
    }
    setIsListening(false);
    setIsActive(false);
    setLevels(Array(BAR_COUNT).fill(0));
  }, []);

  const start = useCallback(async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    await stop();

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    } as Audio.RecordingOptions);
    await recording.startAsync();
    recordingRef.current = recording;
    setIsListening(true);

    loopRef.current = setInterval(async () => {
      const rec = recordingRef.current;
      if (!rec) return;
      const status = await rec.getStatusAsync();
      if (!status.isRecording) return;

      const level = normalizeMetering(
        (status as Audio.RecordingStatus & { metering?: number }).metering
      );
      setIsActive(level > 0.06);
      setLevels((prev) => {
        const shifted = [...prev.slice(1), level];
        return shifted.map((v, i) => {
          const wobble = 0.85 + 0.15 * Math.sin(Date.now() / 90 + i * 0.7);
          return Math.min(1, v * wobble);
        });
      });
    }, POLL_MS);
  }, [stop]);

  const toggle = useCallback(async () => {
    if (isListening) await stop();
    else await start();
  }, [isListening, start, stop]);

  useEffect(() => () => {
    void stop();
  }, [stop]);

  return { levels, isActive, isListening, start, stop, toggle, barCount: BAR_COUNT };
}

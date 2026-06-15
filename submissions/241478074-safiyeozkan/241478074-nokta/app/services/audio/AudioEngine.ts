import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { smoothLevel } from './RMSProcessor';

export interface MicUpdate {
  isRecording: boolean;
  metering: number;
  amplitude: number;
  rms: number;
  samples: number[];
  uri: string | null;
  timestamp: number;
}

export class AudioEngine {
  private recording: InstanceType<typeof Audio.Recording> | null = null;
  private samples: number[] = [];
  private lastLevel = 0;
  private onUpdate: ((update: MicUpdate) => void) | null = null;

  async initialize() {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission denied');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
  }

  async start(onUpdate: (update: MicUpdate) => void) {
    await this.initialize();
    this.onUpdate = onUpdate;
    this.samples = [];
    this.lastLevel = 0;

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      this.handleRecordingStatus,
      100
    );

    this.recording = recording;
  }

  async stop() {
    if (!this.recording) return;
    let uri: string | null = null;
    try {
      if (typeof this.recording.getURI === 'function') {
        uri = this.recording.getURI();
      }
      await this.recording.stopAndUnloadAsync();
    } catch {
      // ignore stop errors when already stopped
    }
    this.recording = null;
    this.samples = [];
    this.onUpdate?.({
      isRecording: false,
      metering: -160,
      amplitude: 0,
      rms: 0,
      samples: [],
      uri,
      timestamp: Date.now(),
    });
  }

  private handleRecordingStatus = async (status: Audio.RecordingStatus) => {
    const meteringValue = typeof status.metering === 'number' ? status.metering : -160;
    const amplitude = Math.max(0, Math.min(1, (meteringValue + 100) / 50));
    const smoothed = smoothLevel(amplitude, this.lastLevel, 0.14);
    this.lastLevel = smoothed;

    this.samples = [...this.samples.slice(-127), smoothed];
    const normalizedRms = Math.sqrt(this.samples.reduce((acc, value) => acc + value * value, 0) / Math.max(1, this.samples.length));

    this.onUpdate?.({
      isRecording: status.isRecording ?? true,
      metering: meteringValue,
      amplitude: smoothed,
      rms: normalizedRms,
      samples: [...this.samples],
      uri: status.uri ?? null,
      timestamp: Date.now(),
    });

    if (status.durationMillis > 1000 && this.recording && status.canRecord) {
      try {
        await this.recording.getStatusAsync();
      } catch {
        // ignore transient errors during live stream
      }
    }
  };
}

/**
 * Nokta Voice Forge — Audio Recording Service
 * Uses expo-av with metering for real-time audio visualization
 */

import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { AudioMeterData, AudioServiceState } from '../types';

const METERING_POLL_INTERVAL_MS = 80;
const NUM_FREQUENCY_BANDS = 32;
const SILENCE_THRESHOLD = 0.05;
const CIRCULAR_BUFFER_SIZE = 64;
const DB_MIN = -160;
const DB_MAX = 0;
const AUDIO_SESSION_RETRY_DELAY_MS = 150;

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const FALLBACK_RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.LOW_QUALITY,
  isMeteringEnabled: true,
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize a dB value from the range (-160, 0) to (0, 1).
 */
function normalizeDb(dB: number): number {
  const clamped = Math.max(DB_MIN, Math.min(DB_MAX, dB));
  return (clamped - DB_MIN) / (DB_MAX - DB_MIN);
}

/**
 * Generate simulated frequency bands from a single amplitude value.
 * Creates realistic-looking band distribution with randomized variation.
 */
function simulateFrequencyBands(amplitude: number, bandCount: number): number[] {
  const bands: number[] = [];
  for (let i = 0; i < bandCount; i++) {
    // Create a natural roll-off curve: mid frequencies are strongest
    const normalizedIndex = i / (bandCount - 1);
    // Bell curve centered at ~0.35 to simulate voice frequency emphasis
    const bellCurve = Math.exp(-Math.pow((normalizedIndex - 0.35) * 3, 2));
    // Add randomized variation (±30%)
    const variation = 0.7 + Math.random() * 0.6;
    // Scale by amplitude and apply curve + variation
    const bandValue = amplitude * bellCurve * variation;
    bands.push(Math.max(0, Math.min(1, bandValue)));
  }
  return bands;
}

export class AudioService {
  private recording: Audio.Recording | null = null;
  private meteringInterval: ReturnType<typeof setInterval> | null = null;
  private amplitudeBuffer: number[] = [];
  private bufferIndex: number = 0;
  private startTime: number = 0;
  private currentMeterData: AudioMeterData | null = null;

  private state: AudioServiceState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    fileUri: null,
  };

  private clearMeteringInterval(): void {
    if (this.meteringInterval) {
      clearInterval(this.meteringInterval);
      this.meteringInterval = null;
    }
  }

  private async resetAudioSession(): Promise<void> {
    try {
      this.clearMeteringInterval();

      if (this.recording) {
        try {
          const status = await this.recording.getStatusAsync();
          if (status.canRecord || status.isRecording) {
            await this.recording.stopAndUnloadAsync();
          }
        } catch {
          // A failed prepare can leave the recorder in a partially initialized state.
        }
        this.recording = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.warn('[AudioService] Audio session reset warning:', error);
    }
  }

  private async configureRecordingAudioMode(): Promise<void> {
    await Audio.setIsEnabledAsync(true);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  private async prepareAndStartRecording(options: Audio.RecordingOptions): Promise<Audio.Recording> {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(options);
    await recording.startAsync();
    return recording;
  }

  private async createRecordingWithRetry(): Promise<Audio.Recording> {
    try {
      return await this.prepareAndStartRecording(RECORDING_OPTIONS);
    } catch (firstError) {
      console.warn('[AudioService] First recording prepare failed, retrying:', firstError);
      await this.resetAudioSession();
      await wait(AUDIO_SESSION_RETRY_DELAY_MS);
      await this.configureRecordingAudioMode();
      try {
        return await this.prepareAndStartRecording(FALLBACK_RECORDING_OPTIONS);
      } catch (secondError) {
        console.warn('[AudioService] Fallback recording prepare failed:', secondError);
        throw secondError;
      }
    }
  }

  /**
   * Request microphone permissions and configure audio mode.
   * Returns true if permissions were granted.
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('[AudioService] Microphone permission denied');
        return false;
      }

      await this.configureRecordingAudioMode();

      return true;
    } catch (error) {
      console.error('[AudioService] Permission error:', error);
      return false;
    }
  }

  /**
   * Push an amplitude value into the circular buffer.
   */
  private pushToBuffer(amplitude: number): void {
    if (this.amplitudeBuffer.length < CIRCULAR_BUFFER_SIZE) {
      this.amplitudeBuffer.push(amplitude);
    } else {
      this.amplitudeBuffer[this.bufferIndex % CIRCULAR_BUFFER_SIZE] = amplitude;
    }
    this.bufferIndex++;
  }

  /**
   * Get the recent amplitude values from the circular buffer.
   */
  public getAmplitudeHistory(): number[] {
    if (this.amplitudeBuffer.length < CIRCULAR_BUFFER_SIZE) {
      return [...this.amplitudeBuffer];
    }
    const start = this.bufferIndex % CIRCULAR_BUFFER_SIZE;
    return [
      ...this.amplitudeBuffer.slice(start),
      ...this.amplitudeBuffer.slice(0, start),
    ];
  }

  /**
   * Start audio recording with metering enabled.
   * Calls `onMeter` every ~80ms with normalized audio data.
   */
  async startRecording(
    onMeter: (data: AudioMeterData) => void
  ): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    try {
      // Clean up any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      const recording = await this.createRecordingWithRetry();
      this.recording = recording;
      this.startTime = Date.now();
      this.amplitudeBuffer = [];
      this.bufferIndex = 0;

      this.state = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        fileUri: null,
      };

      // Start polling for metering data
      this.meteringInterval = setInterval(async () => {
        if (!this.recording) return;

        try {
          const status = await this.recording.getStatusAsync();

          if (!status.isRecording) return;

          const rawDb = status.metering ?? DB_MIN;
          const amplitude = normalizeDb(rawDb);
          const isSpeaking = amplitude > SILENCE_THRESHOLD;
          const bands = simulateFrequencyBands(amplitude, NUM_FREQUENCY_BANDS);

          this.pushToBuffer(amplitude);

          this.state.duration = status.durationMillis;

          const meterData: AudioMeterData = {
            amplitude,
            dB: rawDb,
            bands,
            isSpeaking,
            timestamp: Date.now(),
          };

          this.currentMeterData = meterData;
          onMeter(meterData);
        } catch (err) {
          // Recording may have been stopped between interval ticks
          // Silently ignore status fetch errors during cleanup
        }
      }, METERING_POLL_INTERVAL_MS);

      return true;
    } catch (error) {
      console.warn('[AudioService] Native recording unavailable:', error);
      await this.resetAudioSession();
      this.state.isRecording = false;
      return false;
    }
  }

  /**
   * Stop the current recording and return the file URI.
   */
  async stopRecording(): Promise<string | null> {
    // Clear the metering poll
    this.clearMeteringInterval();

    if (!this.recording) {
      this.state.isRecording = false;
      return null;
    }

    try {
      const status = await this.recording.getStatusAsync();
      if (status.isRecording) {
        await this.recording.stopAndUnloadAsync();
      }

      const uri = this.recording.getURI();
      this.state = {
        isRecording: false,
        isPaused: false,
        duration: status.durationMillis ?? this.state.duration,
        fileUri: uri,
      };

      this.recording = null;

      // Reset audio mode so playback works
      await this.resetAudioSession();

      return uri;
    } catch (error) {
      console.error('[AudioService] Stop recording error:', error);
      this.recording = null;
      this.state.isRecording = false;
      await this.resetAudioSession();
      return null;
    }
  }

  /**
   * Full cleanup — stop recording and release resources.
   */
  async cleanup(): Promise<void> {
    await this.stopRecording();
    this.amplitudeBuffer = [];
    this.bufferIndex = 0;
    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      fileUri: null,
    };
  }

  public getMeterData(): AudioMeterData | null {
    return this.currentMeterData;
  }

  /**
   * Get current service state.
   */
  getState(): AudioServiceState {
    return { ...this.state };
  }
}

export default AudioService;

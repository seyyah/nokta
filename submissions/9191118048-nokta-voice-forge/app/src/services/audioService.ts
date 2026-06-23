/**
 * Nokta Voice Forge — Audio Recording Service
 * Uses expo-audio with metering for real-time audio visualization
 */

import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';
import type { AudioRecorder, RecordingOptions } from 'expo-audio';
import { AudioMeterData, AudioServiceState } from '../types';

const METERING_POLL_INTERVAL_MS = 80;
const NUM_FREQUENCY_BANDS = 32;
const SILENCE_THRESHOLD = 0.08;
const CIRCULAR_BUFFER_SIZE = 64;
const DB_MIN = -60;
const DB_MAX = 0;
const AUDIO_SESSION_RETRY_DELAY_MS = 150;

const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const FALLBACK_RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.LOW_QUALITY,
  isMeteringEnabled: true,
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize useful microphone levels from the range (-60, 0) to (0, 1).
 * expo-audio may report values down to -160 dB, but treating that entire range
 * as useful signal makes normal room silence look like loud speech.
 */
function normalizeDb(dB: number): number {
  const clamped = Math.max(DB_MIN, Math.min(DB_MAX, dB));
  const linear = (clamped - DB_MIN) / (DB_MAX - DB_MIN);
  return Math.pow(linear, 1.8);
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
  private recording: AudioRecorder | null = null;
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
          const status = this.recording.getStatus();
          if (status.isRecording) {
            await this.recording.stop();
          }
        } catch {
          // A failed prepare can leave the recorder in a partially initialized state.
        }
        this.recording.release();
        this.recording = null;
      }

      await setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: 'mixWithOthers',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
      });
    } catch (error) {
      console.warn('[AudioService] Audio session reset warning:', error);
    }
  }

  private async configureRecordingAudioMode(): Promise<void> {
    await setIsAudioActiveAsync(true);
    await setAudioModeAsync({
      allowsRecording: true,
      interruptionMode: 'doNotMix',
      interruptionModeAndroid: 'duckOthers',
      playsInSilentMode: true,
    });
  }

  private async prepareAndStartRecording(options: RecordingOptions): Promise<AudioRecorder> {
    const recording = new AudioModule.AudioRecorder(options);
    await recording.prepareToRecordAsync(options);
    recording.record();
    return recording;
  }

  private async createRecordingWithRetry(): Promise<AudioRecorder> {
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
      const { granted } = await requestRecordingPermissionsAsync();
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
          const status = this.recording.getStatus();

          if (!status.isRecording) return;

          const rawDb = status.metering ?? DB_MIN;
          const amplitude = normalizeDb(rawDb);
          const isSpeaking = amplitude > SILENCE_THRESHOLD;
          const bands = simulateFrequencyBands(amplitude, NUM_FREQUENCY_BANDS);

          this.pushToBuffer(amplitude);

          this.state.duration = Math.round(status.durationMillis);

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
      const status = this.recording.getStatus();
      if (status.isRecording) {
        await this.recording.stop();
      }

      const uri = this.recording.uri;
      this.state = {
        isRecording: false,
        isPaused: false,
        duration: Math.round(status.durationMillis ?? this.state.duration),
        fileUri: uri,
      };

      this.recording.release();
      this.recording = null;

      // Reset audio mode so playback works
      await this.resetAudioSession();

      return uri;
    } catch (error) {
      console.error('[AudioService] Stop recording error:', error);
      this.recording?.release();
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

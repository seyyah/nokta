import { Audio } from 'expo-av';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AvatarScene } from './AvatarScene';
import { VoiceBars } from './VoiceBars';
import { fetchBridgeStatus, hasBridgeEndpoint, type BridgeStatus } from '../services/bridge';
import {
  clearPendingAuditVoiceNote,
  loadPendingAuditVoiceNote,
  savePendingAuditVoiceNote,
} from '../services/auditVoiceNote';
import { palette, shadows } from '../theme';

type VoiceAvatarScreenProps = {
  onBack: () => void;
  onOpenBridge: (status: BridgeStatus | null) => void;
};

const BAND_COUNT = 13;
const SILENT_BANDS = Array.from({ length: BAND_COUNT }, () => 0);

export function VoiceAvatarScreen({ onBack, onOpenBridge }: VoiceAvatarScreenProps) {
  const meter = useVoiceMeter();
  const [listeningForNote, setListeningForNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteStatus, setNoteStatus] = useState<string | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingAuditVoiceNote().then((note) => {
      if (note) {
        setNoteDraft(note);
      }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hasBridgeEndpoint()) {
      return undefined;
    }

    void refreshBridgeStatus();
    const timer = setInterval(() => {
      void refreshBridgeStatus();
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setListeningForNote(true);
    setVoiceError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setListeningForNote(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript.trim() ?? '';

    if (!transcript) {
      return;
    }

    setNoteDraft(transcript);

    if (event.isFinal) {
      void savePendingAuditVoiceNote(transcript).then(() => {
        setNoteStatus('Voice note saved for the next audit export.');
      });
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListeningForNote(false);
    setVoiceError(event.message || 'Speech recognition failed.');
  });

  const refreshBridgeStatus = useCallback(async () => {
    if (!hasBridgeEndpoint()) {
      setBridgeStatus(null);
      return;
    }

    setBridgeLoading(true);
    try {
      setBridgeStatus(await fetchBridgeStatus());
    } catch {
      setBridgeStatus(null);
    } finally {
      setBridgeLoading(false);
    }
  }, []);

  const toggleDictation = async () => {
    if (listeningForNote) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    setNoteStatus(null);
    setVoiceError(null);
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permission.granted) {
      setVoiceError('Microphone or speech permission was denied.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      addsPunctuation: true,
      continuous: false,
      interimResults: true,
      lang: 'tr-TR',
    });
  };

  const clearNote = async () => {
    setNoteDraft('');
    setNoteStatus('Voice note cleared.');
    await clearPendingAuditVoiceNote();
  };

  const bridgeReady = Boolean(bridgeStatus?.stuck);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Pitch Mentor Voice</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Talk your game pitch into shape.</Text>
        <Text style={styles.subtitle}>
          Dictate game notes, audit requests, or mentor context. The avatar reacts while
          the transcript is saved into the next audit report.
        </Text>
      </View>

      <AvatarScene bands={meter.bands} level={meter.level} listening={meter.recording} />
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mentor voice meter</Text>
          <Text style={styles.latencyText}>target &lt; 200ms</Text>
        </View>
        <VoiceBars bands={meter.bands} level={meter.level} />
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => void meter.toggle()}
            style={[styles.primaryAction, meter.recording ? styles.stopAction : null]}
          >
            <Text style={styles.primaryActionText}>
              {meter.recording ? 'Stop Mic' : 'Start Mic'}
            </Text>
          </Pressable>
          <Text style={styles.levelText}>{Math.round(meter.level * 100)}%</Text>
        </View>
        {meter.error ? <Text style={styles.errorText}>{meter.error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dictate next audit request</Text>
        <Text style={styles.helperText}>
          Say what should change in the brief, mentor ticket, or prototype readiness card.
          The exported audit markdown will include this transcript.
        </Text>
        <View style={styles.noteBox}>
          <Text style={noteDraft ? styles.noteText : styles.notePlaceholder}>
            {noteDraft || 'No dictated audit note saved yet.'}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => void toggleDictation()}
            style={[styles.primaryAction, listeningForNote ? styles.stopAction : null]}
          >
            <Text style={styles.primaryActionText}>
              {listeningForNote ? 'Stop Dictation' : 'Dictate Audit Note'}
            </Text>
          </Pressable>
          <Pressable onPress={() => void clearNote()} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Clear</Text>
          </Pressable>
        </View>
        {noteStatus ? <Text style={styles.successText}>{noteStatus}</Text> : null}
        {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mentor escalation bridge</Text>
          {bridgeLoading ? <ActivityIndicator color={palette.blue} size="small" /> : null}
        </View>
        <Text style={styles.helperText}>
          If the forge loop cannot resolve two cycles in a row, this opens a Jitsi room
          for a human mentor call.
        </Text>
        <View style={[styles.bridgeState, bridgeReady ? styles.bridgeStateHot : null]}>
          <Text style={styles.bridgeStateTitle}>
            {bridgeReady ? 'STUCK detected' : 'No active STUCK state'}
          </Text>
          <Text style={styles.bridgeStateText}>
            {bridgeStatus?.reason || 'Run the forge server and refresh after rollback cycles.'}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={() => void refreshBridgeStatus()} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </Pressable>
          <Pressable
            disabled={!bridgeReady}
            onPress={() => onOpenBridge(bridgeStatus)}
            style={[styles.primaryAction, !bridgeReady ? styles.disabledAction : null]}
          >
            <Text style={styles.primaryActionText}>Uzmana Baglan</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function useVoiceMeter() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelRef = useRef(0);
  const phaseRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [bands, setBands] = useState(SILENT_BANDS);
  const [error, setError] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateFromRawLevel = useCallback((rawLevel: number) => {
    const target = clamp(rawLevel, 0, 1);
    const smoothing = target > levelRef.current ? 0.38 : 0.14;
    const nextLevel = target < 0.018 ? levelRef.current * 0.82 : levelRef.current + (target - levelRef.current) * smoothing;
    levelRef.current = nextLevel < 0.01 ? 0 : nextLevel;
    phaseRef.current += 0.24;
    setLevel(levelRef.current);
    setBands(createBands(levelRef.current, phaseRef.current));
  }, []);

  const stop = useCallback(async () => {
    stopPolling();
    const current = recordingRef.current;
    recordingRef.current = null;
    setRecording(false);
    updateFromRawLevel(0);

    if (!current) {
      return;
    }

    try {
      await current.stopAndUnloadAsync();
    } catch {
      // The recorder can already be unloaded when permissions are revoked.
    }
  }, [stopPolling, updateFromRawLevel]);

  const start = useCallback(async () => {
    try {
      setError(null);
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setError('Microphone permission was denied.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recorder = new Audio.Recording();
      const options = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      };

      await recorder.prepareToRecordAsync(options as Audio.RecordingOptions);
      await recorder.startAsync();
      recordingRef.current = recorder;
      setRecording(true);

      timerRef.current = setInterval(() => {
        void recorder.getStatusAsync().then((status) => {
          const metering = typeof status.metering === 'number' ? status.metering : -160;
          updateFromRawLevel(dbToLevel(metering));
        }).catch(() => updateFromRawLevel(0));
      }, 64);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Microphone could not start.');
      await stop();
    }
  }, [stop, updateFromRawLevel]);

  useEffect(() => () => {
    void stop();
  }, [stop]);

  return {
    bands,
    error,
    level,
    recording,
    toggle: recording ? stop : start,
  };
}

function dbToLevel(metering: number) {
  if (!Number.isFinite(metering)) {
    return 0;
  }

  const normalized = (metering + 58) / 48;
  return clamp(normalized, 0, 1);
}

function createBands(level: number, phase: number) {
  if (level < 0.012) {
    return SILENT_BANDS;
  }

  return SILENT_BANDS.map((_, index) => {
    const ratio = index / (BAND_COUNT - 1);
    const centerBias = 1 - Math.abs(ratio - 0.5) * 0.68;
    const pulse = 0.76 + Math.abs(Math.sin(phase + index * 0.72)) * 0.28;
    return clamp(level * centerBias * pulse + level * 0.08, 0, 1);
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  backButton: {
    backgroundColor: palette.surface,
    borderColor: palette.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  bridgeState: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 8,
    marginTop: 14,
    padding: 14,
  },
  bridgeStateHot: {
    backgroundColor: palette.rustSoft,
  },
  bridgeStateText: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  bridgeStateTitle: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 8,
    marginTop: 14,
    padding: 16,
    ...shadows,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
  },
  content: {
    gap: 12,
    padding: 18,
    paddingBottom: 42,
  },
  disabledAction: {
    opacity: 0.45,
  },
  errorText: {
    color: palette.rust,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    marginTop: 10,
  },
  eyebrow: {
    color: palette.blue,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  helperText: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  hero: {
    marginBottom: 2,
  },
  latencyText: {
    color: palette.success,
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  levelText: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
  },
  noteBox: {
    backgroundColor: palette.background,
    borderColor: palette.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 86,
    padding: 14,
  },
  notePlaceholder: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  noteText: {
    color: palette.ink,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: palette.blue,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: palette.ink,
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  stopAction: {
    backgroundColor: palette.rust,
  },
  successText: {
    color: palette.success,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    marginTop: 10,
  },
  subtitle: {
    color: palette.muted,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  title: {
    color: palette.ink,
    fontFamily: 'Newsreader_700Bold',
    fontSize: 34,
    lineHeight: 36,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

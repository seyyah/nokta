// @ts-nocheck
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, MathUtils, Vector3 } from 'three';

const BAR_COUNT = 32;
const JITSI_ROOM = 'nokta-231118044-slopdetec-bridge';
const JITSI_URL = `https://meet.jit.si/${JITSI_ROOM}`;

export type ForgeSignal = 'SUCCESS' | 'FAIL' | 'ROLLBACK';

export type ForgeRun = {
  id: string;
  label: string;
  status: ForgeSignal;
  timestamp: string;
};

type VoiceMeter = {
  level: number;
  levels: number[];
  isListening: boolean;
  isDictating: boolean;
  dictationText: string;
  error: string | null;
  toggleListening(): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  startDictation(): void;
  stopDictation(): void;
  setDictationText(value: string): void;
};

function buildBars(level: number, frequencyBins?: number[]): number[] {
  if (frequencyBins?.length) {
    const step = Math.max(1, Math.floor(frequencyBins.length / BAR_COUNT));
    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const start = index * step;
      const slice = frequencyBins.slice(start, start + step);
      const avg = slice.reduce((sum, value) => sum + value, 0) / Math.max(1, slice.length);
      const shaped = Math.pow(avg / 255, 0.72);
      return MathUtils.clamp(shaped, 0.04, 1);
    });
  }

  return Array.from({ length: BAR_COUNT }, (_, index) => {
    const wave = 0.64 + Math.sin(index * 0.7 + Date.now() / 95) * 0.23;
    const edgeFalloff = 1 - Math.abs(index - BAR_COUNT / 2) / (BAR_COUNT * 0.7);
    const value = level * wave * MathUtils.clamp(edgeFalloff + 0.18, 0.22, 1);
    return MathUtils.clamp(value, 0.04, 1);
  });
}

function normalizeDb(db?: number): number {
  if (typeof db !== 'number' || !Number.isFinite(db)) return 0.05;
  const normalized = (db + 58) / 58;
  return MathUtils.clamp(Math.pow(Math.max(0, normalized), 1.35), 0.03, 1);
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getConsecutiveBlockCount(runs: ForgeRun[]): number {
  let count = 0;
  for (let index = runs.length - 1; index >= 0; index -= 1) {
    if (runs[index].status === 'SUCCESS') break;
    count += 1;
  }
  return count;
}

export function useVoiceMeter(): VoiceMeter {
  const [level, setLevel] = useState(0.04);
  const [levels, setLevels] = useState<number[]>(() => buildBars(0.04));
  const [isListening, setIsListening] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const levelRef = useRef(0.04);

  const pushLevel = useCallback((nextLevel: number, bins?: number[]) => {
    const smoothed = levelRef.current * 0.42 + nextLevel * 0.58;
    levelRef.current = smoothed;
    setLevel(smoothed);
    setLevels(buildBars(smoothed, bins));
  }, []);

  const stopWebAnalyser = useCallback(() => {
    if (rafRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopListening = useCallback(async () => {
    stopWebAnalyser();
    const recording = recordingRef.current;
    recordingRef.current = null;
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // The recording may already be stopped by the OS.
      }
    }
    setIsListening(false);
    pushLevel(0.04);
  }, [pushLevel, stopWebAnalyser]);

  const startWebAnalyser = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Tarayici mikrofon API destegi bulunamadi.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    streamRef.current = stream;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextCtor();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.64;
    source.connect(analyser);

    const frequency = new Uint8Array(analyser.frequencyBinCount);
    const time = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteFrequencyData(frequency);
      analyser.getByteTimeDomainData(time);
      let sum = 0;
      for (let index = 0; index < time.length; index += 1) {
        const centered = (time[index] - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / time.length);
      pushLevel(MathUtils.clamp(rms * 3.8, 0.03, 1), Array.from(frequency));
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [pushLevel]);

  const startNativeRecorder = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Mikrofon izni verilmedi.');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const base = Audio.RecordingOptionsPresets.HIGH_QUALITY;
    const options = {
      ...base,
      android: { ...base.android, isMeteringEnabled: true },
      ios: { ...base.ios, isMeteringEnabled: true },
      web: { ...base.web, mimeType: 'audio/webm' },
    };

    const recording = new Audio.Recording();
    recording.setProgressUpdateInterval(80);
    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording) return;
      pushLevel(normalizeDb(status.metering));
    });
    await recording.prepareToRecordAsync(options);
    await recording.startAsync();
    recordingRef.current = recording;
  }, [pushLevel]);

  const startListening = useCallback(async () => {
    if (isListening) return;
    setError(null);
    try {
      if (Platform.OS === 'web') {
        await startWebAnalyser();
      } else {
        await startNativeRecorder();
      }
      setIsListening(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mikrofon baslatilamadi.';
      setError(message);
      setIsListening(false);
      pushLevel(0.04);
    }
  }, [isListening, pushLevel, startNativeRecorder, startWebAnalyser]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const startDictation = useCallback(() => {
    setError(null);
    if (Platform.OS !== 'web') {
      setError('Dikte demo modu web SpeechRecognition ile calisir; mobilde metni elle duzenleyebilirsin.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Bu tarayicida SpeechRecognition yok. Chrome/Edge ile web demosunu ac.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setDictationText(transcript.trim());
    };
    recognition.onerror = (event) => setError(event.error || 'Dikte hatasi.');
    recognition.onend = () => setIsDictating(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsDictating(true);
  }, []);

  const stopDictation = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setIsDictating(false);
  }, []);

  useEffect(() => {
    return () => {
      stopWebAnalyser();
      recordingRef.current?.stopAndUnloadAsync?.();
      recognitionRef.current?.stop?.();
    };
  }, [stopWebAnalyser]);

  return {
    level,
    levels,
    isListening,
    isDictating,
    dictationText,
    error,
    toggleListening,
    startListening,
    stopListening,
    startDictation,
    stopDictation,
    setDictationText,
  };
}

function LevelBars({ levels, level }: { levels: number[]; level: number }) {
  const alive = level > 0.09;
  return (
    <View style={styles.bars}>
      {levels.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: 8 + value * 86,
              opacity: alive ? 0.55 + value * 0.45 : 0.18,
              backgroundColor: index % 3 === 0 ? '#57d7ff' : index % 3 === 1 ? '#7cf7c4' : '#f9d36b',
            },
          ]}
        />
      ))}
    </View>
  );
}

export function VoiceLabScreen({
  meter,
  onExportDictation,
}: {
  meter: VoiceMeter;
  onExportDictation(markdown: string): Promise<void>;
}) {
  const exportReport = async () => {
    const body = meter.dictationText.trim() || 'Dikte metni bos; demo icin manuel not girildi.';
    const markdown = [
      '# Dikte Audit Raporu - Voice Visualizer',
      '',
      `Tarih: ${new Date().toLocaleString('tr-TR')}`,
      'Kaynak: Voice -> STT -> Markdown',
      '',
      '## Dikte',
      body,
      '',
      '## Agent Input',
      '- READ: Voice sekmesinde mikrofon RMS/FFT barlari ve dikte paneli test edildi.',
      '- LOCATE: `app/src/final/VoiceAvatarBridge.tsx`',
      '- HYPOTHESIZE: Sessizlikte sonen, konusunca 80ms aralikla canlanan barlar yeterli demo sinyali verir.',
    ].join('\n');
    await onExportDictation(markdown);
  };

  return (
    <>
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>Phase A</Text>
        <Text style={styles.screenTitle}>Voice Visualizer</Text>
        <Text style={styles.copy}>
          Mikrofon RMS ve web FFT sinyali 80ms hedef aralikla barlara bagli. Sessizlikte barlar solar,
          konusunca aninda yukselir.
        </Text>
      </View>

      <View style={styles.voiceDeck}>
        <View style={styles.meterTop}>
          <TouchableOpacity
            style={[styles.micButton, meter.isListening && styles.micButtonLive]}
            onPress={meter.toggleListening}
          >
            <Text style={styles.micGlyph}>{meter.isListening ? 'Stop' : 'Mic'}</Text>
          </TouchableOpacity>
          <View style={styles.meterReadout}>
            <Text style={styles.readoutLabel}>RMS</Text>
            <Text style={styles.readoutValue}>{Math.round(meter.level * 100)}%</Text>
            <Text style={styles.readoutHint}>80ms metering</Text>
          </View>
        </View>
        <LevelBars levels={meter.levels} level={meter.level} />
      </View>

      {meter.error && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{meter.error}</Text>
        </View>
      )}

      <View style={styles.panelCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardTitle}>Dikte audit</Text>
            <Text style={styles.cardCopy}>Web demo Chrome/Edge uzerinde STT uretir; mobilde metin kutusu duzenlenebilir.</Text>
          </View>
          <TouchableOpacity
            style={[styles.smallPill, meter.isDictating && styles.smallPillActive]}
            onPress={meter.isDictating ? meter.stopDictation : meter.startDictation}
          >
            <Text style={styles.smallPillText}>{meter.isDictating ? 'Dur' : 'Dikte'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.dictationInput}
          multiline
          value={meter.dictationText}
          onChangeText={meter.setDictationText}
          placeholder="Raporu sesle dikte et veya buradan duzenle."
          placeholderTextColor="#77808c"
        />
        <TouchableOpacity style={styles.primaryWide} onPress={exportReport}>
          <Text style={styles.primaryWideText}>Markdown raporu disari aktar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function useAvatarAsset(uploadedUri?: string | null) {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (uploadedUri) {
      setUri(uploadedUri);
      setFailed(false);
      return undefined;
    }

    let alive = true;
    async function load() {
      try {
        const asset = Asset.fromModule(require('../../assets/avatar.glb'));
        await asset.downloadAsync();
        if (alive) setUri(asset.localUri || asset.uri);
      } catch {
        if (alive) setFailed(true);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [uploadedUri]);

  return { uri, failed };
}

function VisemeOverlay({ level, persona }: { level: number; persona: string }) {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = Math.sin(clock.elapsedTime * 18) * 0.04;
    const open = MathUtils.clamp(level * 0.7 + pulse, 0.02, 0.42);
    ref.current.scale.y = 0.35 + open * 2.8;
    ref.current.position.y = -0.42 - open * 0.12;
  });

  return (
    <mesh ref={ref} position={[0, -0.42, 0.72]}>
      <boxGeometry args={[persona === 'senior' ? 0.32 : 0.38, 0.06, 0.04]} />
      <meshStandardMaterial color={persona === 'senior' ? '#f9d36b' : '#ff6b7a'} emissive="#301018" />
    </mesh>
  );
}

function AvatarModel({ uri, level, persona }: { uri: string; level: number; persona: string }) {
  const gltf = useLoader(GLTFLoader, uri);
  const group = useRef(null);
  const bounds = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = (persona === 'senior' ? 2.15 : 2.28) / maxDim;
    return {
      center,
      scale,
      baseX: -center.x * scale,
      baseY: -center.y * scale - 0.05,
      baseZ: -center.z * scale,
    };
  }, [gltf.scene, persona]);

  const hasMouthMorph = useMemo(() => {
    let found = false;
    gltf.scene.traverse((node) => {
      if (!node.isMesh || !node.morphTargetDictionary) return;
      const names = ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_A', 'viseme_O', 'mouthFunnel'];
      found = found || names.some((name) => node.morphTargetDictionary[name] !== undefined);
    });
    return found;
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.9) * 0.05;
      group.current.position.x = bounds.baseX;
      group.current.position.y = bounds.baseY + Math.sin(clock.elapsedTime * 1.6) * 0.025;
      group.current.position.z = bounds.baseZ;
    }

    const open = MathUtils.clamp(level * 1.18 + Math.sin(clock.elapsedTime * 16) * level * 0.12, 0, 1);
    gltf.scene.traverse((node) => {
      if (!node.isMesh || !node.morphTargetDictionary || !node.morphTargetInfluences) return;
      const names = ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_A', 'viseme_O', 'mouthFunnel'];
      names.forEach((name) => {
        const index = node.morphTargetDictionary[name];
        if (index !== undefined) node.morphTargetInfluences[index] = open;
      });
    });
  });

  return (
    <group ref={group} scale={bounds.scale} position={[bounds.baseX, bounds.baseY, bounds.baseZ]}>
      <primitive object={gltf.scene} />
      {!hasMouthMorph && <VisemeOverlay level={level} persona={persona} />}
    </group>
  );
}

function PersonaStage({ persona }: { persona: string }) {
  const ring = useRef(null);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    ring.current.rotation.z = clock.elapsedTime * (persona === 'senior' ? 0.18 : -0.12);
  });

  return (
    <group>
      <mesh position={[0, 0.06, -0.24]}>
        <circleGeometry args={[1.6, 64]} />
        <meshBasicMaterial color={persona === 'senior' ? '#2b2410' : '#102633'} transparent opacity={0.82} />
      </mesh>
      <mesh ref={ring} position={[0, 0.08, -0.18]}>
        <torusGeometry args={[persona === 'senior' ? 1.28 : 1.18, 0.018, 12, 96]} />
        <meshStandardMaterial color={persona === 'senior' ? '#f9d36b' : '#57d7ff'} emissive={persona === 'senior' ? '#3a2608' : '#062536'} />
      </mesh>
      <mesh position={[0, -1.18, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 64]} />
        <meshStandardMaterial color={persona === 'senior' ? '#14100a' : '#0a1720'} roughness={0.8} />
      </mesh>
    </group>
  );
}

function ProceduralAvatar({ level, persona }: { level: number; persona: string }) {
  const head = useRef(null);
  const mouth = useRef(null);

  useFrame(({ clock }) => {
    if (head.current) {
      head.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.12;
      head.current.rotation.x = Math.sin(clock.elapsedTime * 1.2) * 0.035;
    }
    if (mouth.current) {
      const open = MathUtils.clamp(0.04 + level * 0.55 + Math.sin(clock.elapsedTime * 17) * level * 0.08, 0.04, 0.62);
      mouth.current.scale.y = open;
    }
  });

  return (
    <group ref={head} position={[0, -0.35, 0]}>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.68, 48, 48]} />
        <meshStandardMaterial color={persona === 'senior' ? '#d6b08a' : '#d1a17c'} roughness={0.72} />
      </mesh>
      <mesh position={[-0.24, 0.53, 0.58]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.24, 0.53, 0.58]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh ref={mouth} position={[0, 0.2, 0.62]}>
        <boxGeometry args={[0.34, 0.18, 0.04]} />
        <meshStandardMaterial color="#341018" />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.28, 0.36, 0.5, 32]} />
        <meshStandardMaterial color={persona === 'senior' ? '#1f2937' : '#23324a'} />
      </mesh>
    </group>
  );
}

class AvatarErrorBoundary extends React.Component<any, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function AvatarCanvas({
  level,
  persona,
  uploadedAvatarUri,
}: {
  level: number;
  persona: string;
  uploadedAvatarUri?: string | null;
}) {
  const { uri, failed } = useAvatarAsset(uploadedAvatarUri);

  return (
    <View style={styles.canvasShell}>
      <Canvas style={styles.canvas} camera={{ position: [0, 0.05, 4.2], fov: 32 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[1.4, 2.6, 3.4]} intensity={persona === 'senior' ? 3.2 : 2.6} />
        <pointLight position={[-2, 1.6, 2]} intensity={persona === 'senior' ? 1 : 1.4} color={persona === 'senior' ? '#f9d36b' : '#7cf7c4'} />
        <PersonaStage persona={persona} />
        <AvatarErrorBoundary
          resetKey={`${uri || 'no-uri'}-${persona}`}
          fallback={<ProceduralAvatar key={`error-${persona}`} level={level} persona={persona} />}
        >
          <Suspense fallback={<ProceduralAvatar key={`fallback-${persona}`} level={level} persona={persona} />}>
            {uri && !failed ? (
              <AvatarModel key={`${uri}-${persona}`} uri={uri} level={level} persona={persona} />
            ) : (
              <ProceduralAvatar key={`procedural-${persona}`} level={level} persona={persona} />
            )}
          </Suspense>
        </AvatarErrorBoundary>
      </Canvas>
    </View>
  );
}

export function AvatarLabScreen({
  level,
  isListening,
  onToggleListening,
}: {
  level: number;
  isListening: boolean;
  onToggleListening(): Promise<void>;
}) {
  const [persona, setPersona] = useState<'junior' | 'senior'>('junior');
  const [reading, setReading] = useState(false);
  const [reportText, setReportText] = useState(
    'SlopDetec raporu: Voice visualizer canli, avatar agzi mikrofona bagli, stuck durumunda Bridge uzmana aciliyor.',
  );
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState('app/assets/avatar.glb');
  const readingTimer = useRef(null);
  const effectiveLevel = reading ? Math.max(level, 0.42) : level;

  const copy =
    persona === 'senior'
      ? 'Senior-sen daha sakin ve net konusur: once risk, sonra tek onarim hipotezi.'
      : 'Junior-sen hizli geri bildirim verir: once neresi canli, sonra hangi kisim fazla slop.';

  const pickAvatarFile = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      Alert.alert('Avatar', 'Mobil build icin kendi Avaturn exportunu app/assets/avatar.glb dosyasi olarak degistir.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf,model/gltf-binary,model/gltf+json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (avatarUri?.startsWith('blob:')) URL.revokeObjectURL(avatarUri);
      setAvatarUri(URL.createObjectURL(file));
      setAvatarFileName(file.name);
    };
    input.click();
  };

  const pickReportFile = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      Alert.alert('Rapor', 'Mobil buildde rapor metnini alana yapistirarak okutabilirsin.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,text/markdown,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setReportText(String(reader.result || ''));
      reader.readAsText(file);
    };
    input.click();
  };

  const stopReportReading = () => {
    if (readingTimer.current) clearTimeout(readingTimer.current);
    readingTimer.current = null;
    if (Platform.OS === 'web') window.speechSynthesis?.cancel?.();
    setReading(false);
  };

  const toggleReportReading = () => {
    if (reading) {
      stopReportReading();
      return;
    }

    const text = reportText.trim() || copy;
    setReading(true);
    if (Platform.OS === 'web' && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = persona === 'senior' ? 0.84 : 1.08;
      utterance.pitch = persona === 'senior' ? 0.82 : 1.08;
      utterance.onend = () => setReading(false);
      utterance.onerror = () => setReading(false);
      window.speechSynthesis.speak(utterance);
    } else {
      const duration = MathUtils.clamp(text.length * 42, 3500, 16000);
      readingTimer.current = setTimeout(() => setReading(false), duration);
    }
  };

  useEffect(() => {
    return () => {
      if (readingTimer.current) clearTimeout(readingTimer.current);
      if (avatarUri?.startsWith('blob:')) URL.revokeObjectURL(avatarUri);
      if (Platform.OS === 'web') window.speechSynthesis?.cancel?.();
    };
  }, [avatarUri]);

  return (
    <>
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>Phase B</Text>
        <Text style={styles.screenTitle}>Avatar Lipsync</Text>
        <Text style={styles.copy}>
          Avaturn GLB yuklenirse morph target viseme kanallari oynatilir; yoksa ayni RMS sinyali procedural
          yuz fallback'ine baglanir.
        </Text>
      </View>

      <View>
        <AvatarCanvas level={effectiveLevel} persona={persona} uploadedAvatarUri={avatarUri} />
        <View style={[styles.personaBadge, persona === 'senior' && styles.personaBadgeSenior]}>
          <Text style={styles.personaBadgeText}>{persona === 'senior' ? 'Senior-sen aktif' : 'Junior-sen aktif'}</Text>
        </View>
      </View>

      <View style={styles.panelCard}>
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segment, persona === 'junior' && styles.segmentActive]}
            onPress={() => setPersona('junior')}
          >
            <Text style={[styles.segmentText, persona === 'junior' && styles.segmentTextActive]}>Junior-sen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, persona === 'senior' && styles.segmentActive]}
            onPress={() => setPersona('senior')}
          >
            <Text style={[styles.segmentText, persona === 'senior' && styles.segmentTextActive]}>Senior-sen</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardCopy}>{copy}</Text>
        <View style={styles.avatarMeta}>
          <Text style={styles.metaLabel}>Avatar</Text>
          <Text style={styles.metaValue} numberOfLines={1}>{avatarFileName}</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryAction} onPress={pickAvatarFile}>
            <Text style={styles.secondaryActionText}>GLB yukle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={onToggleListening}>
            <Text style={styles.secondaryActionText}>{isListening ? 'Mikrofonu durdur' : 'Mikrofonla konustur'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.panelCard}>
        <View style={styles.rowBetween}>
          <View style={styles.flexOne}>
            <Text style={styles.cardTitle}>Rapor okut</Text>
            <Text style={styles.cardCopy}>Markdown veya txt raporu yukle; secili persona metni okurken agiz animasyonu calisir.</Text>
          </View>
          <TouchableOpacity
            style={[styles.smallPill, reading && styles.smallPillActive]}
            onPress={pickReportFile}
          >
            <Text style={styles.smallPillText}>Yukle</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.reportInput}
          multiline
          value={reportText}
          onChangeText={setReportText}
          placeholder="Okutulacak rapor metni"
          placeholderTextColor="#77808c"
        />
        <TouchableOpacity
          style={[styles.primaryWide, reading && styles.primaryWideHot]}
          onPress={toggleReportReading}
        >
          <Text style={styles.primaryWideText}>{reading ? 'Okumayi durdur' : 'Raporu avatara okut'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

export function ForgeSignalPanel({
  runs,
  onAppend,
  onOpenBridge,
}: {
  runs: ForgeRun[];
  onAppend(status: ForgeSignal): void;
  onOpenBridge(): void;
}) {
  const stuckCount = getConsecutiveBlockCount(runs);
  const stuck = stuckCount >= 2;

  return (
    <View style={styles.panelCard}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardTitle}>STUCK heuristigi</Text>
          <Text style={styles.cardCopy}>Son iki cycle FAIL veya ROLLBACK ise Bridge otomatik acilir.</Text>
        </View>
        <View style={[styles.statusBadge, stuck && styles.statusBadgeHot]}>
          <Text style={styles.statusBadgeText}>{stuck ? 'STUCK' : `${stuckCount}/2`}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.successButton} onPress={() => onAppend('SUCCESS')}>
          <Text style={styles.cycleButtonText}>SUCCESS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.failButton} onPress={() => onAppend('FAIL')}>
          <Text style={styles.cycleButtonText}>FAIL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rollbackButton} onPress={() => onAppend('ROLLBACK')}>
          <Text style={styles.cycleButtonText}>ROLLBACK</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryWide} onPress={() => {
        onAppend('FAIL');
        onAppend('ROLLBACK');
        onOpenBridge();
      }}>
        <Text style={styles.primaryWideText}>Kasitli STUCK demo tetikle</Text>
      </TouchableOpacity>

      <ScrollView style={styles.runList} nestedScrollEnabled>
        {runs.slice(-6).reverse().map((run) => (
          <View key={run.id} style={styles.runRow}>
            <Text style={styles.runStatus}>{run.status}</Text>
            <Text style={styles.runLabel}>{run.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function ExpertBridgeScreen({
  runs,
  onAppend,
}: {
  runs: ForgeRun[];
  onAppend(status: ForgeSignal): void;
}) {
  const stuckCount = getConsecutiveBlockCount(runs);
  const stuck = stuckCount >= 2;

  const openCall = async () => {
    try {
      await Linking.openURL(JITSI_URL);
    } catch {
      Alert.alert('Bridge', 'Jitsi linki acilamadi.');
    }
  };

  return (
    <>
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>Phase C</Text>
        <Text style={styles.screenTitle}>Expert Bridge</Text>
        <Text style={styles.copy}>
          Iki ardil FAIL/ROLLBACK sonrasi insan uzmana Jitsi odasi acilir. Jitsi icinde ses, video
          ve ekran paylasimi birlikte calisir.
        </Text>
      </View>

      <View style={[styles.bridgeHero, stuck && styles.bridgeHeroHot]}>
        <Text style={styles.bridgeStatus}>{stuck ? 'STUCK tespit edildi' : 'Forge izleniyor'}</Text>
        <Text style={styles.bridgeCounter}>{stuckCount}/2 bloklayici cycle</Text>
        <TouchableOpacity style={[styles.callButton, !stuck && styles.callButtonQuiet]} onPress={openCall}>
          <Text style={styles.callButtonText}>{stuck ? 'Uzmana Baglan' : 'Jitsi odasini test et'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.cardTitle}>Oda</Text>
        <Text style={styles.roomText}>{JITSI_URL}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.failButton} onPress={() => onAppend('FAIL')}>
            <Text style={styles.cycleButtonText}>FAIL ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rollbackButton} onPress={() => onAppend('ROLLBACK')}>
            <Text style={styles.cycleButtonText}>ROLLBACK ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.cardTitle}>Son cycle'lar</Text>
        {runs.slice(-5).reverse().map((run) => (
          <View key={run.id} style={styles.runRow}>
            <Text style={styles.runStatus}>{run.status}</Text>
            <Text style={styles.runLabel}>{run.label}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export const bridgeMeta = {
  room: JITSI_ROOM,
  url: JITSI_URL,
};

export function makeForgeRun(status: ForgeSignal, label?: string): ForgeRun {
  const now = new Date();
  return {
    id: makeId(),
    label: label || `Final hafta ${status.toLowerCase()} cycle - ${now.toLocaleTimeString('tr-TR')}`,
    status,
    timestamp: now.toISOString(),
  };
}

const styles = StyleSheet.create({
  headerBlock: {
    marginTop: 18,
    marginBottom: 18,
  },
  kicker: {
    color: '#7cf7c4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  copy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
  },
  voiceDeck: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24435c',
    backgroundColor: '#101a27',
    padding: 16,
    marginBottom: 16,
  },
  meterTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#182235',
    borderWidth: 2,
    borderColor: '#334155',
  },
  micButtonLive: {
    borderColor: '#ff5f7e',
    backgroundColor: '#34121c',
  },
  micGlyph: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  meterReadout: {
    flex: 1,
  },
  readoutLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  readoutValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
  },
  readoutHint: {
    color: '#7cf7c4',
    fontSize: 12,
    fontWeight: '800',
  },
  bars: {
    height: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    flex: 1,
    minHeight: 8,
    borderRadius: 5,
  },
  warningBox: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#2a1115',
    marginBottom: 14,
  },
  warningText: {
    color: '#fecaca',
    lineHeight: 20,
  },
  panelCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c3a4f',
    backgroundColor: '#121a27',
    padding: 16,
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  cardCopy: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  smallPill: {
    minWidth: 76,
    minHeight: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
  },
  smallPillActive: {
    backgroundColor: '#be123c',
  },
  smallPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  dictationInput: {
    marginTop: 14,
    minHeight: 118,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    color: '#ffffff',
    padding: 13,
    textAlignVertical: 'top',
    lineHeight: 21,
  },
  primaryWide: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryWideText: {
    color: '#06111d',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryWideHot: {
    backgroundColor: '#f59e0b',
  },
  canvasShell: {
    height: 390,
    minHeight: 390,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    marginBottom: 14,
  },
  canvas: {
    flex: 1,
    width: '100%',
    minHeight: 390,
  },
  personaBadge: {
    position: 'absolute',
    left: 12,
    bottom: 26,
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#57d7ff',
    backgroundColor: 'rgba(8,22,32,0.88)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaBadgeSenior: {
    borderColor: '#f9d36b',
    backgroundColor: 'rgba(42,31,9,0.88)',
  },
  personaBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderColor: '#7cf7c4',
    backgroundColor: '#123026',
  },
  segmentText: {
    color: '#94a3b8',
    fontWeight: '900',
    fontSize: 13,
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  flexOne: {
    flex: 1,
  },
  avatarMeta: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253347',
    backgroundColor: '#0b1220',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
  },
  metaLabel: {
    color: '#7cf7c4',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 2,
  },
  metaValue: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '800',
  },
  reportInput: {
    marginTop: 14,
    minHeight: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    color: '#ffffff',
    padding: 13,
    textAlignVertical: 'top',
    lineHeight: 21,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#172554',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  secondaryActionLive: {
    borderColor: '#f59e0b',
    backgroundColor: '#3a2608',
  },
  secondaryActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  statusBadge: {
    minWidth: 58,
    minHeight: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusBadgeHot: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
  },
  successButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollbackButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#a16207',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  runList: {
    maxHeight: 154,
    marginTop: 12,
  },
  runRow: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#253347',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  runStatus: {
    width: 78,
    color: '#7cf7c4',
    fontSize: 11,
    fontWeight: '900',
  },
  runLabel: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
  },
  bridgeHero: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#101a27',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  bridgeHeroHot: {
    borderColor: '#ef4444',
    backgroundColor: '#241116',
  },
  bridgeStatus: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  bridgeCounter: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
  },
  callButton: {
    minHeight: 50,
    minWidth: 190,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonQuiet: {
    backgroundColor: '#2563eb',
  },
  callButtonText: {
    color: '#06111d',
    fontSize: 15,
    fontWeight: '900',
  },
  roomText: {
    color: '#93c5fd',
    fontSize: 13,
    lineHeight: 19,
  },
});

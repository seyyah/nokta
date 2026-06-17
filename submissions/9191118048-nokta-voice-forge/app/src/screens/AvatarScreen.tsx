import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import AvatarScene from '../components/AvatarScene';
import { AudioService } from '../services/audioService';
import {
  detectSpeechLanguage,
  generateAvatarReply,
  generateGeminiAudioReply,
} from '../services/conversationService';
import { transcribeAudio } from '../services/sttService';
import { generateMaleSpeechFile } from '../services/ttsService';
import { animation, borderRadius, colors, shadows, spacing, typography } from '../theme';

const VISUALIZER_BARS = 20;
const MIC_SIZE = 72;

type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const MALE_VOICE_NAMES = [
  'cem', 'maged', 'majed', 'tarik', 'tariq', 'omar', 'ahmed', 'hakan',
  'yusuf', 'kerem', 'daniel', 'alex', 'fred', 'thomas', 'aaron',
];

function generateBands(amplitude: number): number[] {
  const center = VISUALIZER_BARS / 2;
  return Array.from({ length: VISUALIZER_BARS }, (_, index) => {
    const distance = Math.abs(index - center) / center;
    const curve = Math.exp(-distance * distance * 2.5);
    return Math.min(1, amplitude * curve * (0.72 + Math.random() * 0.45));
  });
}

async function findMaleVoice(language: string): Promise<string | undefined> {
  const configuredVoice = process.env.EXPO_PUBLIC_MALE_VOICE_ID?.trim();
  if (configuredVoice) return configuredVoice;

  const languagePrefix = language.split('-')[0].toLowerCase();
  const voices = await Speech.getAvailableVoicesAsync();
  const languageVoices = voices.filter(
    (voice) => voice.language.toLowerCase().startsWith(languagePrefix),
  );
  const maleVoice = languageVoices.find((voice) => {
    const searchableName = `${voice.name} ${voice.identifier}`.toLowerCase();
    return MALE_VOICE_NAMES.some((name) => searchableName.includes(name));
  });
  return maleVoice?.identifier;
}

const STATUS_COPY: Record<ConversationState, { badge: string; title: string; subtitle: string }> = {
  idle: { badge: 'HAZIR', title: 'Konusmaya hazir', subtitle: 'Konusmak icin mikrofonu basili tut' },
  listening: { badge: 'DINLIYOR', title: 'Seni dinliyorum', subtitle: 'Bitirdiginde parmagini kaldir' },
  thinking: { badge: 'DUSUNUYOR', title: 'Yanit hazirlaniyor', subtitle: 'Konusman metne cevrildi, yanit uretiliyor' },
  speaking: { badge: 'KONUSUYOR', title: 'Senior-Sen yanitliyor', subtitle: 'Sesi durdurmak icin dugmeye dokun' },
  error: { badge: 'HATA', title: 'Baglanti tamamlanamadi', subtitle: 'API anahtarlarini ve internet baglantisini kontrol et' },
};

export default function AvatarScreen() {
  const replyPlayer = useAudioPlayer(null, { updateInterval: 100, keepAudioSessionActive: true });
  const replyPlayerStatus = useAudioPlayerStatus(replyPlayer);
  const audioServiceRef = useRef(new AudioService());
  const replyPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visualLatencyMeasuredRef = useRef(false);
  const isHoldingMicRef = useRef(false);
  const isFinishingRef = useRef(false);
  const recordingStartPromiseRef = useRef<Promise<boolean> | null>(null);
  const pendingReplyPlaybackRef = useRef(false);
  const isReplyAnimatingRef = useRef(false);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  const [bands, setBands] = useState<number[]>(new Array(VISUALIZER_BARS).fill(0));
  const [errorMessage, setErrorMessage] = useState('');
  const [userText, setUserText] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [visualLatency, setVisualLatency] = useState<number | null>(null);
  const micScale = useSharedValue(1);

  const clearReplyPulse = useCallback(() => {
    if (replyPulseRef.current) {
      clearInterval(replyPulseRef.current);
      replyPulseRef.current = null;
    }
    setSpeakingIntensity(0);
    setBands(new Array(VISUALIZER_BARS).fill(0));
  }, []);

  const finishSpeaking = useCallback(() => {
    pendingReplyPlaybackRef.current = false;
    isReplyAnimatingRef.current = false;
    clearReplyPulse();
    setConversationState('idle');
  }, [clearReplyPulse]);

  const startSpeakingAnimation = useCallback(() => {
    if (isReplyAnimatingRef.current) return;
    isReplyAnimatingRef.current = true;
    setConversationState('speaking');
    replyPulseRef.current = setInterval(() => {
      const amplitude = 0.3 + Math.random() * 0.55;
      setSpeakingIntensity(amplitude);
      setBands(generateBands(amplitude));
    }, 90);
  }, []);

  useEffect(() => {
    if (replyPlayerStatus.didJustFinish) finishSpeaking();
  }, [finishSpeaking, replyPlayerStatus.didJustFinish]);

  useEffect(() => {
    if (replyPlayerStatus.playing) startSpeakingAnimation();
  }, [replyPlayerStatus.playing, startSpeakingAnimation]);

  useEffect(() => {
    if (!replyPlayerStatus.isLoaded || !pendingReplyPlaybackRef.current) return;
    pendingReplyPlaybackRef.current = false;

    (async () => {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'duckOthers',
        playsInSilentMode: true,
      });
      await replyPlayer.seekTo(0);
      replyPlayer.volume = 1;
      replyPlayer.play();
    })().catch((error) => {
      console.warn('[AvatarScreen] Reply playback failed:', error);
      setErrorMessage('Erkek ses dosyasi oynatilamadi.');
      setConversationState('error');
    });
  }, [replyPlayer, replyPlayerStatus.isLoaded]);

  const speakReply = useCallback(async (reply: string, sourceText: string) => {
    clearReplyPulse();
    setConversationState('thinking');

    try {
      const speechUri = await generateMaleSpeechFile(reply);
      pendingReplyPlaybackRef.current = true;
      replyPlayer.replace(speechUri);
    } catch (ttsError) {
      console.warn('[AvatarScreen] Gemini male TTS failed, using device fallback:', ttsError);
      const language = detectSpeechLanguage(sourceText);
      const maleVoice = await findMaleVoice(language);
      Speech.speak(reply, {
        language,
        voice: maleVoice,
        rate: 0.95,
        pitch: maleVoice ? 0.92 : 0.68,
        onStart: startSpeakingAnimation,
        onDone: finishSpeaking,
        onStopped: finishSpeaking,
        onError: () => {
          clearReplyPulse();
          setErrorMessage('Erkek ses yaniti oynatilamadi.');
          setConversationState('error');
        },
      });
    }
  }, [clearReplyPulse, finishSpeaking, replyPlayer, startSpeakingAnimation]);

  const stopEverything = useCallback(async () => {
    await audioServiceRef.current.stopRecording();
    replyPlayer.pause();
    await Speech.stop();
    clearReplyPulse();
  }, [clearReplyPulse, replyPlayer]);

  useEffect(() => {
    return () => {
      stopEverything().catch(() => {});
    };
  }, [stopEverything]);

  const startListening = useCallback(async () => {
    if (isHoldingMicRef.current || conversationState === 'thinking') return;
    isHoldingMicRef.current = true;
    setErrorMessage('');
    setUserText('');
    setAssistantText('');
    setVisualLatency(null);
    visualLatencyMeasuredRef.current = false;
    await Speech.stop();

    const startPromise = audioServiceRef.current.startRecording((meter) => {
      setSpeakingIntensity(meter.amplitude);
      setBands(generateBands(meter.amplitude));
      if (meter.amplitude > 0.08 && !visualLatencyMeasuredRef.current) {
        visualLatencyMeasuredRef.current = true;
        requestAnimationFrame(() => setVisualLatency(Date.now() - meter.timestamp));
      }
    });
    recordingStartPromiseRef.current = startPromise;
    const didStart = await startPromise;
    recordingStartPromiseRef.current = null;

    if (didStart) {
      if (isHoldingMicRef.current) setConversationState('listening');
    } else {
      isHoldingMicRef.current = false;
      setErrorMessage('Mikrofon baslatilamadi. Izinleri ve baska bir kayit uygulamasinin acik olmadigini kontrol et.');
      setConversationState('error');
    }
  }, [conversationState]);

  const finishListening = useCallback(async () => {
    if (!isHoldingMicRef.current || isFinishingRef.current) return;
    isHoldingMicRef.current = false;
    isFinishingRef.current = true;
    await recordingStartPromiseRef.current;
    setConversationState('thinking');
    setSpeakingIntensity(0);
    setBands(new Array(VISUALIZER_BARS).fill(0));

    try {
      const recordingUri = await audioServiceRef.current.stopRecording();
      const duration = audioServiceRef.current.getState().duration;
      if (!recordingUri) throw new Error('Kayit dosyasi olusturulamadi.');

      let transcript: string;
      let reply: string;
      if (
        process.env.EXPO_PUBLIC_CHAT_PROVIDER?.trim().toLowerCase() === 'gemini' &&
        process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim()
      ) {
        const audioBase64 = await FileSystem.readAsStringAsync(recordingUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const result = await generateGeminiAudioReply(audioBase64);
        transcript = result.transcript;
        reply = result.reply;
      } else {
        const transcription = await transcribeAudio(recordingUri, duration);
        if (!transcription.isRealSTT) {
          throw new Error('Gercek konusma icin STT API anahtari gerekli.');
        }
        transcript = transcription.text;
        if (!transcript.trim()) throw new Error('Konusma anlasilamadi. Lutfen tekrar dene.');
        reply = await generateAvatarReply(transcript);
      }

      setUserText(transcript);
      setAssistantText(reply);
      speakReply(reply, transcript);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sesli konusma tamamlanamadi.';
      setErrorMessage(message);
      setConversationState('error');
    } finally {
      isFinishingRef.current = false;
    }
  }, [speakReply]);

  const handleMicPressIn = useCallback(async () => {
    if (conversationState === 'speaking') {
      replyPlayer.pause();
      await Speech.stop();
      finishSpeaking();
    }
    await startListening();
  }, [conversationState, finishSpeaking, replyPlayer, startListening]);

  const handleMicPressOut = useCallback(async () => {
    await finishListening();
  }, [finishListening]);

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));
  const status = STATUS_COPY[conversationState];
  const isActive = conversationState === 'listening' || conversationState === 'speaking';
  const isBusy = conversationState === 'thinking';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#111327', '#090A12', '#07070C']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.heroRow}>
          <View style={[styles.liveBadge, isActive && styles.liveBadgeActive]}>
            <View style={[styles.liveDot, isActive && styles.liveDotActive]} />
            <Text style={styles.liveText}>{status.badge}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.stageCard}>
          <LinearGradient
            colors={['rgba(124,92,252,0.16)', 'rgba(0,212,170,0.04)', 'rgba(9,10,18,0.2)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.stageGlow} />
          <AvatarScene
            speakingIntensity={conversationState === 'speaking' ? speakingIntensity : 0}
            isSpeaking={conversationState === 'speaking'}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.controlPanel}>
          <View style={styles.vizHeader}>
            <View style={styles.vizCopy}>
              <Text style={styles.vizTitle}>{status.title}</Text>
              <Text style={[styles.vizSubtitle, errorMessage ? styles.errorText : undefined]}>
                {errorMessage || status.subtitle}
              </Text>
            </View>
            <Text style={styles.levelText}>{Math.round(speakingIntensity * 100)}%</Text>
          </View>

          {(userText || assistantText) && (
            <View style={styles.transcriptBox}>
              {!!userText && <Text numberOfLines={2} style={styles.userText}>Sen: {userText}</Text>}
              {!!assistantText && <Text numberOfLines={3} style={styles.assistantText}>Senior-Sen: {assistantText}</Text>}
            </View>
          )}

          <View style={styles.latencyRow}>
            <View style={[styles.latencyChip, visualLatency !== null && visualLatency < 200 && styles.latencyChipGood]}>
              <Text style={styles.latencyLabel}>VIZ</Text>
              <Text style={styles.latencyValue}>{visualLatency === null ? '--' : `${visualLatency}ms`}</Text>
            </View>
            <Text style={styles.latencyHint}>Hedef: viz &lt; 200ms</Text>
          </View>

          <View style={styles.vizBars}>
            {bands.map((amplitude, index) => (
              <View key={index} style={[styles.vizBar, { height: 4 + amplitude * 24 }]} />
            ))}
          </View>

          <View style={styles.micRow}>
            <Text style={styles.micHint}>
              {conversationState === 'listening' ? 'Birakinca gonderilir' : conversationState === 'speaking' ? 'Yeni soru icin basili tut' : 'Konusmak icin basili tut'}
            </Text>
            <Animated.View style={micStyle}>
              <Pressable
                disabled={isBusy}
                style={[styles.micBtn, isActive && styles.micBtnActive, isBusy && styles.micBtnBusy]}
                onPressIn={() => {
                  micScale.value = withSpring(0.9, animation.springBouncy);
                  handleMicPressIn().catch(() => {});
                }}
                onPressOut={() => {
                  micScale.value = withSpring(1, animation.springBouncy);
                  handleMicPressOut().catch(() => {});
                }}
              >
                {isActive || isBusy ? <View style={styles.stopIcon} /> : (
                  <View style={styles.micGlyph}>
                    <View style={styles.micGlyphStem} />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  heroRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: spacing.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.round, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.border },
  liveBadgeActive: { borderColor: 'rgba(0,212,170,0.4)', backgroundColor: 'rgba(0,212,170,0.09)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  liveDotActive: { backgroundColor: colors.primary },
  liveText: { ...typography.micro, color: colors.textSecondary, fontSize: 10 },
  stageCard: { flex: 1, minHeight: 310, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', backgroundColor: 'rgba(8,9,18,0.85)', ...shadows.lg },
  stageGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(124,92,252,0.12)', alignSelf: 'center', top: 70 },
  controlPanel: { marginTop: spacing.md, marginBottom: spacing.sm, padding: spacing.md, borderRadius: borderRadius.xl, backgroundColor: 'rgba(18,18,28,0.94)', borderWidth: 1, borderColor: colors.border },
  vizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  vizCopy: { flex: 1, paddingRight: spacing.md },
  vizTitle: { ...typography.bodyBold, fontSize: 14 },
  vizSubtitle: { ...typography.caption, fontSize: 11, marginTop: 2 },
  errorText: { color: colors.error },
  levelText: { ...typography.bodyBold, color: colors.primary, fontVariant: ['tabular-nums'] },
  transcriptBox: { gap: 5, padding: 10, marginBottom: spacing.sm, borderRadius: borderRadius.md, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: colors.border },
  userText: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },
  assistantText: { ...typography.caption, color: colors.primary, fontSize: 10 },
  latencyRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  latencyChip: { flexDirection: 'row', gap: 4, paddingHorizontal: 7, paddingVertical: 4, borderRadius: borderRadius.round, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  latencyChipGood: { backgroundColor: 'rgba(0,212,170,0.09)', borderColor: 'rgba(0,212,170,0.35)' },
  latencyLabel: { ...typography.micro, fontSize: 8, color: colors.textMuted },
  latencyValue: { ...typography.micro, fontSize: 8, color: colors.primary, fontVariant: ['tabular-nums'] },
  latencyHint: { ...typography.micro, fontSize: 8, color: colors.textMuted, marginLeft: 'auto' },
  vizBars: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', height: 30 },
  vizBar: { width: 3, borderRadius: 2, backgroundColor: colors.primary, opacity: 0.85 },
  micRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  micHint: { ...typography.caption, color: colors.textSecondary },
  micBtn: { width: MIC_SIZE, height: MIC_SIZE, borderRadius: MIC_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,170,0.6)', backgroundColor: colors.primary, ...shadows.md },
  micBtnActive: { backgroundColor: colors.error, borderColor: colors.accent },
  micBtnBusy: { backgroundColor: colors.secondary, opacity: 0.75 },
  micGlyph: { width: 18, height: 27, borderRadius: 9, borderWidth: 3, borderColor: colors.textInverse },
  micGlyphStem: { position: 'absolute', width: 3, height: 8, backgroundColor: colors.textInverse, bottom: -9, alignSelf: 'center' },
  stopIcon: { width: 20, height: 20, borderRadius: 5, backgroundColor: '#FFFFFF' },
});

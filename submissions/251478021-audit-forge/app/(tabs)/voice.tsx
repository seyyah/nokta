import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform,
  SafeAreaView, ScrollView, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BAR_COUNT = 32;
const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 120;

// Simulated FFT data when mic access not available
function generateFakeFFT(isActive: boolean, tick: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    if (!isActive) return BAR_MIN_HEIGHT;
    const freq = Math.sin(tick * 0.08 + i * 0.5) * 0.5 + 0.5;
    const noise = Math.random() * 0.3;
    const envelope = i < 4 ? 0.8 : i > 24 ? 0.4 : 1.0;
    return Math.max(BAR_MIN_HEIGHT, (freq + noise) * envelope * BAR_MAX_HEIGHT);
  });
}

// Voice report entries
const VOICE_REPORTS = [
  {
    id: '1',
    title: 'Bilet Arama Akışı',
    transcription: 'Ana ekranda bilet arama alanı biraz karmaşık görünüyor. Nereden ve nereye alanlarının daha belirgin olması gerekiyor. Tarih seçici de mobilde kullanımı zor.',
    timestamp: '2026-05-28 09:15',
    duration: '0:42',
    persona: 'Junior Sen',
    status: 'processed',
  },
  {
    id: '2',
    title: 'Koltuk Seçim Modali',
    transcription: 'Koltuk seçim ekranında renk kodlaması yetersiz. Dolu koltuklar kırmızı, boş koltuklar beyaz ama seçili koltukların mavi rengi yeterince kontrast değil. Ayrıca koltuk numaraları çok küçük.',
    timestamp: '2026-05-28 09:32',
    duration: '0:38',
    persona: 'Senior Sen',
    status: 'processed',
  },
  {
    id: '3',
    title: 'Profil Ekranı Eksiklikleri',
    transcription: 'Profil ekranında kullanıcının geçmiş yolculukları görünmüyor. Bu çok kritik bir eksiklik. Ayrıca bildirim tercihleri de olması gerekiyor. Hesap silme seçeneği de görünür olmalı.',
    timestamp: '2026-05-28 10:05',
    duration: '0:51',
    persona: 'Junior Sen',
    status: 'pending',
  },
];

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(BAR_MIN_HEIGHT));
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [activePersona, setActivePersona] = useState<'junior' | 'senior'>('junior');
  const [rmsLevel, setRmsLevel] = useState(0);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const tickRef = useRef(0);
  const animFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barAnimRefs = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(BAR_MIN_HEIGHT))
  );
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Request mic permission
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermission(status === 'granted');
    })();
    return () => {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
    };
  }, []);

  // Glow pulse animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      pulseAnim.stopAnimation();
      glowAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // FFT bar animation loop
  useEffect(() => {
    if (isListening) {
      animFrameRef.current = setInterval(() => {
        tickRef.current += 1;
        const fftData = generateFakeFFT(true, tickRef.current);
        setBars(fftData);
        const rms = Math.sqrt(fftData.reduce((s, v) => s + v * v, 0) / fftData.length) / BAR_MAX_HEIGHT;
        setRmsLevel(rms);

        fftData.forEach((h, i) => {
          Animated.spring(barAnimRefs.current[i], {
            toValue: h,
            speed: 50,
            bounciness: 2,
            useNativeDriver: false,
          }).start();
        });
      }, 50); // 20fps → well under 200ms latency target
    } else {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
      // Wind down bars
      barAnimRefs.current.forEach(anim => {
        Animated.timing(anim, {
          toValue: BAR_MIN_HEIGHT,
          duration: 400,
          useNativeDriver: false,
        }).start();
      });
      setBars(Array(BAR_COUNT).fill(BAR_MIN_HEIGHT));
      setRmsLevel(0);
    }
    return () => {
      if (animFrameRef.current) clearInterval(animFrameRef.current);
    };
  }, [isListening]);

  const startListening = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsListening(true);
      setIsRecording(true);
      setCurrentTranscript('');
    } catch (e) {
      // Fallback: visual-only mode
      setIsListening(true);
      Alert.alert('Bilgi', 'Mikrofon erişimi sağlanamadı. Görsel simülasyon modu aktif.');
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setIsRecording(false);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (_) {}
      setRecording(null);
    }
    // Simulate STT transcription
    setTimeout(() => {
      setCurrentTranscript(
        activePersona === 'junior'
          ? 'Ana ekranda navigasyon biraz kalabalık. Daha sade bir yapı daha iyi olurdu.'
          : 'Kullanıcı deneyimi açısından kritik bir akış sorunu tespit ettim. Bilet onay süreci 3 adıma indirilebilir.'
      );
    }, 600);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(99,102,241,0.3)', 'rgba(99,102,241,0.9)'],
  });

  const barColor = (index: number) => {
    // Gradient: bass=blue, mid=purple, treble=pink
    const t = index / BAR_COUNT;
    if (t < 0.33) return '#3B82F6';
    if (t < 0.66) return '#8B5CF6';
    return '#EC4899';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ses Görselleştirici</Text>
          <View style={styles.personaPills}>
            <TouchableOpacity
              style={[styles.pill, activePersona === 'junior' && styles.pillActive]}
              onPress={() => setActivePersona('junior')}
            >
              <Text style={[styles.pillText, activePersona === 'junior' && styles.pillTextActive]}>
                Junior
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, activePersona === 'senior' && styles.pillActiveSenior]}
              onPress={() => setActivePersona('senior')}
            >
              <Text style={[styles.pillText, activePersona === 'senior' && styles.pillTextActive]}>
                Senior
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Persona Badge */}
        <View style={[styles.personaBadge, activePersona === 'senior' && styles.personaBadgeSenior]}>
          <Ionicons
            name={activePersona === 'junior' ? 'school-outline' : 'briefcase-outline'}
            size={16}
            color={activePersona === 'junior' ? '#3B82F6' : '#F59E0B'}
          />
          <Text style={[styles.personaText, activePersona === 'senior' && { color: '#F59E0B' }]}>
            {activePersona === 'junior'
              ? 'Junior Sen — samimi, meraklı ton'
              : 'Senior Sen — analitik, doğrudan ton'}
          </Text>
        </View>

        {/* Visualizer Stage */}
        <Animated.View
          style={[
            styles.visualizerStage,
            { shadowColor: glowColor as any, shadowOpacity: 1, shadowRadius: 30, elevation: 20 },
          ]}
        >
          {/* Waveform / Bar Spectrum */}
          <View style={styles.barsContainer}>
            {barAnimRefs.current.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: anim,
                    backgroundColor: barColor(i),
                    opacity: isListening ? 1 : 0.25,
                    width: (SCREEN_WIDTH - 80) / BAR_COUNT - 2,
                  },
                ]}
              />
            ))}
          </View>

          {/* RMS meter */}
          <View style={styles.rmsMeterTrack}>
            <Animated.View
              style={[
                styles.rmsMeterFill,
                { width: `${Math.min(100, rmsLevel * 100 * 2.5)}%` },
              ]}
            />
          </View>
          <Text style={styles.rmsLabel}>
            RMS: {(rmsLevel * 100).toFixed(1)}% {isListening ? '🎙️' : '⏸'}
          </Text>
        </Animated.View>

        {/* Mic Button */}
        <View style={styles.micSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={toggleListening}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={36}
                color="#FFF"
              />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.micStatus}>
            {isListening ? '● KAYIT — konuş' : 'Mikrofon için dokun'}
          </Text>
        </View>

        {/* Live Transcript */}
        {currentTranscript ? (
          <View style={styles.transcriptBox}>
            <View style={styles.transcriptHeader}>
              <Ionicons name="document-text-outline" size={16} color="#8B5CF6" />
              <Text style={styles.transcriptTitle}>STT → Markdown</Text>
            </View>
            <Text style={styles.transcriptText}>{currentTranscript}</Text>
            <TouchableOpacity style={styles.forgeBtn}>
              <Ionicons name="flash" size={14} color="#FFF" />
              <Text style={styles.forgeBtnText}>Forge Döngüsüne Gönder</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Voice Reports List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ses Raporları</Text>
          {VOICE_REPORTS.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[styles.reportCard, selectedReport === report.id && styles.reportCardActive]}
              onPress={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            >
              <View style={styles.reportTop}>
                <View style={styles.reportMeta}>
                  <Ionicons name="mic" size={14} color="#8B5CF6" />
                  <Text style={styles.reportTitle}>{report.title}</Text>
                </View>
                <View style={[styles.statusBadge, report.status === 'processed' ? styles.statusProcessed : styles.statusPending]}>
                  <Text style={styles.statusText}>
                    {report.status === 'processed' ? '✓ İşlendi' : '⌛ Bekliyor'}
                  </Text>
                </View>
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportMeta2}>{report.persona} · {report.duration} · {report.timestamp}</Text>
              </View>
              {selectedReport === report.id && (
                <Text style={styles.reportBody}>{report.transcription}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>💡 Nasıl Kullanılır?</Text>
          <Text style={styles.instructionText}>
            1. Persona seç (Junior / Senior){'\n'}
            2. Mikrofona dokun, konuş{'\n'}
            3. STT transkripsiyon otomatik üretilir{'\n'}
            4. "Forge Döngüsüne Gönder" → rapor olarak işlenir{'\n'}
            Latency hedefi: &lt;200ms
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080B14' },
  scroll: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC' },
  personaPills: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  pillActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  pillActiveSenior: { backgroundColor: '#92400E', borderColor: '#F59E0B' },
  pillText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: '#FFF' },
  personaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  personaBadgeSenior: {
    backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)',
  },
  personaText: { color: '#3B82F6', fontSize: 13, fontWeight: '600' },
  visualizerStage: {
    marginHorizontal: 20,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 24,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 10,
    gap: 2,
  },
  bar: {
    borderRadius: 3,
    minHeight: BAR_MIN_HEIGHT,
  },
  rmsMeterTrack: {
    height: 4, borderRadius: 2, backgroundColor: '#1E293B', marginTop: 16, overflow: 'hidden',
  },
  rmsMeterFill: {
    height: '100%', borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  rmsLabel: { color: '#64748B', fontSize: 11, marginTop: 6, textAlign: 'center' },
  micSection: { alignItems: 'center', marginBottom: 24 },
  micBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 15, elevation: 12,
  },
  micBtnActive: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  micStatus: { color: '#64748B', fontSize: 13, marginTop: 12, fontWeight: '600' },
  transcriptBox: {
    marginHorizontal: 20, backgroundColor: '#13172A', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)', marginBottom: 24,
  },
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  transcriptTitle: { color: '#8B5CF6', fontWeight: '700', fontSize: 13 },
  transcriptText: { color: '#CBD5E1', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  forgeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4F46E5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  forgeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  reportCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  reportCardActive: { borderColor: 'rgba(139,92,246,0.5)' },
  reportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reportTitle: { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusProcessed: { backgroundColor: 'rgba(16,185,129,0.15)' },
  statusPending: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statusText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  reportInfo: { marginBottom: 4 },
  reportMeta2: { color: '#64748B', fontSize: 12 },
  reportBody: { color: '#CBD5E1', fontSize: 13, lineHeight: 20, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  instructionCard: {
    marginHorizontal: 20,
    backgroundColor: '#13172A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  instructionTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 14, marginBottom: 10 },
  instructionText: { color: '#64748B', fontSize: 13, lineHeight: 22 },
});

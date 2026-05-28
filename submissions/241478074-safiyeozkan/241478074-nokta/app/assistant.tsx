import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AvatarScene from './components/avatar/AvatarScene';
import AudioBars from './components/voice/AudioBars';
import AudioWave from './components/voice/AudioWave';
import AudioGlow from './components/voice/AudioGlow';
import { useMicrophone } from './hooks/useMicrophone';
import { useFFT } from './hooks/useFFT';
import { useRMS } from './hooks/useRMS';
import { usePersonaStore, PERSONAS } from './src/store/usePersonaStore';
import { WhisperService } from './services/ai/WhisperService';
import { TTSService } from './services/ai/TTSService';
import { ForgeEngine } from './services/forge/forgeEngine';

const forge = new ForgeEngine();

type MessageEntry = {
  role: 'user' | 'assistant';
  message: string;
};

export default function AssistantScreen() {
  const router = useRouter();
  const personaKey = usePersonaStore((state) => state.current);
  const setPersona = usePersonaStore((state) => state.setPersona);
  const persona = PERSONAS[personaKey];
  const {
    permission,
    isRecording,
    amplitude,
    samples,
    uri,
    error,
    start,
    stop,
  } = useMicrophone();
  const fft = useFFT(samples, 16);
  const rms = useRMS(samples);
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('Kayıt başlatmak için mikrofon simgesine dokun.');
  const [history, setHistory] = useState<MessageEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [forgeState, setForgeState] = useState('IDLE');
  const [expertEscalation, setExpertEscalation] = useState(false);
  const [reportUri, setReportUri] = useState<string | null>(null);

  const updatePersona = (key: typeof personaKey) => {
    setPersona(key);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stop();
      if (!uri) return;
      setProcessing(true);
      setForgeState('RUNNING');
      try {
        const transcription = await WhisperService.transcribe(uri);
        setTranscript(transcription.text);
        setHistory((current) => [...current, { role: 'user', message: transcription.text }]);

        const result = await forge.execute({ transcript: transcription.text, persona: personaKey });
        setForgeState(result.state);
        setAssistantText(result.summary);
        setHistory((current) => [...current, { role: 'assistant', message: result.summary }]);
        setReportUri(result.reportUri ?? null);
        if (result.expertCall) {
          setExpertEscalation(true);
          setTimeout(() => router.push('/bridge'), 1200);
        }
        TTSService.speak(result.summary, { pitch: persona.voicePitch });
      } catch (err) {
        setAssistantText('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setProcessing(false);
      }
    } else {
      await start();
      setAssistantText('Mikrofon canlı. Konuşun, Nokta dinliyor.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09090d" />

      <View style={styles.header}>
        <Text style={styles.title}>Nokta Sesli Asistan</Text>
        <View style={styles.badgeRow}>
          <TouchableOpacity style={styles.badge} onPress={() => updatePersona('junior-sen')}>
            <Text style={[styles.badgeText, personaKey === 'junior-sen' && styles.badgeTextActive]}>Junior</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.badge} onPress={() => updatePersona('senior-sen')}>
            <Text style={[styles.badgeText, personaKey === 'senior-sen' && styles.badgeTextActive]}>Senior</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.assistantCard}>
          <Text style={styles.subtitle}>Persona</Text>
          <Text style={styles.personaLabel}>{persona.label}</Text>
          <Text style={styles.personaDescription}>{persona.description}</Text>
        </View>

        <View style={styles.avatarSection}>
          <AudioGlow intensity={amplitude} />
          <View style={styles.avatarCanvas}>
            <AvatarScene speechLevel={amplitude} persona={persona} />
          </View>
        </View>

          <AudioWave bins={fft} accent={personaKey === 'senior-sen' ? '#F59E0B' : '#8B5CF6'} />
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>Gerçek zamanlı frekans ve ses seviyesi</Text>
          <AudioBars bins={fft} accent={personaKey === 'senior-sen' ? '#F59E0B' : '#8B5CF6'} />
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>RMS: {rms.toFixed(2)}</Text>
          <Text style={styles.stat}>Amplitude: {amplitude.toFixed(2)}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.voiceButton, isRecording && styles.voiceButtonActive]} onPress={handleToggleRecording}>
            {processing ? (
              <ActivityIndicator color="#0f0f0f" />
            ) : (
              <Text style={styles.voiceButtonText}>{isRecording ? 'Durdur' : 'Konuşmaya Başla'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/bridge')}>
            <Text style={styles.linkButtonText}>Uzman Köprüsüne Geç</Text>
          </TouchableOpacity>
        </View>
        {expertEscalation ? (
          <View style={styles.escalationBanner}>
            <Text style={styles.escalationText}>İki döngü üst üste ROLLBACK/FAIL algılandı. Uzman görüşmesi açılıyor.</Text>
            <TouchableOpacity style={styles.escalationButton} onPress={() => router.push('/bridge')}>
              <Text style={styles.escalationButtonText}>Uzmana Bağlan</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.transcriptBox}>
          <Text style={styles.boxTitle}>Transkript</Text>
          <Text style={styles.boxText}>{transcript || 'Kayıt bekleniyor...'}</Text>
        </View>

        <View style={styles.transcriptBox}>
          <Text style={styles.boxTitle}>Nokta Yanıtı</Text>
          <Text style={styles.boxText}>{assistantText}</Text>
        </View>

        <View style={styles.historyBox}>
          <Text style={styles.boxTitle}>Konuşma Geçmişi</Text>
          {history.map((item, index) => (
            <View key={`${item.role}-${index}`} style={styles.historyRow}>
              <Text style={styles.historyRole}>{item.role === 'user' ? 'Sen:' : 'Asistan:'}</Text>
              <Text style={styles.historyText}>{item.message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerText}>Forge durumu: {forgeState}</Text>
          <Text style={styles.footerNote}>Her konuşma döngüsü otomatik olarak incelenir ve yeniden deneme/rollback stratejileri uygulanır.</Text>
          {reportUri ? (
            <Text style={styles.footerNote}>Rapor kaydedildi: {reportUri}</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090d' },
  header: { padding: 20, paddingTop: 28 },
  title: { color: '#f5f0e8', fontSize: 26, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  badge: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#111' },
  badgeText: { color: '#888', fontWeight: '700' },
  badgeTextActive: { color: '#c8a96e' },
  content: { paddingBottom: 120, paddingHorizontal: 20 },
  assistantCard: { backgroundColor: '#111', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1f1f1f', marginBottom: 18 },
  subtitle: { color: '#8b8b96', fontSize: 12, letterSpacing: 1.2, marginBottom: 6 },
  personaLabel: { color: '#f5f0e8', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  personaDescription: { color: '#bababa', lineHeight: 20 },
  avatarSection: { height: 320, marginBottom: 24, borderRadius: 24, overflow: 'hidden', backgroundColor: '#050508', borderWidth: 1, borderColor: '#1d1d22' },
  avatarCanvas: { flex: 1 },
  meterRow: { marginBottom: 18 },
  meterLabel: { color: '#888', fontSize: 12, marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 18 },
  stat: { color: '#c8a96e', fontWeight: '700' },
  error: { color: '#ff6b6b', marginBottom: 12, paddingHorizontal: 4 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  voiceButton: { flex: 2, backgroundColor: '#c8a96e', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  voiceButtonActive: { backgroundColor: '#f59e0b' },
  voiceButtonText: { color: '#09090d', fontWeight: '800' },
  linkButton: { flex: 1, backgroundColor: '#111', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2b2b33' },
  linkButtonText: { color: '#f5f0e8', fontWeight: '700' },
  transcriptBox: { backgroundColor: '#111', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1f1f1f', marginBottom: 16 },
  boxTitle: { color: '#c8a96e', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1.2 },
  boxText: { color: '#d6d6d6', lineHeight: 22 },
  historyBox: { backgroundColor: '#111', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1f1f1f', marginBottom: 24 },
  historyRow: { marginBottom: 12 },
  historyRole: { color: '#8b8b96', fontSize: 12, marginBottom: 4 },
  historyText: { color: '#e7e7e7', lineHeight: 20 },
  footerCard: { backgroundColor: '#0e0e13', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#222' },
  footerText: { color: '#f5f0e8', fontWeight: '700', marginBottom: 6 },
  footerNote: { color: '#888', lineHeight: 20 },
  escalationBanner: { marginHorizontal: 0, marginBottom: 18, padding: 16, borderRadius: 20, backgroundColor: '#2f1a0f', borderColor: '#7c3aed', borderWidth: 1 },
  escalationText: { color: '#f5f0e8', marginBottom: 10, fontSize: 13, lineHeight: 18 },
  escalationButton: { alignSelf: 'flex-start', backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
  escalationButtonText: { color: '#fff', fontWeight: '700' },
});

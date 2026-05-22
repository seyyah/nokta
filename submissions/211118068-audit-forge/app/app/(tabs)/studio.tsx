import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { VoiceVisualizer } from '../../components/VoiceVisualizer';
import { AvatarPresenter } from '../../components/AvatarPresenter';
import { useVoiceMeter } from '../../hooks/useVoiceMeter';
import { buildVoiceAuditMarkdown, saveVoiceReport } from '../../lib/voiceToReport';

export default function StudioScreen() {
  const { levels, isActive, isListening, toggle } = useVoiceMeter();
  const mouthOpen = useMemo(() => levels[levels.length - 1] ?? 0, [levels]);
  const [transcript, setTranscript] = useState('');
  const [screenName, setScreenName] = useState('IdeasScreen');

  const saveReport = async () => {
    if (!transcript.trim()) {
      Alert.alert('Dikte boş', 'Mikrofona konuş veya metni elle yaz.');
      return;
    }
    const md = buildVoiceAuditMarkdown({
      screen: screenName,
      transcript,
    });
    const name = `voice-report-${Date.now()}.md`;
    await saveVoiceReport(name, md);
    Alert.alert(
      'Rapor kaydedildi',
      `${name} uygulama belleğine yazıldı. Agent forge için audit-reports/ klasörüne kopyala.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Studio</Text>
      <Text style={styles.subtitle}>
        Konuş → dalga canlansın → avatar dudak senkronu (&lt;200ms RMS)
      </Text>

      <AvatarPresenter mouthOpen={mouthOpen} />

      <VoiceVisualizer levels={levels} isActive={isActive} />

      <TouchableOpacity
        style={[styles.micBtn, isListening && styles.micBtnActive]}
        onPress={() => void toggle()}
      >
        <Text style={styles.micBtnText}>
          {isListening ? '■ Dinlemeyi durdur' : '🎙 Mikrofonu aç'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Ses → STT → Audit raporu</Text>
      <TextInput
        style={styles.input}
        value={screenName}
        onChangeText={setScreenName}
        placeholder="Ekran adı"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        value={transcript}
        onChangeText={setTranscript}
        placeholder="Dikte metni (konuşurken yaz veya STT sonucu yapıştır)"
        multiline
      />
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => void saveReport()}>
        <Text style={styles.secondaryBtnText}>Markdown rapor kaydet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkBtn}
        onPress={() => router.push('/expert-bridge' as never)}
      >
        <Text style={styles.linkBtnText}>Uzmana Bağlan (WebRTC)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 8 },
  micBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  micBtnActive: { backgroundColor: '#DC2626' },
  micBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  secondaryBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#FFF', fontWeight: '600' },
  linkBtn: { paddingVertical: 10, alignItems: 'center' },
  linkBtnText: { color: '#2563EB', fontWeight: '600' },
});

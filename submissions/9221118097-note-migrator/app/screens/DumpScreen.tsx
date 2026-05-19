import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeNotes, IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dump'>;
};

const PLACEHOLDER = `--- English ---
John: don't forget to bring chapter 3 notes tomorrow
Ali: exam hint: question 4 is definitely about osmosis
Someone: [forwarded] 10 last-minute study tips - re-read, make short notes

--- Malay ---
Kak Mia: jangan lupa bawak notes chapter 3 esok
John: ada resepi kek batik? letak 3 sudu gula perang
Ali: soalan 4 confirm keluar pasal osmosis

--- Türkçe ---
Ayşe: yarın 3. bölüm notlarını unutmayın
Mehmet: osmoz konusu sınava kesin çıkacak
Ali: [iletildi] son dakika çalışma ipuçları`;

export default function DumpScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!text.trim()) {
      Alert.alert('Empty!', 'Paste some messages first.');
      return;
    }
    setLoading(true);
    try {
      const cards: IdeaCard[] = await analyzeNotes(text);
      navigation.navigate('Cards', { cards });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>NoteMigrator</Text>
        <Text style={styles.appVersion}>AI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>📋 Paste Your Chat Dump</Text>
        <Text style={styles.sub}>
          WhatsApp, Telegram, any group chat — paste the chaos below.{'\n'}
          Works in{' '}
          <Text style={styles.langTag}>English</Text>
          {', '}
          <Text style={styles.langTag}>Malay</Text>
          {' & '}
          <Text style={styles.langTag}>Türkçe</Text>
          {' (or mixed).'}
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor="#555"
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>✨ Analyze & Extract Ideas</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingHint}>
            AI is reading your chaos... hang tight 🤖{'\n'}
            <Text style={styles.loadingHintSmall}>
              Yapay zeka mesajlarınızı analiz ediyor • AI sedang menganalisis mesej anda
            </Text>
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
    backgroundColor: '#0f0f14',
  },
  appName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appVersion: {
    color: '#6c47ff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#1e1530',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  inner: { padding: 20, paddingBottom: 40 },
  heading: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  langTag: { color: '#6c47ff', fontWeight: '600' },

  input: {
    backgroundColor: '#1a1a24',
    color: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    minHeight: 260,
    borderWidth: 1,
    borderColor: '#2a2a38',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  btn: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingHint: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    lineHeight: 20,
  },
  loadingHintSmall: { fontSize: 11, color: '#444' },
});

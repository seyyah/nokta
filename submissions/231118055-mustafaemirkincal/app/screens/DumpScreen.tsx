import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeNotes, IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';
import AuditWidget from '../components/AuditWidget';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dump'>;
};

const PLACEHOLDER = `WhatsApp dışa aktarımı ya da kaba notlar yeterli.

1. Öğrenci projeleri için fikir kartları başlat
2. Tekrarlanan kararları tekilleştirmek için daha temiz bir yol lazım
3. Bu sunum güçlü ama kapsamı fazla geniş
4. Cuma gününden önce tasarım ekibiyle takip et
5. Belki mobil uygulama en uygulanabilir maddeleri öne çıkarmalı
6. Karar: ilk sürüm yerel öncelikli kalsın
7. Risk: demo cihazı için kararlı API anahtarı yok
8. Tekrar eden not: öğrenci projeleri için fikir kartları başlat`;

export default function DumpScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  function handleChange(nextText: string) {
    setText(nextText);
    const lines = nextText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
    setLineCount(lines.length);
  }

  function appendExtraNote() {
    const next = extraNote.trim();
    if (!next) {
      Alert.alert('Boş not', 'Önce kısa bir ek not yaz.');
      return;
    }

    const separator = text.trim() ? '\n' : '';
    handleChange(`${text}${separator}${next}`);
    setExtraNote('');
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      Alert.alert('Boş giriş', 'Önce bir not dökümü, sunum veya dağınık metin yapıştır.');
      return;
    }

    setLoading(true);
    try {
      const cards: IdeaCard[] = await analyzeNotes(text);
      navigation.navigate('Cards', { cards });
    } catch (error: any) {
      Alert.alert('Analiz başarısız', error?.message ?? 'Bir şeyler ters gitti.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>NOKTA</Text>
            <Text style={styles.kicker}>Fikir girişi, denetim ve köprü</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{lineCount || '0'} satır</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Dağınık notları fikir kartına çevir.</Text>
          <Text style={styles.heroCopy}>
            WhatsApp dışa aktarımları, madde listeleri veya kaba toplantı notlarını yapıştır.
            NOKTA tekrarları gruplayıp gürültüyü temizler ve en uygulanabilir kartları çıkarır.
          </Text>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Tekilleştirme</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>İzlenebilir</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Yapay zekâya hazır</Text>
            </View>
          </View>
        </View>

        <View style={styles.sampleBox}>
          <Text style={styles.sampleTitle}>Neleri işler</Text>
          <Text style={styles.sampleText}>
            Karmaşık sohbet dökümlerinden veya beyin fırtınası metinlerinden gelen tekrar eden
            fikirleri, karışık dilleri, ekip kararlarını, görevleri ve risk notlarını işler.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor="#7b8095"
          value={text}
          onChangeText={handleChange}
          textAlignVertical="top"
        />

        <View style={styles.extraNoteBox}>
          <Text style={styles.sampleTitle}>Ek not ekle</Text>
          <TextInput
            style={styles.extraInput}
            placeholder="Bir satır daha yaz ve listeye ekle"
            placeholderTextColor="#7b8095"
            value={extraNote}
            onChangeText={setExtraNote}
          />
          <TouchableOpacity style={styles.extraBtn} onPress={appendExtraNote}>
            <Text style={styles.extraBtnText}>Notu ekle</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0b1020" />
          ) : (
            <Text style={styles.buttonText}>Analiz et ve tekilleştir</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Avatar')}>
            <Text style={styles.linkText}>Avatar laboratuvarı</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Bridge')}>
            <Text style={styles.linkText}>Uzman köprüsü</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Yerel yedek akış hazır. APK, `EXPO_PUBLIC_GEMINI_API_KEY` değerini derleme sırasında
          okur; `app/.env.local` dosyasını değiştirirsen yeniden derlemen gerekir.
        </Text>
      </ScrollView>

      <AuditWidget screenName="Fikir girişi" notes={text} cards={[]} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1020',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -100,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    left: -80,
    bottom: -120,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  kicker: {
    color: '#98a2b3',
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: '#dbe4ff',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroCopy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '700',
  },
  sampleBox: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: 16,
    marginBottom: 14,
    gap: 8,
  },
  sampleTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  sampleText: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  input: {
    minHeight: 220,
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: 16,
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  extraNoteBox: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: 16,
    marginBottom: 14,
    gap: 10,
  },
  extraInput: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
  },
  extraBtn: {
    backgroundColor: '#67e8f9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  extraBtnText: {
    color: '#08111f',
    fontWeight: '900',
  },
  button: {
    backgroundColor: '#facc15',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#08111f',
    fontSize: 16,
    fontWeight: '900',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  linkBtn: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  linkText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  footerNote: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
});

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AuditWidget from '../components/AuditWidget';
import AvatarStage from '../src/components/AvatarStage';
import { useVoiceLevel } from '../src/hooks/useVoiceLevel';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Avatar'>;
};

const PERSONA = {
  label: 'Genç-Sen',
  accent: '#67e8f9',
  backdrop: 'rgba(34, 211, 238, 0.10)',
  scale: 1.2,
};

const BARS = [0.42, 0.68, 0.24, 0.74, 0.54, 0.33, 0.62, 0.21];

export default function AvatarScreen({ navigation }: Props) {
  const voice = useVoiceLevel();

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowOne} />
      <View style={styles.bgGlowTwo} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Avatar laboratuvarı</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Yüzün artık uygulamaya bağlı.</Text>
          <Text style={styles.heroCopy}>
            `app/assets/avatar.glb` dosyası burada yüklenir. Mikrofon seviyesi arttıkça ağız ve
            çene hareket eder. Önce bu sade sürümü kullan.
          </Text>
        </View>

        <AvatarStage level={voice.level} persona={PERSONA} />

        <View style={styles.waveCard}>
          <Text style={styles.sectionTitle}>Ses çubukları</Text>
          <View style={styles.bars}>
            {BARS.map((bar, index) => (
              <View
                key={String(index)}
                style={[styles.bar, { height: 24 + bar * 64, opacity: 0.3 + voice.level * 0.7 }]}
              />
            ))}
          </View>
          <Text style={styles.helper}>
            {voice.listening
              ? 'Mikrofon açık. Konuşunca avatar tepki veriyor.'
              : 'Çubukları ve dudak hareketini başlatmak için mikrofonu aç.'}
          </Text>
        </View>

        <View style={styles.steps}>
          <Text style={styles.sectionTitle}>Yapılanlar</Text>
          <Text style={styles.step}>1. GLB dosyan `app/assets/avatar.glb` içine kondu.</Text>
          <Text style={styles.step}>2. Bu ekran modeli yükler ve ağzı hareket ettirir.</Text>
          <Text style={styles.step}>3. Mikrofon seviyesi çubukları ve dudak senkronunu sürer.</Text>
          <Text style={styles.step}>4. İstersen sonra gerçek bir viseme hattı ekleyebilirsin.</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.primaryBtn, voice.listening && styles.secondaryBtn]}
            onPress={voice.listening ? voice.stop : voice.start}
          >
            <Text style={styles.primaryText}>{voice.listening ? 'Mikrofonu kapat' : 'Mikrofonu aç'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Bridge')}
          >
            <Text style={styles.secondaryText}>Köprü</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AuditWidget
        screenName="Avatar Laboratuvarı"
        notes={`Ses seviyesi: ${Math.round(voice.level * 100)}%`}
        cards={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  bgGlowOne: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(34, 211, 238, 0.11)',
  },
  bgGlowTwo: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(250, 204, 21, 0.09)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  backText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroCopy: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  waveCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: 100,
  },
  bar: {
    flex: 1,
    borderRadius: 99,
    backgroundColor: '#67e8f9',
  },
  helper: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  steps: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  step: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#facc15',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#08111f',
    fontWeight: '900',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '900',
  },
});

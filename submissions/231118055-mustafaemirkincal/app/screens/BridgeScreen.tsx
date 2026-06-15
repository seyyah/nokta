import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AuditWidget from '../components/AuditWidget';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Bridge'>;
};

const ROOM_URL = 'https://meet.jit.si/NoktaBridge231118055';

export default function BridgeScreen({ navigation }: Props) {
  async function openRoom() {
    await Linking.openURL(ROOM_URL);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Uzman köprüsü</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Döngü kilitlenince bunu aç.</Text>
          <Text style={styles.heroCopy}>
            Basit tut: kamera, ses ve ekran paylaşımı Jitsi odası üzerinden çalışır. Uygulama
            sorunu çözemediğinde işi bir insana devret.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Oda</Text>
          <Text style={styles.url}>{ROOM_URL}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Demoda ne gösterileceği</Text>
          <Text style={styles.copy}>1. Kilitli durumu göster.</Text>
          <Text style={styles.copy}>2. Köprüyü aç.</Text>
          <Text style={styles.copy}>3. Ekranı paylaş ve uzmandan yardım iste.</Text>
          <Text style={styles.copy}>4. Özeti sonra BRIDGE.md içine yaz.</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={openRoom}>
          <Text style={styles.primaryText}>Jitsi odasına katıl</Text>
        </TouchableOpacity>
      </ScrollView>

      <AuditWidget screenName="Uzman Köprüsü" notes={ROOM_URL} cards={[]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
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
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  label: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  url: {
    color: '#67e8f9',
    lineHeight: 20,
  },
  copy: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#67e8f9',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#07111f',
    fontWeight: '900',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface Idea {
  id: string;
  title: string;
  summary: string;
  tag: string;
  votes: number;
  body: string;
}

const IDEAS: Record<string, Idea> = {
  '1': {
    id: '1',
    title: 'Sessiz Saat Modu',
    summary: 'Belirlenen saatlerde bildirimleri otomatik kapat, odaklanma skorunu goster.',
    tag: 'Uretkenlik',
    votes: 42,
    body: 'Kullanici belirli saat araliklarini odak bloklari olarak isaretler. Bu bloklarda tum bildirimler sistem seviyesinde susturulur. Blok bittiginde ozet: kac bildirim geldi, kacini kacirdin, odaklanma skoru 0-100. Blok gecmisi haftalik grafik olarak gorunur.',
  },
  '2': {
    id: '2',
    title: 'Hafiza Kartlari',
    summary: 'Her fikri spaced-repetition kartina cevir, unutmadan once hatirlat.',
    tag: 'Ogrenme',
    votes: 31,
    body: 'Bir fikri karta cevir butonuna basarsin. Sistem arka yuzunu AI ile doldurur: anahtar soru, baglantili kavramlar, ornek kullanim. SM-2 algoritmasi ile tekrar zamanlanir. Sabah bildirimi: Bugun 3 kart suresi doldu. Kartlar uygulama icinde mini oyunla calisilir.',
  },
  '3': {
    id: '3',
    title: 'Harita Modunda Fikirler',
    summary: 'Fikirleri koordinata bagli goster.',
    tag: 'Kesif',
    votes: 18,
    body: 'Her not kaydedildiginde arka planda GPS koordinati alinir. Harita gorunumune gecince dunya haritasinda pinler gorursun. Pine tikladiginda o lokasyonda dogan fikirler listelenir. Isi haritasi: hangi sehirde daha cok fikrin var? Yolculuk modunda otomatik aktif.',
  },
};

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idea = IDEAS[id ?? ''];
  const [voted, setVoted] = useState(false);

  if (!idea) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Fikir bulunamadi.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Geri don</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{idea.tag}</Text>
        </View>
        <Text style={styles.title}>{idea.title}</Text>
        <Text style={styles.summary}>{idea.summary}</Text>
        <View style={styles.divider} />
        <Text style={styles.bodyLabel}>DETAY</Text>
        <Text style={styles.body}>{idea.body}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.voteBtn, voted && styles.voteBtnActive]}
            onPress={() => setVoted((v) => !v)}
          >
            <Text style={styles.voteBtnText}>
              {voted ? 'Oylanidi' : 'Oy Ver'}
            </Text>
            <Text style={styles.voteCount}>{idea.votes + (voted ? 1 : 0)}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 100 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4a4a8a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: { color: '#a5b4fc', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#e2e8f0', marginBottom: 10 },
  summary: { fontSize: 15, color: '#94a3b8', lineHeight: 22, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#2d2d4e', marginBottom: 20 },
  bodyLabel: { fontSize: 12, color: '#6366f1', fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 15, color: '#cbd5e1', lineHeight: 24 },
  actions: { marginTop: 32 },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4a4a8a',
  },
  voteBtnActive: { borderColor: '#6366f1', backgroundColor: '#1e1e4e' },
  voteBtnText: { fontSize: 15, fontWeight: '700', color: '#a5b4fc' },
  voteCount: { fontSize: 18, fontWeight: '800', color: '#6366f1' },
  errorText: { color: '#f87171', fontSize: 16, textAlign: 'center', marginTop: 40 },
  backLink: { color: '#6366f1', textAlign: 'center', marginTop: 12, fontSize: 15 },
});

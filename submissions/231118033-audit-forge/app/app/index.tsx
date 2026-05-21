/**
 * app/index.tsx — HomeScreen
 * Nokta fikir listesi. 3 mock fikir, detay sayfasına yönlendirme.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';

interface Idea {
  id: string;
  title: string;
  summary: string;
  tag: string;
  votes: number;
}

const IDEAS: Idea[] = [
  {
    id: '1',
    title: 'Sessiz Saat Modu',
    summary: 'Belirlenen saatlerde bildirimleri otomatik kapat, odaklanma skorunu göster.',
    tag: 'Üretkenlik',
    votes: 42,
  },
  {
    id: '2',
    title: 'Hafıza Kartları',
    summary: 'Her fikri spaced-repetition kartına çevir, unutmadan önce hatırlat.',
    tag: 'Öğrenme',
    votes: 31,
  },
  {
    id: '3',
    title: 'Harita Modunda Fikirler',
    summary: 'Fikirleri koordinata bağla; "bu yerde aklıma geldi" mantığıyla görselleştir.',
    tag: 'Keşif',
    votes: 18,
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fikirler</Text>
        <TouchableOpacity
          style={styles.onboardBtn}
          onPress={() => router.push('/onboarding')}
          accessibilityLabel="Onboarding'e git"
        >
          <Text style={styles.onboardBtnText}>?</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={IDEAS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/idea/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.tag}</Text>
              </View>
            </View>
            <Text style={styles.cardSummary}>{item.summary}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.votes}>▲ {item.votes}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4e',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
  onboardBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4a4a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardBtnText: { color: '#e2e8f0', fontWeight: '700', fontSize: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#4a4a8a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#a5b4fc', fontSize: 11, fontWeight: '600' },
  cardSummary: { fontSize: 13, color: '#94a3b8', lineHeight: 19 },
  cardFooter: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' },
  votes: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
});

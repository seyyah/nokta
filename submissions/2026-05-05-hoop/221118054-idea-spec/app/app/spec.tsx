import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
interface Idea { id: string; spark: string; createdAt: string; spec?: Record<string, string>; }
const FIELDS = [
  { key: 'problem', label: '🔴 Problem' },
  { key: 'user', label: '👤 Hedef Kullanıcı' },
  { key: 'scope', label: '🎯 Kapsam' },
  { key: 'constraint', label: '⚠️ Kısıtlar' },
  { key: 'successMetric', label: '📊 Başarı Metriği' },
];
export default function SpecScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('@nokta/ideas').then(raw => {
      if (!raw) return;
      const ideas: Idea[] = JSON.parse(raw);
      setIdea(ideas.find(i => i.id === id) || null);
    });
  }, []);
  if (!idea) return <View style={styles.container}><Text style={{ color: '#888', padding: 20 }}>Yükleniyor...</Text></View>;
  const shareSpec = () => {
    const text = `# ${idea.spark}\n\n` + FIELDS.map(f => `## ${f.label}\n${idea.spec?.[f.key] || '-'}`).join('\n\n');
    Share.share({ message: text });
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.label}>BAŞLANGIÇ FİKRİ</Text>
      <Text style={styles.spark}>"{idea.spark}"</Text>
      <View style={styles.badge}><Text style={styles.badgeText}>📄 PAGE</Text></View>
      {FIELDS.map(f => (
        <View key={f.key} style={styles.card}>
          <Text style={styles.fieldLabel}>{f.label}</Text>
          <Text style={styles.fieldValue}>{idea.spec?.[f.key] || <Text style={{ color: '#444', fontStyle: 'italic' }}>Tanımlanmadı</Text>}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.expertCta}
        onPress={() => router.push(`/expert?ideaId=${idea.id}`)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.expertCtaTitle}>👤 Spec'e Uzman Desteği Al</Text>
          <Text style={styles.expertCtaSub}>UX, PM, domain ve tech uzmanlarından insan görüşü</Text>
        </View>
        <Text style={styles.expertCtaArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.shareBtn} onPress={shareSpec}>
        <Text style={styles.shareBtnText}>↑ Spec'i Paylaş</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  label: { color: '#555', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  spark: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 6, marginBottom: 12 },
  badge: { backgroundColor: '#1a3a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 24 },
  badgeText: { color: '#7ed321', fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: '#141414', borderRadius: 12, padding: 16, marginBottom: 12 },
  fieldLabel: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  fieldValue: { color: '#ddd', fontSize: 15, lineHeight: 22 },
  expertCta: { backgroundColor: '#1a2438', borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#4a90e2' },
  expertCtaTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  expertCtaSub: { color: '#8aa6c8', fontSize: 12, marginTop: 4 },
  expertCtaArrow: { color: '#4a90e2', fontSize: 22, fontWeight: '700' },
  shareBtn: { backgroundColor: '#4a90e2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

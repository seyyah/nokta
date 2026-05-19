import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { generateFinalSpec } from '../services/gemini';
import { Ionicons } from '@expo/vector-icons';

// Basit Markdown → React Native render
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // ## Başlık
    if (line.startsWith('## ')) {
      return (
        <View key={i} style={mdStyles.sectionHeader}>
          <View style={mdStyles.sectionDot} />
          <Text style={mdStyles.h2}>{line.replace('## ', '')}</Text>
        </View>
      );
    }
    // # Ana Başlık
    if (line.startsWith('# ')) {
      return <Text key={i} style={mdStyles.h1}>{line.replace('# ', '')}</Text>;
    }
    // ### Alt başlık
    if (line.startsWith('### ')) {
      return <Text key={i} style={mdStyles.h3}>{line.replace('### ', '')}</Text>;
    }
    // **kalın** içerikleri parse et
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.replace(/^[-*] /, '').replace(/\*\*(.*?)\*\*/g, '$1');
      return (
        <View key={i} style={mdStyles.bulletRow}>
          <Text style={mdStyles.bullet}>▸</Text>
          <Text style={mdStyles.bulletText}>{content}</Text>
        </View>
      );
    }
    // Boş satır
    if (line.trim() === '') {
      return <View key={i} style={{ height: 8 }} />;
    }
    // Normal paragraf (kalınları temizle)
    const clean = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    return <Text key={i} style={mdStyles.body}>{clean}</Text>;
  });
}

export default function ResultScreen() {
  const { idea, answers } = useLocalSearchParams();
  const router = useRouter();

  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const result = await generateFinalSpec(idea as string, JSON.parse(answers as string));
        setSpec(result);
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert('Spec oluşturulurken bir hata oluştu.');
        router.back();
      }
    }
    init();
  }, [idea, answers]);

  const handleShare = async () => {
    try {
      await Share.share({ message: spec, title: 'Nokta Product Spec' });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGlow} />
        <ActivityIndicator size="large" color="#7000FF" />
        <Text style={styles.loadingTitle}>Spec Üretiliyor</Text>
        <Text style={styles.loadingSubtitle}>AI fikrini profesyonel bir dokümana dönüştürüyor...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0A0A0A', '#0D0A1A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.iconBtn}>
          <Ionicons name="close-outline" size={26} color="#AAA" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <View style={styles.titleDot} />
          <Text style={styles.title}>Product Spec</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={26} color="#7000FF" />
        </TouchableOpacity>
      </View>

      {/* İkiz badge */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#00E5A0" />
          <Text style={styles.badgeText}>AI Üretildi</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="document-text-outline" size={14} color="#7000FF" />
          <Text style={styles.badgeText}>MVP Hazır</Text>
        </View>
      </View>

      {/* Spec içeriği */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {renderMarkdown(spec)}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Alt buton */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={() => router.replace('/')}>
          <Ionicons name="add-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.finishButtonText}>Yeni Fikir Başlat</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const mdStyles = StyleSheet.create({
  h1: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 12, marginBottom: 6, letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 6, gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#7000FF' },
  h2: { color: '#A855F7', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  h3: { color: '#CCC', fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  bulletRow: { flexDirection: 'row', gap: 8, marginVertical: 3, paddingLeft: 4 },
  bullet: { color: '#7000FF', fontSize: 14, lineHeight: 22 },
  bulletText: { color: '#DDD', fontSize: 14, lineHeight: 22, flex: 1 },
  body: { color: '#C0C0C0', fontSize: 14, lineHeight: 22, marginVertical: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  loadingGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#7000FF', opacity: 0.08,
  },
  loadingTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 24, marginBottom: 8 },
  loadingSubtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7000FF' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  badgeRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  badgeText: { color: '#CCC', fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(112, 0, 255, 0.2)',
  },
  footer: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  finishButton: {
    backgroundColor: '#7000FF', borderRadius: 16, height: 58,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  finishButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

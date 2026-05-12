import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const RATING_CONFIG = {
  'Mükemmel': { color: '#c5e8c5', icon: 'star' },
  'İyi':       { color: '#abcbdf', icon: 'thumbs-up' },
  'Orta':      { color: '#e8bf94', icon: 'alert-circle' },
  'Zayıf':     { color: '#e88f8f', icon: 'close-circle' },
};

export default function ExpertReview({ navigation, route }) {
  const { review, specialty, selectedIds } = route.params || {};
  const { setApps, updateDraft } = useContext(AppContext);
  const catalogEntry = CATALOG[specialty] || CATALOG.cardiologist;
  const accentColor = catalogEntry.accentColor || '#abcbdf';
  const persona = review?.persona || {};
  const rating = review?.rating || 'İyi';
  const ratingCfg = RATING_CONFIG[rating] || RATING_CONFIG['İyi'];

  const suggestedComponents = (review?.suggestedAdd || [])
    .map((id) => catalogEntry.components.find((c) => c.id === id))
    .filter(Boolean);

  const saveReview = () => {
    const reviewPayload = {
      expertName: persona.name,
      expertTitle: persona.title,
      rating,
      summary: review.summary,
      savedAt: new Date().toISOString(),
    };

    // Her zaman draft'a yaz — LaunchPracticeApp buradan okur
    updateDraft({ expertReview: reviewPayload });

    // Eğer bu app zaten kaydedilmişse (MyAppsLibrary'den gelindiyse) orada da güncelle
    setApps((prev) => {
      const idx = prev.findIndex(
        (a) =>
          a.specialty === specialty &&
          JSON.stringify(a.selectedComponents) === JSON.stringify(selectedIds)
      );
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], expertReview: reviewPayload };
      return updated;
    });

    navigation.navigate('MainTabs', { screen: 'MyApps' });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color="#c2c7cc" />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Uzman başlık */}
        <View style={[styles.expertHeader, { borderColor: ratingCfg.color + '44' }]}>
          <View style={[styles.expertAvatar, { backgroundColor: accentColor + '22' }]}>
            <Ionicons name={catalogEntry.icon} size={24} color={accentColor} />
          </View>
          <View style={styles.expertMeta}>
            <Text style={styles.expertName}>{persona.name}</Text>
            <Text style={styles.expertTitle}>{persona.title}</Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: ratingCfg.color + '22' }]}>
            <Ionicons name={ratingCfg.icon} size={14} color={ratingCfg.color} />
            <Text style={[styles.ratingText, { color: ratingCfg.color }]}>{rating}</Text>
          </View>
        </View>

        {/* Özet */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{review?.summary}</Text>
        </View>

        {/* Güçlü Yönler */}
        {review?.strengths?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>GÜÇLÜ YÖNLER</Text>
            {review.strengths.map((s, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color="#c5e8c5" />
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Eksikler / İyileştirmeler */}
        {review?.gaps?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>GELİŞTİRİLEBİLECEK ALANLAR</Text>
            {review.gaps.map((g, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="alert-circle-outline" size={16} color="#e8bf94" />
                <Text style={styles.bulletText}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Öneri */}
        {review?.recommendation && (
          <View style={[styles.recCard, { borderColor: accentColor + '44' }]}>
            <View style={styles.recHeader}>
              <Ionicons name="bulb-outline" size={16} color={accentColor} />
              <Text style={[styles.recLabel, { color: accentColor }]}>UZMAN ÖNERİSİ</Text>
            </View>
            <Text style={styles.recText}>{review.recommendation}</Text>
          </View>
        )}

        {/* Önerilen Bileşenler */}
        {suggestedComponents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ÖNERİLEN BİLEŞENLER</Text>
            {suggestedComponents.map((c) => (
              <View key={c.id} style={styles.suggestRow}>
                <View style={[styles.suggestIcon, { backgroundColor: accentColor + '22' }]}>
                  <Ionicons name={c.icon} size={16} color={accentColor} />
                </View>
                <View style={styles.suggestInfo}>
                  <Text style={styles.suggestName}>{c.name}</Text>
                  <Text style={styles.suggestSignal}>%{c.peerSignal} meslektaş bunu kullanıyor</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Kaydet */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor }]}
          onPress={saveReview}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark-outline" size={17} color="#121415" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Uzman Rozeti Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backToApp} onPress={() => navigation.navigate('WizardFlow', { screen: 'PrototypeComplete' })}>
          <Text style={styles.backToAppText}>Uygulamaya Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 56 },
  scroll: { padding: 24, paddingBottom: 40 },

  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  backText: { fontSize: 14, color: '#c2c7cc', marginLeft: 4 },

  expertHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e2021', borderRadius: 16,
    padding: 16, borderWidth: 1, marginBottom: 16, gap: 12,
  },
  expertAvatar: {
    width: 46, height: 46, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  expertMeta: { flex: 1 },
  expertName: { fontSize: 15, fontWeight: 'bold', color: '#e3e2e3' },
  expertTitle: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  ratingText: { fontSize: 13, fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#1a1c1e', borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#292a2b',
  },
  summaryText: { fontSize: 14, color: '#c2c7cc', lineHeight: 22 },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10, color: '#6B6B6B', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 10,
  },
  bulletText: { fontSize: 13, color: '#c2c7cc', flex: 1, lineHeight: 20 },

  recCard: {
    backgroundColor: '#1e2021', borderRadius: 14,
    padding: 16, borderWidth: 1, marginBottom: 20,
  },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  recLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  recText: { fontSize: 14, color: '#e3e2e3', lineHeight: 22 },

  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#292a2b', marginBottom: 8,
  },
  suggestIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  suggestInfo: { flex: 1 },
  suggestName: { fontSize: 14, fontWeight: '600', color: '#e3e2e3' },
  suggestSignal: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },

  saveBtn: {
    padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  backToApp: { padding: 14, alignItems: 'center' },
  backToAppText: { fontSize: 14, color: '#6B6B6B' },
});

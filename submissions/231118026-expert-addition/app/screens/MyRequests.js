import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CATALOG } from '../data/catalog';
import { REQUESTS_KEY } from './AskExpert';

const RATING_COLORS = { 'Mükemmel': '#c5e8c5', 'İyi': '#abcbdf', 'Orta': '#e8bf94', 'Zayıf': '#e88f8f' };
const RATING_ICONS  = { 'Mükemmel': 'star', 'İyi': 'thumbs-up', 'Orta': 'alert-circle', 'Zayıf': 'close-circle' };

export default function MyRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(REQUESTS_KEY).then((raw) => {
        setRequests(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  const renderItem = ({ item }) => {
    const catalogEntry = CATALOG[item.specialty];
    const accent = catalogEntry?.accentColor || '#abcbdf';
    const answered = item.status === 'answered';
    const ratingColor = answered ? (RATING_COLORS[item.expertResponse?.rating] || '#abcbdf') : '#e8bf94';

    return (
      <TouchableOpacity
        style={[styles.card, answered && { borderColor: ratingColor + '44' }]}
        onPress={() => answered && setSelected(item)}
        activeOpacity={answered ? 0.85 : 1}
      >
        <View style={styles.cardTop}>
          <View style={[styles.specIcon, { backgroundColor: accent + '22' }]}>
            <Ionicons name={catalogEntry?.icon || 'medkit-outline'} size={15} color={accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardSpec}>{catalogEntry?.label}</Text>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
          {answered ? (
            <View style={[styles.statusPill, { backgroundColor: ratingColor + '22' }]}>
              <Ionicons name={RATING_ICONS[item.expertResponse?.rating] || 'checkmark-circle'} size={12} color={ratingColor} />
              <Text style={[styles.statusPillText, { color: ratingColor }]}>{item.expertResponse?.rating}</Text>
            </View>
          ) : (
            <View style={[styles.statusPill, { backgroundColor: '#e8bf9422' }]}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>Bekliyor</Text>
            </View>
          )}
        </View>

        <Text style={styles.questionText} numberOfLines={2}>"{item.question}"</Text>

        {answered && (
          <View style={styles.previewWrap}>
            <Text style={styles.previewText} numberOfLines={2}>
              {item.expertResponse?.summary}
            </Text>
            <Text style={[styles.tapHint, { color: ratingColor }]}>Detayları gör →</Text>
          </View>
        )}

        {!answered && (
          <View style={styles.waitRow}>
            <Ionicons name="time-outline" size={12} color="#6B6B6B" />
            <Text style={styles.waitText}>Uzman inceliyor, yanıt bekleniyor...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#c2c7cc" />
        </TouchableOpacity>
        <Text style={styles.title}>Taleplerim</Text>
        <View style={{ width: 22 }} />
      </View>

      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#343536" />
          <Text style={styles.emptyTitle}>Henüz talep yok</Text>
          <Text style={styles.emptyText}>
            Uygulamanızı oluşturduktan sonra "Uzmana Sor" ile talep gönderin.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.emptyBtnText}>Uygulamayı Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Yanıt Detay Modalı */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (() => {
          const response = selected.expertResponse;
          const rColor = RATING_COLORS[response?.rating] || '#abcbdf';
          const catalogEntry = CATALOG[selected.specialty];
          return (
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={24} color="#c2c7cc" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Uzman Yanıtı</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Uzman + Rating */}
                <View style={[styles.expertHeader, { borderColor: rColor + '44' }]}>
                  <View style={[styles.expertAvatar, { backgroundColor: catalogEntry?.accentColor + '22' || '#1e2021' }]}>
                    <Ionicons name={catalogEntry?.icon || 'medkit-outline'} size={22} color={catalogEntry?.accentColor || '#abcbdf'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expertName}>{response?.expertName}</Text>
                    <Text style={styles.expertTitle}>{response?.expertTitle}</Text>
                  </View>
                  <View style={[styles.ratingBadge, { backgroundColor: rColor + '22' }]}>
                    <Ionicons name={RATING_ICONS[response?.rating] || 'star'} size={14} color={rColor} />
                    <Text style={[styles.ratingText, { color: rColor }]}>{response?.rating}</Text>
                  </View>
                </View>

                {/* Özet */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>{response?.summary}</Text>
                </View>

                {/* Güçlü Yönler */}
                {response?.strengths?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>GÜÇLÜ YÖNLER</Text>
                    {response.strengths.map((s, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#c5e8c5" />
                        <Text style={styles.bulletText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Eksikler */}
                {response?.gaps?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>GELİŞTİRİLEBİLECEK ALANLAR</Text>
                    {response.gaps.map((g, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Ionicons name="alert-circle-outline" size={15} color="#e8bf94" />
                        <Text style={styles.bulletText}>{g}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Öneri */}
                {response?.recommendation && (
                  <View style={[styles.recCard, { borderColor: rColor + '44' }]}>
                    <View style={styles.recHeader}>
                      <Ionicons name="bulb-outline" size={15} color={rColor} />
                      <Text style={[styles.recLabel, { color: rColor }]}>ANA ÖNERİ</Text>
                    </View>
                    <Text style={styles.recText}>{response.recommendation}</Text>
                  </View>
                )}

                <Text style={styles.answeredAt}>
                  {new Date(response?.answeredAt).toLocaleString('tr-TR')} tarihinde yanıtlandı
                </Text>
              </ScrollView>
            </View>
          );
        })()}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 56 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#e3e2e3' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  emptyTitle: { color: '#c2c7cc', fontWeight: 'bold', fontSize: 17 },
  emptyText: { color: '#6B6B6B', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8, backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#292a2b',
  },
  emptyBtnText: { color: '#abcbdf', fontSize: 14, fontWeight: '600' },

  card: {
    backgroundColor: '#1e2021', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#292a2b',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  specIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardSpec: { fontSize: 13, fontWeight: '600', color: '#c2c7cc' },
  cardDate: { fontSize: 11, color: '#6B6B6B', marginTop: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  pendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e8bf94' },
  pendingText: { fontSize: 11, fontWeight: '700', color: '#e8bf94' },
  questionText: { fontSize: 13, color: '#6B6B6B', fontStyle: 'italic', marginBottom: 10, lineHeight: 19 },
  previewWrap: { borderTopWidth: 1, borderTopColor: '#292a2b', paddingTop: 10, gap: 4 },
  previewText: { fontSize: 12, color: '#c2c7cc', lineHeight: 18 },
  tapHint: { fontSize: 11, fontWeight: '600' },
  waitRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waitText: { fontSize: 11, color: '#6B6B6B' },

  modalContainer: { flex: 1, backgroundColor: '#121415', paddingTop: 56 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3' },
  modalScroll: { padding: 20, paddingBottom: 60 },

  expertHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 16,
  },
  expertAvatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  expertName: { fontSize: 14, fontWeight: 'bold', color: '#e3e2e3' },
  expertTitle: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  ratingText: { fontSize: 13, fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#1a1c1e', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#292a2b', marginBottom: 20,
  },
  summaryText: { fontSize: 14, color: '#c2c7cc', lineHeight: 22 },

  section: { marginBottom: 18 },
  sectionLabel: {
    fontSize: 10, color: '#6B6B6B', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bulletText: { fontSize: 13, color: '#c2c7cc', flex: 1, lineHeight: 19 },

  recCard: {
    backgroundColor: '#1e2021', borderRadius: 12, padding: 14,
    borderWidth: 1, marginBottom: 20,
  },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  recLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  recText: { fontSize: 14, color: '#e3e2e3', lineHeight: 21 },
  answeredAt: { fontSize: 11, color: '#4a4b4d', textAlign: 'center', marginTop: 8 },
});

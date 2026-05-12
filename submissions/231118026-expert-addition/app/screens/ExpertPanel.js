import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, ScrollView, Alert, Modal, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CATALOG } from '../data/catalog';
import { EXPERT_PERSONAS } from '../services/groq';
import { REQUESTS_KEY } from './AskExpert';

const RATING_OPTIONS = ['Mükemmel', 'İyi', 'Orta', 'Zayıf'];
const RATING_COLORS = { 'Mükemmel': '#c5e8c5', 'İyi': '#abcbdf', 'Orta': '#e8bf94', 'Zayıf': '#e88f8f' };

export default function ExpertPanel({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rating, setRating] = useState('İyi');
  const [summary, setSummary] = useState('');
  const [strengths, setStrengths] = useState('');
  const [gaps, setGaps] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = async () => {
    try {
      const raw = await AsyncStorage.getItem(REQUESTS_KEY);
      setRequests(raw ? JSON.parse(raw) : []);
    } catch (_) { }
  };

  const openRequest = (req) => {
    setSelectedReq(req);
    if (req.expertResponse) {
      setRating(req.expertResponse.rating || 'İyi');
      setSummary(req.expertResponse.summary || '');
      setStrengths((req.expertResponse.strengths || []).join('\n'));
      setGaps((req.expertResponse.gaps || []).join('\n'));
      setRecommendation(req.expertResponse.recommendation || '');
    } else {
      setRating('İyi');
      setSummary('');
      setStrengths('');
      setGaps('');
      setRecommendation('');
    }
  };

  const submitResponse = async () => {
    if (!summary.trim()) {
      Alert.alert('Eksik', 'Lütfen en az bir özet yazın.');
      return;
    }
    setSaving(true);
    const persona = EXPERT_PERSONAS[selectedReq.specialty] || EXPERT_PERSONAS.cardiologist;
    const expertResponse = {
      rating,
      summary: summary.trim(),
      strengths: strengths.split('\n').map((s) => s.trim()).filter(Boolean),
      gaps: gaps.split('\n').map((g) => g.trim()).filter(Boolean),
      recommendation: recommendation.trim(),
      expertName: persona.name,
      expertTitle: persona.title,
      answeredAt: new Date().toISOString(),
    };

    try {
      const raw = await AsyncStorage.getItem(REQUESTS_KEY);
      const all = raw ? JSON.parse(raw) : [];
      const updated = all.map((r) =>
        r.id === selectedReq.id ? { ...r, status: 'answered', expertResponse } : r
      );
      await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
      setRequests(updated);
      setSelectedReq(null);
      Alert.alert('Yanıt Gönderildi', 'Klinisyen yanıtınızı görebilir.');
    } catch (_) {
      Alert.alert('Hata', 'Kaydetme sırasında bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const answered = requests.filter((r) => r.status === 'answered');

  const renderItem = ({ item }) => {
    const catalogEntry = CATALOG[item.specialty];
    const accent = catalogEntry?.accentColor || '#abcbdf';
    const isAnswered = item.status === 'answered';
    return (
      <TouchableOpacity
        style={[styles.card, isAnswered && { opacity: 0.7 }]}
        onPress={() => openRequest(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={[styles.specIcon, { backgroundColor: accent + '22' }]}>
            <Ionicons name={catalogEntry?.icon || 'medkit-outline'} size={16} color={accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.clinicianName}</Text>
            <Text style={styles.cardSpec}>{catalogEntry?.label} · {item.selectedComponentIds?.length} bileşen · Skor {item.patternScore}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: isAnswered ? '#c5e8c522' : '#e8bf9422' }]}>
            <Text style={[styles.statusPillText, { color: isAnswered ? '#c5e8c5' : '#e8bf94' }]}>
              {isAnswered ? 'Yanıtlandı' : 'Bekliyor'}
            </Text>
          </View>
        </View>
        <Text style={styles.questionText} numberOfLines={2}>"{item.question}"</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString('tr-TR')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#c2c7cc" />
        </TouchableOpacity>
        <Text style={styles.title}>Uzman Paneli</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pending.length} bekliyor</Text>
        </View>
      </View>

      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="inbox-outline" size={48} color="#343536" />
          <Text style={styles.emptyTitle}>Henüz talep yok</Text>
          <Text style={styles.emptyText}>Klinisyenler talep gönderdiğinde burada görünür.</Text>
        </View>
      ) : (
        <FlatList
          data={[...pending, ...answered]}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Yanıt Modalı */}
      <Modal
        visible={!!selectedReq}
        animationType="slide"
        onRequestClose={() => setSelectedReq(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedReq(null)}>
              <Ionicons name="close" size={24} color="#c2c7cc" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Talebi İncele & Yanıtla</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {/* Talep Detayı */}
            <View style={styles.reqDetail}>
              <Text style={styles.reqLabel}>KLİNİSYEN SORUSU</Text>
              <Text style={styles.reqQuestion}>"{selectedReq?.question}"</Text>
              <Text style={styles.reqMeta}>
                {CATALOG[selectedReq?.specialty]?.label} · {selectedReq?.selectedComponentIds?.length} bileşen · Skor {selectedReq?.patternScore}
              </Text>
              <View style={styles.compRow}>
                {(selectedReq?.selectedComponentIds || []).map((id) => {
                  const comp = CATALOG[selectedReq?.specialty]?.components?.find((c) => c.id === id);
                  return comp ? (
                    <View key={id} style={styles.compChip}>
                      <Text style={styles.compChipText}>{comp.name}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </View>

            {/* Rating */}
            <Text style={styles.fieldLabel}>DEĞERLENDİRME</Text>
            <View style={styles.ratingRow}>
              {RATING_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.ratingBtn,
                    rating === r && { backgroundColor: RATING_COLORS[r] + '33', borderColor: RATING_COLORS[r] },
                  ]}
                  onPress={() => setRating(r)}
                >
                  <Text style={[styles.ratingBtnText, rating === r && { color: RATING_COLORS[r] }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Özet */}
            <Text style={styles.fieldLabel}>ÖZET (zorunlu)</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Konfigürasyonu genel olarak değerlendirin..."
              placeholderTextColor="#4a4b4d"
              multiline
              value={summary}
              onChangeText={setSummary}
            />

            {/* Güçlü yönler */}
            <Text style={styles.fieldLabel}>GÜÇLÜ YÖNLER (her satıra bir madde)</Text>
            <TextInput
              style={[styles.input, { minHeight: 70 }]}
              placeholder="Randevu sistemi iyi yapılandırılmış&#10;Hasta eğitimi dahil edilmiş"
              placeholderTextColor="#4a4b4d"
              multiline
              value={strengths}
              onChangeText={setStrengths}
            />

            {/* Eksikler */}
            <Text style={styles.fieldLabel}>EKSİKLER / İYİLEŞTİRMELER (her satıra bir madde)</Text>
            <TextInput
              style={[styles.input, { minHeight: 70 }]}
              placeholder="İlaç takibi eksik&#10;Takip kontrol listesi eklenmeli"
              placeholderTextColor="#4a4b4d"
              multiline
              value={gaps}
              onChangeText={setGaps}
            />

            {/* Öneri */}
            <Text style={styles.fieldLabel}>ANA ÖNERİ</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="En kritik tek önerinizi yazın..."
              placeholderTextColor="#4a4b4d"
              multiline
              value={recommendation}
              onChangeText={setRecommendation}
            />

            <TouchableOpacity
              style={[styles.submitBtn, saving && { opacity: 0.7 }]}
              onPress={submitResponse}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#121415" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>
                {saving ? 'Kaydediliyor...' : 'Yanıtı Gönder'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 56 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, marginBottom: 8,
  },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#e3e2e3' },
  pendingBadge: {
    backgroundColor: '#e8bf9422', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  pendingBadgeText: { fontSize: 12, color: '#e8bf94', fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { color: '#c2c7cc', fontWeight: 'bold', fontSize: 17 },
  emptyText: { color: '#6B6B6B', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },

  card: {
    backgroundColor: '#1e2021', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#292a2b',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  specIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: 'bold', color: '#e3e2e3' },
  cardSpec: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  questionText: { fontSize: 13, color: '#c2c7cc', fontStyle: 'italic', marginBottom: 8, lineHeight: 19 },
  dateText: { fontSize: 11, color: '#4a4b4d' },

  modalContainer: { flex: 1, backgroundColor: '#121415', paddingTop: 56 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 4,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3' },
  modalScroll: { padding: 20, paddingBottom: 60 },

  reqDetail: {
    backgroundColor: '#1a1c1e', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#292a2b', marginBottom: 24,
  },
  reqLabel: {
    fontSize: 10, color: '#6B6B6B', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  reqQuestion: { fontSize: 14, color: '#c2c7cc', fontStyle: 'italic', marginBottom: 8, lineHeight: 20 },
  reqMeta: { fontSize: 12, color: '#6B6B6B', marginBottom: 8 },
  compRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  compChip: {
    backgroundColor: '#292a2b', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  compChipText: { fontSize: 11, color: '#c2c7cc' },

  fieldLabel: {
    fontSize: 10, color: '#6B6B6B', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1, padding: 10, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#292a2b',
    backgroundColor: '#1e2021',
  },
  ratingBtnText: { fontSize: 12, fontWeight: '600', color: '#6B6B6B' },
  input: {
    backgroundColor: '#1e2021', borderRadius: 12,
    borderWidth: 1, borderColor: '#292a2b',
    padding: 14, color: '#e3e2e3', fontSize: 13,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#c5e8c5', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: { color: '#121415', fontSize: 16, fontWeight: 'bold' },
});

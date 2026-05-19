import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  submitToExpert,
  listenToRequest,
  listenToAllRequests,
  markAsReviewing,
  sendExpertResponse,
} from '../services/expertService';

const STATUS_CONFIG = {
  pending:   { label: 'Kuyrukta',    color: '#F59E0B', icon: '⏳', bg: '#F59E0B22' },
  reviewing: { label: 'İnceleniyor', color: '#3B82F6', icon: '🔍', bg: '#3B82F622' },
  done:      { label: 'Tamamlandı',  color: '#10B981', icon: '✅', bg: '#10B98122' },
};

// ── UZMAN MODU ────────────────────────────────────────────────────────────────
function ExpertMode({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = listenToAllRequests(setRequests);
    return () => unsub();
  }, []);

  const handleSelect = async (item) => {
    setSelected(item);
    setResponse('');
    if (item.status === 'pending') {
      await markAsReviewing(item.id, 'Uzman');
    }
  };

  const handleSend = async () => {
    if (!response.trim() || !selected) return;
    setSending(true);
    await sendExpertResponse(selected.id, 'Uzman', response.trim());
    setSending(false);
    setSelected(null);
    setResponse('');
    Alert.alert('✅ Gönderildi', 'Yanıtın öğrenciye ulaştı!');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Talep detay ekranı
  if (selected) {
    return (
      <LinearGradient colors={['#080814', '#0d0d1a']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
                <Text style={styles.backIcon}>← Geri</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Talebi İncele</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
              <View style={styles.requestCard}>
                <Text style={styles.reqIdea}>💡 {selected.idea}</Text>
                {selected.spec?.title && (
                  <Text style={styles.reqTitle}>{selected.spec.title}</Text>
                )}
                {selected.spec?.problem && (
                  <Text style={styles.reqMeta}>Problem: {selected.spec.problem}</Text>
                )}
                {selected.spec?.user && (
                  <Text style={styles.reqMeta}>Kullanıcı: {selected.spec.user}</Text>
                )}
                {selected.score?.total != null && (
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillText}>
                      Nokta Skoru: {selected.score.total}/100
                    </Text>
                  </View>
                )}
              </View>

              {selected.status === 'done' ? (
                <View style={styles.doneBox}>
                  <Text style={styles.doneLabel}>✅ Yanıtın Gönderildi</Text>
                  <Text style={styles.doneText}>{selected.expertResponse}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.replyLabel}>Uzman olarak yanıtını yaz:</Text>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Samimi, yapıcı ve kişisel bir yorum yaz..."
                    placeholderTextColor="#555"
                    multiline
                    value={response}
                    onChangeText={setResponse}
                    autoFocus
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, (!response.trim() || sending) && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!response.trim() || sending}
                  >
                    {sending
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.sendBtnText}>Yanıtı Gönder 🚀</Text>
                    }
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Talep listesi
  return (
    <LinearGradient colors={['#080814', '#0d0d1a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>🔬 Uzman Paneli</Text>
            <Text style={styles.subtitle}>{requests.length} talep</Text>
          </View>
          <View style={styles.expertBadge}>
            <Text style={styles.expertBadgeText}>UZMAN</Text>
          </View>
        </View>

        {requests.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Henüz talep yok</Text>
            <Text style={styles.emptySub}>Öğrenci fikir gönderince burada görünür</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              return (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.listCardInner}>
                    <View style={styles.listCardTop}>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={styles.statusIcon}>{cfg.icon}</Text>
                        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Text style={styles.listTime}>{formatTime(item.submittedAt)}</Text>
                    </View>
                    <Text style={styles.listIdea} numberOfLines={2}>💡 {item.idea}</Text>
                    {item.spec?.title && (
                      <Text style={styles.listSpecTitle} numberOfLines={1}>{item.spec.title}</Text>
                    )}
                    {item.status !== 'done' && (
                      <Text style={styles.tapHint}>Yanıtlamak için dokun →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── ÖĞRENCİ MODU ─────────────────────────────────────────────────────────────
function StudentMode({ navigation, route }) {
  const { idea, spec, score } = route.params || {};
  const [requestId, setRequestId] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  // Spec varsa ekran açılınca otomatik gönder
  useEffect(() => {
    if (spec && !autoSubmitted) {
      setAutoSubmitted(true);
      handleSubmit();
    }
  }, [spec]);

  const handleSubmit = async () => {
    if (!spec) return;
    setSubmitting(true);
    try {
      const ref = await submitToExpert(idea, spec, score);
      const id = ref.key;
      setRequestId(id);
      unsubRef.current = listenToRequest(id, (data) => setRequestData(data));
    } catch (e) {
      console.warn('Firebase submit error:', e);
      Alert.alert(
        'Bağlantı Hatası',
        'Firebase\'e bağlanılamadı. Lütfen internet bağlantını kontrol et.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = requestData ? (STATUS_CONFIG[requestData.status] || STATUS_CONFIG.pending) : null;

  return (
    <LinearGradient colors={['#080814', '#0d0d1a', '#080814']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Uzman Desteği</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Hero */}
          <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.heroCard}>
            <Text style={styles.heroIcon}>🧑‍🔬</Text>
            <Text style={styles.heroTitle}>Gerçek İnsan Uzman</Text>
            <Text style={styles.heroDesc}>
              Spec'in uzman telefona gönderildi. Uzman yanıt yazdığında burada anlık göreceksin.
            </Text>
            {spec && (
              <View style={styles.specPreview}>
                <Text style={styles.specPreviewLabel}>Gönderilen Spec:</Text>
                <Text style={styles.specPreviewTitle}>{spec.title}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Gönderme durumu */}
          {submitting && (
            <View style={styles.submittingCard}>
              <ActivityIndicator color="#7C6FFF" />
              <Text style={styles.submittingText}>Uzman kuyruğuna gönderiliyor...</Text>
            </View>
          )}

          {/* Spec yoksa uyar */}
          {!spec && !submitting && (
            <View style={styles.noSpecCard}>
              <Text style={styles.noSpecText}>
                Uzman görüşü için önce bir fikir analizi tamamla.
              </Text>
            </View>
          )}

          {/* Durum Takibi */}
          {requestId && cfg && (
            <View style={[styles.statusCard, { borderColor: cfg.color + '44' }]}>
              <View style={styles.statusCardTop}>
                <Text style={styles.statusCardIcon}>{cfg.icon}</Text>
                <Text style={[styles.statusCardLabel, { color: cfg.color }]}>{cfg.label}</Text>
                {requestData.status !== 'done' && (
                  <ActivityIndicator size="small" color={cfg.color} style={{ marginLeft: 8 }} />
                )}
              </View>

              {requestData.status === 'pending' && (
                <Text style={styles.statusCardDesc}>
                  Uzman talebini gördü, incelemeye alıyor...
                </Text>
              )}
              {requestData.status === 'reviewing' && (
                <Text style={styles.statusCardDesc}>
                  {requestData.expertName || 'Uzman'} şu an inceliyor ve yanıt yazıyor...
                </Text>
              )}
              {requestData.status === 'done' && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackFrom}>
                    💬 {requestData.expertName || 'Uzman'} yanıtladı:
                  </Text>
                  <Text style={styles.feedbackText}>{requestData.expertResponse}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── ANA EKRAN ─────────────────────────────────────────────────────────────────
export default function ExpertScreen({ navigation, route }) {
  // Hooks her zaman en üstte — conditional return'den önce
  const [mode, setMode] = useState(null);
  const hasSpec = !!(route.params?.spec);

  // Spec varsa (SpecScreen'den geliyoruz) → direkt Öğrenci modu
  if (hasSpec) {
    return <StudentMode navigation={navigation} route={route} />;
  }

  if (mode === 'expert') return <ExpertMode navigation={navigation} />;
  if (mode === 'student') return <StudentMode navigation={navigation} route={route} />;

  return (
    <LinearGradient colors={['#080814', '#0d0d1a', '#080814']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Uzman Desteği</Text>
        </View>

        <View style={styles.modePicker}>
          <Text style={styles.modeTitle}>Bu telefon kim?</Text>
          <Text style={styles.modeSub}>İki farklı modda çalışır</Text>

          <TouchableOpacity style={styles.modeCard} onPress={() => setMode('student')}>
            <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.modeCardInner}>
              <Text style={styles.modeCardIcon}>🎓</Text>
              <Text style={styles.modeCardTitle}>Öğrenci / Girişimci</Text>
              <Text style={styles.modeCardDesc}>Fikrini uzman görüşüne gönder, yanıtı bekle</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeCard} onPress={() => setMode('expert')}>
            <LinearGradient colors={['#064e3b', '#065f46']} style={styles.modeCardInner}>
              <Text style={styles.modeCardIcon}>🔬</Text>
              <Text style={styles.modeCardTitle}>Uzman Paneli</Text>
              <Text style={styles.modeCardDesc}>Gelen talepleri gör, gerçek yanıt yaz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 18, color: '#7C6FFF' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 12, color: '#888' },
  expertBadge: { backgroundColor: '#10B98133', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#10B98155' },
  expertBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  heroCard: { borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#7C6FFF44' },
  heroIcon: { fontSize: 40, marginBottom: 10 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroDesc: { fontSize: 13, color: '#c4b5fd', textAlign: 'center', lineHeight: 19 },
  specPreview: { marginTop: 14, backgroundColor: '#ffffff15', borderRadius: 10, padding: 12, width: '100%' },
  specPreviewLabel: { fontSize: 11, color: '#a5b4fc', marginBottom: 3 },
  specPreviewTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  submittingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#7C6FFF22', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#7C6FFF44' },
  submittingText: { color: '#c4b5fd', fontSize: 14 },
  noSpecCard: { backgroundColor: '#ffffff08', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#ffffff15' },
  noSpecText: { color: '#888', textAlign: 'center', lineHeight: 20 },
  statusCard: { borderRadius: 16, padding: 16, backgroundColor: '#1a1a2e', borderWidth: 1, gap: 10 },
  statusCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusCardIcon: { fontSize: 20 },
  statusCardLabel: { fontSize: 15, fontWeight: '700' },
  statusCardDesc: { color: '#aaa', fontSize: 13, lineHeight: 19 },
  feedbackBox: { backgroundColor: '#10B98115', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#10B98133', gap: 8 },
  feedbackFrom: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  feedbackText: { fontSize: 14, color: '#d1fae5', lineHeight: 21 },
  modePicker: { flex: 1, paddingHorizontal: 20, paddingBottom: 40, justifyContent: 'center', gap: 20 },
  modeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  modeSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 8 },
  modeCard: { borderRadius: 20, overflow: 'hidden' },
  modeCardInner: { padding: 24, alignItems: 'center', gap: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ffffff15' },
  modeCardIcon: { fontSize: 40 },
  modeCardTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modeCardDesc: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  emptySub: { fontSize: 13, color: '#666' },
  list: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },
  listCardInner: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ffffff10', gap: 8 },
  listCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusIcon: { fontSize: 12 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  listTime: { color: '#555', fontSize: 11 },
  listIdea: { fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  listSpecTitle: { fontSize: 13, color: '#888' },
  tapHint: { fontSize: 11, color: '#7C6FFF', textAlign: 'right' },
  requestCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: '#ffffff15' },
  reqIdea: { fontSize: 15, color: '#e2e8f0', fontWeight: '600' },
  reqTitle: { fontSize: 14, color: '#7C6FFF', fontWeight: '700' },
  reqMeta: { fontSize: 12, color: '#888', lineHeight: 17 },
  scorePill: { backgroundColor: '#7C6FFF22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 4 },
  scorePillText: { color: '#c4b5fd', fontWeight: '700', fontSize: 12 },
  replyLabel: { fontSize: 14, color: '#aaa', fontWeight: '600' },
  replyInput: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, color: '#fff', fontSize: 15, lineHeight: 23, borderWidth: 1, borderColor: '#ffffff15', minHeight: 160 },
  sendBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  doneBox: { backgroundColor: '#10B98115', borderRadius: 14, padding: 16, gap: 8, borderWidth: 1, borderColor: '#10B98133' },
  doneLabel: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  doneText: { fontSize: 14, color: '#d1fae5', lineHeight: 21 },
});

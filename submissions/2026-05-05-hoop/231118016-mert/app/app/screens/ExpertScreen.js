import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';

// ─── HITL Modu Sabitleri ─────────────────────────────────────────────────────
// nokta-hoop mimarisinden ilham alınmıştır:
//   HOOTL → tam otonom (AI yeterli)
//   HOTL  → uzman izliyor, gerekirse müdahale eder
//   HITL  → uzman onayı zorunlu, onay olmadan devam edilemez
const LOOP_MODE = {
  HOOTL: 'HOOTL',
  HOTL: 'HOTL',
  HITL: 'HITL',
};

// Risk seviyesine göre döngü modu belirleme
function determineLoopMode(score) {
  if (score >= 75) return LOOP_MODE.HOOTL; // Düşük risk → tam otonom
  if (score >= 50) return LOOP_MODE.HOTL;  // Orta risk  → uzman izler
  return LOOP_MODE.HITL;                    // Yüksek risk → uzman onayı zorunlu
}

// Mock uzman havuzu — gerçek sistemde Slack/WhatsApp/Email adapter'ı çalışır
const MOCK_EXPERTS = [
  { name: 'Dr. Ayşe Kaya', title: 'Kıdemli Ürün Danışmanı', avatar: '👩‍💼' },
  { name: 'Murat Demir', title: 'Startup Mentor & Angel Yatırımcı', avatar: '👨‍💻' },
  { name: 'Prof. Zeynep Arslan', title: 'Girişimcilik Araştırmacısı', avatar: '👩‍🏫' },
];

// Mock uzman geri bildirimleri — gerçek sistemde uzman yazıyor
const MOCK_FEEDBACKS = [
  (idea) => `"${idea.slice(0, 40)}..." fikri pazar potansiyeli açısından ilgi çekici. Ancak MVP kapsamını daha da daraltmanızı öneririm — sadece bir çekirdek özellikle başlayın. Kısıtlar bölümünde rakip analizi eksik, bunu ekleyin.`,
  (idea) => `Teknik fizibilite açısından sağlam görünüyor. Kullanıcı segmentini daha net tanımlamanız gerekiyor: B2B mi, B2C mi? Bu ayrım monetizasyon modelini doğrudan etkiliyor. Doğrulama hipotezi gerçekçi ve beğendim.`,
  (idea) => `Özgün bir bakış açısı. Pazar boyutu iddialarını üçüncü taraf verisiyle desteklemenizi öneririm. Teknik kısıtlar arasına GDPR/KVKK uyumluluğunu da eklemeyi unutmayın.`,
];

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
const ExpertScreen = ({ route, navigation }) => {
  const { idea, score, specSections } = route.params || {};

  const loopMode = determineLoopMode(score || 0);
  const expert = MOCK_EXPERTS[Math.floor(Math.random() * MOCK_EXPERTS.length)];
  const feedbackFn = MOCK_FEEDBACKS[Math.floor(Math.random() * MOCK_FEEDBACKS.length)];

  // Durum: 'idle' | 'escalating' | 'waiting' | 'feedback_received' | 'approved' | 'rejected'
  const [status, setStatus] = useState('idle');
  const [expertFeedback, setExpertFeedback] = useState('');
  const [userNote, setUserNote] = useState('');
  const [escalationId, setEscalationId] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Uzman bekleme animasyonu
  useEffect(() => {
    if (status === 'waiting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [status]);

  // Geri bildirim geldiğinde fade-in
  useEffect(() => {
    if (status === 'feedback_received') {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [status]);

  // ─── HITL Eskalasyon Tetikleyici ─────────────────────────────────────────
  // Gerçek sistemde: nokta-hoop trigger --input idea.json --adapter slack --risk high
  const handleEscalate = () => {
    const id = `ESC-${Date.now().toString(36).toUpperCase()}`;
    setEscalationId(id);
    setStatus('escalating');

    // MCP adapter simülasyonu: bildirim gönderiliyor
    setTimeout(() => {
      setStatus('waiting');

      // Uzman cevap süresi simülasyonu (gerçekte Slack/WhatsApp mesajı bekler)
      const waitTime = loopMode === LOOP_MODE.HITL ? 4000 : 2500;
      setTimeout(() => {
        setExpertFeedback(feedbackFn(idea || ''));
        setStatus('feedback_received');
      }, waitTime);
    }, 1200);
  };

  const handleApprove = () => setStatus('approved');
  const handleReject = () => setStatus('rejected');

  // ─── Render Yardımcıları ──────────────────────────────────────────────────
  const renderLoopBadge = () => {
    const colors = {
      [LOOP_MODE.HOOTL]: { bg: '#e8f5e9', text: '#2e7d32', label: '🤖 HOOTL — Tam Otonom' },
      [LOOP_MODE.HOTL]:  { bg: '#fff3e0', text: '#e65100', label: '👁 HOTL — Uzman İzliyor' },
      [LOOP_MODE.HITL]:  { bg: '#fce4ec', text: '#b71c1c', label: '🔐 HITL — Onay Zorunlu' },
    };
    const c = colors[loopMode];
    return (
      <View style={[styles.loopBadge, { backgroundColor: c.bg }]}>
        <Text style={[styles.loopBadgeText, { color: c.text }]}>{c.label}</Text>
      </View>
    );
  };

  // ─── Durum: Bekleme (escalating) ─────────────────────────────────────────
  if (status === 'escalating') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f3460" />
        <Text style={styles.statusTitle}>Uzman Bildirim Gönderiliyor...</Text>
        <Text style={styles.statusSub}>ID: {escalationId}</Text>
        <Text style={styles.statusSub}>Kanal: MCP → Slack Adapter</Text>
      </View>
    );
  }

  // ─── Durum: Uzman Yanıtı Bekleniyor ─────────────────────────────────────
  if (status === 'waiting') {
    return (
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.expertAvatarLarge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.expertAvatarEmoji}>{expert.avatar}</Text>
        </Animated.View>
        <Text style={styles.statusTitle}>{expert.name} Yanıtlıyor...</Text>
        <Text style={styles.statusSub}>{expert.title}</Text>
        <View style={styles.waitingBadge}>
          <Text style={styles.waitingBadgeText}>⏳ Uzman inceliyor — {loopMode} modu aktif</Text>
        </View>
        {loopMode === LOOP_MODE.HITL && (
          <Text style={styles.hitlNote}>
            Bu fikir yüksek riskli olarak işaretlendi.{'\n'}Uzman onayı olmadan spec kesinleşmez.
          </Text>
        )}
      </View>
    );
  }

  // ─── Durum: Onaylandı ────────────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.bigEmoji}>✅</Text>
        <Text style={styles.statusTitle}>Spec Onaylandı!</Text>
        <Text style={styles.statusSub}>
          {expert.name} tarafından onaylandı.{'\n'}
          Fikrin artık "uzman doğrulamalı" statüsünde.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryBtnText}>Yeni Fikir Gir →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Durum: Reddedildi ───────────────────────────────────────────────────
  if (status === 'rejected') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.bigEmoji}>🔁</Text>
        <Text style={styles.statusTitle}>Revizyon Gerekli</Text>
        <Text style={styles.statusSub}>
          {expert.name}'in geri bildirimi doğrultusunda{'\n'}
          fikrini güncelleyip tekrar gönder.
        </Text>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.outlineBtnText}>← Fikre Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Ana Ekran ───────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Uzman İncelemesi</Text>
        <Text style={styles.headerSub}>Human-in-the-Loop (nokta-hoop)</Text>
      </View>

      {/* Döngü Modu Badge */}
      {renderLoopBadge()}

      {/* Eskalasyon Bilgisi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Eskalasyon Detayları</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Risk Seviyesi</Text>
          <Text style={styles.infoValue}>
            {score >= 75 ? '🟢 Düşük' : score >= 50 ? '🟡 Orta' : '🔴 Yüksek'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Readiness Skoru</Text>
          <Text style={styles.infoValue}>{score}/100</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Döngü Modu</Text>
          <Text style={styles.infoValue}>{loopMode}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Adapter</Text>
          <Text style={styles.infoValue}>MCP → Slack</Text>
        </View>
      </View>

      {/* Uzman Profili */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Atanan Uzman</Text>
        <View style={styles.expertRow}>
          <Text style={styles.expertEmoji}>{expert.avatar}</Text>
          <View>
            <Text style={styles.expertName}>{expert.name}</Text>
            <Text style={styles.expertTitle2}>{expert.title}</Text>
          </View>
        </View>
      </View>

      {/* Geri Bildirim (feedback gelince görünür) */}
      {status === 'feedback_received' && (
        <Animated.View style={[styles.feedbackCard, { opacity: fadeAnim }]}>
          <Text style={styles.feedbackTitle}>💬 Uzman Geri Bildirimi</Text>
          <Text style={styles.feedbackText}>{expertFeedback}</Text>

          {/* Kullanıcı notu (isteğe bağlı) */}
          <Text style={styles.noteLabel}>Notunuz (isteğe bağlı):</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Uzmanın yorumuna cevabınızı yazın..."
            placeholderTextColor="#aaa"
            value={userNote}
            onChangeText={setUserNote}
            multiline
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
              <Text style={styles.approveBtnText}>✓ Onayla & Yayınla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <Text style={styles.rejectBtnText}>↩ Revize Et</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Gönder Butonu */}
      {status === 'idle' && (
        <View style={styles.cta}>
          <Text style={styles.ctaDesc}>
            Spec'ini kıdemli bir danışmana gönder.{' '}
            {loopMode === LOOP_MODE.HITL
              ? 'Onay zorunlu (HITL) — uzman yanıtlayana kadar devam edilemez.'
              : loopMode === LOOP_MODE.HOTL
              ? 'Uzman süreci izleyecek (HOTL) — gerekirse müdahale eder.'
              : 'Otonom mod (HOOTL) — uzman bilgilendirilir ama onayı beklenmez.'}
          </Text>
          <TouchableOpacity style={styles.escalateBtn} onPress={handleEscalate}>
            <Text style={styles.escalateBtnText}>Uzmana Gönder 👨‍⚖️</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ─── Stiller ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scroll: { padding: 20, gap: 16 },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 14,
  },
  header: { alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e' },
  headerSub: {
    fontSize: 13,
    color: '#0f3460',
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 6,
    fontWeight: '600',
  },
  loopBadge: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  loopBadgeText: { fontSize: 14, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, color: '#777' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  expertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expertEmoji: { fontSize: 36 },
  expertName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  expertTitle2: { fontSize: 12, color: '#888', marginTop: 2 },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackTitle: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
  feedbackText: { fontSize: 14, color: '#333', lineHeight: 22 },
  noteLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  approveBtn: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#fce4ec',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  rejectBtnText: { color: '#c62828', fontWeight: '700', fontSize: 14 },
  cta: { gap: 10 },
  ctaDesc: { fontSize: 13, color: '#666', lineHeight: 20, textAlign: 'center' },
  escalateBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  escalateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' },
  statusSub: { fontSize: 13, color: '#777', textAlign: 'center' },
  expertAvatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertAvatarEmoji: { fontSize: 48 },
  waitingBadge: {
    backgroundColor: '#fff3e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  waitingBadgeText: { fontSize: 13, color: '#e65100', fontWeight: '600' },
  hitlNote: {
    fontSize: 13,
    color: '#b71c1c',
    textAlign: 'center',
    lineHeight: 20,
    backgroundColor: '#fce4ec',
    padding: 12,
    borderRadius: 10,
  },
  bigEmoji: { fontSize: 64 },
  primaryBtn: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#0f3460',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  outlineBtnText: { color: '#0f3460', fontWeight: '700', fontSize: 15 },
});

export default ExpertScreen;

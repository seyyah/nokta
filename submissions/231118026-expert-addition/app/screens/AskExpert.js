import React, { useContext, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import { EXPERT_PERSONAS } from '../services/groq';

export const REQUESTS_KEY = '@nonslop_expert_requests';
const EXPERT_EMAIL = 'uzman@example.com';

const PRESET_QUESTIONS = [
  { id: 'optimal', label: 'Bileşen seçimlerim optimal mi?' },
  { id: 'missing', label: 'Eksik olan önemli bir şey var mı?' },
  { id: 'hipaa', label: 'Bu yapılandırma güvenli mi?' },
  { id: 'score', label: 'Desen puanımı nasıl artırırım?' },
];

export default function AskExpert({ navigation }) {
  const { currentDraft, authUser } = useContext(AppContext);
  const specialty = currentDraft?.specialty || 'cardiologist';
  const selectedIds = currentDraft?.selectedComponents || [];
  const catalogEntry = CATALOG[specialty] || CATALOG.cardiologist;
  const persona = EXPERT_PERSONAS[specialty] || EXPERT_PERSONAS.cardiologist;
  const patternScore = currentDraft?._patternScore ?? 0;

  const [selectedPreset, setSelectedPreset] = useState(PRESET_QUESTIONS[0].id);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedComponents = catalogEntry.components.filter((c) => selectedIds.includes(c.id));
  const accentColor = catalogEntry.accentColor || '#abcbdf';

  const handleSend = async () => {
    setLoading(true);
    const presetLabel = PRESET_QUESTIONS.find((q) => q.id === selectedPreset)?.label || '';
    const question = customNote.trim() ? `${presetLabel} — ${customNote.trim()}` : presetLabel;

    const request = {
      id: `req_${Date.now()}`,
      clinicianName: authUser?.name || 'Klinisyen',
      clinicianEmail: authUser?.email || '',
      appName: currentDraft?.appName || catalogEntry.label,
      specialty,
      selectedComponentIds: selectedIds,
      patternScore,
      question,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expertResponse: null,
    };

    try {
      const raw = await AsyncStorage.getItem(REQUESTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify([request, ...existing]));

      // Email compose
      const subject = encodeURIComponent(
        `[NonSlop] Uzman Değerlendirme Talebi — ${catalogEntry.label}`
      );
      const compList = selectedComponents.map((c) => `  • ${c.name} (%${c.peerSignal})`).join('\n');
      const body = encodeURIComponent(
        `Merhaba ${persona.name},\n\n` +
        `${request.clinicianName} adlı klinisyen aşağıdaki yapılandırma için görüşünüzü talep ediyor.\n\n` +
        `UZMANLIK: ${catalogEntry.label}\n` +
        `DESEN PUANI: ${patternScore}/100\n` +
        `SEÇİLEN BİLEŞENLER (${selectedComponents.length} adet):\n${compList}\n\n` +
        `SORU: ${question}\n\n` +
        `Talep ID: ${request.id}\n` +
        `Tarih: ${new Date().toLocaleString('tr-TR')}\n\n` +
        `Yanıtlamak için NonSlop uygulamasında Uzman Paneli'ni (logoya 5 kez dokunun) açabilirsiniz.\n\n` +
        `— NonSlop`
      );
      await Linking.openURL(`mailto:${EXPERT_EMAIL}?subject=${subject}&body=${body}`);
    } catch (_) {
      // Email açılamazsa yine de devam et
    } finally {
      setLoading(false);
      navigation.replace('RequestSent', { requestId: request.id, persona });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color="#c2c7cc" />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Uzmana Sor</Text>
        <Text style={styles.sub}>
          Talebiniz alanınızdaki doğrulanmış bir uzman tarafından incelenecek ve yanıtlanacak.
        </Text>

        {/* Uzman Kartı */}
        <View style={[styles.expertCard, { borderColor: accentColor + '44' }]}>
          <View style={[styles.expertAvatar, { backgroundColor: accentColor + '22' }]}>
            <Ionicons name={catalogEntry.icon} size={26} color={accentColor} />
          </View>
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{persona.name}</Text>
            <Text style={styles.expertTitle}>{persona.title}</Text>
            <Text style={styles.expertMeta}>{persona.experience} · {persona.hospital}</Text>
          </View>
          <View style={[styles.verifiedBadge, { backgroundColor: accentColor + '22' }]}>
            <Ionicons name="shield-checkmark" size={12} color={accentColor} />
            <Text style={[styles.verifiedText, { color: accentColor }]}>HITL</Text>
          </View>
        </View>

        {/* Nasıl Çalışır */}
        <View style={styles.howItWorks}>
          {[
            { icon: 'send-outline', text: 'Sorunuzu iletiyorsunuz' },
            { icon: 'person-outline', text: 'Uzman konfigürasyonunuzu inceliyor' },
            { icon: 'chatbubble-ellipses-outline', text: 'Kişisel yanıt alıyorsunuz' },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepIcon, { backgroundColor: accentColor + '22' }]}>
                <Ionicons name={step.icon} size={14} color={accentColor} />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Konfigürasyon Özeti */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEVCUT KONFİGÜRASYONUNUZ</Text>
          <View style={styles.configSummary}>
            <View style={styles.configStat}>
              <Text style={[styles.configStatNum, { color: accentColor }]}>{selectedIds.length}</Text>
              <Text style={styles.configStatLabel}>Bileşen</Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configStat}>
              <Text style={[styles.configStatNum, { color: accentColor }]}>{patternScore}</Text>
              <Text style={styles.configStatLabel}>Desen Puanı</Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configStat}>
              <Text style={[styles.configStatNum, { color: accentColor }]}>
                {catalogEntry.label?.split(' ')[0]}
              </Text>
              <Text style={styles.configStatLabel}>Uzmanlık</Text>
            </View>
          </View>
          <View style={styles.compList}>
            {selectedComponents.slice(0, 5).map((c) => (
              <View key={c.id} style={styles.compChip}>
                <Ionicons name={c.icon} size={11} color={accentColor} />
                <Text style={styles.compChipText} numberOfLines={1}>{c.name}</Text>
              </View>
            ))}
            {selectedComponents.length > 5 && (
              <View style={styles.compChip}>
                <Text style={styles.compChipText}>+{selectedComponents.length - 5}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Soru Seç */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SORUNUZU SEÇİN</Text>
          {PRESET_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.presetBtn,
                selectedPreset === q.id && { borderColor: accentColor, backgroundColor: accentColor + '11' },
              ]}
              onPress={() => setSelectedPreset(q.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selectedPreset === q.id && { borderColor: accentColor }]}>
                {selectedPreset === q.id && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
              </View>
              <Text style={[styles.presetText, selectedPreset === q.id && { color: '#e3e2e3' }]}>
                {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ek Not */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EK NOT (opsiyonel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Özel bir bağlam veya endişeniz varsa ekleyin..."
            placeholderTextColor="#4a4b4d"
            multiline
            numberOfLines={3}
            value={customNote}
            onChangeText={setCustomNote}
          />
        </View>

        {/* Gönder */}
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: accentColor }, loading && { opacity: 0.7 }]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#121415" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#121415" style={{ marginRight: 8 }} />
              <Text style={styles.sendBtnText}>Uzman Talebi Gönder</Text>
            </>
          )}
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

  heading: { fontSize: 26, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6B6B6B', marginBottom: 24, lineHeight: 20 },

  expertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e2021', borderRadius: 16,
    padding: 16, borderWidth: 1, marginBottom: 16, gap: 12,
  },
  expertAvatar: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  expertInfo: { flex: 1 },
  expertName: { fontSize: 15, fontWeight: 'bold', color: '#e3e2e3' },
  expertTitle: { fontSize: 12, color: '#c2c7cc', marginTop: 2 },
  expertMeta: { fontSize: 11, color: '#6B6B6B', marginTop: 3 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedText: { fontSize: 10, fontWeight: '700' },

  howItWorks: {
    backgroundColor: '#1a1c1e', borderRadius: 14,
    padding: 14, marginBottom: 24, gap: 12,
    borderWidth: 1, borderColor: '#292a2b',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stepText: { fontSize: 13, color: '#c2c7cc' },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10, color: '#6B6B6B', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },

  configSummary: {
    flexDirection: 'row', backgroundColor: '#1e2021',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#292a2b', marginBottom: 12,
  },
  configStat: { flex: 1, alignItems: 'center' },
  configStatNum: { fontSize: 20, fontWeight: 'bold' },
  configStatLabel: { fontSize: 10, color: '#6B6B6B', marginTop: 2 },
  configDivider: { width: 1, backgroundColor: '#292a2b', marginHorizontal: 8 },
  compList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  compChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1e2021', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#292a2b',
  },
  compChipText: { fontSize: 11, color: '#c2c7cc' },

  presetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#292a2b', marginBottom: 8,
  },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#4a4b4d',
    justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  presetText: { fontSize: 14, color: '#6B6B6B', flex: 1 },

  textInput: {
    backgroundColor: '#1e2021', borderRadius: 12,
    borderWidth: 1, borderColor: '#292a2b',
    padding: 14, color: '#e3e2e3', fontSize: 14,
    textAlignVertical: 'top', minHeight: 80,
  },

  sendBtn: {
    padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },
});

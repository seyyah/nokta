import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView,
  Animated, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CATALOG } from '../data/catalog';
import { AppContext } from '../context/AppContext';

const COMMUNITY_KEY = '@nonslop_community';

const SEED_FEED = [
  {
    id: '1',
    specialty: 'cardiologist',
    title: 'Post-Procedure Follow-Up App',
    doctor: 'Dr. M.',
    practiceType: 'Solo Practice',
    daysAgo: 5,
    components: ['booking', 'appointment-reminder', 'follow-up-checklist', 'medication-tracker'],
    patientCount: 847,
    patternScore: 91,
  },
  {
    id: '2',
    specialty: 'dentist',
    title: 'Family Dentistry Patient App',
    doctor: 'Dr. L.',
    practiceType: 'Clinic',
    daysAgo: 8,
    components: ['booking', 'appointment-reminder', 'oral-health-tips', 'gamification'],
    patientCount: 1200,
    patternScore: 88,
  },
  {
    id: '3',
    specialty: 'nurse',
    title: 'Outpatient Care Coordinator',
    doctor: 'Nurse S.',
    practiceType: 'Solo Practice',
    daysAgo: 12,
    components: ['shift-handoff', 'patient-vitals', 'appointment-reminder', 'braden-scale'],
    patientCount: 340,
    patternScore: 84,
  },
  {
    id: '4',
    specialty: 'cardiologist',
    title: 'Cardio Rehab Companion',
    doctor: 'Dr. A.',
    practiceType: 'Multi-Provider',
    daysAgo: 14,
    components: ['appointment-reminder', 'patient-education', 'telehealth', 'wells-dvt'],
    patientCount: 512,
    patternScore: 79,
  },
  {
    id: '5',
    specialty: 'dentist',
    title: 'Implant Specialist App',
    doctor: 'Dr. K.',
    practiceType: 'Solo Practice',
    daysAgo: 21,
    components: ['booking', 'treatment-plan', 'secure-messaging', 'dmft-index'],
    patientCount: 290,
    patternScore: 82,
  },
  {
    id: '6',
    specialty: 'hepatology',
    title: 'CLD Patient Tracker',
    doctor: 'Dr. E.',
    practiceType: 'Hospital',
    daysAgo: 3,
    components: ['booking', 'medication-tracker', 'meld', 'patient-education'],
    patientCount: 180,
    patternScore: 86,
  },
  {
    id: '7',
    specialty: 'psychiatry',
    title: 'Outpatient Mental Health App',
    doctor: 'Dr. Y.',
    practiceType: 'Solo Practice',
    daysAgo: 7,
    components: ['booking', 'telehealth', 'secure-messaging', 'phq9', 'mood-tracker'],
    patientCount: 220,
    patternScore: 80,
  },
  {
    id: '8',
    specialty: 'orthopedics',
    title: 'Post-Op Knee Recovery',
    doctor: 'Dr. B.',
    practiceType: 'Clinic',
    daysAgo: 10,
    components: ['booking', 'pre-op-checklist', 'exercise-tracker', 'pain-tracker', 'koos-score'],
    patientCount: 415,
    patternScore: 87,
  },
  {
    id: '9',
    specialty: 'nephrology',
    title: 'CKD Monitoring App',
    doctor: 'Dr. T.',
    practiceType: 'Hospital',
    daysAgo: 4,
    components: ['booking', 'patient-vitals', 'medication-tracker', 'ckd-epi'],
    patientCount: 130,
    patternScore: 83,
  },
];

function getLabel(cid) {
  const entry = Object.values(CATALOG).flatMap((s) => s.components).find((c) => c.id === cid);
  return entry?.name || cid;
}

function Toast({ message, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={[toastStyles.wrap, { opacity }]}>
      <Ionicons name="checkmark-circle" size={16} color="#c5e8c5" />
      <Text style={toastStyles.text}>{message}</Text>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: '#1e2021', borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#292a2b', zIndex: 100,
  },
  text: { color: '#e3e2e3', fontSize: 13, fontWeight: '600' },
});

function PreviewModal({ item, visible, onClose, onFork, onOpenFull, alreadyForked }) {
  if (!item) return null;
  const entry = CATALOG[item.specialty];
  const accent = entry?.accentColor || '#abcbdf';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <View style={[modalStyles.specPill, { backgroundColor: accent + '22' }]}>
              <Ionicons name={entry?.icon || 'medkit-outline'} size={12} color={accent} />
              <Text style={[modalStyles.specLabel, { color: accent }]}>{entry?.label}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B6B6B" />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.title}>{item.title}</Text>
          <Text style={modalStyles.meta}>{item.doctor} · {item.practiceType}</Text>

          <View style={modalStyles.phoneWrap}>
            <View style={modalStyles.phoneFrame}>
              <View style={modalStyles.phoneNotch} />
              <View style={modalStyles.phoneScreen}>
                <View style={modalStyles.appHeader}>
                  <View style={[modalStyles.appAvatar, { backgroundColor: accent + '33' }]}>
                    <Ionicons name={entry?.icon || 'medkit-outline'} size={12} color={accent} />
                  </View>
                  <Text style={[modalStyles.appName, { color: accent }]}>{entry?.label} App</Text>
                </View>
                <View style={[modalStyles.mainCTA, { backgroundColor: accent }]}>
                  <Text style={modalStyles.ctaText}>Randevu Al</Text>
                </View>
                {item.components.slice(1, 4).map((cid) => (
                  <View key={cid} style={modalStyles.featureRow}>
                    <View style={[modalStyles.featureIcon, { backgroundColor: accent + '22' }]} />
                    <Text style={modalStyles.featureName}>{getLabel(cid)}</Text>
                  </View>
                ))}
              </View>
              <View style={modalStyles.homeBar} />
            </View>
          </View>

          <View style={modalStyles.statsRow}>
            <View style={modalStyles.stat}>
              <Ionicons name="people-outline" size={13} color="#6B6B6B" />
              <Text style={modalStyles.statText}>{item.patientCount.toLocaleString()} hasta</Text>
            </View>
            <View style={[modalStyles.scoreBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[modalStyles.scoreText, { color: accent }]}>Skor {item.patternScore}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[modalStyles.fullPreviewBtn]}
            onPress={() => { onClose(); onOpenFull(item); }}
            activeOpacity={0.85}
          >
            <Ionicons name="phone-portrait-outline" size={16} color="#abcbdf" />
            <Text style={modalStyles.fullPreviewText}>Tam Önizleme</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[modalStyles.forkBtn, alreadyForked && modalStyles.forkBtnDone]}
            onPress={() => { if (!alreadyForked) { onFork(item); onClose(); } }}
            activeOpacity={alreadyForked ? 1 : 0.85}
          >
            <Ionicons name={alreadyForked ? 'checkmark' : 'copy-outline'} size={16} color={alreadyForked ? '#c5e8c5' : '#121415'} />
            <Text style={[modalStyles.forkText, alreadyForked && { color: '#c5e8c5' }]}>
              {alreadyForked ? 'Şablon Uygulandı' : 'Bu Şablonu Kullan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1e2021', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: '#292a2b',
  },
  handle: { width: 36, height: 4, backgroundColor: '#343536', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  specPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  specLabel: { fontSize: 11, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B6B6B', marginBottom: 16 },

  phoneWrap: { alignItems: 'center', marginBottom: 16 },
  phoneFrame: { width: 160, backgroundColor: '#121415', borderRadius: 20, borderWidth: 4, borderColor: '#292a2b', overflow: 'hidden' },
  phoneNotch: { width: 40, height: 5, backgroundColor: '#292a2b', borderRadius: 2, alignSelf: 'center', marginTop: 6, marginBottom: 4 },
  phoneScreen: { padding: 8, minHeight: 140 },
  homeBar: { width: 30, height: 3, backgroundColor: '#292a2b', borderRadius: 2, alignSelf: 'center', marginVertical: 6 },

  appHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  appAvatar: { width: 20, height: 20, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 8, fontWeight: 'bold' },
  mainCTA: { borderRadius: 6, padding: 6, marginBottom: 6, alignItems: 'center' },
  ctaText: { fontSize: 7, fontWeight: 'bold', color: '#121415' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1e2021', borderRadius: 4, padding: 5, marginBottom: 4 },
  featureIcon: { width: 14, height: 14, borderRadius: 3 },
  featureName: { fontSize: 7, color: '#e3e2e3' },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, color: '#6B6B6B' },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { fontSize: 12, fontWeight: 'bold' },

  fullPreviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#abcbdf33', backgroundColor: '#1a2a3a',
  },
  fullPreviewText: { color: '#abcbdf', fontSize: 14, fontWeight: '600' },

  forkBtn: {
    backgroundColor: '#abcbdf', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  forkBtnDone: { backgroundColor: '#1e3a2a', borderWidth: 1, borderColor: '#c5e8c5' },
  forkText: { color: '#121415', fontSize: 15, fontWeight: 'bold' },
});

export default function CommunityFeed({ navigation }) {
  const { setApps, startNewDraft, updateDraft } = useContext(AppContext);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [forkedId, setForkedId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(COMMUNITY_KEY).then((raw) => {
      if (raw) {
        try { setCommunityPosts(JSON.parse(raw)); } catch (_) {}
      }
    });
  }, []);

  const allFeed = useMemo(() => {
    const mine = communityPosts.map((p) => ({ ...p, isOwn: true }));
    return [...mine, ...SEED_FEED];
  }, [communityPosts]);

  const filters = [
    { key: 'all', label: 'Tümü' },
    ...Object.entries(CATALOG).map(([id, data]) => ({ key: id, label: data.label })),
  ];

  const filtered = useMemo(
    () => (activeFilter === 'all' ? allFeed : allFeed.filter((f) => f.specialty === activeFilter)),
    [activeFilter, allFeed]
  );

  const showToastMsg = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const forkItem = (item) => {
    startNewDraft(item.specialty);
    updateDraft({ selectedComponents: [...item.components], appName: `${item.title} (kopya)` });
    setForkedId(item.id);
    showToastMsg('Şablon uygulandı → PrototypeComplete');
    navigation.navigate('WizardFlow', { screen: 'PrototypeComplete' });
  };

  const openFull = (item) => {
    navigation.navigate('ClinicianHome', {
      appName: item.title,
      selectedComponents: item.components,
      specialty: item.specialty,
    });
  };

  const renderItem = ({ item }) => {
    const entry = CATALOG[item.specialty];
    const accent = entry?.accentColor || '#abcbdf';
    const daysLabel = item.daysAgo === 1 ? '1 gün önce' : `${item.daysAgo} gün önce`;
    const alreadyForked = forkedId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => setPreviewItem(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <View style={[styles.specPill, { backgroundColor: accent + '22' }]}>
              <Ionicons name={entry?.icon || 'medkit-outline'} size={12} color={accent} />
              <Text style={[styles.specLabel, { color: accent }]}>{entry?.label}</Text>
            </View>
            {item.isOwn && (
              <View style={styles.ownBadge}>
                <Text style={styles.ownText}>Senin</Text>
              </View>
            )}
          </View>
          <Text style={styles.timeLabel}>{daysLabel}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.metaText}>{item.doctor} · {item.practiceType}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {item.components.map((cid) => (
            <View key={cid} style={styles.chip}>
              <Text style={styles.chipText}>{getLabel(cid)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={13} color="#6B6B6B" />
            <Text style={styles.statText}>{item.patientCount.toLocaleString()} hasta</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="grid-outline" size={13} color="#6B6B6B" />
            <Text style={styles.statText}>{item.components.length} özellik</Text>
          </View>
          <View style={[styles.scoreStat, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.scoreText, { color: accent }]}>Skor {item.patternScore}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.previewBtn} onPress={() => openFull(item)}>
            <Ionicons name="phone-portrait-outline" size={14} color="#abcbdf" />
            <Text style={styles.previewText}>Tam Önizleme</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.forkBtn, alreadyForked && styles.forkBtnDone]}
            onPress={() => !alreadyForked && forkItem(item)}
            activeOpacity={alreadyForked ? 1 : 0.85}
          >
            <Ionicons name={alreadyForked ? 'checkmark' : 'copy-outline'} size={14} color={alreadyForked ? '#c5e8c5' : '#121415'} />
            <Text style={[styles.forkText, alreadyForked && { color: '#c5e8c5' }]}>
              {alreadyForked ? 'Uygulandı' : 'Bu Şablonu Kullan'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Topluluk</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color="#343536" />
            <Text style={styles.emptyText}>Bu alanda henüz paylaşım yok.</Text>
          </View>
        }
      />

      <PreviewModal
        item={previewItem}
        visible={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onFork={forkItem}
        onOpenFull={openFull}
        alreadyForked={previewItem?.id === forkedId}
      />

      <Toast message={toastMsg} visible={showToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingHorizontal: 24, paddingTop: 64 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3' },
  countBadge: { backgroundColor: '#1e2021', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#292a2b' },
  countText: { fontSize: 12, color: '#6B6B6B', fontWeight: '600' },

  filterBar: { maxHeight: 38, marginBottom: 8 },
  filterBarContent: { gap: 8, paddingRight: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e2021', borderWidth: 1, borderColor: '#292a2b' },
  filterChipActive: { backgroundColor: '#abcbdf', borderColor: '#abcbdf' },
  filterText: { fontSize: 13, color: '#6B6B6B', fontWeight: '500' },
  filterTextActive: { color: '#121415', fontWeight: 'bold' },

  card: { backgroundColor: '#1e2021', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#292a2b' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  specLabel: { fontSize: 11, fontWeight: 'bold' },
  ownBadge: { backgroundColor: '#1a3a2a', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#c5e8c544' },
  ownText: { fontSize: 10, color: '#c5e8c5', fontWeight: 'bold' },
  timeLabel: { fontSize: 11, color: '#6B6B6B' },

  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  metaText: { fontSize: 12, color: '#6B6B6B', marginBottom: 12 },

  chips: { flexDirection: 'row', marginBottom: 12 },
  chip: { backgroundColor: '#292a2b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  chipText: { fontSize: 11, color: '#c2c7cc' },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#6B6B6B' },
  scoreStat: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  scoreText: { fontSize: 11, fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12 },
  previewText: { color: '#abcbdf', fontSize: 13, fontWeight: '600' },
  forkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#abcbdf', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  forkBtnDone: { backgroundColor: '#1e3a2a', borderWidth: 1, borderColor: '#c5e8c5' },
  forkText: { color: '#121415', fontSize: 13, fontWeight: 'bold' },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: '#6B6B6B', fontSize: 14 },
});

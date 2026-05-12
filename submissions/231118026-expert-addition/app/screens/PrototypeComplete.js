import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

function AnimatedScore({ target }) {
  const { t } = useTranslation();
  const [display, setDisplay] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const celebOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(anim, {
      toValue: target,
      duration: 1200,
      useNativeDriver: false,
    }).start(() => {
      if (target >= 80) {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 0.6, duration: 300, useNativeDriver: true }),
            Animated.timing(glowScale, { toValue: 1.6, duration: 500, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(celebOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]).start();
      }
    });
    return () => anim.removeAllListeners();
  }, [target]);

  const color = display >= 80 ? '#c5e8c5' : display >= 60 ? '#abcbdf' : '#e8bf94';

  return (
    <View style={scoreStyles.wrap}>
      <View style={scoreStyles.scoreWrap}>
        <Animated.View
          style={[
            scoreStyles.glow,
            { backgroundColor: '#c5e8c5', transform: [{ scale: glowScale }], opacity: glowOpacity },
          ]}
        />
        <Text style={[scoreStyles.number, { color }]}>{display}</Text>
      </View>
      <Text style={scoreStyles.label}>{t('prototype.patternScore')}</Text>
      <Animated.Text style={[scoreStyles.celebText, { opacity: celebOpacity }]}>
        Mükemmel eşleşme ✦
      </Animated.Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  scoreWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  number: { fontSize: 48, fontWeight: 'bold', lineHeight: 52 },
  label: { fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  celebText: { fontSize: 10, color: '#c5e8c5', fontWeight: '600', marginTop: 4, letterSpacing: 0.5 },
});

export default function PrototypeComplete({ navigation }) {
  const { t } = useTranslation();
  const { currentDraft, updateDraft } = useContext(AppContext);
  const specialty = currentDraft?.specialty || 'cardiologist';
  const selectedIds = currentDraft?.selectedComponents || [];
  const superIds = currentDraft?.superComponents || [];
  const superStyleIdx = currentDraft?.superStyle ?? null;
  const catalogEntry = CATALOG[specialty] || CATALOG.cardiologist;

  const selectedComponents = catalogEntry.components.filter((c) =>
    selectedIds.includes(c.id)
  );

  const patternScore =
    selectedComponents.length > 0
      ? Math.round(
        selectedComponents.reduce((sum, c) => {
          const weight = superIds.includes(c.id) ? 1.2 : 1;
          return sum + c.peerSignal * weight;
        }, 0) / selectedComponents.length
      )
      : 0;

  const previewAccent = superStyleIdx !== null && catalogEntry.styleConcepts?.[superStyleIdx]
    ? catalogEntry.styleConcepts[superStyleIdx].accent
    : catalogEntry.accentColor;
  const previewBg = superStyleIdx !== null && catalogEntry.styleConcepts?.[superStyleIdx]
    ? catalogEntry.styleConcepts[superStyleIdx].bg
    : '#0d0e10';

  const hasBooking = selectedIds.includes('booking');

  const suggestions = patternScore < 80
    ? catalogEntry.components
        .filter((c) => !selectedIds.includes(c.id))
        .sort((a, b) => b.peerSignal - a.peerSignal)
        .slice(0, 2)
        .map((c) => {
          const newScore = Math.round(
            [...selectedComponents, c].reduce((sum, x) => sum + x.peerSignal, 0) /
            (selectedComponents.length + 1)
          );
          return { ...c, newScore, delta: newScore - patternScore };
        })
    : [];

  const addComponent = (compId) => {
    updateDraft({ selectedComponents: [...selectedIds, compId] });
  };

  const goToAskExpert = () => {
    updateDraft({ _patternScore: patternScore });
    navigation.navigate('AskExpert');
  };

  const shareLink = async () => {
    const payload = { specialty, components: selectedIds, appName: currentDraft?.appName || catalogEntry.label };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    await Share.share({ message: `nonslop://preview?data=${encoded}` });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-sharp" size={20} color="#121415" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('prototype.title')}</Text>
          <Text style={styles.subtitle}>
            {selectedComponents.length} {t('prototype.features')} · {t('prototype.avgPeerSignal')}
          </Text>
        </View>
        <AnimatedScore target={patternScore} />
      </View>

      <View style={styles.phoneFrame}>
        <View style={styles.phoneNotch} />
        <ScrollView style={[styles.phoneScreen, { backgroundColor: previewBg }]} showsVerticalScrollIndicator={false}>
          <View style={styles.appHeader}>
            <View style={[styles.appAvatar, { backgroundColor: previewAccent + '33' }]}>
              <Ionicons name={catalogEntry.icon} size={18} color={previewAccent} />
            </View>
            <Text style={styles.appTitle}>{catalogEntry.label} App</Text>
            <Text style={styles.appSub}>Welcome, Patient</Text>
          </View>

          {hasBooking && (
            <View style={[styles.mainCTA, { backgroundColor: previewAccent }]}>
              <Text style={styles.mainCTAText}>{t('community.bookAppointment')}</Text>
              <Ionicons name="arrow-forward" size={13} color="#121415" />
            </View>
          )}

          <View style={styles.featureList}>
            {selectedComponents
              .filter((c) => c.id !== 'booking')
              .map((c) => {
                const isSuper = superIds.includes(c.id);
                return (
                  <View key={c.id} style={[styles.featureRow, isSuper && { borderWidth: 1, borderColor: '#c5e8c544' }]}>
                    <View style={[styles.featureIcon, { backgroundColor: previewAccent + '22' }]}>
                      <Ionicons name={c.icon} size={13} color={previewAccent} />
                    </View>
                    <Text style={styles.featureName}>{c.name}</Text>
                    {isSuper && <Text style={styles.superTag}>✦</Text>}
                  </View>
                );
              })}
            {selectedComponents.length === 0 && (
              <Text style={styles.emptyNote}>No features selected</Text>
            )}
          </View>
        </ScrollView>
        <View style={styles.phoneBar} />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestBox}>
          <Text style={styles.suggestLabel}>Skoru artırmak için ekle</Text>
          <View style={styles.suggestRow}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.suggestCard}
                onPress={() => addComponent(s.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.suggestIcon, { backgroundColor: previewAccent + '22' }]}>
                  <Ionicons name={s.icon} size={14} color={previewAccent} />
                </View>
                <Text style={styles.suggestName} numberOfLines={1}>{s.name}</Text>
                <View style={[styles.deltaBadge, { backgroundColor: '#c5e8c522' }]}>
                  <Text style={styles.deltaText}>+{s.delta} puan</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.openBtn}
          onPress={() =>
            navigation.navigate('ClinicianHome', {
              appName: currentDraft?.appName || catalogEntry.label,
              selectedComponents: selectedIds,
              specialty,
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="phone-portrait-outline" size={18} color="#121415" style={{ marginRight: 8 }} />
          <Text style={styles.openBtnText}>{t('buttons.openApp')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.expertBtn}
          onPress={goToAskExpert}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color="#e8bf94" style={{ marginRight: 6 }} />
          <Text style={styles.expertBtnText}>Uzmana Sor</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { flexDirection: 'row', gap: 4 }]} onPress={shareLink}>
            <Ionicons name="share-outline" size={13} color="#c2c7cc" />
            <Text style={styles.secondaryBtnText}>Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, styles.publishBtn]}
            onPress={() => navigation.navigate('LaunchPracticeApp', { score: patternScore })}
          >
            <Text style={[styles.secondaryBtnText, { color: '#abcbdf' }]}>Yayınla →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  successBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#abcbdf', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#e3e2e3' },
  subtitle: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },

  phoneFrame: {
    flex: 1,
    backgroundColor: '#1e2021',
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#292a2b',
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
    width: '75%',
  },
  phoneNotch: {
    width: 60, height: 6, backgroundColor: '#292a2b',
    borderRadius: 3, alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },
  phoneScreen: { flex: 1, backgroundColor: '#0d0e10', padding: 12 },
  phoneBar: {
    height: 4, width: 40, backgroundColor: '#292a2b',
    borderRadius: 2, alignSelf: 'center', marginVertical: 8,
  },

  appHeader: { alignItems: 'center', marginBottom: 10, paddingVertical: 6 },
  appAvatar: {
    width: 34, height: 34, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  appTitle: { fontSize: 11, fontWeight: 'bold', color: '#e3e2e3' },
  appSub: { fontSize: 9, color: '#6B6B6B', marginTop: 2 },

  mainCTA: {
    borderRadius: 9, padding: 9, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  mainCTAText: { fontSize: 10, fontWeight: 'bold', color: '#121415' },

  featureList: { gap: 5 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#1e2021', borderRadius: 7, padding: 7,
  },
  featureIcon: { width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  featureName: { fontSize: 9, color: '#e3e2e3', fontWeight: '500', flex: 1 },
  superTag: { fontSize: 9, color: '#c5e8c5', fontWeight: 'bold' },
  emptyNote: { fontSize: 9, color: '#343536', textAlign: 'center', marginTop: 16 },

  suggestBox: { marginBottom: 12 },
  suggestLabel: { fontSize: 11, color: '#6B6B6B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  suggestRow: { flexDirection: 'row', gap: 8 },
  suggestCard: {
    flex: 1, backgroundColor: '#1e2021', borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#292a2b', gap: 6,
  },
  suggestIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  suggestName: { fontSize: 11, color: '#e3e2e3', fontWeight: '500' },
  deltaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  deltaText: { fontSize: 10, fontWeight: '700', color: '#c5e8c5' },

  actions: { gap: 10 },
  openBtn: {
    backgroundColor: '#abcbdf', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  openBtnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  expertBtn: {
    backgroundColor: '#1e2021', borderRadius: 12,
    padding: 13, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e8bf9444',
  },
  expertBtnText: { color: '#e8bf94', fontSize: 14, fontWeight: '600' },

  secondaryActions: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    padding: 12, borderRadius: 10, backgroundColor: '#1e2021',
    flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#292a2b',
  },
  publishBtn: { borderColor: '#abcbdf' },
  secondaryBtnText: { fontSize: 13, color: '#c2c7cc', fontWeight: '600' },
});


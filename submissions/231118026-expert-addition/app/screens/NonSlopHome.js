import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import { REQUESTS_KEY } from './AskExpert';

export default function NonSlopHome({ navigation }) {
  const { t } = useTranslation();
  const { apps, startNewDraft, userProfile, setProfile } = useContext(AppContext);
  const [pendingCount, setPendingCount] = useState(0);
  const [logoTaps, setLogoTaps] = useState(0);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(REQUESTS_KEY).then((raw) => {
        if (!raw) return;
        const reqs = JSON.parse(raw);
        const answered = reqs.filter((r) => r.status === 'answered').length;
        setPendingCount(answered);
      });
    }, [])
  );

  const handleLogoTap = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next >= 5) {
      setLogoTaps(0);
      navigation.navigate('ExpertPanel');
    }
  };

  const TRUST_SIGNALS = Object.entries(CATALOG).map(([id, entry]) => ({
    specialty: id,
    label: entry.label,
    icon: entry.icon,
    accent: entry.accentColor,
    peerSignal: Math.round(
      entry.components.reduce((s, c) => s + c.peerSignal, 0) / (entry.components.length || 1)
    ),
    topComponent: [...entry.components].sort((a, b) => b.peerSignal - a.peerSignal)[0],
  }));
  const latestApps = apps.slice(0, 3);

  const startAIRequest = () => {
    if (userProfile?.specialty) startNewDraft(userProfile.specialty);
    navigation.navigate('AICustomRequest');
  };

  const startBrowse = () => {
    if (userProfile?.specialty) {
      startNewDraft(userProfile.specialty);
      navigation.navigate('WizardFlow', { screen: 'ReviewConcepts' });
    } else {
      navigation.navigate('WizardFlow');
    }
  };

  const changeSpecialty = () => {
    navigation.navigate('WizardFlow', { screen: 'SelectSpecialty' });
  };

  const lastApp = apps[0];
  const lastEntry = lastApp ? CATALOG[lastApp.specialty] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topLogoRow}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={1}>
          <Text style={styles.logoMark}>{t('app.name')}</Text>
        </TouchableOpacity>
        {userProfile?.specialty && (
          <TouchableOpacity style={styles.specialtyChip} onPress={changeSpecialty} activeOpacity={0.7}>
            <Ionicons
              name={CATALOG[userProfile.specialty]?.icon || 'medkit-outline'}
              size={13}
              color={CATALOG[userProfile.specialty]?.accentColor || '#abcbdf'}
            />
            <Text style={[styles.specialtyChipText, { color: CATALOG[userProfile.specialty]?.accentColor || '#abcbdf' }]}>
              {CATALOG[userProfile.specialty]?.label}
            </Text>
            <Ionicons name="swap-horizontal-outline" size={12} color="#6B6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {userProfile?.name ? (
        <Text style={styles.greeting}>Merhaba, {userProfile.name}</Text>
      ) : apps.length === 0 && (
        <>
          <Text style={styles.heroTitle}>{t('app.tagline')}</Text>
          <Text style={styles.subtext}>{t('app.subtitle')}</Text>
        </>
      )}

      <Text style={styles.choiceLabel}>Nasıl başlamak istersiniz?</Text>

      <TouchableOpacity style={styles.aiBtn} onPress={startAIRequest} activeOpacity={0.85}>
        <View style={styles.aiBtnIcon}>
          <Ionicons name="sparkles" size={24} color="#abcbdf" />
        </View>
        <View style={styles.aiBtnText}>
          <Text style={styles.aiBtnTitle}>💬 Özel İsteğim Var</Text>
          <Text style={styles.aiBtnSub}>Arayın, size özel önerelim</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#6B6B6B" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.browseBtn} onPress={startBrowse} activeOpacity={0.85}>
        <View style={styles.browseBtnIcon}>
          <Ionicons name="grid-outline" size={24} color="#c5e8c5" />
        </View>
        <View style={styles.browseBtnText}>
          <Text style={styles.browseBtnTitle}>👀 Önerilere Göz At</Text>
          <Text style={styles.browseBtnSub}>Popüler uygulama desenlerini keşfet</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#6B6B6B" />
      </TouchableOpacity>

      {/* Taleplerim butonu — yanıt varsa badge göster */}
      <TouchableOpacity
        style={styles.requestsBtn}
        onPress={() => navigation.navigate('MyRequests')}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#e8bf94" />
        <Text style={styles.requestsBtnText}>Taleplerim</Text>
        {pendingCount > 0 && (
          <View style={styles.requestsBadge}>
            <Text style={styles.requestsBadgeText}>{pendingCount} yanıt</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color="#6B6B6B" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {apps.length > 0 && (
        <>
          <Text style={styles.sectionHeading}>Uygulamalarım</Text>

          {lastEntry && (
            <TouchableOpacity
              style={styles.resumeCard}
              onPress={() =>
                navigation.navigate('ClinicianHome', {
                  appName: lastApp.appName || lastEntry.label,
                  selectedComponents: lastApp.selectedComponents || [],
                  specialty: lastApp.specialty,
                })
              }
              activeOpacity={0.85}
            >
              <View style={[styles.resumeIcon, { backgroundColor: lastEntry.accentColor + '22' }]}>
                <Ionicons name={lastEntry.icon} size={22} color={lastEntry.accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeLabel}>Son oluşturulan</Text>
                <Text style={styles.resumeName} numberOfLines={1}>
                  {lastApp.appName || `${lastEntry.label} App`}
                </Text>
                <Text style={styles.resumeMeta}>
                  {lastApp.selectedComponents?.length || 0} özellik · {lastApp.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B6B6B" />
            </TouchableOpacity>
          )}

          {latestApps.slice(1).map((app, idx) => {
            const entry = CATALOG[app.specialty];
            const accent = entry?.accentColor || '#abcbdf';
            return (
              <TouchableOpacity
                key={idx}
                style={styles.appRow}
                onPress={() =>
                  navigation.navigate('ClinicianHome', {
                    appName: app.appName || entry?.label,
                    selectedComponents: app.selectedComponents || [],
                    specialty: app.specialty,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={[styles.appDot, { backgroundColor: accent + '33' }]}>
                  <Ionicons name={entry?.icon || 'medkit-outline'} size={16} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appName} numberOfLines={1}>
                    {app.appName || `${entry?.label || app.specialty} App`}
                  </Text>
                  <Text style={styles.appMeta}>{app.status} · {app.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#343536" />
              </TouchableOpacity>
            );
          })}

          {apps.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('MyApps')} style={styles.seeAll}>
              <Text style={styles.seeAllText}>Tümünü gör ({apps.length}) →</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {apps.length === 0 && (
        <>
          <Text style={styles.sectionLabel}>{t('home.provenPatterns')}</Text>

          {TRUST_SIGNALS.map((signal) => (
            <TouchableOpacity
              key={signal.specialty}
              style={styles.signalCard}
              onPress={() => {
                startNewDraft(signal.specialty);
                navigation.navigate('WizardFlow', { screen: 'ReviewConcepts' });
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.signalIcon, { backgroundColor: signal.accent + '22' }]}>
                <Ionicons name={signal.icon || 'medkit-outline'} size={20} color={signal.accent} />
              </View>
              <View style={styles.signalBody}>
                <View style={styles.signalTop}>
                  <Text style={[styles.signalSpecialty, { color: signal.accent }]}>{signal.label}</Text>
                  <View style={[styles.signalBadge, { backgroundColor: signal.accent + '22' }]}>
                    <Text style={[styles.signalBadgeText, { color: signal.accent }]}>
                      %{signal.peerSignal} kullanıyor
                    </Text>
                  </View>
                </View>
                {signal.topComponent && (
                  <>
                    <Text style={styles.signalComponent}>{signal.topComponent.name}</Text>
                    <Text style={styles.signalImpact}>{signal.topComponent.description}</Text>
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={14} color="#343536" />
            </TouchableOpacity>
          ))}

          <View style={styles.trustRow}>
            {Object.entries(CATALOG).map(([id, data]) => (
              <View key={id} style={styles.trustPill}>
                <Ionicons name={data.icon} size={13} color="#6B6B6B" />
                <Text style={styles.trustText}>{data.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingHorizontal: 24, paddingTop: 64 },
  content: { paddingBottom: 60 },

  topLogoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoMark: { fontSize: 15, fontWeight: 'bold', color: '#abcbdf' },
  specialtyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1e2021', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#292a2b',
  },
  specialtyChipText: { fontSize: 12, fontWeight: '600' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 20 },
  heroTitle: { fontSize: 34, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 12, lineHeight: 42 },
  subtext: { fontSize: 15, color: '#6B6B6B', marginBottom: 28, lineHeight: 22 },

  primaryBtn: {
    backgroundColor: '#abcbdf', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 36,
  },
  primaryBtnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },

  choiceLabel: {
    fontSize: 13,
    color: '#c2c7cc',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  aiBtn: {
    backgroundColor: '#1e2021',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#abcbdf44',
  },
  aiBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#abcbdf22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBtnText: { flex: 1 },
  aiBtnTitle: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  aiBtnSub: { fontSize: 13, color: '#6B6B6B', lineHeight: 18 },

  browseBtn: {
    backgroundColor: '#1e2021',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 36,
    borderWidth: 2,
    borderColor: '#c5e8c544',
  },
  browseBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#c5e8c522',
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseBtnText: { flex: 1 },
  browseBtnTitle: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 4 },
  browseBtnSub: { fontSize: 13, color: '#6B6B6B', lineHeight: 18 },

  sectionLabel: {
    fontSize: 12, color: '#6B6B6B', fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },

  signalCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#292a2b',
  },
  signalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  signalBody: { flex: 1 },
  signalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  signalSpecialty: { fontSize: 12, fontWeight: 'bold' },
  signalBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  signalBadgeText: { fontSize: 10, fontWeight: 'bold' },
  signalComponent: { fontSize: 14, fontWeight: '600', color: '#e3e2e3', marginBottom: 3 },
  signalImpact: { fontSize: 12, color: '#6B6B6B', lineHeight: 17 },

  trustRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, marginBottom: 8 },
  trustPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1e2021', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#292a2b',
  },
  trustText: { fontSize: 12, color: '#6B6B6B' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#abcbdf', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  newBtnText: { color: '#121415', fontWeight: 'bold', fontSize: 13 },

  resumeCard: {
    backgroundColor: '#1e2021', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28,
    borderWidth: 1, borderColor: '#292a2b',
  },
  resumeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  resumeLabel: { fontSize: 11, color: '#6B6B6B', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  resumeName: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 2 },
  resumeMeta: { fontSize: 12, color: '#6B6B6B' },

  sectionHeading: { fontSize: 13, color: '#6B6B6B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  appRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e2021',
  },
  appDot: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 15, fontWeight: '600', color: '#e3e2e3', marginBottom: 2 },
  appMeta: { fontSize: 12, color: '#6B6B6B' },

  seeAll: { paddingVertical: 16 },
  seeAllText: { color: '#abcbdf', fontSize: 14, fontWeight: '600' },

  requestsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e2021', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e8bf9433', marginBottom: 24,
  },
  requestsBtnText: { fontSize: 14, fontWeight: '600', color: '#e8bf94', flex: 1 },
  requestsBadge: {
    backgroundColor: '#e8bf9433', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  requestsBadgeText: { fontSize: 11, fontWeight: '700', color: '#e8bf94' },
});


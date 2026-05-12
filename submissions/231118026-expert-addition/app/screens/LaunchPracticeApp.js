import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

export default function LaunchPracticeApp({ navigation, route }) {
  const { t } = useTranslation();
  const { currentDraft, setApps, resetDraft } = useContext(AppContext);

  const ICON_THEMES = [
    { key: 'clinical', label: t('launch.themes.clinical'), bg: '#1a3a4a', accent: '#abcbdf' },
    { key: 'warm', label: t('launch.themes.warm'), bg: '#3a1a1a', accent: '#ffb4ab' },
    { key: 'nature', label: t('launch.themes.nature'), bg: '#1a3a1a', accent: '#c5e8c5' },
  ];
  const specialty = currentDraft?.specialty || 'cardiologist';
  const catalogEntry = CATALOG[specialty];
  const defaultName = `Dr. — ${catalogEntry?.label || 'Practice'}`;
  const score = route.params?.score ?? 0;

  const [appName, setAppName] = useState(currentDraft?.appName || defaultName);
  const [iconTheme, setIconTheme] = useState(0);

  const handleNext = () => {
    const name = appName.trim() || defaultName;
    const newApp = {
      id: Date.now().toString(),
      appName: name,
      specialty,
      selectedComponents: currentDraft?.selectedComponents || [],
      superComponents: currentDraft?.superComponents || [],
      superStyle: currentDraft?.superStyle ?? null,
      themeIndex: iconTheme,
      score,
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'Live',
      expertReview: currentDraft?.expertReview ?? null,
    };
    setApps((prev) => [newApp, ...prev]);
    resetDraft();
    navigation.navigate('ClinicianHome', {
      appName: name,
      selectedComponents: newApp.selectedComponents,
      specialty,
      themeIndex: iconTheme,
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <Text style={styles.title}>{t('launch.title')}</Text>
      <Text style={styles.subtitle}>{t('launch.subtitle')}</Text>

      <Text style={styles.label}>{t('launch.title')}</Text>
      <TextInput
        style={styles.input}
        value={appName}
        onChangeText={setAppName}
        placeholder={defaultName}
        placeholderTextColor="#6B6B6B"
        returnKeyType="done"
        maxLength={40}
      />
      <Text style={styles.charCount}>{appName.length}/40 {t('launch.characterLimit')}</Text>

      <Text style={styles.label}>{t('launch.themeLabel')}</Text>
      <View style={styles.themeRow}>
        {ICON_THEMES.map((theme, i) => (
          <TouchableOpacity
            key={theme.key}
            style={[
              styles.themeCard,
              iconTheme === i && { borderColor: theme.accent, borderWidth: 2 },
            ]}
            onPress={() => setIconTheme(i)}
            activeOpacity={0.8}
          >
            <View style={[styles.themeSwatch, { backgroundColor: theme.bg }]}>
              <View style={[styles.themeAccent, { backgroundColor: theme.accent }]} />
            </View>
            <Text style={styles.themeLabel}>{theme.label}</Text>
            {iconTheme === i && (
              <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.previewCard}>
        <View style={[styles.previewIcon, { backgroundColor: ICON_THEMES[iconTheme].bg }]}>
          <Ionicons name={catalogEntry?.icon || 'medkit-outline'} size={24} color={ICON_THEMES[iconTheme].accent} />
        </View>
        <View>
          <Text style={styles.previewName} numberOfLines={1}>{appName || defaultName}</Text>
          <Text style={styles.previewSub}>{catalogEntry?.label} · {currentDraft?.selectedComponents?.length || 0} özellik</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{t('buttons.continue')}</Text>
        <Ionicons name="arrow-forward" size={18} color="#121415" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },
  back: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B6B6B', marginBottom: 32 },

  label: {
    fontSize: 12,
    color: '#c2c7cc',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1e2021',
    color: '#e3e2e3',
    padding: 16,
    borderRadius: 14,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#292a2b',
  },
  charCount: { fontSize: 11, color: '#343536', textAlign: 'right', marginTop: 4, marginBottom: 24 },

  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  themeCard: {
    flex: 1,
    backgroundColor: '#1e2021',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292a2b',
    gap: 8,
  },
  themeSwatch: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    justifyContent: 'flex-end',
    padding: 6,
  },
  themeAccent: { height: 6, width: '60%', borderRadius: 3 },
  themeLabel: { fontSize: 12, color: '#c2c7cc', fontWeight: '600' },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2021',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#292a2b',
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewName: { fontSize: 16, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 2 },
  previewSub: { fontSize: 12, color: '#6B6B6B' },

  btn: {
    backgroundColor: '#abcbdf',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  btnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },
});


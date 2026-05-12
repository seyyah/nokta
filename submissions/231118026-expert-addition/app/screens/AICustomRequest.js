import React, { useState, useMemo, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import { USE_CASES } from '../data/useCases';

const usecaseItems = USE_CASES.map(uc => ({
  type: 'usecase',
  key: uc.id,
  title: uc.title,
  subtitle: uc.subtitle,
  icon: uc.icon,
  specialty: uc.specialty,
  components: uc.components,
  peerSignal: null,
  keywords: [uc.title, uc.subtitle, CATALOG[uc.specialty]?.label || ''],
}));

const componentItems = Object.entries(CATALOG).flatMap(([specialty, entry]) =>
  entry.components.map(comp => ({
    type: 'component',
    key: `${specialty}-${comp.id}`,
    title: comp.name,
    subtitle: comp.description,
    icon: comp.icon,
    specialty,
    components: [comp.id],
    peerSignal: comp.peerSignal,
    keywords: [comp.name, comp.description, entry.label, comp.ui_pattern || ''],
  }))
);

const ALL_ITEMS = [...usecaseItems, ...componentItems];

export default function AICustomRequest({ navigation }) {
  const { updateDraft, startNewDraft, currentDraft, userProfile } = useContext(AppContext);
  const [query, setQuery] = useState('');

  const userSpecialty = currentDraft?.specialty || userProfile?.specialty || null;
  const specialtyEntry = userSpecialty ? CATALOG[userSpecialty] : null;
  const accent = specialtyEntry?.accentColor || '#abcbdf';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      if (userSpecialty) {
        const mine = ALL_ITEMS.filter(item => item.specialty === userSpecialty);
        const others = ALL_ITEMS.filter(item => item.specialty !== userSpecialty);
        return [...mine, ...others].slice(0, 8);
      }
      return ALL_ITEMS.slice(0, 6);
    }
    const matched = ALL_ITEMS.filter(item =>
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
    if (userSpecialty) {
      return [
        ...matched.filter(item => item.specialty === userSpecialty),
        ...matched.filter(item => item.specialty !== userSpecialty),
      ];
    }
    return matched;
  }, [query, userSpecialty]);

  const topMatch = filtered[0] || null;

  const handleSelect = (item) => {
    startNewDraft(item.specialty);
    updateDraft({ selectedComponents: item.components, aiSuggestedComponents: item.components });
    navigation.navigate('WizardFlow', { screen: 'ReviewConcepts' });
  };

  const getAccent = (specialty) => CATALOG[specialty]?.accentColor || '#abcbdf';
  const getSpecialtyLabel = (specialty) => CATALOG[specialty]?.label || specialty;

  const placeholder = specialtyEntry
    ? `${specialtyEntry.label} özelliklerini ara...`
    : 'Örn: kardiyoloji hesaplama, randevu, hemşire...';

  const sectionLabel = query.trim()
    ? 'Eşleşen öneriler'
    : userSpecialty
      ? `${specialtyEntry?.label || ''} için öneriler`
      : 'Popüler başlangıç noktaları';

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      {specialtyEntry && (
        <View style={[styles.specialtyBanner, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
          <Ionicons name={specialtyEntry.icon} size={14} color={accent} />
          <Text style={[styles.specialtyBannerText, { color: accent }]}>{specialtyEntry.label}</Text>
        </View>
      )}
      <Text style={styles.title}>Özel isteğinizi yazın</Text>
      <Text style={styles.subtitle}>
        {specialtyEntry
          ? `${specialtyEntry.label} için özelleştirilmiş öneriler`
          : 'Katalogdan size özel öneriler sunalım'}
      </Text>

      {/* Input + ghost completion container */}
      <View style={[styles.inputContainer, topMatch && styles.inputContainerActive]}>
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={18} color="#6B6B6B" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => topMatch && handleSelect(topMatch)}
            returnKeyType="go"
            placeholder={placeholder}
            placeholderTextColor="#6B6B6B"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#6B6B6B" />
            </TouchableOpacity>
          )}
        </View>

        {topMatch && query.trim().length > 0 && (
          <TouchableOpacity
            style={styles.ghostRow}
            onPress={() => handleSelect(topMatch)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward" size={13} color={getAccent(topMatch.specialty)} />
            <Text
              style={[styles.ghostText, { color: getAccent(topMatch.specialty) }]}
              numberOfLines={1}
            >
              {topMatch.title}
            </Text>
            <View style={[styles.ghostBadge, { backgroundColor: getAccent(topMatch.specialty) + '22' }]}>
              <Text style={[styles.ghostBadgeText, { color: getAccent(topMatch.specialty) }]}>
                seç
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Chip listesi */}
      <Text style={styles.sectionLabel}>{sectionLabel}</Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={28} color="#343536" />
          <Text style={styles.emptyText}>Eşleşme bulunamadı</Text>
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Tüm önerileri gör</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filtered.map((item) => {
          const accent = getAccent(item.specialty);
          const catalogEntry = CATALOG[item.specialty];
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.chip}
              onPress={() => handleSelect(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.chipIcon, { backgroundColor: accent + '22' }]}>
                <Ionicons name={item.icon} size={18} color={accent} />
              </View>
              <View style={styles.chipBody}>
                <Text style={styles.chipTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.chipMeta}>
                  <View style={[styles.specialtyPill, { backgroundColor: accent + '18', borderColor: accent + '33' }]}>
                    <Text style={[styles.specialtyPillText, { color: accent }]}>
                      {getSpecialtyLabel(item.specialty)}
                    </Text>
                  </View>
                  {item.peerSignal !== null ? (
                    <Text style={styles.chipSub}>{item.peerSignal}% pratik kullanıyor</Text>
                  ) : (
                    <Text style={styles.chipSub}>{item.components.length} özellik</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#343536" />
            </TouchableOpacity>
          );
        })
      )}

      {/* Şablonlara gözat */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.browserBtn}
        onPress={() => navigation.navigate('UseCaseBrowser')}
        activeOpacity={0.8}
      >
        <Ionicons name="albums-outline" size={18} color="#c2c7cc" />
        <Text style={styles.browserBtnText}>Tüm şablonlara gözat</Text>
        <Ionicons name="arrow-forward" size={16} color="#6B6B6B" />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingHorizontal: 24, paddingTop: 64 },
  back: { marginBottom: 20 },
  specialtyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, marginBottom: 12,
  },
  specialtyBannerText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 20 },

  inputContainer: {
    backgroundColor: '#1e2021', borderRadius: 14,
    borderWidth: 1, borderColor: '#292a2b',
    marginBottom: 20, overflow: 'hidden',
  },
  inputContainerActive: { borderColor: '#3a3b3c' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  searchIcon: { flexShrink: 0 },
  input: {
    flex: 1, fontSize: 16, color: '#e3e2e3',
    paddingVertical: 0,
  },

  ghostRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#292a2b',
  },
  ghostText: { flex: 1, fontSize: 14, fontWeight: '500' },
  ghostBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  ghostBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  sectionLabel: {
    fontSize: 11, color: '#6B6B6B', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#6B6B6B' },
  clearBtn: {
    marginTop: 4, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, backgroundColor: '#1e2021',
    borderWidth: 1, borderColor: '#292a2b',
  },
  clearBtnText: { fontSize: 13, color: '#c2c7cc' },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 10, borderWidth: 1, borderColor: '#292a2b',
  },
  chipIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  chipBody: { flex: 1, gap: 4 },
  chipTitle: { fontSize: 14, fontWeight: '600', color: '#e3e2e3' },
  chipMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specialtyPill: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  specialtyPillText: { fontSize: 10, fontWeight: '600' },
  chipSub: { fontSize: 11, color: '#6B6B6B' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#292a2b' },
  dividerText: { fontSize: 12, color: '#6B6B6B' },

  browserBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#292a2b',
  },
  browserBtnText: { flex: 1, fontSize: 14, color: '#c2c7cc', fontWeight: '500' },
});

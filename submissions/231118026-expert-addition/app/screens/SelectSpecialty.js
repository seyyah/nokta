import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import StepBar from '../components/StepBar';

const specialties = Object.entries(CATALOG).map(([id, data]) => ({
  id,
  label: data.label,
  icon: data.icon,
  accent: data.accentColor,
  componentCount: data.components.length,
}));

function SpecialtyPreview({ specialtyId }) {
  const entry = CATALOG[specialtyId];
  if (!entry) return null;
  const top2 = [...entry.components]
    .sort((a, b) => b.peerSignal - a.peerSignal)
    .slice(0, 2);
  const accent = entry.accentColor;

  return (
    <View style={[previewStyles.wrap, { borderColor: accent + '44' }]}>
      <Text style={[previewStyles.heading, { color: accent }]}>En çok kullanılan</Text>
      {top2.map((c) => (
        <View key={c.id} style={previewStyles.row}>
          <View style={[previewStyles.iconWrap, { backgroundColor: accent + '22' }]}>
            <Ionicons name={c.icon} size={16} color={accent} />
          </View>
          <View style={previewStyles.textCol}>
            <Text style={previewStyles.name}>{c.name}</Text>
            <Text style={previewStyles.signal}>%{c.peerSignal} klinikte kullanılıyor</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function SelectSpecialty({ navigation }) {
  const { t } = useTranslation();
  const { startNewDraft, userProfile } = useContext(AppContext);
  const [selected, setSelected] = useState(userProfile?.specialty || null);

  const handleNext = () => {
    startNewDraft(selected);
    navigation.navigate('ReviewConcepts');
  };

  const accent = selected ? CATALOG[selected]?.accentColor : '#abcbdf';

  const renderItem = ({ item, index }) => {
    const isSelected = selected === item.id;
    const isOdd = index % 2 !== 0;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isOdd && { marginLeft: 8 },
          isSelected && { borderColor: item.accent, borderWidth: 2 },
        ]}
        onPress={() => setSelected(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrap, { backgroundColor: isSelected ? item.accent + '22' : '#292a2b' }]}>
          <Ionicons name={item.icon} size={26} color={isSelected ? item.accent : '#c2c7cc'} />
        </View>
        <Text style={[styles.cardTitle, isSelected && { color: item.accent }]}>{item.label}</Text>
        <Text style={styles.cardSub}>{item.componentCount} özellik</Text>
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: item.accent }]}>
            <Ionicons name="checkmark" size={10} color="#121415" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <StepBar step={1} accent={accent} />

      <Text style={styles.title}>{t('specialty.title')}</Text>
      <Text style={styles.subtitle}>
        {userProfile?.specialty
          ? 'Farklı bir alan seçmek için dokunun'
          : t('specialty.subtitle')}
      </Text>

      <FlatList
        data={specialties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        style={styles.list}
        ListFooterComponent={selected ? <SpecialtyPreview specialtyId={selected} /> : null}
      />

      <TouchableOpacity
        style={[
          styles.btn,
          !selected && styles.btnDisabled,
          selected && { backgroundColor: accent },
        ]}
        disabled={!selected}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>{t('buttons.next')}: Style Onboarding</Text>
        <Ionicons name="arrow-forward" size={18} color="#121415" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#1a1c1d',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  heading: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: '#e3e2e3', marginBottom: 1 },
  signal: { fontSize: 11, color: '#6B6B6B' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', padding: 24, paddingTop: 64 },
  back: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B6B6B', marginBottom: 28 },
  list: { flex: 1 },
  row: { marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: '#1e2021',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292a2b',
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#e3e2e3', textAlign: 'center' },
  cardSub: { fontSize: 11, color: '#6B6B6B', textAlign: 'center' },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#abcbdf',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: { backgroundColor: '#292a2b' },
  btnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },
});


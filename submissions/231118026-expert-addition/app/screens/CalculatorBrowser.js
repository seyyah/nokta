import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CALCULATORS } from '../data/calculatorDefs';

const SPECIALTY_META = {
  cardiologist: { label: 'Cardiology', icon: 'heart-outline', color: '#e8a0a0' },
  dentist: { label: 'Dentistry', icon: 'happy-outline', color: '#abcbdf' },
  nurse: { label: 'Nursing', icon: 'pulse-outline', color: '#c5e8c5' },
  hepatology: { label: 'Hepatology', icon: 'water-outline', color: '#e8bf94' },
  pulmonology: { label: 'Pulmonology', icon: 'partly-sunny-outline', color: '#b8cfff' },
  nephrology: { label: 'Nephrology', icon: 'water-outline', color: '#80d4d4' },
  orthopedics: { label: 'Orthopedics', icon: 'body-outline', color: '#d4b8ff' },
  psychiatry: { label: 'Psychiatry', icon: 'heart-outline', color: '#f4b8d4' },
};

const ALL_ENTRIES = Object.entries(CALCULATORS).map(([id, calc]) => ({ id, ...calc }));

const ALL_SPECIALTIES = ['all', ...Object.keys(SPECIALTY_META)];

export default function CalculatorBrowser({ navigation, route }) {
  const { specialty } = route.params || {};
  const accent = SPECIALTY_META[specialty]?.color || '#abcbdf';
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(specialty || 'all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ENTRIES.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q) && !c.subtitle.toLowerCase().includes(q)) return false;
      if (activeFilter !== 'all' && !(c.specialty || []).includes(activeFilter)) return false;
      return true;
    });
  }, [query, activeFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      const specs = c.specialty || ['other'];
      specs.forEach((s) => {
        if (!map[s]) map[s] = [];
        map[s].push(c);
      });
    });
    return Object.entries(map).sort(([a], [b]) => {
      if (a === specialty) return -1;
      if (b === specialty) return 1;
      return 0;
    });
  }, [filtered, specialty]);

  const flatItems = useMemo(() => {
    const items = [];
    grouped.forEach(([spec, calcs]) => {
      items.push({ type: 'header', spec });
      calcs.forEach((c) => items.push({ type: 'calc', ...c, spec }));
    });
    return items;
  }, [grouped]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      const meta = SPECIALTY_META[item.spec] || { label: item.spec, icon: 'calculator-outline', color: '#abcbdf' };
      return (
        <View style={styles.sectionHeader}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
          <Text style={[styles.sectionLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
      );
    }
    const meta = SPECIALTY_META[item.spec] || { color: '#abcbdf' };
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CalculatorScreen', { calculatorId: item.id, specialty: item.spec })}
      >
        <View style={[styles.dot, { backgroundColor: meta.color + '33' }]}>
          <Ionicons name="calculator-outline" size={18} color={meta.color} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#343536" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <Text style={[styles.title, { color: accent }]}>Hesaplamalar</Text>
      <Text style={styles.subtitle}>{ALL_ENTRIES.length} kalkülatör mevcut</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {ALL_SPECIALTIES.map((spec) => {
          const isActive = activeFilter === spec;
          const meta = SPECIALTY_META[spec];
          const chipColor = meta?.color || '#abcbdf';
          const label = spec === 'all' ? 'Tümü' : meta?.label || spec;
          return (
            <TouchableOpacity
              key={spec}
              style={[styles.chip, isActive && { backgroundColor: chipColor + '22', borderColor: chipColor }]}
              onPress={() => setActiveFilter(spec)}
              activeOpacity={0.75}
            >
              {meta && <Ionicons name={meta.icon} size={12} color={isActive ? chipColor : '#6B6B6B'} />}
              <Text style={[styles.chipText, isActive && { color: chipColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#6B6B6B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ara..."
          placeholderTextColor="#6B6B6B"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color="#6B6B6B" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={flatItems}
        keyExtractor={(item) => item.type === 'header' ? `h_${item.spec}` : `${item.id}_${item.spec}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={36} color="#343536" />
            <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 64, paddingHorizontal: 24 },
  back: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B6B6B', marginBottom: 20 },

  filterRow: { marginBottom: 14 },
  filterContent: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#292a2b',
    backgroundColor: '#1e2021',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B6B6B' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e2021', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 20, gap: 8,
    borderWidth: 1, borderColor: '#292a2b',
  },
  searchIcon: {},
  searchInput: { flex: 1, color: '#e3e2e3', fontSize: 14 },

  list: { paddingBottom: 40 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, marginBottom: 10,
  },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e2021', borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#292a2b', gap: 12,
  },
  dot: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#e3e2e3', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#6B6B6B' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#6B6B6B', fontSize: 14 },
});

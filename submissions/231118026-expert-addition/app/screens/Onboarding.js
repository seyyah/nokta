import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

const specialties = Object.entries(CATALOG).map(([id, data]) => ({
  id,
  label: data.label,
  icon: data.icon,
  accent: data.accentColor,
}));

export default function Onboarding({ navigation }) {
  const { setProfile, startNewDraft } = useContext(AppContext);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');

  const accent = selected ? CATALOG[selected]?.accentColor : '#abcbdf';

  const handleStart = () => {
    const profile = {
      specialty: selected,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    startNewDraft(selected);
    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <Text style={styles.logo}>NonSlop</Text>
          <Text style={styles.step}>Kurulum</Text>
        </View>

        <Text style={styles.title}>Uzmanlık alanınız nedir?</Text>
        <Text style={styles.subtitle}>
          Bunu bir kez seçiyorsunuz. Her yeni uygulama bu alana göre kişiselleştirilecek.
        </Text>

        {specialties.map((item) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, isSelected && { borderColor: item.accent, borderWidth: 2 }]}
              onPress={() => setSelected(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, isSelected && { backgroundColor: item.accent + '22' }]}>
                <Ionicons name={item.icon} size={28} color={isSelected ? item.accent : '#c2c7cc'} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, isSelected && { color: item.accent }]}>
                  {item.label}
                </Text>
                <Text style={styles.cardSub}>
                  {CATALOG[item.id].components.length} kanıtlanmış bileşen
                </Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={item.accent} />}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.nameLabel}>İsminiz (opsiyonel)</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Dr. Adınız"
          placeholderTextColor="#6B6B6B"
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          maxLength={40}
        />

        <TouchableOpacity
          style={[styles.btn, !selected && styles.btnDisabled, selected && { backgroundColor: accent }]}
          disabled={!selected}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Başla</Text>
          <Ionicons name="arrow-forward" size={18} color="#121415" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#121415' },
  container: { padding: 24, paddingTop: 72 },
  logoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 18, fontWeight: 'bold', color: '#abcbdf' },
  step: { fontSize: 12, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e3e2e3', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B6B6B', lineHeight: 20, marginBottom: 28 },
  card: {
    backgroundColor: '#1e2021', padding: 18, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#292a2b',
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#292a2b',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#e3e2e3', marginBottom: 2 },
  cardSub: { fontSize: 13, color: '#6B6B6B' },
  nameLabel: { fontSize: 13, color: '#c2c7cc', fontWeight: '600', marginTop: 20, marginBottom: 8 },
  nameInput: {
    backgroundColor: '#1e2021', borderRadius: 12, padding: 14,
    color: '#e3e2e3', fontSize: 15, borderWidth: 1, borderColor: '#292a2b',
    marginBottom: 28,
  },
  btn: {
    backgroundColor: '#abcbdf', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#292a2b' },
  btnText: { color: '#121415', fontSize: 17, fontWeight: 'bold' },
});

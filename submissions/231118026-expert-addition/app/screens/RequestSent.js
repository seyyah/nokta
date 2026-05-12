import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RequestSent({ navigation, route }) {
  const { persona } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={64} color="#c5e8c5" />
      </View>

      <Text style={styles.title}>Talebiniz İletildi</Text>
      <Text style={styles.sub}>
        {persona?.name || 'Uzman'} konfigürasyonunuzu inceleyecek ve kısa sürede yanıt verecek.
      </Text>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: '#e8bf94' }]} />
          <Text style={styles.statusText}>İnceleme bekleniyor</Text>
          <Text style={styles.statusTime}>Şimdi</Text>
        </View>
        <View style={styles.statusLine} />
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: '#292a2b' }]} />
          <Text style={[styles.statusText, { color: '#4a4b4d' }]}>Uzman inceliyor</Text>
        </View>
        <View style={styles.statusLine} />
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: '#292a2b' }]} />
          <Text style={[styles.statusText, { color: '#4a4b4d' }]}>Yanıt hazır</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        Yanıt geldiğinde "Taleplerim" ekranından görüntüleyebilirsiniz.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('MyRequests')}
        activeOpacity={0.85}
      >
        <Ionicons name="list-outline" size={17} color="#121415" style={{ marginRight: 8 }} />
        <Text style={styles.primaryBtnText}>Taleplerim</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate('MainTabs')}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryBtnText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#121415',
    padding: 32, alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#e3e2e3', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  statusCard: {
    width: '100%', backgroundColor: '#1e2021',
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#292a2b', marginBottom: 24,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusLine: { width: 2, height: 20, backgroundColor: '#292a2b', marginLeft: 6, marginVertical: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { flex: 1, fontSize: 14, color: '#c2c7cc', fontWeight: '500' },
  statusTime: { fontSize: 11, color: '#6B6B6B' },

  hint: {
    fontSize: 12, color: '#4a4b4d', textAlign: 'center',
    lineHeight: 18, marginBottom: 32,
  },

  primaryBtn: {
    backgroundColor: '#c5e8c5', padding: 16, borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    width: '100%', marginBottom: 12,
  },
  primaryBtnText: { color: '#121415', fontSize: 16, fontWeight: 'bold' },

  secondaryBtn: { padding: 12 },
  secondaryBtnText: { fontSize: 14, color: '#6B6B6B' },
});

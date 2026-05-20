import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [notifs, setNotifs] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>System Settings</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Configure application preferences</Text>
      </View>

      {/* Preferences Section */}
      <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#3b82f6' }]}>General Settings</Text>

        {/* Regular Item */}
        <View style={[styles.row, { borderBottomColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <Text style={[styles.rowLabel, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Enable Notifications</Text>
          <Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: '#4f46e5' }} />
        </View>

        {/* FIXED: Row alignment using default flex-direction row and space-between spacing */}
        <View style={[styles.row, { borderBottomColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <Text style={[styles.rowLabel, { color: isDark ? '#f8fafc' : '#0f172a', flex: 1, marginRight: 16 }]}>
            Background Auto-Update & Cloud Sync
          </Text>
          <Switch value={autoUpdate} onValueChange={setAutoUpdate} trackColor={{ true: '#4f46e5' }} />
        </View>

        {/* Regular Item */}
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Use FaceID / Biometrics</Text>
          <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ true: '#4f46e5' }} />
        </View>
      </View>

      {/* About & Support Card */}
      <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#60a5fa' : '#3b82f6' }]}>Information</Text>
        
        <View style={[styles.row, { borderBottomColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <Text style={[styles.rowLabel, { color: isDark ? '#f8fafc' : '#0f172a' }]}>App Version</Text>
          <Text style={[styles.rowValue, { color: isDark ? '#94a3b8' : '#64748b' }]}>v1.0.4 (Audit Ready)</Text>
        </View>

        {/* Clickable Row */}
        <TouchableOpacity style={styles.row}>
          <Text style={[styles.rowLabel, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Privacy Policy</Text>
          <Text style={{ color: '#4f46e5' }}>View ➔</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED: Danger reset button positioned outside cards in the normal layout flow */}
      <TouchableOpacity 
        style={styles.resetBtn}
        onPress={() => alert('Reset performed!')}
      >
        <Text style={styles.resetBtnText}>Reset All Data</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
    position: 'relative', // To align absolute children
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
  },
  // FIXED: Reset button is placed in standard block layout flow
  resetBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const handleNavigationBug = () => {
    // BUG #3: Navigation Typo - "Pofile" instead of "Profile"
    try {
      navigation.navigate('Pofile'); 
    } catch (e) {
      console.log('Navigation failed', e);
    }
  };

  const toggleAnalytics = () => {
    // BUG #4: Incorrect State Update - It always sets to true instead of toggling
    setAnalytics(true); 
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <TouchableOpacity style={styles.settingItem} onPress={toggleAnalytics}>
          <Text style={styles.settingLabel}>Share Usage Analytics</Text>
          <Switch value={analytics} onValueChange={toggleAnalytics} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.actionItem} onPress={handleNavigationBug}>
          <Text style={styles.actionLabel}>View Detailed Profile (Typo Bug)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={[styles.actionLabel, { color: '#FF5A5F' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.42-audit</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  actionItem: {
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionLabel: {
    fontSize: 16,
    color: '#4A90E2',
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#BBB',
  },
});

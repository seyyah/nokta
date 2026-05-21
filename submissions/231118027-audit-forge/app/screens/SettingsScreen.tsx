import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet } from 'react-native';

export default function SettingsScreen({ navigation }: any) {
  // BUG 3 DÜZELTİLDİ: Butonun çalışması için React State (Durum) eklendi
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Ayarlar</Text>
      
      <View style={styles.row}>
        <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Karanlık Mod</Text>
        <Switch 
          value={isDarkMode} 
          onValueChange={(val) => setIsDarkMode(val)} 
        /> 
      </View>
      
      <Button title="Geri Dön" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightBg: { backgroundColor: '#ffffff' },
  darkBg: { backgroundColor: '#222222' },
  title: { fontSize: 24, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  label: { marginRight: 10, fontSize: 18 },
  lightText: { color: '#000000' },
  darkText: { color: '#ffffff' }
});
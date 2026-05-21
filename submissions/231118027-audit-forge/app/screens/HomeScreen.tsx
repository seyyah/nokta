import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      
      {/* BUG 1 DÜZELTİLDİ: "Giriş Yab" -> "Giriş Yap" yapıldı */}
      <Button title="Giriş Yap" onPress={() => navigation.navigate('Profile')} />
      
      <View style={{ marginTop: 10 }}>
        <Button title="Ayarlara Git" onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
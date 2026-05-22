import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil Ekranı</Text>
      
      {/* BUG 2 DÜZELTİLDİ: Yazı rengi #333333 yapılarak okunaklı hale getirildi */}
      <Text style={styles.infoText}>Kullanıcı Adı: Efe (Veri Çekildi)</Text>
      
      <Button title="Geri Dön" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20 },
  infoText: { color: '#333333', fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
});
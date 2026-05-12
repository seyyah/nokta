import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useHoopCall } from './HoopLogic';

export default function HoopCallScreen({ route, navigation }) {
  // Parametreleri ve Kullanıcı Bilgisini alıyoruz
  const { ideaId, ideaTitle, userInfo } = route.params || { 
    ideaId: '0', 
    ideaTitle: 'Genel Fikir',
    userInfo: { name: 'Misafir Kullanıcı' } 
  };

  // nokta-hoop paketinden gelen hook
  const { joinCall, transcript, status } = useHoopCall({
    tokenServerUrl: process.env.EXPO_PUBLIC_HOOP_TOKEN_SERVER_URL,
    callId: `nokta-idea-${ideaId}`,
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Human-in-the-Loop</Text>
      
      {/* Kullanıcı Rozeti */}
      <View style={styles.userBadgeContainer}>
        <Text style={styles.userBadgeText}>👤 Oturum: {userInfo.name}</Text>
      </View>

      <Text style={styles.subHeader}>{ideaTitle} için Mentor Görüşmesi</Text>
      
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Görüşme Durumu: {status}</Text>
      </View>

      {/* Görüşmeyi Başlatma Butonu */}
      <TouchableOpacity 
        style={[styles.button, status === 'joined' && styles.buttonActive]} 
        onPress={joinCall}
      >
        <Text style={styles.buttonText}>
          {status === 'joined' ? 'Görüşme Devam Ediyor...' : 'Mentor ile Görüşmeyi Başlat'}
        </Text>
      </TouchableOpacity>

      {/* Transkript Alanı ve Writeback (Geri Yazma) Butonu */}
      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptTitle}>Görüşme Kaydı (Transkript):</Text>
          <Text style={styles.transcriptContent}>{transcript}</Text>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={() => navigation.saveTranscript(transcript)}
          >
            <Text style={styles.buttonText}>Notları Spec'e Ekle ve Bitir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoArea}>
          <Text style={styles.infoText}>Görüşme bittikten sonra transkript burada görünecek.</Text>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.navigate()} 
          >
            <Text style={styles.cancelText}>Vazgeç ve Ana Ekrana Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#000' },
  userBadgeContainer: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15, marginTop: 10, marginBottom: 5 },
  userBadgeText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 25, textAlign: 'center', paddingHorizontal: 20 },
  statusBadge: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 20, marginBottom: 20 },
  statusText: { color: '#555', fontSize: 12, fontWeight: '500' },
  button: { backgroundColor: '#FF5722', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 3, width: '90%' },
  buttonActive: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  transcriptBox: { 
    marginTop: 30, 
    width: '100%', 
    padding: 20, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 15, 
    borderLeftWidth: 5, 
    borderLeftColor: '#FF5722',
    elevation: 2
  },
  transcriptTitle: { fontWeight: 'bold', marginBottom: 12, fontSize: 16, color: '#333' },
  transcriptContent: { lineHeight: 22, color: '#444', fontSize: 14, fontStyle: 'italic' },
  saveButton: { 
    backgroundColor: '#2E7D32', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20, 
    width: '100%' 
  },
  infoArea: { alignItems: 'center', marginTop: 40 },
  infoText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },
  cancelButton: { padding: 10 },
  cancelText: { color: '#D32F2F', fontWeight: '600', textDecorationLine: 'underline' }
});
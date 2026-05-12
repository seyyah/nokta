import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

export default function App() {
  const [status, setStatus] = useState('Hazır');
  const voiceSupportText = Voice ? 'Opsiyonel ses tanıma hazır.' : 'Ses tanıma modülü pasif.';

  const handleSpeak = () => {
    const message = 'Merhaba, ben Nokta mobil asistan. İsterseniz sizi insan desteğine de yönlendirebilirim.';
    setStatus('Konuşuyor');
    Speech.speak(message, {
      language: 'tr-TR',
      onDone: () => setStatus('Hazır'),
      onStopped: () => setStatus('Hazır'),
      onError: () => setStatus('Seslendirme hatası'),
    });
  };

  const handleHumanSupport = () => {
    Alert.alert('İnsan Desteği', 'Bir temsilciye bağlanmak üzeresiniz...');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mascot}>
        <Text style={styles.mascotText}>HS</Text>
      </View>
      <Text style={styles.title}>Nokta Mobil Asistan</Text>
      <Text style={styles.subtitle}>
        Sesli yanıt veren, gerektiğinde insan temsilciye geçiş sunan mobil Nokta deneyimi.
      </Text>
      <Text style={styles.status}>Durum: {status}</Text>
      <Text style={styles.voiceStatus}>{voiceSupportText}</Text>
      <View style={styles.buttonGroup}>
        <Button title="Konuşmayı Başlat" onPress={handleSpeak} color="#155EEF" />
        <View style={styles.buttonSpacer} />
        <Button title="İnsan Desteği" onPress={handleHumanSupport} color="#0F766E" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  mascot: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
    marginBottom: 24,
    backgroundColor: '#155EEF',
  },
  mascotText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
    color: '#475569',
    textAlign: 'center',
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1E293B',
  },
  voiceStatus: {
    fontSize: 13,
    marginBottom: 24,
    color: '#64748B',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 320,
  },
  buttonSpacer: {
    height: 12,
  },
});

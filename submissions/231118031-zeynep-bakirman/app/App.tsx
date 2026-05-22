import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert } from 'react-native';
import { AuditWidget } from '@xtatistix/mobile-audit';
// ÇÖZÜM BURADA: Expo 54 kurallarına uymak için sonuna /legacy ekledik
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';

const FS: any = FileSystem;

let notesData: any[] = [];
const mockStorage = {
  loadNotes: async () => notesData,
  saveNotes: async (notes: any[]) => { notesData = notes; }
};

const auditDeps = {
  captureScreen: captureScreen,
  captureRef: captureRef,
  writeFile: async (fileName: string, content: string) => {
    try {
      const path = (FS.documentDirectory || '') + fileName;
      await FS.writeAsStringAsync(path, content, { encoding: 'utf8' });
      return path;
    } catch (e) {
      Alert.alert("Yazma Hatası", "Dosya oluşturulamadı: " + String(e));
      return "";
    }
  },
  writeFileBinary: async (fileName: string, content: string) => {
    try {
      const path = (FS.documentDirectory || '') + fileName;
      await FS.writeAsStringAsync(path, content, { encoding: 'base64' });
      return path;
    } catch (e) {
      Alert.alert("Yazma Hatası", "Resim dosyası oluşturulamadı: " + String(e));
      return "";
    }
  },
  shareFile: async (fileUri: string) => {
    try {
      if (!fileUri) {
        Alert.alert("Paylaşım Hatası", "Dosya yolu boş döndü.");
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Hata", "Paylaşım bu cihazda aktif değil.");
      }
    } catch (e) {
      Alert.alert("Paylaşım Hatası", String(e));
    }
  },
  storage: mockStorage,
  currentScreen: 'AyarlarEkrani',
  BugIcon: <Text style={{ fontSize: 24 }}>🐛</Text>
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.buggyText}>Bu başlık yazısı okunmuyor!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.normalText}>Burası uygulamanın düzgün kısmı.</Text>

        <View style={styles.buggyButton}>
          <Text style={styles.buttonText}>Kayıp Buton</Text>
        </View>
      </View>

      <AuditWidget deps={auditDeps} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: { padding: 20, backgroundColor: '#000' },
  // DÜZELTME 1: color '#000' iken '#fff' yapıldı (Cycle 3)
  buggyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // DÜZELTME 2: padding eklendi (Cycle 4)
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  normalText: { fontSize: 20, marginBottom: 50 },
  // DÜZELTME 3: Hatalı margin değerleri normalleştirildi (Cycle 1)
  buggyButton: {
    backgroundColor: 'red',
    padding: 15,
    marginTop: 20,
    marginLeft: 0
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
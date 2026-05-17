import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'fast-text-encoding';
import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation';

import { AuditWidget } from '@xtatistix/mobile-audit';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Bug } from 'lucide-react-native';
import { slopSenseAuditStorage } from './src/utils/AuditStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Unknown');
  const viewRef = useRef(null);

  const auditDeps = {
    captureScreen: async () => {
      return await captureScreen({ format: 'png', quality: 0.8 });
    },
    captureRef: async (ref: React.RefObject<any>) => {
      return await captureRef(ref, { format: 'png', quality: 0.8 });
    },
    writeFile: async (filename: string, content: string) => {
      console.log("\n\n======== MD OUTPUT START ========\n\n");
      console.log(content);
      console.log("\n\n========= MD OUTPUT END =========\n\n");
      try {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, content, { encoding: 'utf8' });
        return fileUri;
      } catch (err) {
        Alert.alert("File Save Error", String(err));
        throw err;
      }
    },
    writeFileBinary: async (filename: string, base64: string) => {
      try {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
        return fileUri;
      } catch (err) {
        Alert.alert("Binary Save Error", String(err));
        throw err;
      }
    },
    shareFile: async (uri: string) => {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert("Hata", "Bu cihazda paylaşım desteklenmiyor.");
          return;
        }
        await Sharing.shareAsync(uri);
      } catch (err) {
        Alert.alert("Share Error", String(err));
      }
    },
    storage: slopSenseAuditStorage,
    currentScreen,
    reporterId: 'Agent (Antigravity)',
    BugIcon: <Bug size={24} color="#FFF" />,
  };


  return (
    <SafeAreaProvider>
      <View style={styles.container} ref={viewRef}>
        <StatusBar style="light" />
        <AppNavigator onScreenChange={setCurrentScreen} />
        <AuditWidget deps={auditDeps} appName="SlopSense" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12', // Match our theme background
  },
});

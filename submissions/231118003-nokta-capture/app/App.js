import React from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

// Audit Widget and Native Dependencies
import { AuditWidget } from "@xtatistix/mobile-audit";
import { captureScreen, captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./src/screens/HomeScreen";
import EnrichScreen from "./src/screens/EnrichScreen";
import SpecScreen from "./src/screens/SpecScreen";

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState('Unknown');

  const onReady = () => {
    setCurrentScreen(navigationRef.getCurrentRoute()?.name || 'Unknown');
  };

  const onStateChange = async () => {
    const currentRouteName = navigationRef.getCurrentRoute()?.name;
    setCurrentScreen(currentRouteName || 'Unknown');
  };

  const auditDeps = {
    captureScreen,
    captureRef,
    writeFile: async (filename, content) => {
      try {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, content, { encoding: 'utf8' });
        console.log("===== OLUŞTURULAN RAPOR (" + filename + ") =====");
        console.log(content);
        console.log("==================================================");
        return fileUri;
      } catch (e) {
        alert("Dosya Yazma Hatası: " + e.message);
        return "";
      }
    },
    writeFileBinary: async (filename, base64) => {
      try {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
        return fileUri;
      } catch (e) {
        alert("Binary Yazma Hatası: " + e.message);
        return "";
      }
    },
    shareFile: async (uri) => {
      try {
        if (!uri) return;
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          alert("Paylaşım ekranı bu cihazda açılamadı! Rapor terminale (siyah ekrana) yazdırıldı, oradan kopyalayabilirsin.");
        }
      } catch (e) {
        alert("Paylaşım Hatası: " + e.message + " (Rapor terminale yazdırıldı)");
      }
    },
    storage: {
      loadNotes: async () => {
        try {
          const str = await AsyncStorage.getItem('@audit_notes');
          return str ? JSON.parse(str) : [];
        } catch(e) { return []; }
      },
      saveNotes: async (notes) => {
        await AsyncStorage.setItem('@audit_notes', JSON.stringify(notes));
      }
    },
    BugIcon: <View style={{width: 24, height: 24, backgroundColor: 'white', borderRadius: 12}} />
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={onReady} onStateChange={onStateChange}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Enrich" component={EnrichScreen} />
          <Stack.Screen name="Spec" component={SpecScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <AuditWidget deps={auditDeps} currentScreen={currentScreen} />
    </SafeAreaProvider>
  );
}

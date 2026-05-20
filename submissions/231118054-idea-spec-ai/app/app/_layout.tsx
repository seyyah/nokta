import React, { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuditWidget, AuditWidgetDeps } from '@xtatistix/mobile-audit';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('ONBOARDING_COMPLETED');
      if (completed !== 'true' && pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    };
    checkOnboarding();
  }, [mounted, pathname]);

  const auditDeps: AuditWidgetDeps = {
    captureScreen: async () => {
      return await captureScreen({
        format: 'png',
        quality: 0.9,
      });
    },
    captureRef: async (ref) => {
      return await captureRef(ref, {
        format: 'png',
        quality: 0.9,
      });
    },
    writeFile: async (filename, content) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return uri;
    },
    writeFileBinary: async (filename, base64) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: async (uri) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    },
    storage: {
      loadNotes: async () => {
        const val = await AsyncStorage.getItem('AUDIT_NOTES');
        return val ? JSON.parse(val) : [];
      },
      saveNotes: async (notes) => {
        await AsyncStorage.setItem('AUDIT_NOTES', JSON.stringify(notes));
      },
    },
    currentScreen: pathname || 'home',
    BugIcon: <Ionicons name="bug" size={22} color="#FFFFFF" />,
  };

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="spec" />
      </Stack>
      <StatusBar style="dark" />
      <AuditWidget deps={auditDeps} appName="Nokta App" />
    </ThemeProvider>
  );
}

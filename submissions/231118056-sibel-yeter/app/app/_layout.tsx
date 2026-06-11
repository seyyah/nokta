import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { AuditWidget, AuditWidgetDeps } from '@xtatistix/mobile-audit';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const auditDeps = useMemo<AuditWidgetDeps>(() => {
    return {
      captureScreen: async () => {
        try {
          const uri = await captureScreen({
            format: 'png',
            quality: 0.9,
          });
          return uri;
        } catch (e) {
          console.error('[Host] captureScreen error:', e);
          throw e;
        }
      },
      captureRef: async (ref) => {
        try {
          const uri = await captureRef(ref, {
            format: 'png',
            quality: 0.9,
          });
          return uri;
        } catch (e) {
          console.error('[Host] captureRef error:', e);
          throw e;
        }
      },
      writeFile: async (filename, content) => {
        try {
          const uri = FileSystem.documentDirectory + filename;
          await FileSystem.writeAsStringAsync(uri, content, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          return uri;
        } catch (e) {
          console.error('[Host] writeFile error:', e);
          throw e;
        }
      },
      writeFileBinary: async (filename, base64) => {
        try {
          const uri = FileSystem.documentDirectory + filename;
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return uri;
        } catch (e) {
          console.error('[Host] writeFileBinary error:', e);
          throw e;
        }
      },
      shareFile: async (uri) => {
        try {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            console.warn('[Host] Sharing is not available');
          }
        } catch (e) {
          console.error('[Host] shareFile error:', e);
          throw e;
        }
      },
      storage: {
        loadNotes: async () => {
          try {
            const data = await AsyncStorage.getItem('audit_notes');
            return data ? JSON.parse(data) : [];
          } catch (e) {
            console.error('[Host] loadNotes error:', e);
            return [];
          }
        },
        saveNotes: async (notes) => {
          try {
            await AsyncStorage.setItem('audit_notes', JSON.stringify(notes));
          } catch (e) {
            console.error('[Host] saveNotes error:', e);
          }
        },
      },
      currentScreen: pathname || '/',
      reporterId: '231118056-sibel-yeter',
      BugIcon: <Ionicons name="bug" size={24} color="#fff" />,
    };
  }, [pathname]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ideas/[id]" options={{ title: 'Idea Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
      </Stack>
      <StatusBar style="auto" />
      <AuditWidget deps={auditDeps} appName="Nokta-Audit-App" />
    </ThemeProvider>
  );
}

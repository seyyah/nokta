/**
 * app/_layout.tsx
 *
 * Root layout — AuditWidget'ın tek mount noktası.
 *
 * Track A disiplini: grep -r 'AuditWidget' app/ → sadece bu dosya döner.
 * Widget kaldırıldığında (<AuditWidget .../> + import satırı) uygulama
 * eksiksiz çalışmaya devam eder.
 */

import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from '../components/auditStorage';

export default function RootLayout() {
  const pathname = usePathname();

  // currentScreen: Expo Router aktif route → dinamik besleme
  const currentScreen = pathname === '/'
    ? 'HomeScreen'
    : pathname.startsWith('/idea/')
      ? 'IdeaDetailScreen'
      : pathname === '/onboarding'
        ? 'OnboardingScreen'
        : pathname;

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#e2e8f0',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Nokta ·' }} />
        <Stack.Screen name="idea/[id]" options={{ title: 'Fikir' }} />
        <Stack.Screen name="onboarding" options={{ title: 'Hoş Geldin', headerShown: false }} />
      </Stack>

      {/* ── DROP-IN MOUNT — tek satır ── */}
      <AuditWidget
        appName="Nokta"
        initialPosition={{ bottom: 110, right: 16 }}
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename: string, content: string) => {
            const uri = (FileSystem.documentDirectory ?? '') + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename: string, base64: string) => {
            const uri = (FileSystem.documentDirectory ?? '') + filename;
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri: string) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen,
          reporterId: '231118033',
          BugIcon: <Text style={{ fontSize: 20 }}>🐛</Text>,
        }}
      />
    </>
  );
}

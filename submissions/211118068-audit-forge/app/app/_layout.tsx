import { Stack, usePathname } from 'expo-router';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from '../auditStorage';

function resolveScreen(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'OnboardingScreen';
  if (pathname.includes('/ideas')) return 'IdeasScreen';
  if (pathname.includes('/idea/')) return 'IdeaDetailScreen';
  if (pathname.includes('/settings')) return 'SettingsScreen';
  return 'UnknownScreen';
}

export default function RootLayout() {
  const pathname = usePathname();
  const currentScreen = resolveScreen(pathname);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="idea/[id]" options={{ title: 'Fikir Detayı' }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <AuditWidget
        appName="nokta-audit-forge"
        deps={{
          captureScreen: () =>
            captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) =>
            captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen,
          reporterId: 'karahan-qa',
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </>
  );
}

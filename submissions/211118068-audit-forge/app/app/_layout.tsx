import { Stack, usePathname } from 'expo-router';
import { captureScreen, captureRef } from 'react-native-view-shot';
import {
  documentDirectory,
  cacheDirectory,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
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

const baseDir = documentDirectory ?? cacheDirectory ?? '';

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
            const uri = baseDir + filename;
            await writeAsStringAsync(uri, content, { encoding: 'utf8' });
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = baseDir + filename;
            await writeAsStringAsync(uri, base64, { encoding: 'base64' });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri, { mimeType: 'text/markdown', dialogTitle: 'Audit Raporu' }),
          storage: auditStorage,
          currentScreen,
          reporterId: 'karahan-qa',
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </>
  );
}

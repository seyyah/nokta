import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from './auditStorage';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
      <AuditWidget
        appName="NoktaApp"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const uri = documentDirectory + filename;
            await writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = documentDirectory + filename;
            await writeAsStringAsync(uri, base64, {
              encoding: EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri) => shareAsync(uri),
          storage: auditStorage,
          currentScreen: pathname || 'UnknownScreen',
          reporterId: 'esmse',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </>
  );
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import 'react-native-reanimated';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuditWidget } from '@/components/nokta-audit';
import { auditStorage } from '@/components/auditStorage';

const fs = FileSystem as any;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <AuditWidget
        appName="NoktaApp"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', quality: 0.8, result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', quality: 0.8, result: 'tmpfile' }),
          writeFile: async (filename, content) => {
            const uri = fs.documentDirectory + filename;
            await fs.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename, base64) => {
            const uri = fs.documentDirectory + filename;
            await fs.writeAsStringAsync(uri, base64, {
              encoding: fs.EncodingType.Base64,
            });
            return uri;
          },
          shareFile: (uri) => Sharing.shareAsync(uri),
          storage: auditStorage,
          currentScreen: pathname || 'HomeScreen',
          reporterId: '231118036-ali-nursin-karacan',
          BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </ThemeProvider>
  );
}



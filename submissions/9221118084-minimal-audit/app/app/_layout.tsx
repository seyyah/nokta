import { Stack, usePathname } from 'expo-router';
import { AuditWidget } from '@xtatistix/mobile-audit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { colors } from '../lib/theme';

const auditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem('audit_notes');
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes: any[]) {
    await AsyncStorage.setItem('audit_notes', JSON.stringify(notes));
  },
};

// Map the current router path to a human-readable screen name for reports.
function screenNameFromPath(path: string): string {
  if (path.startsWith('/new-note')) return 'NewNoteScreen';
  if (path.startsWith('/note/')) return 'DetailScreen';
  return 'HomeScreen';
}

export default function RootLayout() {
  const pathname = usePathname();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgTop },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '800', fontSize: 18, color: colors.ink },
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: colors.bgTop },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Notlarım' }} />
        <Stack.Screen name="new-note" options={{ title: 'Yeni Not' }} />
        <Stack.Screen name="note/[id]" options={{ title: 'Not' }} />
      </Stack>
      <AuditWidget
        appName="Notlar"
        deps={{
          captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
          captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile' }),
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
          currentScreen: screenNameFromPath(pathname),
          BugIcon: <Text style={{ fontSize: 20 }}>🐛</Text>,
        }}
        initialPosition={{ bottom: 110, right: 16 }}
      />
    </>
  );
}

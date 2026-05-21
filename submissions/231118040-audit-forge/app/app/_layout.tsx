import { ReactNode, RefObject, useMemo } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, usePathname } from 'expo-router';
import * as MobileAudit from '@xtatistix/mobile-audit';
import type { AuditNote, AuditStorage } from '@xtatistix/mobile-audit';
import { captureRef, captureScreen } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { screenFromPath } from '../src/screens';

type WidgetDeps = {
  captureScreen: () => Promise<string>;
  captureRef: (ref: RefObject<any>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon: ReactNode;
};

let cachedNotes: AuditNote[] = [];

const auditStorage: AuditStorage = {
  async loadNotes() {
    return cachedNotes;
  },
  async saveNotes(notes) {
    cachedNotes = notes;
  },
};

function fileUri(filename: string) {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('No writable file-system directory is available.');
  }
  return `${base}${filename}`;
}

export default function RootLayout() {
  const pathname = usePathname();
  const currentScreen = screenFromPath(pathname);

  const auditDeps = useMemo<WidgetDeps>(
    () => ({
      captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile', quality: 0.9 }),
      captureRef: (ref) => captureRef(ref, { format: 'png', result: 'tmpfile', quality: 0.9 }),
      writeFile: async (filename, content) => {
        const uri = fileUri(filename);
        await FileSystem.writeAsStringAsync(uri, content);
        return uri;
      },
      writeFileBinary: async (filename, base64) => {
        const uri = fileUri(filename);
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return uri;
      },
      shareFile: async (uri) => {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Rapor hazir', uri);
        }
      },
      storage: auditStorage,
      currentScreen,
      reporterId: '231118040',
      BugIcon: <Text style={styles.bugIcon}>!</Text>,
    }),
    [currentScreen],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
      <MobileAudit.AuditWidget appName="Nokta Audit Forge" deps={auditDeps} initialPosition={{ bottom: 28, right: 20 }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bugIcon: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
});

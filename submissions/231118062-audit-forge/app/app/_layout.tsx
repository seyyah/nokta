import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { ReactNode, RefObject } from "react";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { captureRef, captureScreen } from "react-native-view-shot";
import * as MobileAudit from "@xtatistix/mobile-audit";
import { screenKeyFromPath, SCREENS } from "../src/screens";

const STORAGE_KEY = "@nokta-audit-forge/notes";

interface HostAuditNote {
  id: string;
  screenName: string;
  screenshot: string;
  screenshotAspect?: number;
  highlightBounds: { x: number; y: number; width: number; height: number } | null;
  note: string;
  status: "open" | "fixed";
  timestamp: string;
  reporterRole?: string;
  reporterId?: string;
}

interface HostAuditStorage {
  loadNotes(): Promise<HostAuditNote[]>;
  saveNotes(notes: HostAuditNote[]): Promise<void>;
}

interface HostAuditDeps {
  captureScreen: () => Promise<string>;
  captureRef: (ref: RefObject<unknown>) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: HostAuditStorage;
  currentScreen: string;
  reporterId?: string;
  BugIcon: ReactNode;
}

const storage: HostAuditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};

function writeTarget(filename: string) {
  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!directory) {
    throw new Error("No writable Expo file directory is available.");
  }

  return `${directory}${filename}`;
}

export default function RootLayout() {
  const pathname = usePathname();
  const screenKey = screenKeyFromPath(pathname);
  const currentScreen = SCREENS[screenKey].auditName;

  const deps = useMemo<HostAuditDeps>(
    () => ({
      captureScreen: () => captureScreen({ format: "png", result: "tmpfile" }),
      captureRef: (ref) => captureRef(ref, { format: "png", result: "tmpfile" }),
      writeFile: async (filename, content) => {
        const uri = writeTarget(filename);
        await FileSystem.writeAsStringAsync(uri, content);
        return uri;
      },
      writeFileBinary: async (filename, base64) => {
        const uri = writeTarget(filename);
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
      storage,
      currentScreen,
      reporterId: process.env.EXPO_PUBLIC_AUDIT_REPORTER_ID ?? "student-231118062",
      BugIcon: <Text style={styles.auditIcon}>!</Text>,
    }),
    [currentScreen],
  );

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <MobileAudit.AuditWidget deps={deps} appName="Nokta Audit Forge" initialPosition={{ bottom: 92, right: 18 }} />
    </>
  );
}

const styles = StyleSheet.create({
  auditIcon: {
    color: "#fffaf0",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
  },
});

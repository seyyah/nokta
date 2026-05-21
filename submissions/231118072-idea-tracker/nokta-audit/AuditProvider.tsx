import React, { ReactNode } from 'react';
import { View } from 'react-native';
import * as ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AuditWidget } from './src/components/AuditWidget';
import { AuditStorage } from './src/core/types';
import { Text } from 'react-native';

const STORAGE_KEY = 'nokta_audit_notes';

const storage: AuditStorage = {
  loadNotes: async () => {
    try {
      const data = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + STORAGE_KEY);
      return JSON.parse(data);
    } catch {
      return [];
    }
  },
  saveNotes: async (notes) => {
    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + STORAGE_KEY, JSON.stringify(notes));
  }
};

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const viewRef = React.useRef<any>(null);

  const deps = {
    captureScreen: async () => {
      return await ViewShot.captureScreen({
        format: 'jpg',
        quality: 0.8,
      });
    },
    captureRef: async (ref: React.RefObject<any>) => {
      return await ViewShot.captureRef(ref, {
        format: 'jpg',
        quality: 0.8,
      });
    },
    writeFile: async (filename: string, content: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
      return uri;
    },
    shareFile: async (uri: string) => {
      await Sharing.shareAsync(uri);
    },
    storage,
    currentScreen: 'Unknown', // This could be dynamic with navigation state
    BugIcon: <Text style={{ fontSize: 24 }}>🪲</Text>,
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <AuditWidget deps={deps} appName="Idea Tracker" />
    </View>
  );
};

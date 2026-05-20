import React, { ReactNode } from 'react';
import { Text } from 'react-native';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FS: any = FileSystem;

interface Props {
  children: ReactNode;
  currentScreen: string;
}

const BugIcon = () => <Text style={{ fontSize: 24 }}>🐞</Text>;

const storage = {
  loadNotes: async () => {
    const data = await AsyncStorage.getItem('@audit_notes');
    return data ? JSON.parse(data) : [];
  },
  saveNotes: async (notes: any) => {
    await AsyncStorage.setItem('@audit_notes', JSON.stringify(notes));
  }
};

export const AuditBoundary: React.FC<Props> = ({ children, currentScreen }) => {
  return (
    <>
      {children}
      <AuditWidget
        appName="Nokta Audit Forge"
        deps={{
          currentScreen,
          reporterId: "231118064-auditforge",
          captureScreen,
          captureRef,
          writeFile: async (filename: string, content: string) => {
            const uri = FS.documentDirectory + filename;
            await FS.writeAsStringAsync(uri, content);
            return uri;
          },
          writeFileBinary: async (filename: string, content: string) => {
            const uri = FS.documentDirectory + filename;
            await FS.writeAsStringAsync(uri, content, { encoding: FS.EncodingType.Base64 });
            return uri;
          },
          shareFile: Sharing.shareAsync,
          storage,
          BugIcon: <BugIcon />
        }}
      />
    </>
  );
};



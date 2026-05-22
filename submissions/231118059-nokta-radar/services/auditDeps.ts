import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Text } from 'react-native';
import React from 'react';
import { auditStorage } from './auditStorage';
import type { AuditWidgetDeps } from '@xtatistix/mobile-audit';

/**
 * AuditDeps — host application boundary.
 * Widget bu native paketleri kendi içinde IMPORT ETMEZ.
 * Tüm native yetenekler host'tan deps üzerinden dependency injection ile gelir.
 * Drop-in prensibi: widget'ı kaldırırsan bu dosyayı sil, _layout'tan mount satırını kaldır. Bitti.
 *
 * currentScreen ve BugIcon de deps içinde taşınır — AuditWidgetDeps arayüzüne uygun.
 */
export function buildAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () =>
      captureScreen({ format: 'png', result: 'tmpfile' }),

    captureRef: (ref: React.RefObject<any>) =>
      captureRef(ref, { format: 'png', result: 'tmpfile' }),

    writeFile: async (filename: string, content: string): Promise<string> => {
      const uri = (FileSystem.documentDirectory ?? '') + filename;
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return uri;
    },

    writeFileBinary: async (filename: string, base64: string): Promise<string> => {
      const uri = (FileSystem.documentDirectory ?? '') + filename;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },

    shareFile: async (uri: string): Promise<void> => {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      }
    },

    storage: auditStorage,
    currentScreen,
    BugIcon: React.createElement(Text, { style: { fontSize: 20 } }, '🐛'),
  };
}


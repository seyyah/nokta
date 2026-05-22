import { Text } from "react-native";
import { captureRef, captureScreen } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { AuditWidgetDeps } from "@xtatistix/mobile-audit";
import { auditStorage } from "./auditStorage";

export function buildAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () => captureScreen({ format: "png", quality: 0.9, result: "tmpfile" }),
    captureRef: (ref) => captureRef(ref, { format: "png", quality: 0.9, result: "tmpfile" }),
    writeFile: async (filename, content) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename, base64) => {
      const uri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: (uri) => Sharing.shareAsync(uri),
    storage: auditStorage,
    currentScreen,
    reporterId: "211118018",
    BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
  };
}

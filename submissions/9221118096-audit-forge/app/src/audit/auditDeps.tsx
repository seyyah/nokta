import { Text } from "react-native";
import { captureScreen, captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { AuditWidgetDeps } from "@xtatistix/mobile-audit";
import { auditStorage } from "./auditStorage";

// Host application boundary: every native capability the widget needs is
// resolved HERE (in the host), then handed over via `deps`. The widget package
// imports none of these directly — that is the drop-in contract.
export function buildAuditDeps(currentScreen: string): AuditWidgetDeps {
  return {
    captureScreen: () => captureScreen({ format: "png", result: "tmpfile" }),
    captureRef: (ref) => captureRef(ref, { format: "png", result: "tmpfile" }),
    writeFile: async (filename: string, content: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: (uri: string) => Sharing.shareAsync(uri),
    storage: auditStorage,
    currentScreen,
    reporterId: "qa-team",
    BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
  };
}

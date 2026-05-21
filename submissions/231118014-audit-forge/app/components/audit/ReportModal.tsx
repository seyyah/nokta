import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Check, Copy, Share2, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useAudit } from "./AuditProvider";
import { reportToMarkdown } from "./markdown";

const { palette } = Colors;

export default function ReportModal() {
  const { activeReport, closeReview } = useAudit();
  const [copied, setCopied] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);

  const markdown = useMemo(() => {
    if (!activeReport) return "";
    return reportToMarkdown(activeReport);
  }, [activeReport]);

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.log("[audit] clipboard failed", e);
    }
  };

  const onShare = async () => {
    if (sharing || !activeReport) return;
    setSharing(true);
    try {
      if (Platform.OS === "web") {
        await Clipboard.setStringAsync(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        await Clipboard.setStringAsync(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        return;
      }
      const file = new File(Paths.cache, `${activeReport.id}.md`);
      try {
        file.create({ overwrite: true });
      } catch {}
      file.write(markdown);
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/markdown",
        dialogTitle: "Share Nokta Audit Report",
        UTI: "net.daringfireball.markdown",
      });
    } catch (e) {
      console.log("[audit] share failed", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={!!activeReport}
      animationType="slide"
      transparent={false}
      onRequestClose={closeReview}
      presentationStyle="fullScreen"
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>REPORT</Text>
            <Text style={styles.title}>{activeReport?.id ?? ""}</Text>
          </View>
          <Pressable onPress={closeReview} style={styles.closeBtn} testID="audit-close-report">
            <X size={20} color={palette.text} />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <MetaCell label="SCREEN" value={activeReport?.screen ?? "—"} />
          <MetaCell label="MARKS" value={String(activeReport?.annotations.length ?? 0)} />
          <MetaCell
            label="DEVICE"
            value={`${activeReport?.device.os ?? ""} ${activeReport?.device.osVersion ?? ""}`}
          />
        </View>

        <ScrollView
          style={styles.codeWrap}
          contentContainerStyle={styles.codeContent}
          showsVerticalScrollIndicator={false}
        >
          <Text selectable style={styles.code}>
            {markdown}
          </Text>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable onPress={onCopy} style={[styles.btn, styles.btnGhost]} testID="audit-copy">
            {copied ? (
              <Check size={16} color={palette.green} />
            ) : (
              <Copy size={16} color={palette.text} />
            )}
            <Text style={[styles.btnGhostText, copied && { color: palette.green }]}>
              {copied ? "COPIED" : "COPY"}
            </Text>
          </Pressable>
          <Pressable onPress={onShare} style={[styles.btn, styles.btnPrimary]} testID="audit-share">
            <Share2 size={16} color={palette.ink} />
            <Text style={styles.btnPrimaryText}>SHARE .md</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.ink,
    paddingTop: Platform.OS === "ios" ? 60 : 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  kicker: {
    color: palette.yellow,
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 2,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  metaCell: {
    flex: 1,
    backgroundColor: palette.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  metaLabel: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  metaValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  codeWrap: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: palette.ink2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  codeContent: {
    padding: 16,
  },
  code: {
    color: palette.text,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: palette.yellow,
  },
  btnPrimaryText: {
    color: palette.ink,
    fontWeight: "800",
    letterSpacing: 1.3,
    fontSize: 13,
  },
  btnGhost: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  btnGhostText: {
    color: palette.text,
    fontWeight: "700",
    letterSpacing: 1.3,
    fontSize: 13,
  },
});

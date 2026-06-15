import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusBar, StyleSheet, View, Platform } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { HomeScreen } from "./src/screens/HomeScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { VoiceScreen } from "./src/screens/VoiceScreen";
import { AvatarScreen } from "./src/screens/AvatarScreen";
import { ExpertCallScreen } from "./src/screens/ExpertCallScreen";

export type Screen =
  | "Home"
  | "Tasks"
  | "Settings"
  | "Voice"
  | "Avatar"
  | "ExpertCall";

const BRIDGE_FILENAME = "BRIDGE.md";

async function appendBridgeSummary(summary: string) {
  if (Platform.OS === "web") {
    try {
      const existing = localStorage.getItem(BRIDGE_FILENAME) ?? "";
      const entry = `\n\n## Expert Summary (${new Date().toISOString()})\n\n${summary.trim()}\n`;
      localStorage.setItem(BRIDGE_FILENAME, existing + entry);
    } catch (_) {}
    return;
  }
  try {
    const FileSystem = require("expo-file-system/legacy");
    const dir = FileSystem.documentDirectory ?? "";
    if (!dir) return;
    const path = `${dir}${BRIDGE_FILENAME}`;
    const header = `\n\n## Expert Summary (${new Date().toISOString()})\n\n`;
    const body = summary.trim() ? summary.trim() + "\n" : "(empty)\n";
    const chunk = header + body;
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      const prev = await FileSystem.readAsStringAsync(path);
      await FileSystem.writeAsStringAsync(path, prev + chunk);
    } else {
      await FileSystem.writeAsStringAsync(path, chunk.trimStart());
    }
  } catch (e) {
    console.warn("BRIDGE write error", e);
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("Home");
  const [stuckCount, setStuckCount] = useState(0);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const stuckCountRef = useRef(stuckCount);
  stuckCountRef.current = stuckCount;

  const navigate = useCallback((next: Screen) => setScreen(next), []);

  const onReport = useCallback((markdown: string) => {
    const m = markdown.toLowerCase();
    const isStuckSignal =
      m.includes("rollback") ||
      m.includes("stuck") ||
      m.includes("takıld") ||
      m.includes("takild") ||
      m.includes("geri al") ||
      m.includes("geri-al");
    setStuckCount((c) => (isStuckSignal ? c + 1 : 0));
  }, []);

  const onBridgeSaved = useCallback(
    async (summary: string) => {
      await appendBridgeSummary(summary);
      setStuckCount(0);
      setAutoTriggered(false);
      setScreen("Home");
    },
    []
  );

  const onExpertCallExited = useCallback(() => {
    setScreen("Home");
  }, []);

  useEffect(() => {
    if (stuckCount >= 2 && screen !== "ExpertCall") {
      setAutoTriggered(true);
      setScreen("ExpertCall");
    }
  }, [stuckCount, screen]);

  const content = useMemo(() => {
    switch (screen) {
      case "Home":
        return <HomeScreen navigate={navigate} onReport={onReport} />;
      case "Tasks":
        return <TasksScreen navigate={navigate} onReport={onReport} />;
      case "Settings":
        return (
          <SettingsScreen
            navigate={navigate}
            onReport={onReport}
            stuckCount={stuckCount}
          />
        );
      case "Voice":
        return <VoiceScreen navigate={navigate} onReport={onReport} />;
      case "Avatar":
        return (
          <AvatarScreen
            navigate={navigate}
            onReport={onReport}
            onExpertCall={() => setScreen("ExpertCall")}
          />
        );
      case "ExpertCall":
        return (
          <ExpertCallScreen
            navigate={navigate}
            autoTriggered={autoTriggered}
            onBridgeSaved={onBridgeSaved}
            onExit={onExpertCallExited}
          />
        );
      default:
        return <HomeScreen navigate={navigate} onReport={onReport} />;
    }
  }, [
    autoTriggered,
    navigate,
    onBridgeSaved,
    onExpertCallExited,
    onReport,
    screen,
    stuckCount,
  ]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>{content}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a14" },
  container: { flex: 1 },
});

import { Link } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SCREENS, TABS, type RoutePath, type ScreenKey } from "./screens";

interface NoktaScreenProps {
  screenKey: ScreenKey;
}

export function NoktaScreen({ screenKey }: NoktaScreenProps) {
  const screen = SCREENS[screenKey];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{screen.kicker}</Text>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.summary}>{screen.summary}</Text>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((tab) => {
            const active = tab.path === screen.path;
            return (
              <View key={tab.path} style={styles.tabSlot}>
                <Link href={tab.path as RoutePath} asChild>
                  <Pressable accessibilityRole="tab" style={[styles.tab, active && styles.activeTab]}>
                    <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
                  </Pressable>
                </Link>
              </View>
            );
          })}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelLabel}>Current screen</Text>
            <Text style={styles.status}>{screen.status}</Text>
          </View>
          <Text style={styles.panelTitle}>{screen.auditName}</Text>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{screen.primaryAction}</Text>
          </Pressable>
        </View>

        <View style={styles.blockList}>
          {screen.blocks.map((block) => (
            <View style={styles.block} key={block.label}>
              <Text style={styles.blockLabel}>{block.label}</Text>
              <Text style={styles.blockValue}>{block.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f2e8",
  },
  content: {
    padding: 20,
    paddingBottom: 112,
  },
  header: {
    gap: 8,
    marginBottom: 18,
  },
  kicker: {
    color: "#5b6f89",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#1e2530",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
  },
  summary: {
    color: "#465263",
    fontSize: 16,
    lineHeight: 23,
  },
  tabs: {
    backgroundColor: "#e7dccb",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
    padding: 6,
  },
  tab: {
    alignItems: "center",
    borderRadius: 7,
    minHeight: 42,
    justifyContent: "center",
  },
  tabSlot: {
    flex: 1,
  },
  activeTab: {
    backgroundColor: "#1f766b",
  },
  tabText: {
    color: "#465263",
    fontSize: 14,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#fffaf0",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#dfd4c3",
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    marginBottom: 18,
    padding: 18,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelLabel: {
    color: "#6d7481",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  status: {
    backgroundColor: "#eef8f5",
    borderRadius: 6,
    color: "#1f766b",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  panelTitle: {
    color: "#1e2530",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#b4432d",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fffaf0",
    fontSize: 15,
    fontWeight: "800",
  },
  blockList: {
    gap: 12,
  },
  block: {
    backgroundColor: "#fffaf0",
    borderColor: "#dfd4c3",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  blockLabel: {
    color: "#5b6f89",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  blockValue: {
    color: "#263241",
    fontSize: 15,
    lineHeight: 21,
  },
});

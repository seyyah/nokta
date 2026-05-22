import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What is Nokta?</Text>
        <Text style={styles.body}>
          Nokta turns a scattered dot of an idea into a grounded, slop-checked
          spec. This host app is a tiny clone used as the target for the
          audit-forge loop: a tester captures a UX glitch with the nokta-audit
          widget, the report is handed to a coding agent, and the agent repairs
          the host under a ratchet discipline.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>THE LOOP</Text>
          <Text style={styles.cardBody}>
            Customer captures → agent repairs → human reviews. The audit widget
            is the capture side; the forge cycles are the repair side.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 20, gap: 16 },
  title: { color: "#F9FAFB", fontSize: 24, fontWeight: "800" },
  body: { color: "#CBD5E1", fontSize: 15, lineHeight: 23 },
  card: { backgroundColor: "#1E2A44", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#2C3E5F" },
  cardLabel: { color: "#D4AF37", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 6 },
  cardBody: { color: "#CBD5E1", fontSize: 14, lineHeight: 21 },
});

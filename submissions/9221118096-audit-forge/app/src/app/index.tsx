import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.hero}>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.title}>Nokta</Text>
        <Text style={styles.tagline}>
          Turn a scattered dot of an idea into a grounded, slop-checked spec.
        </Text>
      </View>

      <View style={styles.footer}>
        {/* FORGE cycle 1: footer now has horizontal padding so the stretched CTA
            sits inset from both screen edges. */}
        <Pressable style={styles.cta} onPress={() => router.push("/ideas")}>
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/about")} hitSlop={8}>
          <Text style={styles.link}>What is Nokta?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220", justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  dot: { color: "#D4AF37", fontSize: 64, lineHeight: 64, fontWeight: "900" },
  title: { color: "#F9FAFB", fontSize: 40, fontWeight: "900", letterSpacing: 1 },
  tagline: {
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  footer: { paddingBottom: 28, paddingHorizontal: 20, alignItems: "center", gap: 16 },
  cta: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  ctaText: { color: "#0B1220", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
  link: { color: "#94A3B8", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});

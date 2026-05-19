import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { monoFont, theme } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404" }} />
      <View style={styles.container}>
        <Text style={styles.title}>SIGNAL LOST</Text>
        <Text style={styles.sub}>This route does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>&gt; return to chamber</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: theme.bg },
  title: { fontSize: 20, fontFamily: monoFont, color: theme.accent, letterSpacing: 4, fontWeight: "700" },
  sub: { fontSize: 13, fontFamily: monoFont, color: theme.textDim, marginTop: 8 },
  link: { marginTop: 24 },
  linkText: { fontSize: 13, fontFamily: monoFont, color: theme.accent },
});

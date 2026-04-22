import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Keyboard,
  Platform,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IdeaCard {
  id: string;
  text: string;
}

// ─── Deduplication Logic ──────────────────────────────────────────────────────

/**
 * Normalise a line for comparison:
 * - lowercase
 * - strip leading bullet / punctuation chars (-, *, •, ·, →, etc.)
 * - collapse internal whitespace
 */
function normalise(line: string): string {
  return line
    .toLowerCase()
    .replace(/^[-*•·→✦▸◆►\s]+/, "")  // strip bullet prefixes
    .replace(/\s+/g, " ")              // collapse internal spaces
    .trim();
}

/**
 * Process raw pasted text into a deduplicated list of idea cards.
 * Handles WhatsApp exports, bullet lists, and plain newline-separated text.
 */
function processText(raw: string): IdeaCard[] {
  const lines = raw.split("\n");
  const seen = new Set<string>();
  const results: IdeaCard[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;               // skip empty lines

    const key = normalise(trimmed);
    if (!key) return;                   // skip punctuation-only lines
    if (seen.has(key)) return;          // skip duplicates (normalised)

    seen.add(key);
    results.push({
      id: `${Date.now()}-${results.length}`,
      text: trimmed,
    });
  });

  return results;
}

// ─── Card Component ───────────────────────────────────────────────────────────

function Card({ item, index }: { item: IdeaCard; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: index * 45,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: index * 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>{index + 1}</Text>
      </View>
      <Text style={styles.cardText}>{item.text}</Text>
    </Animated.View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [inputText, setInputText] = useState("");
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [screen, setScreen] = useState<"input" | "output">("input");
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);

  function handleProcess() {
    Keyboard.dismiss();
    const rawLines = inputText.split("\n").filter((l) => l.trim());
    const result = processText(inputText);
    setDuplicatesRemoved(rawLines.length - result.length);
    setIdeas(result);
    setScreen("output");
  }

  function handleReset() {
    setScreen("input");
    setIdeas([]);
    setInputText("");
    setDuplicatesRemoved(0);
  }

  // ── Input Screen ────────────────────────────────────────────────────────────
  if (screen === "input") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.dot}>‧</Text>
            <Text style={styles.title}>nokta</Text>
            <Text style={styles.subtitle}>paste your messy notes below</Text>
          </View>

          <TextInput
            style={styles.input}
            multiline
            placeholder={
              "- buy milk\n- Buy Milk\n- call dentist\n• call dentist\n→ finish report"
            }
            placeholderTextColor="#C0BDB8"
            value={inputText}
            onChangeText={setInputText}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, !inputText.trim() && styles.buttonDisabled]}
            onPress={handleProcess}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Process →</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Supports bullet lists · WhatsApp exports · plain text
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Output Screen ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />
      <View style={styles.container}>
        <View style={styles.outputHeader}>
          <View>
            <Text style={styles.title}>ideas</Text>
            <Text style={styles.subtitle}>
              {ideas.length} unique · {duplicatesRemoved} removed
            </Text>
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetText}>↩ reset</Text>
          </TouchableOpacity>
        </View>

        {ideas.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No ideas found.</Text>
          </View>
        ) : (
          <FlatList
            data={ideas}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Card item={item} index={index} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 16 : 8,
  },
  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 28,
  },
  dot: {
    fontSize: 40,
    color: "#1A1A1A",
    lineHeight: 44,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    color: "#9E9B96",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E8E5E0",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    minHeight: 200,
    maxHeight: 320,
  },
  button: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#D4D1CB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: "#C0BDB8",
    marginTop: 10,
  },
  outputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
    marginBottom: 20,
  },
  resetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E5E0",
  },
  resetText: {
    fontSize: 13,
    color: "#6B6864",
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#EDEBE7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0EDE8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9E9B96",
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 22,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9E9B96",
    fontSize: 15,
  },
});

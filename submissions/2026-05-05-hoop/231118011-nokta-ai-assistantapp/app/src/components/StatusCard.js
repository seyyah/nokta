import { Pressable, StyleSheet, Text, View } from "react-native";
import { ASSISTANT_STATE_DESCRIPTIONS } from "../constants/assistantStates";
import { getGroqEndpointInfo } from "../services/groqService";
import { useAssistantStore } from "../store/assistantStore";

export const StatusCard = () => {
  const assistantState = useAssistantStore((state) => state.assistantState);
  const clearConversation = useAssistantStore((state) => state.clearConversation);
  const info = getGroqEndpointInfo();

  return (
    <View style={styles.card}>
      <View style={styles.leftArea}>
        <Text style={styles.title}>Nokta AI</Text>
        <Text style={styles.description}>
          {ASSISTANT_STATE_DESCRIPTIONS[assistantState] || "Nokta hazır."}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Model: {info.model}</Text>
          <Text style={[styles.metaText, info.hasApiKey ? styles.okText : styles.warnText]}>
            API: {info.hasApiKey ? "Hazır" : "Eksik"}
          </Text>
        </View>
      </View>

      <Pressable onPress={clearConversation} style={styles.clearButton}>
        <Text style={styles.clearText}>Temizle</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 15,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)"
  },
  leftArea: {
    flex: 1,
    paddingRight: 12
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900"
  },
  description: {
    color: "rgba(234,246,255,0.68)",
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
    flexWrap: "wrap"
  },
  metaText: {
    color: "rgba(234,246,255,0.66)",
    fontSize: 11,
    fontWeight: "800"
  },
  okText: {
    color: "#86EFAC"
  },
  warnText: {
    color: "#FCA5A5"
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)"
  },
  clearText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  }
});
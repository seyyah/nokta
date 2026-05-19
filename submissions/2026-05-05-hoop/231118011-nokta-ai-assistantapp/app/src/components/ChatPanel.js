import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAssistantStore } from "../store/assistantStore";
import { MessageBubble } from "./MessageBubble";

export const ChatPanel = () => {
  const scrollRef = useRef(null);

  const messages = useAssistantStore((state) => state.messages);
  const isThinking = useAssistantStore((state) => state.isThinking);
  const lastError = useAssistantStore((state) => state.lastError);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [messages.length, isThinking]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Sohbet</Text>
          <Text style={styles.subtitle}>Fikrini yaz, Nokta netleştirsin.</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.messageArea}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isThinking ? (
          <View style={styles.thinkingBox}>
            <Text style={styles.thinkingText}>Nokta düşünüyor...</Text>
          </View>
        ) : null}

        {lastError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 420,
    maxHeight: 520,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12
  },
  headerRow: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900"
  },
  subtitle: {
    color: "rgba(234,246,255,0.58)",
    fontSize: 12,
    marginTop: 3
  },
  messageArea: {
    paddingTop: 10,
    paddingBottom: 18
  },
  thinkingBox: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(103,232,249,0.10)",
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.18)"
  },
  thinkingText: {
    color: "#A5F3FC",
    fontSize: 13,
    fontWeight: "700"
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.2)"
  },
  errorText: {
    color: "#FECACA",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700"
  }
});
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView as RNKKeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "@/contexts/ThemeContext";
import { useSupport, type SupportMessage } from "@/contexts/SupportContext";

function timeStr(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({
  msg,
  colors,
}: {
  msg: SupportMessage;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const isUser = msg.role === "user";
  return (
    <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAgent]}>
      {!isUser && (
        <View style={[styles.agentAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.agentAvatarText, { color: colors.primaryForeground }]}>N</Text>
        </View>
      )}
      <View style={{ maxWidth: "72%" }}>
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text style={[styles.bubbleText, { color: isUser ? colors.primaryForeground : colors.foreground }]}>
            {msg.text}
          </Text>
        </View>
        <Text style={[styles.msgTime, { color: colors.mutedForeground, textAlign: isUser ? "right" : "left" }]}>
          {isUser ? "Siz" : "Destek"} · {timeStr(msg.createdAt)}
        </Text>
      </View>
    </View>
  );
}

function OnboardingView({
  onStart,
  isLoading,
  colors,
}: {
  onStart: (name: string) => void;
  isLoading: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const [name, setName] = useState("");

  return (
    <View style={styles.onboarding}>
      <View style={[styles.onboardingIcon, { backgroundColor: colors.primary }]}>
        <Feather name="message-circle" size={32} color={colors.primaryForeground} />
      </View>
      <Text style={[styles.onboardingTitle, { color: colors.foreground }]}>
        Uzman Desteği
      </Text>
      <Text style={[styles.onboardingDesc, { color: colors.mutedForeground }]}>
        Gerçek bir destek uzmanı size yardımcı olmak için burada. Mesajınızı gönderin, en kısa sürede yanıt alın.
      </Text>
      <View style={styles.features}>
        {[
          { icon: "user" as const, text: "Gerçek insan desteği" },
          { icon: "clock" as const, text: "Hızlı yanıt süresi" },
          { icon: "shield" as const, text: "Gizli ve güvenli" },
        ].map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <Feather name={f.icon} size={15} color={colors.tint} />
            <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f.text}</Text>
          </View>
        ))}
      </View>
      <TextInput
        style={[
          styles.nameInput,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="Adınız (isteğe bağlı)"
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={() => onStart(name || "Kullanıcı")}
      />
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: colors.primary }]}
        onPress={() => onStart(name || "Kullanıcı")}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
            Desteğe Bağlan
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const { session, messages, isConnecting, isSending, error, initSession, sendMessage } =
    useSupport();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlatList<SupportMessage>>(null);
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
  }

  if (!session) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border, backgroundColor: colors.background, paddingTop: webTopPad },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Destek</Text>
        </View>
        <OnboardingView
          onStart={(name) => initSession(name)}
          isLoading={isConnecting}
          colors={colors}
        />
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.destructive }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  const statusLabel = session.status === "active" ? "Çevrimiçi" : "Bekliyor";
  const statusColor = session.status === "active" ? "#22c55e" : "#f59e0b";

  const KAV = Platform.OS === "ios" ? RNKKeyboardAvoidingView : KeyboardAvoidingView;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.chatHeader,
          { borderBottomColor: colors.border, backgroundColor: colors.background, paddingTop: webTopPad },
        ]}
      >
        <View style={[styles.agentAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.agentAvatarText, { color: colors.primaryForeground }]}>N</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontSize: 16 }]}>
            Nokta Destek
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <KAV
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} colors={colors} />}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 16 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!messages.length}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View
          style={[
            styles.inputBar,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 8) + (Platform.OS === "web" ? 34 : 0),
            },
          ]}
        >
          <TextInput
            style={[
              styles.chatInput,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={colors.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.primary : colors.muted },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Feather
                name="send"
                size={18}
                color={inputText.trim() ? colors.primaryForeground : colors.mutedForeground}
              />
            )}
          </TouchableOpacity>
        </View>
      </KAV>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.destructive }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12 },
  onboarding: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  onboardingIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  onboardingDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  features: { gap: 10, width: "100%", marginVertical: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14 },
  nameInput: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  startBtn: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: { fontSize: 16, fontWeight: "600" },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  agentAvatarText: { fontSize: 15, fontWeight: "700" },
  messagesList: { padding: 16, gap: 12 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowAgent: { justifyContent: "flex-start" },
  bubble: { borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  msgTime: { fontSize: 11, marginTop: 4, paddingHorizontal: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    padding: 12,
    alignItems: "center",
  },
  errorText: { color: "#fff", fontSize: 13 },
});

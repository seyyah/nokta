import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

const DOMAIN = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}`
  : "";

const AGENTS = [
  { id: "planner", name: "Planlayıcı", emoji: "🗺", desc: "Fikri plana çevir" },
  { id: "architect", name: "Mimar", emoji: "🏗", desc: "Sistem & mimari tasarım" },
  { id: "frontend", name: "Frontend", emoji: "🎨", desc: "UI/UX & React Native" },
  { id: "backend", name: "Backend", emoji: "⚙️", desc: "API & veritabanı tasarımı" },
  { id: "security", name: "Güvenlik", emoji: "🔐", desc: "Güvenlik & tehdit analizi" },
  { id: "productivity", name: "Koç", emoji: "🚀", desc: "Üretkenlik & zaman yönetimi" },
  { id: "critic", name: "Eleştirmen", emoji: "🧐", desc: "Plan & kod eleştirisi" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: number;
  title: string;
  agentType: string;
  createdAt: string;
}

function AgentSelector({ selected, onSelect, colors }: {
  selected: string;
  onSelect: (id: string) => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agentList}>
      {AGENTS.map((agent) => {
        const isActive = selected === agent.id;
        return (
          <TouchableOpacity
            key={agent.id}
            style={[styles.agentChip, { borderColor: isActive ? colors.tint : colors.border, backgroundColor: isActive ? colors.tint + "18" : colors.card }]}
            onPress={() => { Haptics.selectionAsync(); onSelect(agent.id); }}
          >
            <Text style={styles.agentEmoji}>{agent.emoji}</Text>
            <View>
              <Text style={[styles.agentName, { color: isActive ? colors.tint : colors.foreground }]}>{agent.name}</Text>
              <Text style={[styles.agentDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{agent.desc}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function MessageBubble({ msg, colors }: { msg: Message; colors: ReturnType<typeof useTheme>["colors"] }) {
  const isUser = msg.role === "user";
  return (
    <View style={[styles.msgRow, isUser ? styles.msgUser : styles.msgAgent]}>
      {!isUser && (
        <View style={[styles.agentAvatar, { backgroundColor: colors.tint }]}>
          <Text style={[styles.agentAvatarText, { color: colors.primaryForeground }]}>AI</Text>
        </View>
      )}
      <View style={{ maxWidth: "78%", gap: 4 }}>
        <View style={[styles.bubble, isUser
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
        ]}>
          <Text style={[styles.bubbleText, { color: isUser ? colors.primaryForeground : colors.foreground }]}>
            {msg.content}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ConversationListModal({ visible, onClose, onSelect, onNew, colors }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (conv: Conversation) => void;
  onNew: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetch(`${DOMAIN}/api/anthropic/conversations`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setConvs(list.reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Konuşmalar</Text>
          <TouchableOpacity onPress={onNew} style={[styles.newConvBtn, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={16} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.tint} />
        ) : convs.length === 0 ? (
          <View style={styles.emptyConv}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Henüz konuşma yok</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Yeni bir konuşma başlat</Text>
          </View>
        ) : (
          <FlatList
            data={convs}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const agent = AGENTS.find((a) => a.id === item.agentType) ?? AGENTS[0]!;
              return (
                <TouchableOpacity
                  style={[styles.convItem, { borderBottomColor: colors.border }]}
                  onPress={() => { onSelect(item); onClose(); }}
                >
                  <Text style={styles.convEmoji}>{agent.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.convTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.convAgent, { color: colors.mutedForeground }]}>{agent.name}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

export default function AIScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [agentType, setAgentType] = useState("planner");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [convTitle, setConvTitle] = useState<string | null>(null);
  const [showConvList, setShowConvList] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const listRef = useRef<FlatList<Message>>(null);
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  function scrollToBottom() {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }

  async function createConversation(title: string, agent: string): Promise<number | null> {
    try {
      const r = await fetch(`${DOMAIN}/api/anthropic/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, agentType: agent }),
      });
      const data = await r.json() as Conversation;
      return data.id;
    } catch { return null; }
  }

  async function loadConversation(conv: Conversation) {
    setConvId(conv.id);
    setConvTitle(conv.title);
    const agent = conv.agentType || "planner";
    setAgentType(agent);
    setMessages([]);
    try {
      const r = await fetch(`${DOMAIN}/api/anthropic/conversations/${conv.id}/messages`);
      const data = await r.json() as Array<{ id: number; role: string; content: string }>;
      if (Array.isArray(data)) {
        setMessages(data.map((m) => ({ id: String(m.id), role: m.role as "user" | "assistant", content: m.content })));
        scrollToBottom();
      }
    } catch {}
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    let cid = convId;
    if (!cid) {
      const title = text.substring(0, 50);
      cid = await createConversation(title, agentType);
      if (!cid) return;
      setConvId(cid);
      setConvTitle(title);
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const aiMsg: Message = { id: `a-${Date.now()}`, role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);
    scrollToBottom();

    try {
      const response = await fetch(`${DOMAIN}/api/anthropic/conversations/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, agentType }),
      });

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (parsed.content) {
              setMessages((prev) => prev.map((m) => m.id === aiMsg.id ? { ...m, content: m.content + parsed.content } : m));
            }
            if (parsed.done || parsed.error) break;
          } catch {}
        }
      }
    } catch (e) {
      setMessages((prev) => prev.map((m) => m.id === aiMsg.id ? { ...m, content: "Bir hata oluştu. Lütfen tekrar deneyin." } : m));
    } finally {
      setIsStreaming(false);
      scrollToBottom();
    }
  }

  function startNewConversation() {
    setConvId(null);
    setConvTitle(null);
    setMessages([]);
  }

  const agent = AGENTS.find((a) => a.id === agentType) ?? AGENTS[0]!;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background, paddingTop: webTopPad }]}>
        <TouchableOpacity onPress={() => setShowConvList(true)} style={styles.convBtn}>
          <Feather name="list" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {convTitle ? convTitle.substring(0, 22) + (convTitle.length > 22 ? "…" : "") : `${agent.emoji} ${agent.name}`}
          </Text>
          {convTitle && <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{agent.emoji} {agent.name}</Text>}
        </View>
        <TouchableOpacity onPress={startNewConversation} style={styles.convBtn}>
          <Feather name="edit-3" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <AgentSelector selected={agentType} onSelect={setAgentType} colors={colors} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeEmoji}>{agent.emoji}</Text>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>{agent.name} Ajanı</Text>
            <Text style={[styles.welcomeDesc, { color: colors.mutedForeground }]}>{agent.desc}</Text>
            <View style={styles.suggestionsGrid}>
              {getSuggestions(agentType).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.suggestion, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setInput(s); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble msg={item} colors={colors} />}
            contentContainerStyle={[styles.msgList, { paddingBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          />
        )}

        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 8) + (Platform.OS === "web" ? 34 : 0) }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder={`${agent.name} ajanına sor...`}
            placeholderTextColor={colors.placeholder}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() && !isStreaming ? colors.primary : colors.muted }]}
            onPress={sendMessage}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming
              ? <ActivityIndicator size="small" color={colors.primaryForeground} />
              : <Feather name="send" size={18} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ConversationListModal
        visible={showConvList}
        onClose={() => setShowConvList(false)}
        onSelect={loadConversation}
        onNew={() => { setShowConvList(false); startNewConversation(); }}
        colors={colors}
      />
    </View>
  );
}

function getSuggestions(agentType: string): string[] {
  const map: Record<string, string[]> = {
    planner: ["Fitness uygulaması için plan yap", "E-ticaret projesi başlat", "Haftalık sprint planı oluştur"],
    architect: ["Mikroservis mimarisi tasarla", "Veritabanı şeması öner", "API gateway yapısı kur"],
    frontend: ["Animasyon stratejisi öner", "Performans optimizasyonu yap", "Responsive layout tasarla"],
    backend: ["REST API tasarımı yap", "Cache stratejisi öner", "Ölçeklenebilir DB modeli oluştur"],
    security: ["Güvenlik açıklarını analiz et", "JWT stratejisi öner", "OWASP Top 10 kontrolü yap"],
    productivity: ["Pomodoro planı oluştur", "Önceliklendirme yap", "Odak stratejisi öner"],
    critic: ["Bu planı eleştir", "Mimariyi analiz et", "Kod kalitesini değerlendir"],
  };
  return map[agentType] ?? map["planner"]!;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  convBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },
  agentList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  agentChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  agentEmoji: { fontSize: 18 },
  agentName: { fontSize: 13, fontWeight: "600" },
  agentDesc: { fontSize: 10 },
  welcomeContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  welcomeEmoji: { fontSize: 50 },
  welcomeTitle: { fontSize: 22, fontWeight: "700" },
  welcomeDesc: { fontSize: 14, textAlign: "center" },
  suggestionsGrid: { marginTop: 10, width: "100%", gap: 8 },
  suggestion: { padding: 14, borderRadius: 12, borderWidth: 1 },
  suggestionText: { fontSize: 14 },
  msgList: { padding: 16, gap: 14 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgUser: { justifyContent: "flex-end" },
  msgAgent: { justifyContent: "flex-start" },
  agentAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  agentAvatarText: { fontSize: 11, fontWeight: "700" },
  bubble: { borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 10 },
  chatInput: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  newConvBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  emptyConv: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyText: { fontSize: 14 },
  convItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, gap: 12 },
  convEmoji: { fontSize: 22 },
  convTitle: { fontSize: 15, fontWeight: "600" },
  convAgent: { fontSize: 12, marginTop: 2 },
});
